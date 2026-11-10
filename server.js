import express from 'express';
import helmet from 'helmet';
import multer from 'multer';
import { rateLimit } from 'express-rate-limit';
import { randomBytes } from 'node:crypto';
import { mkdir, rm, readdir, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES, MAX_UPLOAD, MIME, categoryOf, targetsFor } from './formats.js';
import { detectFormat } from './detect.js';
import { convert, ConversionError } from './convert.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const WORK_DIR = process.env.WORK_DIR || path.join(os.tmpdir(), 'convertly-jobs');
const FILE_TTL_MS = Number(process.env.FILE_TTL_MS || 15 * 60 * 1000); // files live 15 minutes max
const MAX_CONCURRENT = Number(process.env.MAX_CONCURRENT || 2);
const MAX_QUEUE = Number(process.env.MAX_QUEUE || 20);
const TRUST_PROXY = process.env.TRUST_PROXY || 'loopback'; // set to your reverse proxy hop count/IP in production

await rm(WORK_DIR, { recursive: true, force: true });
await mkdir(WORK_DIR, { recursive: true, mode: 0o700 });

const app = express();
app.set('trust proxy', TRUST_PROXY);
app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'"],
        'font-src': ["'self'"],
        'img-src': ["'self'", 'data:', 'blob:'],
        'connect-src': ["'self'"],
        'object-src': ["'none'"],
        'frame-ancestors': ["'none'"],
        'form-action': ["'self'"],
        'base-uri': ["'none'"],
      },
    },
    strictTransportSecurity: { maxAge: 63072000, includeSubDomains: true, preload: true },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'no-referrer' },
  }),
);
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  next();
});

// ---------------------------------------------------------------- rate limits
const convertLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_CONVERSIONS || 20),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'rate_limited' },
});
const generalLimiter = rateLimit({ windowMs: 60 * 1000, limit: Number(process.env.RATE_LIMIT_GENERAL || 120), standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'rate_limited' } });
app.use('/api', generalLimiter);

// ---------------------------------------------------------------- job store (in memory)
/** id -> { dir, outPath, name, mime, size, expiresAt } */
const jobs = new Map();
const newId = () => randomBytes(16).toString('hex');

async function destroyJob(id) {
  const job = jobs.get(id);
  jobs.delete(id);
  if (job) await rm(job.dir, { recursive: true, force: true });
}

// Sweep: delete expired results and any orphaned directory older than the TTL.
setInterval(async () => {
  const now = Date.now();
  for (const [id, j] of jobs) if (j.expiresAt <= now) await destroyJob(id);
  for (const d of await readdir(WORK_DIR).catch(() => [])) {
    const full = path.join(WORK_DIR, d);
    const s = await stat(full).catch(() => null);
    if (s && now - s.mtimeMs > FILE_TTL_MS + 60_000 && ![...jobs.values()].some((j) => j.dir === full)) {
      await rm(full, { recursive: true, force: true });
    }
  }
}, 30_000).unref();

// ---------------------------------------------------------------- concurrency queue
let running = 0;
const waiting = [];
function acquire() {
  if (running < MAX_CONCURRENT) {
    running += 1;
    return Promise.resolve();
  }
  if (waiting.length >= MAX_QUEUE) return Promise.reject(new ConversionError('busy'));
  return new Promise((resolve) => waiting.push(resolve));
}
function release() {
  const next = waiting.shift();
  if (next) next();
  else running -= 1;
}

// ---------------------------------------------------------------- upload handling
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        req.jobId = newId();
        req.jobDir = path.join(WORK_DIR, req.jobId);
        await mkdir(req.jobDir, { mode: 0o700 });
        cb(null, req.jobDir);
      } catch (e) {
        cb(e);
      }
    },
    filename: (req, file, cb) => cb(null, 'input.bin'), // never use the client-supplied name on disk
  }),
  limits: { fileSize: MAX_UPLOAD, files: 1, fields: 2, fieldSize: 100, parts: 4 },
});

function safeBaseName(name) {
  const base = path.basename(String(name || 'file')).replace(/\.tar\.gz$/i, '').replace(/\.[^.]*$/, '');
  const clean = base.normalize('NFC').replace(/[^\p{L}\p{N}._ -]+/gu, '_').replace(/^[.\s]+/, '').slice(0, 80);
  return clean || 'file';
}

function fail(res, status, code) {
  return res.status(status).json({ error: code });
}

// ---------------------------------------------------------------- API
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/formats', (req, res) => {
  const categories = Object.fromEntries(
    Object.entries(CATEGORIES).map(([k, c]) => [k, { inputs: c.inputs, outputs: c.outputs, maxBytes: c.maxBytes }]),
  );
  res.set('Cache-Control', 'public, max-age=300').json({ categories, ttlMinutes: FILE_TTL_MS / 60000 });
});

app.post('/api/convert', convertLimiter, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    const cleanup = () => req.jobDir && rm(req.jobDir, { recursive: true, force: true });
    if (err) {
      await cleanup();
      if (err.code === 'LIMIT_FILE_SIZE') return fail(res, 413, 'too_large');
      return fail(res, 400, 'bad_upload');
    }
    if (!req.file) return fail(res, 400, 'no_file');
    const target = String(req.body?.target || '').toLowerCase();
    const input = req.file.path;
    try {
      const from = await detectFormat(input, req.file.originalname);
      if (!from) throw new ConversionError('unsupported_type');
      const cat = categoryOf(from);
      if (req.file.size > CATEGORIES[cat].maxBytes) throw new ConversionError('too_large');
      if (!targetsFor(from).includes(target)) throw new ConversionError('unsupported_pair');

      await acquire();
      let result;
      try {
        result = await convert({ input, from, to: target, job: req.jobDir });
      } finally {
        release();
      }
      await rm(result.input, { force: true }); // the original is no longer needed

      const name = `${safeBaseName(req.file.originalname)}${cat === 'pdf' && target !== 'txt' ? `-${target}-pages` : ''}.${result.outExt}`;
      const expiresAt = Date.now() + FILE_TTL_MS;
      jobs.set(req.jobId, { dir: req.jobDir, outPath: result.out, name, mime: MIME[result.outExt] || 'application/octet-stream', size: result.size, expiresAt });
      res.json({ id: req.jobId, name, size: result.size, from, to: target, expiresAt });
    } catch (e) {
      await cleanup();
      const code = e instanceof ConversionError ? e.code : 'internal';
      if (!(e instanceof ConversionError) || code === 'engine_failed') console.error('[convert]', e.message);
      const status = { too_large: 413, busy: 503, timeout: 504, unsupported_type: 415, unsupported_pair: 400, archive_unsafe: 422, archive_too_big: 422 }[code] || 500;
      fail(res, status, code === 'internal' ? 'engine_failed' : code);
    }
  });
});

const ID_RE = /^[a-f0-9]{32}$/;

app.get('/api/download/:id', (req, res) => {
  const { id } = req.params;
  const job = ID_RE.test(id) && jobs.get(id);
  if (!job || job.expiresAt <= Date.now()) return fail(res, 404, 'expired');
  res.set({
    'Content-Type': job.mime,
    'Content-Length': String(job.size),
    'Content-Disposition': `attachment; filename="download.${job.name.split('.').pop()}"; filename*=UTF-8''${encodeURIComponent(job.name)}`,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; sandbox",
  });
  createReadStream(job.outPath).on('error', () => res.destroy()).pipe(res);
});

app.delete('/api/files/:id', async (req, res) => {
  const { id } = req.params;
  if (!ID_RE.test(id) || !jobs.has(id)) return fail(res, 404, 'expired');
  await destroyJob(id);
  res.status(204).end();
});

app.use('/api', (req, res) => fail(res, 404, 'not_found'));
// Front-end files live in the same folder as the server code, so only an explicit
// allow-list is served (never server.js, package.json, policy.xml, ...).
const STATIC = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/fonts.css', ['fonts.css', 'text/css; charset=utf-8']],
]);
const FONT_RE = /^\/fonts\/([a-z0-9-]+\.woff2)$/;
app.get(/.*/, (req, res, next) => {
  const hit = STATIC.get(req.path);
  const font = req.path.match(FONT_RE);
  if (!hit && !font) return next();
  const [file, type] = hit || [font[1], 'font/woff2'];
  res.set({ 'Content-Type': type, 'Cache-Control': hit ? 'public, max-age=3600' : 'public, max-age=31536000, immutable' });
  res.sendFile(path.join(ROOT, file), (err) => err && !res.headersSent && res.status(404).end());
});
app.use((req, res) => res.status(404).type('html').sendFile(path.join(ROOT, 'index.html')));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => fail(res, 500, 'internal'));

const server = app.listen(PORT, () => console.log(`Convertly listening on http://localhost:${PORT}`));
server.requestTimeout = 10 * 60 * 1000;
server.headersTimeout = 30_000;

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, async () => {
    server.close();
    await rm(WORK_DIR, { recursive: true, force: true });
    process.exit(0);
  });
}

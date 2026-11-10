// Conversion engines. Every external tool is run with execFile (never a shell),
// an explicit input format, a CPU-time / file-size cap, a wall-clock timeout,
// and a scrubbed environment, inside the job's private temporary directory.
import { execFile } from 'node:child_process';
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES, categoryOf } from './formats.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const POLICY_DIR = ROOT; // policy.xml sits next to this file

export class ConversionError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
  }
}

const LIMITS = {
  wallMs: Number(process.env.CONVERT_TIMEOUT_MS || 300_000),
  cpuSec: 600,
  fileSizeBytes: 1024 * 1024 * 1024, // no single output file over 1 GiB
};

function run(cmd, args, { cwd, timeoutMs = LIMITS.wallMs, env = {} } = {}) {
  const fullArgs = [`--cpu=${LIMITS.cpuSec}`, `--fsize=${LIMITS.fileSizeBytes}`, '--', 'nice', '-n', '10', cmd, ...args];
  return new Promise((resolve, reject) => {
    execFile(
      'prlimit',
      fullArgs,
      {
        cwd,
        timeout: timeoutMs,
        killSignal: 'SIGKILL',
        maxBuffer: 4 * 1024 * 1024,
        env: { PATH: '/usr/local/bin:/usr/bin:/bin', HOME: cwd, LANG: 'C.UTF-8', TMPDIR: cwd, ...env },
      },
      (err, stdout, stderr) => {
        if (err) {
          const e = new ConversionError(err.killed ? 'timeout' : 'engine_failed', `${cmd} failed: ${String(stderr).slice(0, 500)}`);
          return reject(e);
        }
        resolve({ stdout, stderr });
      },
    );
  });
}

// ---------------------------------------------------------------- images
const IM_CODER = { png: 'PNG', jpg: 'JPEG', webp: 'WEBP', gif: 'GIF', bmp: 'BMP', tiff: 'TIFF', ico: 'ICO', avif: 'AVIF', heic: 'HEIC', pdf: 'PDF' };

async function imagemagick(input, from, to, out, job) {
  if (from === 'heic') {
    // ImageMagick's libheif build lacks an HEVC decoder; decode with pillow-heif first.
    const png = path.join(job, 'heic-decoded.png');
    await run('python3', ['-I', path.join(ROOT, 'heic2png.py'), input, png], { cwd: job, timeoutMs: 60_000 });
    input = png;
    from = 'png';
  }
  const args = [
    '-limit', 'memory', '256MiB', '-limit', 'map', '512MiB', '-limit', 'area', '128MP',
    '-limit', 'disk', '1GiB', '-limit', 'width', '16KP', '-limit', 'height', '16KP', '-limit', 'time', '120',
    `${IM_CODER[from]}:${input}[0]`, // explicit coder + first frame/page only
    '-auto-orient',
  ];
  if (['jpg', 'bmp', 'pdf'].includes(to)) args.push('-background', 'white', '-alpha', 'remove', '-alpha', 'off');
  if (to === 'ico') args.push('-resize', '256x256>');
  if (to === 'jpg') args.push('-quality', '90');
  args.push('-strip', `${IM_CODER[to]}:${out}`);
  await run('convert', args, { cwd: job, env: { MAGICK_CONFIGURE_PATH: POLICY_DIR } });
}

// ---------------------------------------------------------------- audio / video
const DEMUXER = { mp3: 'mp3', wav: 'wav', ogg: 'ogg', opus: 'ogg', flac: 'flac', m4a: 'mov', mp4: 'mov', mov: 'mov', webm: 'matroska', mkv: 'matroska', avi: 'avi' };
const EVEN = 'scale=trunc(iw/2)*2:trunc(ih/2)*2';
const H264 = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-vf', EVEN];
const FF_OUT = {
  mp3: ['-vn', '-c:a', 'libmp3lame', '-q:a', '2', '-f', 'mp3'],
  wav: ['-vn', '-c:a', 'pcm_s16le', '-f', 'wav'],
  ogg: ['-vn', '-c:a', 'libvorbis', '-q:a', '5', '-f', 'ogg'],
  opus: ['-vn', '-c:a', 'libopus', '-b:a', '128k', '-f', 'ogg'],
  flac: ['-vn', '-c:a', 'flac', '-f', 'flac'],
  m4a: ['-vn', '-c:a', 'aac', '-b:a', '192k', '-f', 'ipod'],
  mp4: [...H264, '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-f', 'mp4'],
  mov: [...H264, '-c:a', 'aac', '-b:a', '160k', '-f', 'mov'],
  mkv: [...H264, '-c:a', 'aac', '-b:a', '160k', '-f', 'matroska'],
  webm: ['-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', '-deadline', 'realtime', '-cpu-used', '8', '-row-mt', '1', '-vf', EVEN, '-c:a', 'libopus', '-b:a', '128k', '-f', 'webm'],
  avi: ['-c:v', 'mpeg4', '-q:v', '4', '-vf', EVEN, '-c:a', 'libmp3lame', '-q:a', '3', '-f', 'avi'],
  gif: ['-an', '-t', '15', '-vf', 'fps=10,scale=480:-2:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse', '-f', 'gif'],
};

async function ffmpeg(input, from, to, out, job) {
  const args = [
    '-nostdin', '-hide_banner', '-loglevel', 'error', '-threads', '2',
    '-protocol_whitelist', 'file', '-f', DEMUXER[from], '-i', input,
    '-map_metadata', '-1', ...FF_OUT[to], '-y', out,
  ];
  await run('ffmpeg', args, { cwd: job });
}

// ---------------------------------------------------------------- office (LibreOffice)
const LO_FILTER = {
  document: {
    pdf: 'pdf:writer_pdf_Export', docx: 'docx:MS Word 2007 XML', odt: 'odt:writer8', rtf: 'rtf:Rich Text Format',
    txt: 'txt:Text (encoded):UTF8', html: 'html:XHTML Writer File:UTF8',
  },
  spreadsheet: {
    pdf: 'pdf:calc_pdf_Export', xlsx: 'xlsx:Calc MS Excel 2007 XML', ods: 'ods:calc8',
    csv: 'csv:Text - txt - csv (StarCalc):44,34,76', html: 'html:XHTML Calc File:UTF8',
  },
  presentation: { pdf: 'pdf:impress_pdf_Export', pptx: 'pptx:Impress MS PowerPoint 2007 XML', odp: 'odp:impress8' },
};
const LO_INFILTER = { txt: 'Text (encoded):UTF8', csv: 'CSV:44,34,76' };

async function libreoffice(input, from, to, out, job, cat) {
  const outDir = path.join(job, 'lo-out');
  await mkdir(outDir);
  const args = [
    `-env:UserInstallation=file://${path.join(job, 'lo-profile')}`,
    '--headless', '--invisible', '--norestore', '--nolockcheck', '--nodefault', '--nologo',
  ];
  if (LO_INFILTER[from]) args.push(`--infilter=${LO_INFILTER[from]}`);
  args.push('--convert-to', LO_FILTER[cat][to], '--outdir', outDir, input);
  await run('soffice', args, { cwd: job, timeoutMs: 180_000 });
  const produced = (await readdir(outDir)).find((f) => f.toLowerCase().endsWith(`.${to}`));
  if (!produced) throw new ConversionError('engine_failed', 'LibreOffice produced no output');
  const { rename } = await import('node:fs/promises');
  await rename(path.join(outDir, produced), out);
}

// ---------------------------------------------------------------- PDF (poppler)
const MAX_PDF_PAGES = 50;
async function poppler(input, from, to, out, job) {
  if (to === 'txt') return run('pdftotext', ['-enc', 'UTF-8', '-l', '500', input, out], { cwd: job });
  const dir = path.join(job, 'pages');
  await mkdir(dir);
  await run('pdftoppm', ['-r', '110', '-l', String(MAX_PDF_PAGES), to === 'png' ? '-png' : '-jpeg', input, path.join(dir, 'page')], { cwd: job });
  const files = (await readdir(dir)).sort();
  if (!files.length) throw new ConversionError('engine_failed', 'no pages rendered');
  await run('zip', ['-q', '-X', '-j', out, ...files.map((f) => path.join(dir, f))], { cwd: job });
}

// ---------------------------------------------------------------- markup / e-books (pandoc)
const PANDOC_READ = { md: 'markdown', html: 'html', epub: 'epub' };
const PANDOC_WRITE = { epub: 'epub3', html: 'html5', md: 'gfm', docx: 'docx', odt: 'odt', txt: 'plain' };
const PANDOC_SANDBOX_OK = new Set(['html', 'md', 'txt']);

// Replace every image with its alt text, drop raw markup and all metadata, so the writer has
// nothing to fetch (no local paths, URLs, cover images, CSS or reference docs).
function stripResources(node) {
  if (Array.isArray(node)) return node.map(stripResources);
  if (node && typeof node === 'object') {
    if (node.t === 'Image') return { t: 'Span', c: [['', [], []], stripResources(node.c[1])] };
    // Raw HTML/LaTeX can carry <img src=...> that some writers (EPUB) would fetch.
    if (node.t === 'RawInline') return { t: 'Str', c: '' };
    if (node.t === 'RawBlock') return { t: 'Plain', c: [] };
    const outObj = {};
    for (const [k, v] of Object.entries(node)) outObj[k] = stripResources(v);
    return outObj;
  }
  return node;
}

async function pandoc(input, from, to, out, job) {
  const opts = { cwd: job, timeoutMs: 120_000 };
  if (PANDOC_SANDBOX_OK.has(to)) {
    // --sandbox: pandoc may not read other local files or fetch anything from the network.
    await run('pandoc', ['--sandbox', '-f', PANDOC_READ[from], '-t', PANDOC_WRITE[to], '-s', '--metadata', 'title=Converted', '-o', out, input], opts);
    return;
  }
  // pandoc 3.1's docx/odt/epub writers cannot run under --sandbox (they need bundled data files),
  // so parse in the sandbox to JSON, strip anything that could be fetched, then write.
  const astPath = path.join(job, 'ast.json');
  await run('pandoc', ['--sandbox', '-f', PANDOC_READ[from], '-t', 'json', '-o', astPath, input], opts);
  const { readFile, writeFile } = await import('node:fs/promises');
  const ast = JSON.parse(await readFile(astPath, 'utf8'));
  const clean = { ...ast, meta: { title: { t: 'MetaInlines', c: [{ t: 'Str', c: 'Converted' }] } }, blocks: stripResources(ast.blocks) };
  await writeFile(astPath, JSON.stringify(clean));
  await run('pandoc', ['-f', 'json', '-t', PANDOC_WRITE[to], '--resource-path', job, '-o', out, astPath], opts);
}

// ---------------------------------------------------------------- archives
const ARCHIVE_MAX_TOTAL = 500 * 1024 * 1024; // zip-bomb guard: max uncompressed size
const ARCHIVE_MAX_ENTRIES = 5000;

async function inspectZip(input, job) {
  // zipinfo lines: "-rw-r--r--  3.0 unx   1234 tx defN 24-Jan-01 12:00 name"
  const { stdout } = await run('unzip', ['-Z', '-l', input], { cwd: job });
  let total = 0, count = 0;
  for (const line of stdout.split('\n')) {
    const m = line.match(/^([-dlpscbr?][-rwxsStT?]{9}|[-dlpscbr?][-rwxsStT?]{8,}\S*)\s+\S+\s+\S+\s+(\d+)/);
    if (!m) continue;
    if (!['-', 'd'].includes(m[1][0])) throw new ConversionError('archive_unsafe', 'links/special files are not allowed');
    if (unsafeName(line.split(/\s+/).slice(9).join(' '))) throw new ConversionError('archive_unsafe', 'path traversal');
    total += Number(m[2]);
    count += 1;
  }
  return { total, count };
}

const unsafeName = (n) => n.startsWith('/') || n.split(/[\\/]/).includes('..');

async function inspectTar(input, job, gz) {
  const { stdout } = await run('tar', [gz ? '-tzvf' : '-tvf', input], { cwd: job });
  let total = 0, count = 0;
  for (const line of stdout.split('\n')) {
    if (!line.trim()) continue;
    const type = line[0];
    if (!['-', 'd'].includes(type)) throw new ConversionError('archive_unsafe', 'links/special files are not allowed');
    const parts = line.trim().split(/\s+/);
    if (unsafeName(parts.slice(5).join(' '))) throw new ConversionError('archive_unsafe', 'path traversal');
    const size = Number(parts[2]);
    total += Number.isFinite(size) ? size : 0;
    count += 1;
  }
  return { total, count };
}

async function archive(input, from, to, out, job) {
  const info = from === 'zip' ? await inspectZip(input, job) : await inspectTar(input, job, from === 'tgz');
  if (info.count > ARCHIVE_MAX_ENTRIES || info.total > ARCHIVE_MAX_TOTAL) throw new ConversionError('archive_too_big');
  const dir = path.join(job, 'unpacked');
  await mkdir(dir);
  if (from === 'zip') await run('unzip', ['-qq', '-n', input, '-d', dir], { cwd: job }); // Info-ZIP strips "../" and absolute paths
  else await run('tar', [from === 'tgz' ? '-xzf' : '-xf', input, '-C', dir, '--no-same-owner', '--no-same-permissions'], { cwd: job });
  // Defence in depth: refuse if anything other than regular files/dirs appeared.
  const { stdout } = await run('find', [dir, '!', '-type', 'f', '!', '-type', 'd'], { cwd: job });
  if (stdout.trim()) throw new ConversionError('archive_unsafe');
  if (to === 'zip') await run('zip', ['-q', '-r', '-X', '-y', out, '.'], { cwd: dir });
  else await run('tar', [to === 'tgz' ? '-czf' : '-cf', out, '-C', dir, '.'], { cwd: job });
}

// ---------------------------------------------------------------- dispatcher
const ENGINES = { imagemagick, ffmpeg, libreoffice, poppler, pandoc, archive };

/** Converts `input` (already detected as `from`) into `to`. Returns the output path. */
export async function convert({ input: original, from, to, job }) {
  let input = original;
  const cat = categoryOf(from);
  if (!cat || !CATEGORIES[cat].outputs.includes(to) || from === to) throw new ConversionError('unsupported_pair');
  // Give the input its real (detected) extension; some engines (LibreOffice) rely on it.
  const { rename } = await import('node:fs/promises');
  const typed = path.join(job, `input.${from}`);
  await rename(input, typed);
  input = typed;
  const outExt = cat === 'pdf' && to !== 'txt' ? 'zip' : to;
  const out = path.join(job, `output.${outExt}`);
  await ENGINES[CATEGORIES[cat].engine](input, from, to, out, job, cat);
  const s = await stat(out).catch(() => null);
  if (!s || s.size === 0) throw new ConversionError('engine_failed', 'empty output');
  return { out, outExt, size: s.size, input };
}

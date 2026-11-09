# محوّل الملفات · File Converter

موقع مجاني لتحويل صيغ الملفات، بلا تسجيل دخول وبلا حساب، بواجهة عربية (RTL) وإنجليزية (LTR).
A free, no-account file-format converter with an Arabic (RTL) and English (LTR) interface.

> **الحالة:** الكود جاهز ومُختبَر على هذا الجهاز. **لم يُنشر على أي استضافة أو نطاق حقيقي.** رابط المعاينة المرفق صفحة ثابتة بلا خادم (وضع المعاينة: تحويل الصور داخل المتصفح فقط).
> **Status:** code complete and tested locally. **Not deployed to any real host or domain.** The preview link is a static page without the server.

اسم «محوّل الملفات» وصفي. التذييل: «صُنع بحب من أجل الخدمة المجانية · دعوة جميلة لأبي وأمي».

---

## 1. Overview

| | |
|---|---|
| Goal | Convert a file from one format to another, as easily as possible |
| Users | Anyone, free, no sign-in |
| Upload | Drag & drop or file picker, several files at once, upload progress bar |
| Choosing the output | After a file is added, only the formats valid for *that* file are shown as buttons |
| Result | Download button + "Delete now" button; files auto-delete after 15 minutes |
| Languages | Arabic (default, RTL) and English (LTR), switchable; light/dark theme |

## 2. Technology stack and why

| Layer | Choice | Reason |
|---|---|---|
| Server | Node.js 22 + Express 4 | Small, well known, easy to host on any VPS |
| Uploads | multer 2 (disk storage, strict limits) | Streams to disk, never trusts the client file name |
| Type detection | file-type 22 (magic bytes) + UTF-8 check for text | Detects the real format from content |
| Security headers | helmet 7 (strict CSP, HSTS, nosniff, no-referrer, frame-ancestors none) | |
| Rate limiting | express-rate-limit 7 | Per-IP limits on conversions and on all API calls |
| Images | ImageMagick 6 with a deny-all `policy/policy.xml` + pillow-heif for HEIC | |
| Audio / video | ffmpeg 6.1 (explicit demuxer, `-protocol_whitelist file`) | |
| Office docs | LibreOffice 24.2 headless (one private profile per job) | |
| PDF | poppler (`pdftotext`, `pdftoppm`) | |
| Markdown / HTML / EPUB | pandoc 3.1 (`--sandbox` reader, resources stripped before writing) | |
| Archives | Info-ZIP + GNU tar with pre-inspection | |
| Frontend | Plain HTML/CSS/JS, no framework, self-hosted fonts (Readex Pro, IBM Plex Sans Arabic, IBM Plex Mono — OFL) | Fast, no third-party requests, strict CSP |
| Deploy | Docker + docker-compose + Caddy (automatic HTTPS) | |

No database: jobs live in memory for 15 minutes and are not needed afterwards. No paid APIs are used.

## 3. Structure

```
src/server.js      HTTP server, security headers, rate limits, upload, queue, download, auto-delete
src/formats.js     the allow-list: categories, input/output formats, size limits
src/detect.js      real format detection from file bytes
src/convert.js     conversion engines (ImageMagick, ffmpeg, LibreOffice, poppler, pandoc, archives)
policy/policy.xml  restrictive ImageMagick policy (deny all coders, allow a short list)
scripts/heic2png.py  HEIC decoder (pillow-heif)
scripts/build-fonts.mjs   copies Arabic+Latin font subsets into public/fonts
scripts/build-preview.mjs builds a single-file static preview (preview/index.html)
public/            index.html, styles.css, app.js, fonts.css, fonts/
test/make-fixtures.sh  generates a sample file for every input format + hostile files
test/run-tests.mjs     end-to-end API tests (conversion matrix + security)
test/ui-test.cjs       browser tests with Playwright
Dockerfile, docker-compose.yml, deploy/Caddyfile
```

API: `GET /api/formats`, `POST /api/convert` (multipart: `file`, `target`), `GET /api/download/:id`, `DELETE /api/files/:id`, `GET /api/health`.

## 4. Supported formats (every pair below was converted and validated in the test run)

Max upload: images 25 MB, audio 50 MB, video 100 MB, documents 25 MB, spreadsheets 25 MB, presentations 50 MB, PDF 25 MB, e-books/text 10 MB, archives 50 MB (500 MB / 5,000 files after unpacking).

| From | To (tested ✓) |
|---|---|
| avi | gif, mkv, mov, mp3, mp4, wav, webm |
| avif | bmp, gif, ico, jpg, pdf, png, tiff, webp |
| bmp | gif, ico, jpg, pdf, png, tiff, webp |
| csv | html, ods, pdf, xlsx |
| doc | docx, html, odt, pdf, rtf, txt |
| docx | html, odt, pdf, rtf, txt |
| epub | docx, html, md, odt, txt |
| flac | m4a, mp3, ogg, opus, wav |
| gif | bmp, ico, jpg, pdf, png, tiff, webp |
| heic | bmp, gif, ico, jpg, pdf, png, tiff, webp |
| html | docx, epub, md, odt, txt |
| ico | bmp, gif, jpg, pdf, png, tiff, webp |
| jpg | bmp, gif, ico, pdf, png, tiff, webp |
| m4a | flac, mp3, ogg, opus, wav |
| md | docx, epub, html, odt, txt |
| mkv | avi, gif, mov, mp3, mp4, wav, webm |
| mov | avi, gif, mkv, mp3, mp4, wav, webm |
| mp3 | flac, m4a, ogg, opus, wav |
| mp4 | avi, gif, mkv, mov, mp3, wav, webm |
| odp | pdf, pptx |
| ods | csv, html, pdf, xlsx |
| odt | docx, html, pdf, rtf, txt |
| ogg | flac, m4a, mp3, opus, wav |
| opus | flac, m4a, mp3, ogg, wav |
| pdf | jpg, png, txt |
| png | bmp, gif, ico, jpg, pdf, tiff, webp |
| ppt | odp, pdf, pptx |
| pptx | odp, pdf |
| rtf | docx, html, odt, pdf, txt |
| tar | tgz, zip |
| tgz | tar, zip |
| tiff | bmp, gif, ico, jpg, pdf, png, webp |
| txt | docx, html, odt, pdf, rtf |
| wav | flac, m4a, mp3, ogg, opus |
| webm | avi, gif, mkv, mov, mp3, mp4, wav |
| webp | bmp, gif, ico, jpg, pdf, png, tiff |
| xls | csv, html, ods, pdf, xlsx |
| xlsx | csv, html, ods, pdf |
| zip | tar, tgz |
Notes:
- Animated GIF / multi-page TIFF → other image formats keep the **first frame/page** only.
- Video → GIF keeps the first 15 seconds at 10 fps, 480 px wide.
- PDF → PNG/JPG gives a ZIP with one image per page (first 50 pages). PDF → DOCX is **not** offered (quality too poor with free tools).
- Markdown/HTML/EPUB → DOCX/ODT/EPUB: images and raw HTML are removed on purpose (security: nothing can be pulled from disk or network). Images in DOCX/ODT/PPTX inputs are kept.
- Not supported (not tested, so not offered): SVG, PSD, RAW camera files, MOBI/AZW, RAR/7z, password-protected files.

## 5. Security measures

- **Real type check:** format detected from file bytes; the extension is used only to tell apart formats with identical containers (doc/xls/ppt, m4a/mp4). Unknown or mismatched files are refused (HTTP 415).
- **Allow-list only:** a conversion runs only if the (input, output) pair is in `src/formats.js`.
- **Size limits** per category plus a global multer cap; archives are inspected before unpacking (zip-bomb guard, links/special files refused, `..`/absolute paths refused).
- **Isolation:** each job gets a private random directory (mode 700); tools run via `execFile` (no shell) under `prlimit` (CPU time, max output size), `nice`, a wall-clock timeout with SIGKILL, and a scrubbed environment. ImageMagick runs with a deny-all policy and explicit coder prefixes; ffmpeg runs with an explicit demuxer and `protocol_whitelist file`; pandoc reads with `--sandbox`; LibreOffice never runs macros in headless convert mode and uses a throw-away profile.
- In Docker: read-only root, tmpfs for jobs, non-root user, all capabilities dropped, `no-new-privileges`, pid/memory/CPU limits, and **no internet egress** for the converter container (internal network).
- **Concurrency queue:** 2 conversions at a time, 20 waiting max (503 "busy" beyond that).
- **Rate limits:** 20 conversions per IP per 10 minutes; 120 API calls per IP per minute (configurable).
- **Auto-delete:** original deleted right after conversion; result deleted after 15 minutes or on "Delete now"; a sweeper removes leftovers every 30 s; the whole work dir is wiped on start/stop.
- **Downloads:** unguessable 128-bit IDs, `Content-Disposition: attachment`, `nosniff`, sandbox CSP, `no-store`.
- **Headers:** strict CSP (`script-src 'self'`, no inline scripts, `frame-ancestors 'none'`), HSTS (2 years, preload), `Referrer-Policy: no-referrer`, `Permissions-Policy`, no `X-Powered-By`.
- **HTTPS:** handled by Caddy (automatic certificates, HTTP→HTTPS redirect).
- No accounts, cookies, analytics or third-party requests (fonts are self-hosted).

Residual risks (honest): LibreOffice/ffmpeg/ImageMagick are large C/C++ codebases; the container hardening above is the main defense, so keep the image updated (`docker compose build --pull` monthly). The rate limit is in-memory, per instance.

## 6. Run locally

Requirements: Node 20+, ImageMagick 6, ffmpeg, LibreOffice, pandoc, poppler-utils, zip/unzip, python3 + `pip install pillow-heif`.

```bash
npm ci
npm run build:fonts      # only needed if public/fonts is missing
npm start                # http://localhost:8080
```

Environment variables: `PORT` (8080), `FILE_TTL_MS` (900000), `MAX_CONCURRENT` (2), `MAX_QUEUE` (20), `RATE_LIMIT_CONVERSIONS` (20 per 10 min), `RATE_LIMIT_GENERAL` (120 per min), `TRUST_PROXY` (`loopback`; set `1` behind one reverse proxy), `WORK_DIR`, `CONVERT_TIMEOUT_MS` (300000). No secrets are needed.

## 7. Tests

```bash
./test/make-fixtures.sh          # needs python-pptx and pillow-heif for the fixtures
npm test                         # API: conversion matrix + security
PORT=18090 npm start & node test/ui-test.cjs   # browser (needs Playwright + Chromium)
```

### Results of the run on 2026-11-05 (Ubuntu 24.04 container, Node 22.23)

- **API suite: 234 / 234 passed** — 204 conversion pairs (each output downloaded and its real type verified) + 30 security/behaviour checks:
  - PASS  rejects executable renamed to .png  (HTTP 415)
  - PASS  rejects SVG (not on allow-list)  (HTTP 415)
  - PASS  rejects fake .docx  (HTTP 415)
  - PASS  PDF renamed .png is detected as PDF (target png->pdf refused, pdf->pdf invalid)  (HTTP 400 unsupported_pair)
  - PASS  rejects unknown target format  (HTTP 400)
  - PASS  rejects cross-category target (png -> mp3)  (HTTP 400)
  - PASS  rejects oversized/invalid 30 MB upload  (HTTP 415 unsupported_type)
  - PASS  rejects zip containing a symlink  (HTTP 422 archive_unsafe)
  - PASS  rejects zip bomb (600 MB uncompressed)  (HTTP 422 archive_unsafe)
  - PASS  tar path traversal entry is refused  (HTTP 422 archive_unsafe)
  - PASS  no file escaped the job folder
  - PASS  markdown -> docx does not embed local files  (HTTP 200)
  - PASS  markdown -> odt does not embed local files  (HTTP 200)
  - PASS  markdown -> epub does not embed local files  (HTTP 200)
  - PASS  markdown -> html does not embed local files  (HTTP 200)
  - PASS  download rejects path traversal id  (HTTP 404)
  - PASS  download rejects unknown id  (HTTP 404)
  - PASS  delete endpoint removes the result immediately
  - PASS  Content-Security-Policy set
  - PASS  HSTS header set
  - PASS  X-Content-Type-Options: nosniff
  - PASS  Referrer-Policy: no-referrer
  - PASS  X-Powered-By removed
  - PASS  static asset /styles.css served
  - PASS  static asset /app.js served
  - PASS  unknown API route returns 404
  - PASS  dotfile request handled safely
  - PASS  rate limit: 4th conversion in window gets 429  (200,200,200,429,429)
  - PASS  result expires after TTL  (HTTP 404)
  - PASS  sweeper deleted expired job folders from disk  (0 left)
- **Browser suite: 11 / 11 passed** — Arabic RTL default, server mode, file-picker upload → WebP download with correct name, Delete now, drag-and-drop MP4 → MP3, targets match file type, clear error for unsupported file, English LTR switch, nav links, no horizontal scroll at 390 px, no console errors.
- **Static preview mode:** banner shown, PNG → JPG converted in the browser, MP3 shows the "needs the server" message, no JS errors.

Not tested: the Docker image build and docker-compose stack (Docker was not available in the build environment), real HTTPS/Caddy, load testing, Safari/Firefox (only Chromium was tested).

## 8. Deployment (needs your approval — nothing was deployed)

1. Get a Linux VPS (2+ vCPU, 4 GB RAM, 40 GB disk) and a domain; point the domain's A record to the server. *(paid — your decision)*
2. Install Docker and the compose plugin.
3. Copy this project to the server, set your domain in `deploy/Caddyfile` (replace `example.com`).
4. `docker compose up -d --build`
5. Check: `https://your-domain/api/health` returns `{"ok":true}`, then convert a test file.
6. Add a privacy policy/terms page if required where you operate.

## 9. Known limitations / remaining tasks

- Conversions are synchronous per request (fine for files up to 100 MB; very long videos may hit the 5-minute timeout).
- One server instance: the job store and rate limits are in memory. For several instances, move them to Redis.
- Markup → DOCX/ODT/EPUB drops images (security trade-off, see §4).
- No legal pages (privacy policy / terms) yet.
- The static preview only demonstrates the interface and image conversion; downloads there are disabled by the preview host (save the image by right-click / long press).

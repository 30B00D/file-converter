// Detects the real format of an uploaded file from its bytes (magic numbers),
// never trusting the client-supplied name or MIME type alone.
import { open } from 'node:fs/promises';
import { fileTypeFromFile } from 'file-type';
import { categoryOf } from './formats.js';

const FT_MAP = {
  jpg: 'jpg', png: 'png', webp: 'webp', gif: 'gif', bmp: 'bmp', tif: 'tiff', ico: 'ico',
  avif: 'avif', heic: 'heic', mp3: 'mp3', wav: 'wav', ogg: 'ogg', oga: 'ogg', opus: 'opus', flac: 'flac',
  m4a: 'm4a', mp4: 'mp4', mov: 'mov', qt: 'mov', webm: 'webm', mkv: 'mkv', avi: 'avi',
  docx: 'docx', odt: 'odt', rtf: 'rtf', xlsx: 'xlsx', ods: 'ods', pptx: 'pptx', odp: 'odp',
  pdf: 'pdf', epub: 'epub', zip: 'zip', tar: 'tar',
};

const TEXT_EXTS = new Set(['txt', 'csv', 'md', 'markdown', 'html', 'htm']);

export function extOf(name) {
  const lower = String(name || '').toLowerCase();
  if (lower.endsWith('.tar.gz')) return 'tgz';
  const m = lower.match(/\.([a-z0-9]{1,10})$/);
  if (!m) return '';
  const e = m[1];
  return { jpeg: 'jpg', tif: 'tiff', htm: 'html', markdown: 'md', aac: 'm4a' }[e] || e;
}

async function looksLikeUtf8Text(path) {
  const fh = await open(path, 'r');
  try {
    const buf = Buffer.alloc(64 * 1024);
    const { bytesRead } = await fh.read(buf, 0, buf.length, 0);
    const chunk = buf.subarray(0, bytesRead);
    if (chunk.includes(0)) return false;
    try {
      // Allow a multi-byte character cut at the chunk edge.
      new TextDecoder('utf-8', { fatal: true }).decode(bytesRead === buf.length ? chunk.subarray(0, -4) : chunk);
      return true;
    } catch {
      return false;
    }
  } finally {
    await fh.close();
  }
}

/** Returns our internal format id (e.g. "docx") or null when the file is not allowed. */
export async function detectFormat(path, originalName) {
  const claimed = extOf(originalName);
  const ft = await fileTypeFromFile(path);

  if (ft) {
    if (ft.ext === 'cfb') {
      // Legacy MS Office (OLE container): only the extension tells doc/xls/ppt apart.
      return ['doc', 'xls', 'ppt'].includes(claimed) ? claimed : null;
    }
    if (ft.ext === 'gz' || ft.ext === 'tar.gz') return claimed === 'tgz' ? 'tgz' : null;
    if (ft.ext === 'mp4' && claimed === 'm4a') return 'm4a';
    if (ft.ext === 'ogg' && claimed === 'opus') return 'opus';
    if (ft.ext === 'xml' && claimed === 'html') return (await looksLikeUtf8Text(path)) ? 'html' : null;
    const fmt = FT_MAP[ft.ext];
    return fmt && categoryOf(fmt) ? fmt : null;
  }

  // Formats without magic bytes: accept only plain UTF-8 text with a text extension.
  if (TEXT_EXTS.has(claimed) || claimed === 'md' || claimed === 'html') {
    return (await looksLikeUtf8Text(path)) ? claimed : null;
  }
  return null;
}

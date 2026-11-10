// Single source of truth for what the server accepts and what it can produce.
// Only formats listed here are accepted; everything else is rejected.

export const MB = 1024 * 1024;

// category -> engine, max upload size, input formats, output formats
export const CATEGORIES = {
  image: {
    engine: 'imagemagick',
    maxBytes: 25 * MB,
    inputs: ['png', 'jpg', 'webp', 'gif', 'bmp', 'tiff', 'ico', 'avif', 'heic'],
    outputs: ['png', 'jpg', 'webp', 'gif', 'bmp', 'tiff', 'ico', 'pdf'],
  },
  audio: {
    engine: 'ffmpeg',
    maxBytes: 50 * MB,
    inputs: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'opus'],
    outputs: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'opus'],
  },
  video: {
    engine: 'ffmpeg',
    maxBytes: 100 * MB,
    inputs: ['mp4', 'webm', 'mkv', 'avi', 'mov'],
    outputs: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'gif', 'mp3', 'wav'],
  },
  document: {
    engine: 'libreoffice',
    maxBytes: 25 * MB,
    inputs: ['docx', 'doc', 'odt', 'rtf', 'txt'],
    outputs: ['pdf', 'docx', 'odt', 'rtf', 'txt', 'html'],
  },
  spreadsheet: {
    engine: 'libreoffice',
    maxBytes: 25 * MB,
    inputs: ['xlsx', 'xls', 'ods', 'csv'],
    outputs: ['xlsx', 'ods', 'csv', 'pdf', 'html'],
  },
  presentation: {
    engine: 'libreoffice',
    maxBytes: 50 * MB,
    inputs: ['pptx', 'ppt', 'odp'],
    outputs: ['pdf', 'pptx', 'odp'],
  },
  pdf: {
    engine: 'poppler',
    maxBytes: 25 * MB,
    inputs: ['pdf'],
    outputs: ['txt', 'png', 'jpg'], // png/jpg -> one image per page, packed in a .zip
  },
  ebook: {
    engine: 'pandoc',
    maxBytes: 10 * MB,
    inputs: ['md', 'html', 'epub'],
    outputs: ['epub', 'html', 'md', 'docx', 'odt', 'txt'],
  },
  archive: {
    engine: 'archive',
    maxBytes: 50 * MB,
    inputs: ['zip', 'tar', 'tgz'],
    outputs: ['zip', 'tar', 'tgz'],
  },
};

export const MIME = {
  png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', bmp: 'image/bmp',
  tiff: 'image/tiff', ico: 'image/x-icon', avif: 'image/avif', heic: 'image/heic',
  pdf: 'application/pdf', mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac',
  m4a: 'audio/mp4', opus: 'audio/ogg', mp4: 'video/mp4', webm: 'video/webm', mkv: 'video/x-matroska',
  avi: 'video/x-msvideo', mov: 'video/quicktime',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword', odt: 'application/vnd.oasis.opendocument.text', rtf: 'application/rtf',
  txt: 'text/plain; charset=utf-8', html: 'text/html; charset=utf-8', md: 'text/markdown; charset=utf-8',
  csv: 'text/csv; charset=utf-8',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel', ods: 'application/vnd.oasis.opendocument.spreadsheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint', odp: 'application/vnd.oasis.opendocument.presentation',
  epub: 'application/epub+zip', zip: 'application/zip', tar: 'application/x-tar', tgz: 'application/gzip',
};

export function categoryOf(fmt) {
  for (const [name, c] of Object.entries(CATEGORIES)) if (c.inputs.includes(fmt)) return name;
  return null;
}

export function targetsFor(fmt) {
  const cat = categoryOf(fmt);
  if (!cat) return [];
  return CATEGORIES[cat].outputs.filter((o) => o !== fmt);
}

export const MAX_UPLOAD = Math.max(...Object.values(CATEGORIES).map((c) => c.maxBytes));

(() => {
  'use strict';

  // ------------------------------------------------------------------ text
  const T = {
    ar: {
      brand: 'محوّل الملفات', navFormats: 'الصيغ المدعومة', navPrivacy: 'الخصوصية والأمان', themeAria: 'تبديل المظهر',
      heroTitle: 'حوّل أي ملف إلى الصيغة التي تحتاجها',
      heroLead: 'مجاني للجميع، بلا تسجيل دخول وبلا حساب. ارفع الملف، اختر الصيغة، ونزّل النتيجة. نحذف كل الملفات تلقائياً بعد وقت قصير.',
      trust1: 'بلا حساب', trust2: 'حذف تلقائي بعد {ttl} دقيقة', trust3: 'اتصال مشفّر HTTPS',
      pvTitle: 'وضع المعاينة',
      pvText: 'خادم التحويل غير متصل بهذه الصفحة، لذا تعمل هنا تحويلات الصور (PNG وJPG وWebP) داخل متصفحك فقط. بقية الصيغ تعمل عند تشغيل الموقع على خادمه.',
      dzTitle: 'اسحب ملفاتك وأفلتها هنا', dzOr: 'أو', dzBtn: 'اختر ملفاً من جهازك', dzHint: 'حتى 100 ميغابايت للفيديو، وأقل لبقية الأنواع.',
      fmtTitle: 'الصيغ المدعومة', fmtLead: 'كل صيغة أدناه اختُبرت فعلياً على الخادم. اختر الملف وستظهر لك الصيغ المتاحة له تلقائياً.',
      from: 'من', to: 'إلى', maxSize: 'الحد الأقصى', serverOnly: 'تعمل على الخادم فقط',
      privTitle: 'الخصوصية والأمان',
      p1t: 'حذف تلقائي', p1: 'يُحذف الملف الأصلي فور انتهاء التحويل، ويُحذف الملف الناتج بعد {ttl} دقيقة أو فور ضغطك زر الحذف.',
      p2t: 'فحص حقيقي للملف', p2: 'نتحقق من نوع الملف من محتواه لا من اسمه، ونرفض الأنواع غير المدعومة والأحجام الزائدة.',
      p3t: 'تحويل معزول', p3: 'كل تحويل يجري في مجلد مؤقت خاص به، بحدود للوقت والذاكرة، ودون تشغيل أي ماكرو أو برنامج داخل الملف.',
      p4t: 'بلا حساب أو تتبّع', p4: 'لا تسجيل دخول ولا ملفات تعريف إعلانية. نحدّ عدد التحويلات لكل زائر لمنع إساءة الاستخدام.',
      footNote: 'صُنع بحب من أجل الخدمة المجانية · دعوة جميلة لأبي وأمي',
      cat: { image: 'صور', audio: 'صوت', video: 'فيديو', document: 'مستندات', spreadsheet: 'جداول', presentation: 'عروض تقديمية', pdf: 'PDF', ebook: 'كتب إلكترونية ونصوص', archive: 'أرشيفات' },
      convertTo: 'حوّل إلى:', convert: 'حوّل الآن', converting: 'جارٍ التحويل…', uploading: 'جارٍ الرفع {p}٪',
      done: 'تمّ التحويل. الملف متاح للتنزيل حتى {time}.', download: 'نزّل {name}', del: 'احذف الآن', deleted: 'حُذف الملف من الخادم.',
      chooseFirst: 'اختر الصيغة أولاً.', retry: 'حاول مجدداً', pdfPages: 'صور الصفحات تصلك في ملف ZIP (حتى 50 صفحة).',
      localDone: 'تمّ التحويل داخل متصفحك ولم يُرفع الملف. احفظ الصورة بالضغط المطوّل عليها أو بالزر الأيمن ثم «حفظ الصورة».',
      remove: 'إزالة',
      err: {
        unsupported_type: 'نوع هذا الملف غير مدعوم، أو أن محتواه لا يطابق امتداده.',
        unsupported_pair: 'لا يمكن تحويل هذا الملف إلى الصيغة المختارة.',
        too_large: 'الملف أكبر من الحد المسموح لهذا النوع ({max}).',
        rate_limited: 'وصلت إلى حد التحويلات المؤقت. انتظر بضع دقائق ثم حاول مجدداً.',
        busy: 'الخادم مشغول الآن. حاول بعد دقيقة.', timeout: 'استغرق التحويل وقتاً أطول من المسموح. جرّب ملفاً أصغر.',
        archive_unsafe: 'رفضنا الأرشيف لأنه يحتوي على روابط رمزية أو ملفات خاصة غير آمنة.',
        archive_too_big: 'الأرشيف بعد فك الضغط أكبر من 500 ميغابايت أو يحوي أكثر من 5000 ملف.',
        expired: 'انتهت صلاحية الملف وحُذف. حوّله من جديد.',
        engine_failed: 'تعذّر تحويل الملف. قد يكون تالفاً أو محمياً بكلمة مرور.',
        network: 'انقطع الاتصال بالخادم. تحقق من الإنترنت وحاول مجدداً.',
        local_only: 'هذه الصيغة تحتاج خادم التحويل، وهو غير متصل في وضع المعاينة.',
      },
    },
    en: {
      brand: 'File Converter', navFormats: 'Formats', navPrivacy: 'Privacy & security', themeAria: 'Toggle theme',
      heroTitle: 'Convert any file to the format you need',
      heroLead: 'Free for everyone. No sign-in, no account. Upload a file, pick a format, download the result. Every file is deleted automatically shortly after.',
      trust1: 'No account', trust2: 'Auto-deleted after {ttl} min', trust3: 'Encrypted HTTPS',
      pvTitle: 'Preview mode',
      pvText: 'The conversion server is not connected to this page, so only image conversions (PNG, JPG, WebP) run here, inside your browser. All other formats work once the site runs on its server.',
      dzTitle: 'Drag and drop your files here', dzOr: 'or', dzBtn: 'Choose a file', dzHint: 'Up to 100 MB for video, less for other types.',
      fmtTitle: 'Supported formats', fmtLead: 'Every format below was tested on the server. Add a file and the formats available for it appear automatically.',
      from: 'From', to: 'To', maxSize: 'Max size', serverOnly: 'Server only',
      privTitle: 'Privacy & security',
      p1t: 'Automatic deletion', p1: 'The original is deleted as soon as the conversion ends; the result is deleted after {ttl} minutes, or right away when you press Delete.',
      p2t: 'Real file checks', p2: 'We check the file type from its content, not its name, and reject unsupported types and oversized files.',
      p3t: 'Isolated conversion', p3: 'Each conversion runs in its own temporary folder with time and memory limits, and never runs macros or code from your file.',
      p4t: 'No account, no tracking', p4: 'No sign-in and no ad trackers. Conversions per visitor are rate-limited to prevent abuse.',
      footNote: 'Made with love as a free service · A kind prayer for my father and mother',
      cat: { image: 'Images', audio: 'Audio', video: 'Video', document: 'Documents', spreadsheet: 'Spreadsheets', presentation: 'Presentations', pdf: 'PDF', ebook: 'E-books & text', archive: 'Archives' },
      convertTo: 'Convert to:', convert: 'Convert now', converting: 'Converting…', uploading: 'Uploading {p}%',
      done: 'Done. Available to download until {time}.', download: 'Download {name}', del: 'Delete now', deleted: 'The file was deleted from the server.',
      chooseFirst: 'Pick a format first.', retry: 'Try again', pdfPages: 'Page images arrive in a ZIP file (up to 50 pages).',
      localDone: 'Converted in your browser; nothing was uploaded. Save the image with a long press or right-click, then "Save image".',
      remove: 'Remove',
      err: {
        unsupported_type: 'This file type is not supported, or its content does not match its extension.',
        unsupported_pair: 'This file cannot be converted to the selected format.',
        too_large: 'The file is larger than the limit for this type ({max}).',
        rate_limited: 'You reached the temporary conversion limit. Wait a few minutes and try again.',
        busy: 'The server is busy. Try again in a minute.', timeout: 'The conversion took too long. Try a smaller file.',
        archive_unsafe: 'The archive was rejected because it contains symbolic links or special files.',
        archive_too_big: 'The archive unpacks to more than 500 MB or holds more than 5,000 files.',
        expired: 'The file expired and was deleted. Convert it again.',
        engine_failed: 'The file could not be converted. It may be damaged or password-protected.',
        network: 'Lost connection to the server. Check your internet and try again.',
        local_only: 'This format needs the conversion server, which is not connected in preview mode.',
      },
    },
  };

  // Fallback copy of the server matrix (used until /api/formats answers, and in preview mode).
  const MB = 1024 * 1024;
  let FORMATS = {
    image: { inputs: ['png', 'jpg', 'webp', 'gif', 'bmp', 'tiff', 'ico', 'avif', 'heic'], outputs: ['png', 'jpg', 'webp', 'gif', 'bmp', 'tiff', 'ico', 'pdf'], maxBytes: 25 * MB },
    audio: { inputs: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'opus'], outputs: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'opus'], maxBytes: 50 * MB },
    video: { inputs: ['mp4', 'webm', 'mkv', 'avi', 'mov'], outputs: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'gif', 'mp3', 'wav'], maxBytes: 100 * MB },
    document: { inputs: ['docx', 'doc', 'odt', 'rtf', 'txt'], outputs: ['pdf', 'docx', 'odt', 'rtf', 'txt', 'html'], maxBytes: 25 * MB },
    spreadsheet: { inputs: ['xlsx', 'xls', 'ods', 'csv'], outputs: ['xlsx', 'ods', 'csv', 'pdf', 'html'], maxBytes: 25 * MB },
    presentation: { inputs: ['pptx', 'ppt', 'odp'], outputs: ['pdf', 'pptx', 'odp'], maxBytes: 50 * MB },
    pdf: { inputs: ['pdf'], outputs: ['txt', 'png', 'jpg'], maxBytes: 25 * MB },
    ebook: { inputs: ['md', 'html', 'epub'], outputs: ['epub', 'html', 'md', 'docx', 'odt', 'txt'], maxBytes: 10 * MB },
    archive: { inputs: ['zip', 'tar', 'tgz'], outputs: ['zip', 'tar', 'tgz'], maxBytes: 50 * MB },
  };
  let TTL = 15;
  // Browser-only converters for preview mode (no server): images through <canvas>.
  const LOCAL = { inputs: ['png', 'jpg', 'webp', 'gif', 'bmp'], outputs: ['png', 'jpg', 'webp'] };
  const LOCAL_MIME = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };

  let mode = 'checking'; // 'server' | 'local'
  let lang = 'ar';
  try { lang = localStorage.getItem('fc-lang') || 'ar'; } catch { /* storage unavailable */ }
  if (!T[lang]) lang = 'ar';

  const $ = (s, el = document) => el.querySelector(s);
  const t = (k) => k.split('.').reduce((o, p) => (o ? o[p] : undefined), T[lang]) ?? k;
  const fmt = (s, vars) => String(s).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));

  function humanSize(b) {
    const units = lang === 'ar' ? ['بايت', 'ك.ب', 'م.ب', 'غ.ب'] : ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (b >= 1024 && i < units.length - 1) { b /= 1024; i += 1; }
    return `${b.toFixed(i && b < 10 ? 1 : 0)} ${units[i]}`;
  }

  function extOf(name) {
    const lower = String(name || '').toLowerCase();
    if (lower.endsWith('.tar.gz')) return 'tgz';
    const m = lower.match(/\.([a-z0-9]{1,10})$/);
    if (!m) return '';
    return { jpeg: 'jpg', tif: 'tiff', htm: 'html', markdown: 'md', aac: 'm4a' }[m[1]] || m[1];
  }
  function categoryOf(ext) {
    for (const [k, c] of Object.entries(FORMATS)) if (c.inputs.includes(ext)) return k;
    return null;
  }

  // ------------------------------------------------------------------ i18n + theme
  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = fmt(t(el.dataset.i18n), { ttl: TTL }); });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
    $('#langBtn').textContent = lang === 'ar' ? 'English' : 'العربية';
    document.title = t('brand');
    renderFormats();
    items.forEach((it) => it.render());
  }
  $('#langBtn').addEventListener('click', () => {
    lang = lang === 'ar' ? 'en' : 'ar';
    try { localStorage.setItem('fc-lang', lang); } catch { /* ignore */ }
    applyLang();
  });
  try { const th = localStorage.getItem('fc-theme'); if (th) document.documentElement.dataset.theme = th; } catch { /* ignore */ }
  $('#themeBtn').addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('fc-theme', next); } catch { /* ignore */ }
  });

  // ------------------------------------------------------------------ formats map
  function renderFormats() {
    const grid = $('#formatGrid');
    grid.textContent = '';
    for (const [k, c] of Object.entries(FORMATS)) {
      const card = document.createElement('article');
      card.className = 'fmt-card';
      card.style.setProperty('--cat', `var(--c-${k})`);
      const localOk = k === 'image';
      if (mode === 'local' && !localOk) card.classList.add('local-off');
      const h = document.createElement('h3');
      h.textContent = t(`cat.${k}`);
      card.append(h);
      for (const [label, list] of [[t('from'), c.inputs], [t('to'), c.outputs]]) {
        const row = document.createElement('div');
        row.className = 'fmt-row';
        const l = document.createElement('span');
        l.textContent = label;
        const tags = document.createElement('div');
        tags.className = 'tags';
        list.forEach((x) => { const s = document.createElement('span'); s.className = 'tag'; s.textContent = x; tags.append(s); });
        row.append(l, tags);
        card.append(row);
      }
      const max = document.createElement('div');
      max.className = 'fmt-row';
      max.textContent = `${t('maxSize')}: ${humanSize(c.maxBytes)}${mode === 'local' && !localOk ? ` · ${t('serverOnly')}` : ''}`;
      card.append(max);
      grid.append(card);
    }
  }

  // ------------------------------------------------------------------ queue items
  const items = [];
  const tpl = $('#itemTpl');

  class Item {
    constructor(file) {
      this.file = file;
      this.ext = extOf(file.name);
      this.cat = categoryOf(this.ext);
      this.target = null;
      this.state = 'idle'; // idle | uploading | converting | done | error | deleted
      this.error = null;
      this.result = null;
      this.progress = 0;
      this.el = tpl.content.firstElementChild.cloneNode(true);
      $('.remove', this.el).addEventListener('click', () => this.remove());
      if (!this.cat) { this.state = 'error'; this.error = 'unsupported_type'; }
      else if (file.size > FORMATS[this.cat].maxBytes) { this.state = 'error'; this.error = 'too_large'; }
      $('#queue').prepend(this.el);
      this.render();
    }

    targets() {
      if (!this.cat) return [];
      if (mode === 'local') return LOCAL.inputs.includes(this.ext) ? LOCAL.outputs.filter((o) => o !== this.ext) : [];
      return FORMATS[this.cat].outputs.filter((o) => o !== this.ext);
    }

    render() {
      const el = this.el;
      const badge = $('.ext-badge', el);
      badge.textContent = this.ext || '?';
      badge.style.setProperty('--cat', this.cat ? `var(--c-${this.cat})` : 'var(--muted)');
      $('.item-name', el).textContent = this.file.name;
      $('.item-sub', el).textContent = `${humanSize(this.file.size)}${this.cat ? ` · ${t(`cat.${this.cat}`)}` : ''}`;
      $('.remove', el).setAttribute('aria-label', `${t('remove')}: ${this.file.name}`);
      $('.to-label', el).textContent = t('convertTo');

      const targets = this.targets();
      const unsupportedHere = this.cat && !targets.length;
      el.classList.toggle('unsupported', !this.cat || unsupportedHere || this.state === 'error' && !this.cat);

      const box = $('.targets', el);
      box.textContent = '';
      box.setAttribute('aria-label', t('convertTo'));
      const busy = this.state === 'uploading' || this.state === 'converting';
      targets.forEach((o) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip';
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', String(this.target === o));
        b.textContent = o;
        b.disabled = busy;
        b.addEventListener('click', () => {
          this.target = o;
          if (this.state !== 'idle') { this.state = 'idle'; this.result = null; this.error = null; }
          this.render();
        });
        box.append(b);
      });

      const prog = $('.progress', el);
      prog.hidden = !busy;
      prog.classList.toggle('indeterminate', this.state === 'converting');
      $('span', prog).style.width = `${this.progress}%`;

      const status = $('.status', el);
      status.className = 'status';
      const actions = $('.actions', el);
      actions.textContent = '';

      if (unsupportedHere && this.state !== 'error') { this.state = 'error'; this.error = 'local_only'; }

      if (this.state === 'error') {
        status.classList.add('err');
        status.textContent = fmt(t(`err.${this.error}`) || t('err.engine_failed'), { max: this.cat ? humanSize(FORMATS[this.cat].maxBytes) : '' });
        if (this.cat && targets.length && !['too_large', 'unsupported_type'].includes(this.error)) actions.append(this.button(t('retry'), 'primary', () => this.start()));
      } else if (this.state === 'uploading') {
        status.textContent = fmt(t('uploading'), { p: Math.round(this.progress) });
      } else if (this.state === 'converting') {
        status.textContent = t('converting');
      } else if (this.state === 'done' && this.result?.local) {
        status.classList.add('ok');
        status.textContent = t('localDone');
        const img = document.createElement('img');
        img.className = 'result-img';
        img.src = this.result.url;
        img.alt = this.result.name;
        actions.append(img);
      } else if (this.state === 'done') {
        status.classList.add('ok');
        const time = new Date(this.result.expiresAt).toLocaleTimeString(lang === 'ar' ? 'ar' : 'en', { hour: '2-digit', minute: '2-digit' });
        status.textContent = fmt(t('done'), { time }) + (this.cat === 'pdf' && this.target !== 'txt' ? ` ${t('pdfPages')}` : '');
        const a = document.createElement('a');
        a.className = 'btn result';
        a.href = `api/download/${this.result.id}`;
        a.setAttribute('download', this.result.name);
        a.textContent = fmt(t('download'), { name: this.result.name });
        actions.append(a, this.button(t('del'), 'ghost', () => this.deleteRemote()));
      } else if (this.state === 'deleted') {
        status.textContent = t('deleted');
      } else if (this.target) {
        actions.append(this.button(t('convert'), 'primary', () => this.start()));
      }
    }

    button(label, kind, onClick) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `btn ${kind}`;
      b.textContent = label;
      b.addEventListener('click', onClick);
      return b;
    }

    async start() {
      if (!this.target) return;
      this.error = null;
      if (mode === 'local') return this.convertLocal();
      this.state = 'uploading';
      this.progress = 0;
      this.render();
      const fd = new FormData();
      fd.append('target', this.target);
      fd.append('file', this.file, this.file.name);
      const xhr = new XMLHttpRequest();
      this.xhr = xhr;
      xhr.open('POST', 'api/convert');
      xhr.responseType = 'json';
      xhr.upload.onprogress = (e) => {
        if (!e.lengthComputable) return;
        this.progress = (e.loaded / e.total) * 100;
        if (this.progress >= 100) this.state = 'converting';
        this.render();
      };
      xhr.upload.onload = () => { this.state = 'converting'; this.render(); };
      xhr.onload = () => {
        const body = xhr.response || {};
        if (xhr.status === 200 && body.id) { this.state = 'done'; this.result = body; }
        else { this.state = 'error'; this.error = body.error || (xhr.status === 429 ? 'rate_limited' : xhr.status === 413 ? 'too_large' : 'engine_failed'); }
        this.render();
      };
      xhr.onerror = () => { this.state = 'error'; this.error = 'network'; this.render(); };
      xhr.send(fd);
    }

    async convertLocal() {
      this.state = 'converting';
      this.render();
      try {
        const bmp = await createImageBitmap(this.file);
        const canvas = document.createElement('canvas');
        canvas.width = bmp.width;
        canvas.height = bmp.height;
        const ctx = canvas.getContext('2d');
        if (this.target === 'jpg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        ctx.drawImage(bmp, 0, 0);
        const blob = await new Promise((res) => canvas.toBlob(res, LOCAL_MIME[this.target], 0.92));
        if (!blob || blob.type !== LOCAL_MIME[this.target]) throw new Error('encode');
        if (this.result?.url) URL.revokeObjectURL(this.result.url);
        const base = this.file.name.replace(/\.[^.]*$/, '') || 'image';
        this.result = { local: true, url: URL.createObjectURL(blob), name: `${base}.${this.target}` };
        this.state = 'done';
      } catch {
        this.state = 'error';
        this.error = 'engine_failed';
      }
      this.render();
    }

    async deleteRemote() {
      try { await fetch(`api/files/${this.result.id}`, { method: 'DELETE' }); } catch { /* the server deletes it anyway after the TTL */ }
      this.state = 'deleted';
      this.render();
    }

    remove() {
      if (this.xhr && this.state !== 'done') this.xhr.abort();
      if (this.result?.local) URL.revokeObjectURL(this.result.url);
      if (this.state === 'done' && !this.result?.local) this.deleteRemote();
      this.el.remove();
      items.splice(items.indexOf(this), 1);
    }
  }

  function addFiles(list) {
    for (const f of list) {
      const it = new Item(f);
      items.push(it);
      const first = it.targets()[0];
      if (it.state === 'idle' && first && it.targets().length === 1) { it.target = first; it.render(); }
    }
  }

  // ------------------------------------------------------------------ drop zone
  const dz = $('#dropzone');
  const input = $('#fileInput');
  input.addEventListener('change', () => { addFiles(input.files); input.value = ''; });
  ['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
  ['dragleave', 'dragend'].forEach((ev) => dz.addEventListener(ev, () => dz.classList.remove('drag')));
  dz.addEventListener('drop', (e) => { e.preventDefault(); dz.classList.remove('drag'); if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files); });
  // Prevent the browser from opening a file dropped outside the zone.
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => e.preventDefault());

  // ------------------------------------------------------------------ boot
  applyLang();
  fetch('api/formats', { headers: { Accept: 'application/json' } })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no server'))))
    .then((data) => {
      if (!data?.categories) throw new Error('bad');
      FORMATS = data.categories;
      TTL = data.ttlMinutes || TTL;
      mode = 'server';
    })
    .catch(() => { mode = 'local'; $('#previewBanner').hidden = false; })
    .finally(() => applyLang());
})();

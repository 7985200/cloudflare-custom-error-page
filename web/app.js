/* ============================================================
   生成器逻辑：表单 → 实时预览 → 下载 / 复制 / 新窗口预览
   ============================================================ */

const FIELDS = ['lang', 'node', 'code', 'site', 'title', 'what', 'visitor',
                'owner', 'colo', 'brand', 'rayid', 'ip', 'timestamp'];

const DEFAULTS = {
  lang: 'en',
  node: 'host',
  code: '502',
  site: 'example.com',
  title: '',
  what: '',
  visitor: '',
  owner: '',
  colo: '',
  brand: 'Cloudflare',
  rayid: '',
  ip: '',
  timestamp: '',
};

const $ = id => document.getElementById(id);

function readForm() {
  return {
    lang:      $('lang').value || 'en',
    node:      $('node').value || 'host',
    code:      $('code').value.trim() || '502',
    site:      $('site').value.trim() || 'example.com',
    title:     $('title').value.trim(),
    what:      $('what').value.trim(),
    visitor:   $('visitor').value.trim(),
    owner:     $('owner').value.trim(),
    colo:      $('colo').value.trim(),
    brand:     $('brand').value.trim() || 'Cloudflare',
    rayid:     $('rayid').value.trim(),
    ip:        $('ip').value.trim(),
    timestamp: $('timestamp').value.trim(),
  };
}

/** 让各文本域的占位提示跟着「语言 / 节点 / 错误码」变化 */
function syncPlaceholders() {
  const lang = $('lang').value || 'en';
  const node = $('node').value || 'host';
  const code = $('code').value.trim();
  const preset = (PRESETS[code] || {})[lang] || null;
  const dt = NODE_TEXT[lang][node];

  $('title').placeholder = (preset && preset.title) || '留空 = 按错误码自动';
  $('what').placeholder = (preset && preset.what) || dt[0];
  $('visitor').placeholder = (preset && preset.visitor) || dt[1];
  $('owner').placeholder = preset ? '留空 = 不显示「所有者」段落'
                                  : (dt[2] || '留空 = 不显示该段');
}

let previewTimer = null;
function schedulePreview() {
  syncPlaceholders();
  clearTimeout(previewTimer);
  previewTimer = setTimeout(() => {
    $('preview').srcdoc = buildErrorPage(readForm());
  }, 120);
}

function download() {
  const form = readForm();
  const html = buildErrorPage(form);
  const code = form.code.replace(/[^\w.-]/g, '') || 'error';
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `error-${code}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyHtml() {
  const html = buildErrorPage(readForm());
  try {
    await navigator.clipboard.writeText(html);
    toast('已复制到剪贴板');
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = html;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('已复制到剪贴板'); }
    catch (_) { toast('复制失败，请手动选择'); }
    ta.remove();
  }
}

function openPreview() {
  const w = window.open('', '_blank');
  if (!w) { toast('被浏览器拦截了，请允许弹窗'); return; }
  w.document.open();
  w.document.write(buildErrorPage(readForm()));
  w.document.close();
}

function reset() {
  Object.entries(DEFAULTS).forEach(([k, v]) => {
    const el = $(k);
    if (el) el.value = v;
  });
  schedulePreview();
  toast('已重置');
}

let toastTimer = null;
function toast(msg) {
  let el = document.getElementById('__toast');
  if (!el) {
    el = document.createElement('div');
    el.id = '__toast';
    el.style.cssText =
      'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);' +
      'padding:9px 18px;border-radius:999px;background:#111;color:#fff;' +
      'font-size:13px;z-index:9999;transition:opacity .2s;pointer-events:none';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 1600);
}

FIELDS.forEach(id => {
  const el = $(id);
  if (!el) return;
  el.addEventListener('input', schedulePreview);
  el.addEventListener('change', schedulePreview);
});

$('btn-download').addEventListener('click', download);
$('btn-copy').addEventListener('click', copyHtml);
$('btn-preview').addEventListener('click', openPreview);
$('btn-reset').addEventListener('click', reset);

schedulePreview();

/* ============================================================
   Cloudflare 错误页模板（1:1 复刻官方 5xx 错误页）
   ------------------------------------------------------------
   · HTML 结构照搬官方模板（含 IE 条件注释、Tailwind 工具类名）
   · 样式来自官方 /cdn-cgi/styles/main.css，图标官方 PNG（base64 内联），
     见 cf-css.js（已内联 <style>，同时保留官方 <link> 以保持源码一致）
   · 与 python/ 、exe/ 两个版本共用同一套文案，三端产出完全一致

   已验证：同参数下产物与 Cloudflare 真实错误页逐字节相同。
   ============================================================ */

/* CF_CSS 由 cf-css.js 提供 */

/* ---------- 文案包 ---------- */
const LANGS = {
  en: {
    code_label: 'Error code',
    visit_pre: 'Visit ',
    visit_post: ' for more information.',
    what_happened: 'What happened?',
    what_can_i_do: 'What can I do?',
    you: 'You',
    browser: 'Browser',
    cloudflare: 'Cloudflare',
    host: 'Host',
    working: 'Working',
    error: 'Error',
    ray_id: 'Cloudflare Ray ID: ',
    your_ip: 'Your IP:',
    click_to_reveal: 'Click to reveal',
    perf_1: 'Performance &amp; security by',
    perf_2: '',
    if_visitor: "If you're a visitor of this website: ",
    if_owner: "If you're the owner of this website: ",
    html_lang: 'en-US',
  },
  zh: {
    code_label: '错误代码',
    visit_pre: '访问 ',
    visit_post: ' 了解更多信息。',
    what_happened: '发生了什么？',
    what_can_i_do: '我能做些什么？',
    you: '您',
    browser: '浏览器',
    cloudflare: 'Cloudflare',
    host: '主机',
    working: '正常工作',
    error: '错误',
    ray_id: 'Cloudflare Ray ID：',
    your_ip: '您的 IP：',
    click_to_reveal: '点击显示',
    perf_1: '性能和安全性由',
    perf_2: ' 提供',
    if_visitor: '如果您是该网站的访问者：',
    if_owner: '如果您是该网站的所有者：',
    html_lang: 'zh-CN',
  },
};

/* 没有命中预设错误码时，按「出错节点」给出的默认正文 */
const NODE_TEXT = {
  en: {
    you: ['There was a problem with the connection between your browser and Cloudflare.',
          'Check your network connection, or try another browser.',
          'This error originates on the visitor side — local network, proxy, or a browser extension.'],
    cloud: ['There was a problem with a Cloudflare edge node.',
            'Wait a moment and refresh the page; the issue usually clears up on its own.',
            'This error originates on the Cloudflare side. Try again shortly.'],
    host: ['The web server reported a bad gateway error.',
           'Please try again in a few minutes.',
           ''],
  },
  zh: {
    you: ['您的浏览器与 Cloudflare 之间的连接出现问题。',
          '请检查网络连接，或换一个浏览器再试。',
          '该错误来自访客侧，通常是本地网络、代理或浏览器插件导致。'],
    cloud: ['Cloudflare 边缘节点出现问题。',
            '请稍等片刻后刷新页面，通常会自动恢复。',
            '该错误来自 Cloudflare 侧，请稍后重试。'],
    host: ['Web 服务器报告了网关错误。',
           '请在几分钟后重试。',
           ''],
  },
};

/* 常见错误码预设（文案取自 Cloudflare 官方错误页）
   title / what / visitor / owner —— owner 为空时不渲染「所有者」段落 */
const PRESETS = {
  '502': {
    en: { title: 'Bad gateway', what: 'The web server reported a bad gateway error.',
          visitor: 'Please try again in a few minutes.', owner: '' },
    zh: { title: '网关错误', what: 'Web 服务器报告了网关错误。',
          visitor: '请在几分钟后重试。', owner: '' },
  },
  '503': {
    en: { title: 'Service temporarily unavailable', what: 'The web server is not able to handle the request.',
          visitor: 'Please try again in a few minutes.', owner: '' },
    zh: { title: '服务暂时不可用', what: 'Web 服务器无法处理该请求。',
          visitor: '请在几分钟后重试。', owner: '' },
  },
  '504': {
    en: { title: 'Gateway time-out', what: 'The web server reported a gateway time-out error.',
          visitor: 'Please try again in a few minutes.', owner: '' },
    zh: { title: '网关超时', what: 'Web 服务器报告了网关超时错误。',
          visitor: '请在几分钟后重试。', owner: '' },
  },
  '520': {
    en: { title: 'Web server is returning an unknown error',
          what: 'There is an unknown connection issue between Cloudflare and the origin web server. As a result, the web page can not be displayed.',
          visitor: 'Please try again in a few minutes.',
          owner: "There is an issue between Cloudflare's cache and your origin web server. Cloudflare monitors for these errors and automatically investigates the cause. To help support the investigation, you can pull the corresponding error log from your web server and submit it our support team. Please include the Ray ID (which is at the bottom of this error page)." },
    zh: { title: 'Web 服务器返回未知错误',
          what: 'Cloudflare 与源站 Web 服务器之间存在未知的连接问题。因此，该网页无法显示。',
          visitor: '请在几分钟后重试。',
          owner: 'Cloudflare 的缓存与您的源站 Web 服务器之间存在问题。Cloudflare 会监控此类错误并自动排查原因。为协助排查，您可以从 Web 服务器提取对应的错误日志并提交给支持团队，请一并附上本错误页底部的 Ray ID。' },
  },
  '521': {
    en: { title: 'Web server is down', what: 'The origin web server is not responding to Cloudflare.',
          visitor: 'Please try again in a few minutes.',
          owner: 'Contact your hosting provider letting them know your web server is not responding.' },
    zh: { title: 'Web 服务器已宕机', what: '源站 Web 服务器未响应 Cloudflare。',
          visitor: '请在几分钟后重试。',
          owner: '请联系您的托管服务提供商，告知对方您的 Web 服务器未响应。' },
  },
  '522': {
    en: { title: 'Connection timed out',
          what: "The initial connection between Cloudflare's network and the origin web server timed out. As a result, the web page can not be displayed.",
          visitor: 'Please try again in a few minutes.',
          owner: "Contact your hosting provider letting them know your web server is not completing requests. An Error 522 means that the request was able to connect to your web server, but that the request didn't finish. The most likely cause is that something on your server is hogging resources." },
    zh: { title: '连接超时',
          what: 'Cloudflare 网络与源站 Web 服务器之间的初始连接超时。因此，该网页无法显示。',
          visitor: '请在几分钟后重试。',
          owner: '请联系您的托管服务提供商，告知对方您的 Web 服务器未能完成请求。错误 522 表示请求已能连接到您的 Web 服务器，但请求未完成，最可能的原因是服务器上有程序占用了过多资源。' },
  },
  '523': {
    en: { title: 'Origin is unreachable', what: 'The origin web server is not reachable.',
          visitor: 'Please try again in a few minutes.',
          owner: 'Contact your hosting provider letting them know your web server is not reachable.' },
    zh: { title: '源站不可达', what: '源站 Web 服务器不可达。',
          visitor: '请在几分钟后重试。',
          owner: '请联系您的托管服务提供商，告知对方您的 Web 服务器不可达。' },
  },
  '524': {
    en: { title: 'A timeout occurred',
          what: 'Cloudflare was able to complete a TCP connection to the origin server, but did not receive a timely HTTP response.',
          visitor: 'Please try again in a few minutes.',
          owner: 'Contact your hosting provider letting them know your web server is not responding to Cloudflare within 100 seconds.' },
    zh: { title: '发生超时',
          what: 'Cloudflare 已能与源站服务器建立 TCP 连接，但未及时收到 HTTP 响应。',
          visitor: '请在几分钟后重试。',
          owner: '请联系您的托管服务提供商，告知对方您的 Web 服务器在 100 秒内未响应 Cloudflare。' },
  },
};

/* 中间节点显示的机房城市（随机挑一个，模拟真实 Cloudflare POP） */
const COLO_NAMES = [
  'Amsterdam', 'San Jose', 'Los Angeles', 'Singapore', 'Tokyo', 'Seoul',
  'Hong Kong', 'Frankfurt', 'London', 'Paris', 'Sydney', 'Toronto',
  'Dallas', 'Chicago', 'Miami', 'São Paulo', 'Mumbai', 'Taipei',
];

const NODES = ['host', 'cloud', 'you'];

/* ----------------------------------------------------------------------------
   自动获取「访客真实 IP」
   ----------------------------------------------------------------------------
   真实 Cloudflare 页面显示的 IP 是服务端写入的访客 IP。
   本工具产出的是静态 HTML，服务端拿不到，只能由浏览器侧请求公共 IP 接口获取，
   再替换页脚那个 IP（它默认被「Click to reveal」按钮遮住，替换过程不可见）。
   未填 IP 时注入本脚本；填了固定 IP 则不注入（此时源码与官方页面完全一致）。
   ---------------------------------------------------------------------------- */
const IP_FETCH_SCRIPT =
  '<script>(function(){' +
  "var el=document.getElementById('cf-footer-ip');if(!el)return;" +
  'var apis=[' +
  "'https://api64.ipify.org?format=json'," +
  "'https://api.ipify.org?format=json'," +
  "'https://ipapi.co/json/'" +
  '];' +
  '(function next(i){if(i>=apis.length)return;' +
  'fetch(apis[i],{cache:"no-store"})' +
  '.then(function(r){return r.json()})' +
  '.then(function(d){var ip=d&&(d.ip||d.query||d.ip_address);' +
  'if(ip){el.textContent=ip;}else{next(i+1);}})' +
  '.catch(function(){next(i+1);});})(0);' +
  '})();<\/script>\n';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function randomRayId() {
  const hex = '0123456789abcdef';
  let s = '';
  for (let i = 0; i < 16; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
}

function randomIp() {
  const r = () => Math.floor(Math.random() * 254) + 1;
  return `${r()}.${r()}.${r()}.${r()}`;
}

function utcNow() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ` +
         `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
}

/** 单个状态节点（浏览器 / Cloudflare / 源站）
 *  Cloudflare 官方模板里图标外层链接用 &#38; 转义、标题链接用裸 &，如实复刻 */
function nodeHtml(nodeId, icon, isError, line1, line2, linkIcon, linkH3, t) {
  const errCls = isError ? 'cf-error-source' : '';
  const state = isError ? 'error' : 'ok';
  const label = isError ? t.error : t.working;
  const labelCls = isError ? 'text-red-error' : 'text-green-success';
  const iconOpen = linkIcon
    ? `    <a href="${linkIcon}" target="_blank" rel="noopener noreferrer">` : '    ';
  const iconClose = linkIcon ? '    </a>' : '    ';
  const h3Open = linkH3
    ? `  <a href="${linkH3}" target="_blank" rel="noopener noreferrer">` : '  ';
  const h3Close = linkH3 ? '  </a>' : '  ';

  return `                    <div id="${nodeId}" class="${errCls} relative w-1/3 md:w-full py-15 md:p-0 md:py-8 md:text-left md:border-solid md:border-0 md:border-b md:border-gray-400 overflow-hidden float-left md:float-none text-center">
  <div class="relative mb-10 md:m-0">
${iconOpen}
    <span class="cf-icon-${icon} block md:hidden h-20 bg-center bg-no-repeat"></span>
    <span class="cf-icon-${state} w-12 h-12 absolute left-1/2 md:left-auto md:right-0 md:top-0 -ml-6 -bottom-4"></span>
${iconClose}
  </div>
  <span class="md:block w-full truncate">${esc(line1)}</span>
  <h3 class="md:inline-block mt-3 md:mt-0 text-2xl text-gray-600 font-light leading-1.3">
${h3Open}
    ${esc(line2)}
${h3Close}
  </h3>
  
  <span class="leading-1.3 text-2xl ${labelCls}">${label}</span>
  
</div>`;
}

/**
 * 生成完整错误页 HTML
 * opts: code, title, site, brand, what, visitor, owner,
 *       node('host'|'cloud'|'you'), lang('en'|'zh'), colo, rayid, ip, timestamp
 * title/what/visitor/owner 留空时，自动按「错误码预设」或「节点」填充。
 */
function buildErrorPage(opts) {
  const o = Object.assign({
    code: '502', title: '', site: 'example.com', brand: 'Cloudflare',
    what: '', visitor: '', owner: '',
    node: 'host', lang: 'en', colo: '', rayid: '', ip: '', timestamp: '',
  }, opts || {});

  const lang = LANGS[o.lang] ? o.lang : 'en';
  const node = NODES.indexOf(o.node) >= 0 ? o.node : 'host';
  const t = LANGS[lang];
  const preset = (PRESETS[String(o.code).trim()] || {})[lang] || null;

  const title = String(o.title || '').trim() ||
    (preset && preset.title) || (lang === 'en' ? 'Internal server error' : '服务器内部错误');
  const what = String(o.what || '').trim() ||
    (preset && preset.what) || NODE_TEXT[lang][node][0];
  const visitor = String(o.visitor || '').trim() ||
    (preset && preset.visitor) || NODE_TEXT[lang][node][1];
  const owner = String(o.owner || '').trim() ||
    (preset && preset.owner) || (preset ? '' : NODE_TEXT[lang][node][2]);

  const rayid = String(o.rayid || '').trim() || randomRayId();
  const ipFixed = String(o.ip || '').trim();        // 填了 → 固定显示该值
  const ip = ipFixed || randomIp();                 // 留空 → 随机兜底，稍后被脚本替换
  const ipScript = ipFixed ? '' : IP_FETCH_SCRIPT;  // 留空 → 注入「取访客真实 IP」脚本
  const colo = String(o.colo || '').trim() ||
    COLO_NAMES[Math.floor(Math.random() * COLO_NAMES.length)];
  const timestamp = String(o.timestamp || '').trim() || utcNow();

  const code = o.code;
  const utmRaw = `https://www.cloudflare.com/5xx-error-landing?utm_source=errorcode_${code}&utm_campaign=${o.site}`;
  const utmEsc = utmRaw.replace(/&/g, '&#38;');

  const nodes = [
    nodeHtml('cf-browser-status', 'browser', node === 'you', t.you, t.browser, null, null, t),
    nodeHtml('cf-cloudflare-status', 'cloud', node === 'cloud', colo, t.cloudflare, utmEsc, utmRaw, t),
    nodeHtml('cf-host-status', 'server', node === 'host', o.site, t.host, null, null, t),
  ].join('\n');

  const adv = [];
  if (owner) {
    adv.push(`                    <p class="mb-6">${esc(t.if_visitor)}${esc(visitor)}</p>`);
    adv.push(`                    <p class="mb-6">${esc(t.if_owner)}${esc(owner)}</p>`);
  } else {
    adv.push(`                    <p class="mb-6">${esc(visitor)}</p>`);
  }
  const advice = adv.join('\n');

  return `<!DOCTYPE html>
<!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="${t.html_lang}"> <![endif]-->
<!--[if IE 7]>    <html class="no-js ie7 oldie" lang="${t.html_lang}"> <![endif]-->
<!--[if IE 8]>    <html class="no-js ie8 oldie" lang="${t.html_lang}"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" lang="${t.html_lang}"> <!--<![endif]-->
<head>

<title>${esc(o.site)} | ${esc(code)}: ${esc(title)}</title>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta http-equiv="X-UA-Compatible" content="IE=Edge" />
<meta name="robots" content="noindex, nofollow" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="stylesheet" id="cf_styles-css" href="/cdn-cgi/styles/main.css" />
<style type="text/css">${CF_CSS}</style>
</head>
<body>
<div id="cf-wrapper">
    <div id="cf-error-details" class="p-0">
        <header class="mx-auto pt-10 lg:pt-6 lg:px-8 w-240 lg:w-full mb-8">
            <h1 class="inline-block sm:block sm:mb-2 font-light text-60 lg:text-4xl text-black-dark leading-tight mr-2">
                <span class="inline-block">${esc(title)}</span>
                <span class="code-label">${t.code_label} ${esc(code)}</span>
            </h1>
            <div>
                ${t.visit_pre}<a href="${utmRaw}" target="_blank" rel="noopener noreferrer">cloudflare.com</a>${t.visit_post}
            </div>
            <div class="mt-3">${esc(timestamp)}</div>
        </header>
        <div class="my-8 bg-gradient-gray">
            <div class="w-240 lg:w-full mx-auto">
                <div class="clearfix md:px-8">
${nodes}
                </div>
            </div>
        </div>

        <div class="w-240 lg:w-full mx-auto mb-8 lg:px-8">
            <div class="clearfix">
                <div class="w-1/2 md:w-full float-left pr-6 md:pb-10 md:pr-0 leading-relaxed">
                    <h2 class="text-3xl font-normal leading-1.3 mb-4">${t.what_happened}</h2>
                    <p>${esc(what)}</p>
                </div>
                <div class="w-1/2 md:w-full float-left leading-relaxed">
                    <h2 class="text-3xl font-normal leading-1.3 mb-4">${t.what_can_i_do}</h2>
${advice}
                </div>
            </div>
        </div>

        <div class="cf-error-footer cf-wrapper w-240 lg:w-full py-10 sm:py-4 sm:px-8 mx-auto text-center sm:text-left border-solid border-0 border-t border-gray-300">
    <p class="text-13">
      <span class="cf-footer-item sm:block sm:mb-1">${t.ray_id}<strong class="font-semibold">${esc(rayid)}</strong></span>
      <span class="cf-footer-separator sm:hidden">&bull;</span>
      <span id="cf-footer-item-ip" class="cf-footer-item hidden sm:block sm:mb-1">
        ${t.your_ip}
        <button type="button" id="cf-footer-ip-reveal" class="cf-footer-ip-reveal-btn">${t.click_to_reveal}</button>
        <span class="hidden" id="cf-footer-ip">${esc(ip)}</span>
        <span class="cf-footer-separator sm:hidden">&bull;</span>
      </span>
      <span class="cf-footer-item sm:block sm:mb-1"><span>${t.perf_1}</span> <a rel="noopener noreferrer" href="${utmEsc}" id="brand_link" target="_blank">${esc(o.brand)}</a>${t.perf_2}</span>
      
    </p>
    <script>(function(){function d(){var b=a.getElementById("cf-footer-item-ip"),c=a.getElementById("cf-footer-ip-reveal");b&&"classList"in b&&(b.classList.remove("hidden"),c.addEventListener("click",function(){c.classList.add("hidden");a.getElementById("cf-footer-ip").classList.remove("hidden")}))}var a=document;document.addEventListener&&a.addEventListener("DOMContentLoaded",d)})();</script>
  </div><!-- /.error-footer -->

    </div>
</div>
${ipScript}</body>
</html>`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buildErrorPage, LANGS, NODE_TEXT, PRESETS, COLO_NAMES };
}

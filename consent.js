/* =====================================================================
   Pain de Vie — cookie consent (simple yes / no)
   ---------------------------------------------------------------------
   - Asks once: accept or refuse. Refusing is as easy as accepting.
   - Nothing that counts visits loads unless the visitor accepts.
   - The choice lasts 12 months. It can be changed from the privacy page.

   TO TURN ON ANALYTICS LATER
   - Paste your Cloudflare Web Analytics token into ANALYTICS_TOKEN.
   - Leave it empty and no analytics ever loads (current state).
   ===================================================================== */
(function () {
  "use strict";

  var ANALYTICS_TOKEN = ""; // <-- paste Cloudflare Web Analytics token here
  var KEY = "pdv_consent";
  var VERSION = 2;
  var MAX_AGE_DAYS = 365;

  var T = {
    en: { title: "Cookies", body: "This site stores only what it needs to work. May we also count visits anonymously?", yes: "Yes", no: "No", policy: "Privacy & cookies" },
    fr: { title: "Cookies", body: "Ce site ne conserve que ce qui est nécessaire à son fonctionnement. Pouvons-nous aussi compter les visites de façon anonyme ?", yes: "Oui", no: "Non", policy: "Confidentialité et cookies" },
    es: { title: "Cookies", body: "Este sitio solo guarda lo necesario para funcionar. ¿Podemos también contar las visitas de forma anónima?", yes: "Sí", no: "No", policy: "Privacidad y cookies" },
    zh: { title: "Cookie", body: "本网站仅保存运行所必需的内容。我们可以匿名统计访问量吗？", yes: "同意", no: "拒绝", policy: "隐私与 Cookie" }
  };

  var SUPPORTED = ["en", "fr", "es", "zh"];
  function t() {
    var l = "fr";
    try { var s = localStorage.getItem("pdv_lang"); if (s) l = s; } catch (e) {}
    return T[SUPPORTED.indexOf(l) > -1 ? l : "fr"];
  }

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!v || v.v !== VERSION) return null;
      if (Date.now() - v.ts > MAX_AGE_DAYS * 864e5) return null;
      return v;
    } catch (e) { return null; }
  }
  function write(yes) {
    var v = { v: VERSION, analytics: !!yes, ts: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
    apply(v);
  }

  var loaded = false;
  function apply(v) {
    if (!v || !v.analytics || !ANALYTICS_TOKEN || loaded) return;
    loaded = true;
    var s = document.createElement("script");
    s.defer = true;
    s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.setAttribute("data-cf-beacon", '{"token":"' + ANALYTICS_TOKEN + '"}');
    document.head.appendChild(s);
  }

  var CSS =
    '.pdvc{position:fixed;left:50%;transform:translateX(-50%);bottom:18px;width:min(560px,calc(100vw - 28px));' +
    'background:#FAF6EF;color:#2A1830;border:1px solid rgba(51,24,63,.14);border-radius:16px;' +
    'box-shadow:0 20px 50px rgba(36,18,46,.28);z-index:9999;padding:20px 22px;' +
    "font-family:'Hanken Grotesk','Noto Sans SC',system-ui,sans-serif;font-size:15px;line-height:1.55}" +
    ".pdvc h2{font-family:'Fraunces',Georgia,serif;font-weight:600;font-size:18px;color:#33183F;margin:0 0 6px}" +
    '.pdvc p{margin:0 0 14px;color:#4a3a50}' +
    '.pdvc a{color:#B4441F;font-weight:600}' +
    '.pdvc-actions{display:flex;gap:10px;flex-wrap:wrap}' +
    '.pdvc-btn{font:inherit;font-weight:600;border-radius:999px;padding:10px 26px;cursor:pointer;border:1.5px solid transparent}' +
    '.pdvc-yes{background:#D8552F;color:#fff}.pdvc-yes:hover{background:#B4441F}' +
    '.pdvc-no{background:transparent;color:#33183F;border-color:rgba(51,24,63,.35)}' +
    '.pdvc-no:hover{background:rgba(51,24,63,.06)}' +
    '.pdvc-btn:focus-visible,.pdvc a:focus-visible{outline:3px solid #E39B2E;outline-offset:2px}' +
    '@media (max-width:520px){.pdvc{bottom:0;border-radius:16px 16px 0 0;width:100%}.pdvc-btn{flex:1}}';

  var box = null, lastFocus = null;

  function close() {
    if (box) { box.remove(); box = null; }
    document.removeEventListener("keydown", onKey);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
    lastFocus = null;
  }

  function onKey(e) {
    if (!box || e.key !== "Tab") return;
    var f = box.querySelectorAll("button,a[href]");
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function render() {
    var d = t();
    if (!document.getElementById("pdvc-css")) {
      var st = document.createElement("style");
      st.id = "pdvc-css"; st.textContent = CSS;
      document.head.appendChild(st);
    }
    if (!lastFocus) lastFocus = document.activeElement;
    if (!box) {
      box = document.createElement("div");
      box.className = "pdvc";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-labelledby", "pdvc-t");
      box.setAttribute("aria-describedby", "pdvc-d");
      document.body.appendChild(box);
      document.addEventListener("keydown", onKey);
    }
    var onPrivacy = /privacy\.html$/.test(location.pathname);
    box.innerHTML =
      '<h2 id="pdvc-t">' + d.title + "</h2>" +
      '<p id="pdvc-d">' + d.body + (onPrivacy ? "" : ' <a href="privacy.html">' + d.policy + "</a>") + "</p>" +
      '<div class="pdvc-actions">' +
      '<button type="button" class="pdvc-btn pdvc-yes" data-a="1">' + d.yes + "</button>" +
      '<button type="button" class="pdvc-btn pdvc-no" data-a="0">' + d.no + "</button>" +
      "</div>";
    box.addEventListener("click", function (e) {
      var b = e.target.closest("[data-a]");
      if (!b) return;
      write(b.getAttribute("data-a") === "1");
      close();
    });
    box.querySelector("button").focus();
  }

  window.PDVConsent = {
    open: function () { lastFocus = document.activeElement; render(); },
    get: read,
    setLang: function () { if (box) render(); }
  };

  function boot() {
    document.querySelectorAll("[data-cookie-settings]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); lastFocus = el; render(); });
    });
    var saved = read();
    if (saved) apply(saved); else render();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

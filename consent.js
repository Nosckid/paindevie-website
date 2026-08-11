/* =====================================================================
   Pain de Vie — Cookie / storage consent manager
   ---------------------------------------------------------------------
   WHAT THIS DOES (plain English)
   - Shows a banner asking the visitor to Accept or Refuse non-essential
     storage. Refusing is exactly as easy as accepting (GDPR requirement).
   - Nothing that tracks is loaded until the visitor clicks "Accept".
   - The visitor can reopen the choices any time via the footer link.
   - The choice is remembered for 12 months, then we ask again.

   CATEGORIES
   - Necessary  : always on. Cannot be switched off. Includes remembering
                  the language the visitor deliberately chose, and the
                  consent choice itself. No tracking, never shared.
   - Analytics  : OFF until the visitor opts in. Anonymous visit counts.

   TO SWITCH ON ANALYTICS LATER
   - Put your Cloudflare Web Analytics token in ANALYTICS_TOKEN below.
   - Leave it empty and no analytics ever loads (current state).
   ===================================================================== */
(function () {
  "use strict";

  var ANALYTICS_TOKEN = ""; // <-- paste Cloudflare Web Analytics token here
  var KEY = "pdv_consent";
  var VERSION = 1;
  var MAX_AGE_DAYS = 365;

  /* ---------- translations ---------- */
  var T = {
    en: {
      title: "We respect your privacy",
      body: "We use only what is needed to make this site work. With your permission we would also like to count visits anonymously, to understand what is useful. You can refuse without losing any feature.",
      accept: "Accept",
      reject: "Refuse",
      customise: "Choose",
      save: "Save my choices",
      policy: "Privacy & cookie policy",
      prefs_title: "Your choices",
      nec_t: "Strictly necessary",
      nec_d: "Required for the site to work: remembering the language you chose and this consent choice. No tracking. Cannot be switched off.",
      nec_always: "Always active",
      ana_t: "Audience measurement",
      ana_d: "Anonymous visit counts so we know which pages are useful. No advertising, no profiling, no data sold.",
      close: "Close",
      reopen: "Cookie settings"
    },
    fr: {
      title: "Nous respectons votre vie privée",
      body: "Nous n'utilisons que ce qui est nécessaire au fonctionnement du site. Avec votre accord, nous souhaiterions aussi compter les visites de façon anonyme, afin de comprendre ce qui est utile. Vous pouvez refuser sans perdre aucune fonctionnalité.",
      accept: "Accepter",
      reject: "Refuser",
      customise: "Choisir",
      save: "Enregistrer mes choix",
      policy: "Politique de confidentialité et cookies",
      prefs_title: "Vos choix",
      nec_t: "Strictement nécessaires",
      nec_d: "Indispensables au fonctionnement : mémoriser la langue que vous avez choisie et votre choix de consentement. Aucun suivi. Ne peut pas être désactivé.",
      nec_always: "Toujours actifs",
      ana_t: "Mesure d'audience",
      ana_d: "Comptage anonyme des visites pour savoir quelles pages sont utiles. Aucune publicité, aucun profilage, aucune donnée vendue.",
      close: "Fermer",
      reopen: "Paramètres des cookies"
    },
    es: {
      title: "Respetamos su privacidad",
      body: "Solo utilizamos lo necesario para que el sitio funcione. Con su permiso, también nos gustaría contar las visitas de forma anónima para entender qué resulta útil. Puede negarse sin perder ninguna función.",
      accept: "Aceptar",
      reject: "Rechazar",
      customise: "Elegir",
      save: "Guardar mis preferencias",
      policy: "Política de privacidad y cookies",
      prefs_title: "Sus preferencias",
      nec_t: "Estrictamente necesarias",
      nec_d: "Imprescindibles para el funcionamiento: recordar el idioma que eligió y su decisión de consentimiento. Sin rastreo. No se puede desactivar.",
      nec_always: "Siempre activas",
      ana_t: "Medición de audiencia",
      ana_d: "Recuento anónimo de visitas para saber qué páginas son útiles. Sin publicidad, sin perfilado, sin venta de datos.",
      close: "Cerrar",
      reopen: "Configuración de cookies"
    },
    zh: {
      title: "我们尊重您的隐私",
      body: "我们仅使用维持网站运行所必需的内容。在您同意的情况下，我们也希望以匿名方式统计访问量，以了解哪些内容有用。您可以拒绝，且不会失去任何功能。",
      accept: "接受",
      reject: "拒绝",
      customise: "自定义",
      save: "保存我的选择",
      policy: "隐私与 Cookie 政策",
      prefs_title: "您的选择",
      nec_t: "严格必要",
      nec_d: "网站运行所必需：记住您选择的语言以及您的同意选择。不进行任何跟踪，无法关闭。",
      nec_always: "始终启用",
      ana_t: "访问量统计",
      ana_d: "匿名统计访问量，以了解哪些页面有用。无广告、无用户画像、不出售数据。",
      close: "关闭",
      reopen: "Cookie 设置"
    }
  };

  var SUPPORTED = ["en", "fr", "es", "zh"];
  function lang() {
    var l = "fr";
    try { var s = localStorage.getItem("pdv_lang"); if (s) l = s; } catch (e) {}
    return SUPPORTED.indexOf(l) > -1 ? l : "fr";
  }
  function t() { return T[lang()]; }

  /* ---------- stored decision ---------- */
  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var v = JSON.parse(raw);
      if (!v || v.v !== VERSION) return null;
      if (Date.now() - v.ts > MAX_AGE_DAYS * 864e5) return null; // expired, ask again
      return v;
    } catch (e) { return null; }
  }
  function write(analytics) {
    var v = { v: VERSION, necessary: true, analytics: !!analytics, ts: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
    apply(v);
    return v;
  }

  /* ---------- act on the decision ---------- */
  var analyticsLoaded = false;
  function apply(v) {
    if (v && v.analytics && ANALYTICS_TOKEN && !analyticsLoaded) {
      analyticsLoaded = true;
      var s = document.createElement("script");
      s.defer = true;
      s.src = "https://static.cloudflareinsights.com/beacon.min.js";
      s.setAttribute("data-cf-beacon", '{"token":"' + ANALYTICS_TOKEN + '"}');
      document.head.appendChild(s);
    }
  }

  /* ---------- styles ---------- */
  var CSS =
    '.pdvc-backdrop{position:fixed;inset:0;background:rgba(36,18,46,.55);z-index:9998;opacity:0;transition:opacity .2s}' +
    '.pdvc-backdrop.show{opacity:1}' +
    '.pdvc{position:fixed;left:50%;transform:translateX(-50%);bottom:18px;width:min(680px,calc(100vw - 28px));' +
    'background:#FAF6EF;color:#2A1830;border:1px solid rgba(51,24,63,.14);border-radius:18px;' +
    'box-shadow:0 22px 60px rgba(36,18,46,.3);z-index:9999;padding:24px 26px;' +
    "font-family:'Hanken Grotesk','Noto Sans SC',system-ui,sans-serif;font-size:15.5px;line-height:1.6}" +
    '.pdvc h2{font-family:\'Fraunces\',Georgia,serif;font-weight:600;font-size:21px;color:#33183F;margin:0 0 10px;line-height:1.2}' +
    '.pdvc p{margin:0 0 16px;color:#4a3a50}' +
    '.pdvc a{color:#B4441F;font-weight:600}' +
    '.pdvc-actions{display:flex;gap:10px;flex-wrap:wrap}' +
    '.pdvc-btn{font:inherit;font-weight:600;font-size:15px;border-radius:999px;padding:12px 22px;cursor:pointer;' +
    'border:1.5px solid transparent;transition:background .18s,color .18s,transform .18s}' +
    '.pdvc-btn:hover{transform:translateY(-1px)}' +
    '.pdvc-primary{background:#D8552F;color:#fff}.pdvc-primary:hover{background:#B4441F}' +
    '.pdvc-secondary{background:#33183F;color:#FAF6EF}.pdvc-secondary:hover{background:#24122E}' +
    '.pdvc-ghost{background:transparent;color:#33183F;border-color:rgba(51,24,63,.3)}' +
    '.pdvc-ghost:hover{background:rgba(51,24,63,.06)}' +
    '.pdvc-btn:focus-visible,.pdvc a:focus-visible,.pdvc input:focus-visible{outline:3px solid #E39B2E;outline-offset:2px}' +
    '.pdvc-cat{border-top:1px solid rgba(51,24,63,.12);padding:15px 0;display:flex;gap:14px;align-items:flex-start}' +
    '.pdvc-cat h3{font-family:inherit;font-size:15.5px;font-weight:700;color:#33183F;margin:0 0 4px}' +
    '.pdvc-cat p{font-size:13.5px;margin:0;color:#6B5B71}' +
    '.pdvc-cat .pdvc-lock{font-size:12.5px;font-weight:700;color:#B4761A;white-space:nowrap;padding-top:2px}' +
    '.pdvc-sw{position:relative;flex:none;width:48px;height:27px;margin-top:2px}' +
    '.pdvc-sw input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer}' +
    '.pdvc-sw span{position:absolute;inset:0;background:#C9BDCE;border-radius:999px;transition:background .18s;pointer-events:none}' +
    '.pdvc-sw span::after{content:"";position:absolute;top:3px;left:3px;width:21px;height:21px;background:#fff;border-radius:50%;transition:transform .18s}' +
    '.pdvc-sw input:checked+span{background:#2E7D53}' +
    '.pdvc-sw input:checked+span::after{transform:translateX(21px)}' +
    '.pdvc-sw input:focus-visible+span{outline:3px solid #E39B2E;outline-offset:2px}' +
    '.pdvc-panel{margin:4px 0 18px}' +
    '@media (max-width:520px){.pdvc{padding:20px 18px;bottom:0;border-radius:18px 18px 0 0;width:100%}' +
    '.pdvc-actions .pdvc-btn{flex:1 1 100%}}' +
    '@media (prefers-reduced-motion:reduce){.pdvc-backdrop,.pdvc-btn,.pdvc-sw span,.pdvc-sw span::after{transition:none}}';

  function injectCSS() {
    if (document.getElementById("pdvc-css")) return;
    var st = document.createElement("style");
    st.id = "pdvc-css";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ---------- UI ---------- */
  var box = null, backdrop = null, lastFocus = null, showingPrefs = false;

  function close() {
    if (box) { box.remove(); box = null; }
    if (backdrop) { backdrop.remove(); backdrop = null; }
    document.removeEventListener("keydown", onKey);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }

  function onKey(e) {
    if (!box) return;
    if (e.key === "Escape" && showingPrefs) { e.preventDefault(); render(false); return; }
    if (e.key !== "Tab") return;
    var f = box.querySelectorAll('button,a[href],input:not([disabled])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function render(prefs) {
    showingPrefs = !!prefs;
    var d = t(), saved = read();
    injectCSS();
    if (!lastFocus) lastFocus = document.activeElement;

    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "pdvc-backdrop";
      document.body.appendChild(backdrop);
      requestAnimationFrame(function () { if (backdrop) backdrop.classList.add("show"); });
    }
    if (!box) {
      box = document.createElement("div");
      box.className = "pdvc";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      box.setAttribute("aria-labelledby", "pdvc-title");
      box.setAttribute("aria-describedby", "pdvc-desc");
      document.body.appendChild(box);
      document.addEventListener("keydown", onKey);
    }

    var anaOn = saved ? saved.analytics : false;

    var html =
      '<h2 id="pdvc-title">' + esc(prefs ? d.prefs_title : d.title) + "</h2>" +
      '<p id="pdvc-desc">' + esc(d.body) + ' <a href="privacy.html">' + esc(d.policy) + "</a></p>";

    if (prefs) {
      html +=
        '<div class="pdvc-panel">' +
        '<div class="pdvc-cat"><div><h3>' + esc(d.nec_t) + "</h3><p>" + esc(d.nec_d) + "</p></div>" +
        '<span class="pdvc-lock">' + esc(d.nec_always) + "</span></div>" +
        '<div class="pdvc-cat"><div><h3>' + esc(d.ana_t) + "</h3><p>" + esc(d.ana_d) + "</p></div>" +
        '<label class="pdvc-sw"><input type="checkbox" id="pdvc-ana" ' + (anaOn ? "checked" : "") +
        ' aria-label="' + esc(d.ana_t) + '"><span aria-hidden="true"></span></label></div>' +
        "</div>";
      html +=
        '<div class="pdvc-actions">' +
        '<button type="button" class="pdvc-btn pdvc-primary" data-act="save">' + esc(d.save) + "</button>" +
        '<button type="button" class="pdvc-btn pdvc-ghost" data-act="reject">' + esc(d.reject) + "</button>" +
        "</div>";
    } else {
      html +=
        '<div class="pdvc-actions">' +
        '<button type="button" class="pdvc-btn pdvc-primary" data-act="accept">' + esc(d.accept) + "</button>" +
        '<button type="button" class="pdvc-btn pdvc-secondary" data-act="reject">' + esc(d.reject) + "</button>" +
        '<button type="button" class="pdvc-btn pdvc-ghost" data-act="prefs">' + esc(d.customise) + "</button>" +
        "</div>";
    }

    box.innerHTML = html;

    box.addEventListener("click", function (e) {
      var b = e.target.closest("[data-act]");
      if (!b) return;
      var a = b.getAttribute("data-act");
      if (a === "accept") { write(true); close(); }
      else if (a === "reject") { write(false); close(); }
      else if (a === "prefs") { render(true); }
      else if (a === "save") {
        var cb = document.getElementById("pdvc-ana");
        write(cb && cb.checked); close();
      }
    });

    var focusFirst = box.querySelector("button");
    if (focusFirst) focusFirst.focus();
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- footer "cookie settings" link ---------- */
  function wireReopen() {
    document.querySelectorAll("[data-cookie-settings]").forEach(function (el) {
      el.textContent = t().reopen;
      el.addEventListener("click", function (e) { e.preventDefault(); lastFocus = el; render(true); });
    });
  }

  /* ---------- public API ---------- */
  window.PDVConsent = {
    open: function () { lastFocus = document.activeElement; render(true); },
    get: read,
    setLang: function () {
      wireReopen();
      if (box) render(showingPrefs); // re-render open dialog in the new language
    }
  };

  /* ---------- boot ---------- */
  function boot() {
    wireReopen();
    var saved = read();
    if (saved) { apply(saved); } else { render(false); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

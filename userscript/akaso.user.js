// ==UserScript==
// @name         AKA.SO URL 줄이기
// @namespace    https://github.com/mikoto52/akaso-chrome-extension
// @version      1.0.3
// @description  우측 하단 아이콘으로 URL을 줄이고, 오른쪽으로 스와이프해 숨깁니다.
// @match        http://*/*
// @match        https://*/*
// @noframes
// @run-at       document-idle
// @connect      aka.so
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @grant        GM_registerMenuCommand
// ==/UserScript==

(() => {
  'use strict';
  if (window.top !== window.self) return;

  const ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAsSwAALEsBpT2WqQAAAwBQTFRFAAAAIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVIxgVUDqfTgAAAQB0Uk5TAB2BOv/z5LljjDn7ihx6QwY4KAUY064gAV4Juxv3T7MTOwSeDu80A4sL3ywC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';
  const DEFAULT_HTTP_STATUS_CODE = 302;

  function validateHttpStatusCode(value = DEFAULT_HTTP_STATUS_CODE) {
    if (![301, 302, 307, 308].some(code => value === code || value === String(code))) {
      throw new Error('상태 코드는 301, 302, 307, 308 중에서 선택해 주세요.');
    }
    return Number(value);
  }

  function validateUrl(value) {
    const input = String(value ?? '').trim();
    let url;
    try { url = new URL(input); }
    catch { throw new Error('https:// 또는 http://로 시작하는 URL을 입력해 주세요.'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
      throw new Error('인증 정보가 포함되지 않은 HTTP/HTTPS URL만 사용할 수 있습니다.');
    }
    return input;
  }

  function extractShortUrl(payload, originalUrl) {
    for (const object of [payload?.data?.link, payload?.data, payload?.link, payload]) {
      if (!object || typeof object !== 'object') continue;
      const domainId = object.domain_id ?? payload?.data?.domain_id ?? payload?.domain_id ?? 0;
      if (domainId === 0 || domainId === '0') {
        for (const slug of [object.url, object.link_id]) {
          if (typeof slug === 'string' && /^[A-Za-z0-9_-]+$/.test(slug)) return `https://aka.so/${slug}`;
        }
      }
      for (const key of ['short_url', 'shortUrl', 'short_link', 'shortLink', 'shortened_url', 'full_url', 'link']) {
        if (typeof object[key] !== 'string') continue;
        try { return validateUrl(object[key]); } catch { /* Try the next field. */ }
      }
      if (typeof object.url === 'string') {
        try {
          const candidate = validateUrl(object.url);
          const parsed = new URL(candidate);
          if (parsed.hostname === 'aka.so' && parsed.pathname !== '/' && candidate !== originalUrl) return candidate;
        } catch { /* Not a complete short URL. */ }
      }
    }
    if (typeof payload === 'string') {
      try { return validateUrl(payload); } catch { /* Not a URL response. */ }
    }
    throw new Error('응답에서 단축 URL을 찾지 못했습니다.');
  }

  function validateToken(value) {
    const token = String(value ?? '').trim();
    if (!token) throw new Error('설정에서 API_TOKEN을 먼저 저장해 주세요.');
    if (/[\r\n]/.test(token) || /^Bearer\s/i.test(token)) {
      throw new Error('Bearer 접두어와 줄바꿈 없이 토큰 값만 입력해 주세요.');
    }
    return token;
  }

  function shortenUrl(input, apiToken, options = {}) {
    const url = validateUrl(input);
    const token = validateToken(apiToken);
    const body = new FormData();
    body.append('type', 'link');
    body.append('location_url', url);
    body.append('domain_id', '0');
    body.append('http_status_code', String(validateHttpStatusCode(options.httpStatusCode)));
    if (options.password) body.append('password', options.password);
    return new Promise((resolve, reject) => {
      let request;
      let settled = false;
      function finish(error, value) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (error) reject(error); else resolve(value);
      }
      // anonymous/redirect use fetch mode, where Chrome can ignore the manager's timeout.
      const timer = setTimeout(() => {
        finish(new Error('요청 시간이 초과되었습니다. 다시 시도해 주세요.'));
        request?.abort();
      }, 20000);
      // Tampermonkey sends this from its background context, avoiding page CORS restrictions.
      try { request = GM_xmlhttpRequest({
        method: 'POST', url: 'https://aka.so/api/links',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        data: body, anonymous: true, redirect: 'error', timeout: 20000,
        onload(response) {
          if (settled) return;
          try {
            let payload;
            try { payload = JSON.parse(response.responseText); }
            catch { payload = String(response.responseText ?? '').trim(); }
            if (response.status < 200 || response.status >= 300) {
              const messages = {
                400: '요청 값이 올바르지 않습니다. URL과 API 요구 항목을 확인해 주세요.',
                401: 'API_TOKEN이 없거나 유효하지 않습니다. 설정을 확인해 주세요.',
                403: 'API 사용 권한이 없습니다. 계정 권한을 확인해 주세요.',
                404: 'API 주소를 찾을 수 없습니다.',
                422: 'API가 입력 값을 처리하지 못했습니다.',
                429: '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.'
              };
              throw new Error(messages[response.status] || `API 요청에 실패했습니다. (HTTP ${response.status})`);
            }
            if (payload?.errors?.length || payload?.error || payload?.success === false) {
              throw new Error('API가 오류 응답을 반환했습니다. 입력 값과 계정 설정을 확인해 주세요.');
            }
            finish(null, extractShortUrl(payload, url));
          } catch (error) { finish(error); }
        },
        onerror: () => finish(new Error('API에 연결하지 못했습니다. 인터넷 연결과 Tampermonkey 권한을 확인해 주세요.')),
        ontimeout: () => finish(new Error('요청 시간이 초과되었습니다. 다시 시도해 주세요.')),
        onabort: () => finish(new Error('요청이 취소되었습니다.'))
      }); } catch (error) { finish(error); }
    });
  }

  const host = document.createElement('div');
  host.id = 'akaso-userscript';
  // Keep styles and token input separate from the site's DOM and CSS.
  host.style.setProperty('all', 'initial', 'important');
  host.style.setProperty('position', 'fixed', 'important');
  host.style.setProperty('inset', '0', 'important');
  host.style.setProperty('z-index', '2147483647', 'important');
  host.style.setProperty('pointer-events', 'none', 'important');
  host.style.setProperty('margin', '0', 'important');
  host.style.setProperty('padding', '0', 'important');
  host.style.setProperty('border', '0', 'important');
  host.style.setProperty('overflow', 'visible', 'important');
  if (typeof host.showPopover === 'function') host.setAttribute('popover', 'manual');
  const root = host.attachShadow({ mode: 'closed' });
  // Build elements directly: sites such as YouTube require TrustedHTML for HTML string sinks.
  function element(tag, attributes = {}, children = []) {
    const node = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    for (const child of children) {
      node.append(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  }
  root.append(
    element("style", {}, [`
      :host { color-scheme: light; }
      * { box-sizing: border-box; }
      [hidden] { display: none !important; }
      button, input, textarea, select { font: inherit; }
      button { cursor: pointer; border: 0; }
      button:disabled { opacity: .55; cursor: default; }
      :focus-visible { outline: 3px solid #75cbb7; outline-offset: 2px; }
      .launcher, .panel { z-index: 2147483647 !important; }
      .launcher { position: fixed; right: max(20px, env(safe-area-inset-right)); bottom: max(20px, env(safe-area-inset-bottom));
        width: 44px; height: 44px; padding: 6px; border-radius: 50%; background: white; box-shadow: 0 4px 20px #172e3233;
        pointer-events: auto; touch-action: none; user-select: none; transition: transform .2s, opacity .2s, visibility .2s; }
      .launcher img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; pointer-events: none; }
      .launcher.dragging { transition: none; }
      .launcher.is-hidden { transform: translateX(110px); opacity: 0; visibility: hidden; pointer-events: none; }
      .panel { position: fixed; right: max(16px, env(safe-area-inset-right)); bottom: max(80px, calc(env(safe-area-inset-bottom) + 60px));
        width: min(380px, calc(100vw - 32px)); max-height: calc(100dvh - 112px); overflow-y: auto; overscroll-behavior: contain;
        background: #f4f8f7; color: #172e32; border: 1px solid #ccd9d5; border-radius: 18px; padding: 22px;
        box-shadow: 0 8px 40px #172e3226; pointer-events: auto; font: 14px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 18px; }
      .brand { color: #087c68; font-size: 13px; font-weight: 800; letter-spacing: 2px; }
      h2 { font-size: 22px; margin: 4px 0 0; }
      .header-actions { display: flex; gap: 12px; }
      .text { background: transparent; color: #087c68; padding: 4px 0; font-size: 12px; }
      label { display: block; font-size: 13px; font-weight: 600; margin: 12px 0 6px; }
      input:not([type=checkbox]), textarea, select { display: block; width: 100%; min-width: 0; border: 1px solid #ccd9d5;
        border-radius: 10px; padding: 11px; color: #203c3d; background: white; font-size: 13px; }
      textarea { resize: vertical; min-height: 84px; max-height: 160px; }
      .primary, .secondary { padding: 11px 14px; border-radius: 9px; font-size: 13px; }
      .primary { background: #087c68; color: white; font-weight: 600; }
      .primary:hover { background: #066252; }
      .secondary { background: #e8efec; color: #254b43; }
      .submit { width: 100%; margin-top: 14px; }
      .actions { display: flex; gap: 8px; margin-top: 12px; }
      .actions > * { flex: 1; }
      .result { background: #e6f4ef; border: 1px solid #cae4d9; border-radius: 12px; padding: 12px; margin-top: 16px; }
      .status { font-size: 13px; color: #087c68; overflow-wrap: anywhere; margin: 12px 0 0; }
      .status:empty { display: none; }
      .status.error { color: #b33333; }
      .note { font-size: 11px; color: #637976; margin: 14px 0 0; }
      .checkbox { display: flex; align-items: center; gap: 6px; color: #637976; font-weight: 400; }
      @media (prefers-reduced-motion: reduce) { .launcher { transition: none; } }
    `]),
    element("button", {"id": "launcher", "class": "launcher", "type": "button", "title": "AKA.SO 열기 · 오른쪽으로 밀면 숨기기", "aria-label": "AKA.SO URL 줄이기 열기", "aria-expanded": "false", "aria-controls": "panel"}, [
      element("img", {"alt": "", "draggable": "false"})
    ]),
    element("section", {"id": "panel", "class": "panel", "role": "dialog", "aria-labelledby": "title", "hidden": ""}, [
      element("header", {}, [
        element("div", {}, [
          element("span", {"class": "brand"}, [
            "AKA.SO"
          ]),
          element("h2", {"id": "title"}, [
            "긴 링크를 짧게."
          ])
        ]),
        element("div", {"class": "header-actions"}, [
          element("button", {"id": "settings", "class": "text", "type": "button"}, [
            "설정"
          ]),
          element("button", {"id": "close", "class": "text", "type": "button", "aria-label": "패널 닫기"}, [
            "닫기"
          ])
        ])
      ]),
      element("div", {"id": "main-view"}, [
        element("form", {"id": "shorten-form"}, [
          element("label", {"for": "url"}, [
            "줄일 URL"
          ]),
          element("textarea", {"id": "url", "rows": "3", "required": "", "spellcheck": "false", "placeholder": "https://example.com/"}),
          element("button", {"id": "current-page", "class": "text", "type": "button"}, [
            "현재 페이지 URL 가져오기"
          ]),
          element("label", {"for": "password"}, [
            "링크 비밀번호 (선택)"
          ]),
          element("input", {"id": "password", "type": "password", "autocomplete": "new-password", "placeholder": "비밀번호 없이 생성하려면 비워 두세요"}),
          element("button", {"id": "shorten", "class": "primary submit", "type": "submit"}, [
            "URL 줄이기"
          ])
        ]),
        element("p", {"id": "status", "class": "status", "role": "status", "aria-live": "polite"}),
        element("section", {"id": "result", "class": "result", "hidden": ""}, [
          element("label", {"for": "short-url"}, [
            "단축 URL"
          ]),
          element("input", {"id": "short-url", "type": "text", "readonly": ""}),
          element("div", {"class": "actions"}, [
            element("button", {"id": "copy", "class": "primary", "type": "button"}, [
              "복사하기"
            ]),
            element("button", {"id": "open", "class": "secondary", "type": "button"}, [
              "링크 열기 ↗"
            ])
          ])
        ]),
        element("p", {"class": "note"}, [
          "버튼을 누르면 입력한 URL을 AKA.SO로 전송합니다."
        ])
      ]),
      element("div", {"id": "settings-view", "hidden": ""}, [
        element("form", {"id": "settings-form"}, [
          element("label", {"for": "token"}, [
            "API_TOKEN"
          ]),
          element("input", {"id": "token", "type": "password", "autocomplete": "off", "spellcheck": "false", "required": ""}),
          element("label", {"class": "checkbox"}, [
            element("input", {"id": "show-token", "type": "checkbox"}),
            " 토큰 표시"
          ]),
          element("label", {"for": "http-status-code"}, [
            "기본 리디렉션 상태 코드"
          ]),
          element("select", {"id": "http-status-code"}, [
            element("option", {"value": "301"}, [
              "301 — 영구 이동"
            ]),
            element("option", {"value": "302"}, [
              "302 — 임시 이동 (기본값)"
            ]),
            element("option", {"value": "307"}, [
              "307 — 임시 이동, 요청 메서드 유지"
            ]),
            element("option", {"value": "308"}, [
              "308 — 영구 이동, 요청 메서드 유지"
            ])
          ]),
          element("button", {"id": "save", "class": "primary submit", "type": "submit"}, [
            "저장"
          ])
        ]),
        element("p", {"id": "settings-status", "class": "status", "role": "status", "aria-live": "polite"}),
        element("p", {"class": "note"}, [
          "Bearer 접두어 없이 토큰 값만 입력하세요. 설정은 Tampermonkey 저장소에 보관됩니다."
        ]),
        element("button", {"id": "back", "class": "text", "type": "button"}, [
          "← 링크 생성으로 돌아가기"
        ])
      ])
    ])
  );
  const $ = id => root.getElementById(id);
  $('launcher').querySelector('img').src = ICON;
  let busy = false;
  let gesture = null;
  let suppressClick = false;

  function mountOverlay(promote = false) {
    // A modal's descendants remain interactive while the rest of the page is inert.
    const dialogs = document.querySelectorAll('dialog:modal');
    const parent = dialogs[dialogs.length - 1] || document.fullscreenElement || document.body || document.documentElement;
    if (host.parentNode !== parent) parent.append(host);
    if (typeof host.showPopover !== 'function') return;
    try {
      // Popovers sit above ordinary stacking contexts. Reopen after a site's popup to go last.
      if (promote && host.matches(':popover-open')) host.hidePopover();
      if (!host.matches(':popover-open')) host.showPopover();
    } catch { /* Keep the ordinary fixed-position overlay if the browser refuses top-layer entry. */ }
  }

  let mountQueued = false;
  function queueMount() {
    if (mountQueued) return;
    mountQueued = true;
    requestAnimationFrame(() => { mountQueued = false; mountOverlay(true); });
  }
  mountOverlay();
  // GitHub and other sites can replace page containers during navigation.
  new MutationObserver(() => {
    if (!host.isConnected) queueMount();
  }).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('toggle', event => {
    if (event.target !== host && event.target instanceof HTMLElement &&
      (event.target.matches('dialog, [popover]'))) queueMount();
  }, true);
  document.addEventListener('close', event => {
    if (event.target instanceof HTMLDialogElement) queueMount();
  }, true);
  document.addEventListener('fullscreenchange', queueMount);
  document.addEventListener('turbo:load', queueMount);
  document.addEventListener('yt-navigate-finish', queueMount);

  function status(message, error = false, target = 'status') {
    $(target).textContent = message;
    $(target).classList.toggle('error', error);
  }

  function currentPage() {
    $('url').value = location.href;
    $('result').hidden = true;
    status('');
  }

  function closePanel() {
    $('panel').hidden = true;
    $('launcher').setAttribute('aria-expanded', 'false');
    $('password').value = '';
    $('token').value = '';
    $('token').type = 'password';
    $('show-token').checked = false;
  }

  function showMain() {
    $('main-view').hidden = false;
    $('settings-view').hidden = true;
    $('settings').hidden = false;
    $('token').value = '';
    $('token').type = 'password';
    $('show-token').checked = false;
    $('title').textContent = '긴 링크를 짧게.';
    $('url').focus();
  }

  function showIcon() {
    mountOverlay(true);
    $('launcher').classList.remove('is-hidden', 'dragging');
    $('launcher').style.transform = '';
    suppressClick = false;
  }

  function showSettings() {
    showIcon();
    $('panel').hidden = false;
    $('launcher').setAttribute('aria-expanded', 'true');
    $('main-view').hidden = true;
    $('settings-view').hidden = false;
    $('settings').hidden = true;
    $('title').textContent = 'API 설정';
    $('token').type = 'password';
    $('show-token').checked = false;
    status('', false, 'settings-status');
    try {
      const settings = GM_getValue('settings', {});
      $('token').value = settings.apiToken || '';
      try { $('http-status-code').value = String(validateHttpStatusCode(settings.httpStatusCode)); }
      catch { $('http-status-code').value = String(DEFAULT_HTTP_STATUS_CODE); }
    } catch { status('설정을 읽지 못했습니다.', true, 'settings-status'); }
    $('token').focus();
  }

  $('launcher').addEventListener('click', event => {
    if (suppressClick) { event.preventDefault(); suppressClick = false; return; }
    if (!$('panel').hidden) { closePanel(); return; }
    currentPage();
    showMain();
    $('panel').hidden = false;
    $('launcher').setAttribute('aria-expanded', 'true');
    $('url').focus();
  });
  $('launcher').addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dy: 0 };
    suppressClick = false;
    $('launcher').setPointerCapture(event.pointerId);
    $('launcher').classList.add('dragging');
  });
  $('launcher').addEventListener('pointermove', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    gesture.dx = event.clientX - gesture.x;
    gesture.dy = event.clientY - gesture.y;
    if (Math.hypot(gesture.dx, gesture.dy) > 8) suppressClick = true;
    $('launcher').style.transform = `translateX(${Math.max(0, gesture.dx)}px)`;
  });
  function finishGesture(event, cancelled = false) {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    const hide = !cancelled && dx >= 32 && dx > Math.abs(dy) * 1.2;
    if (Math.hypot(dx, dy) > 8) suppressClick = true;
    gesture = null;
    $('launcher').classList.remove('dragging');
    $('launcher').style.transform = '';
    if (hide) { closePanel(); $('launcher').classList.add('is-hidden'); suppressClick = true; }
    if ($('launcher').hasPointerCapture(event.pointerId)) $('launcher').releasePointerCapture(event.pointerId);
  }
  $('launcher').addEventListener('pointerup', event => finishGesture(event));
  $('launcher').addEventListener('pointercancel', event => finishGesture(event, true));
  $('launcher').addEventListener('lostpointercapture', () => {
    gesture = null;
    $('launcher').classList.remove('dragging');
    $('launcher').style.transform = '';
  });
  $('close').addEventListener('click', () => { closePanel(); $('launcher').focus(); });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.stopPropagation(); closePanel(); $('launcher').focus(); }
  });
  $('settings').addEventListener('click', showSettings);
  $('back').addEventListener('click', showMain);
  $('current-page').addEventListener('click', currentPage);
  $('url').addEventListener('input', () => { $('result').hidden = true; status(''); });
  $('show-token').addEventListener('change', () => { $('token').type = $('show-token').checked ? 'text' : 'password'; });
  $('settings-form').addEventListener('submit', event => {
    event.preventDefault();
    try {
      GM_setValue('settings', {
        apiToken: validateToken($('token').value),
        httpStatusCode: validateHttpStatusCode($('http-status-code').value)
      });
      status('API_TOKEN과 기본 상태 코드를 저장했습니다.', false, 'settings-status');
    } catch (error) { status(error.message || '설정을 저장하지 못했습니다.', true, 'settings-status'); }
  });
  $('shorten-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    busy = true;
    for (const id of ['url', 'password', 'shorten', 'current-page']) $(id).disabled = true;
    $('shorten').textContent = '줄이는 중…';
    $('result').hidden = true;
    status('');
    try {
      const settings = GM_getValue('settings', {});
      const shortUrl = await shortenUrl($('url').value, settings.apiToken, {
        httpStatusCode: settings.httpStatusCode, password: $('password').value
      });
      $('short-url').value = shortUrl;
      $('password').value = '';
      $('result').hidden = false;
      status('단축 URL을 만들었습니다.');
    } catch (error) { status(error.message || '요청에 실패했습니다.', true); }
    finally {
      busy = false;
      for (const id of ['url', 'password', 'shorten', 'current-page']) $(id).disabled = false;
      $('shorten').textContent = 'URL 줄이기';
    }
  });
  $('copy').addEventListener('click', () => {
    try { GM_setClipboard($('short-url').value, 'text'); status('클립보드에 복사했습니다.'); }
    catch { $('short-url').focus(); $('short-url').select(); status('선택된 URL을 직접 복사해 주세요.', true); }
  });
  $('open').addEventListener('click', () => {
    try { GM_openInTab($('short-url').value, { active: true, insert: true }); }
    catch { status('링크를 열지 못했습니다. URL을 복사해 직접 열어 주세요.', true); }
  });
  GM_registerMenuCommand('AKA.SO 아이콘 다시 표시', showIcon);
  GM_registerMenuCommand('AKA.SO 설정', showSettings);
  GM_registerMenuCommand('AKA.SO 아이콘 숨기기', () => { closePanel(); $('launcher').classList.add('is-hidden'); });
})();

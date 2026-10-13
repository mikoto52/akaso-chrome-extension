import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../akaso.user.js', import.meta.url), 'utf8');

function setup(handler, timers = { setTimeout, clearTimeout }, environment = {}) {
  const window = { isSecureContext: true };
  window.top = window.self = window;
  const context = vm.createContext({ window, navigator: {}, URL, FormData, GM_xmlhttpRequest: handler, ...timers, ...environment });
  const functions = source.slice(0, source.indexOf('  const host ='));
  vm.runInContext(functions + '\n globalThis.api = { shortenUrl, validateHttpStatusCode, validateUrl, extractShortUrl, copyText };\n})();', context);
  return context.api;
}

test('embeds the unchanged extension icon and declares scoped API access', async () => {
  const embedded = source.match(/const ICON = 'data:image\/png;base64,([^']+)'/);
  assert.ok(embedded);
  assert.deepEqual(Buffer.from(embedded[1], 'base64'), await readFile(new URL('../../aka-so-extension/icon.png', import.meta.url)));
  assert.ok(source.includes('// @connect      aka.so'));
  assert.ok(source.includes('// @noframes'));
});

test('sends multipart request without is_bulk and converts the returned link', async () => {
  const api = setup(request => {
    assert.equal(request.url, 'https://aka.so/api/links');
    assert.equal(request.method, 'POST');
    assert.equal(request.headers.Authorization, 'Bearer test-token');
    assert.equal(request.headers['Content-Type'], undefined);
    assert.equal(request.anonymous, true);
    assert.equal(request.redirect, 'error');
    assert.equal(request.timeout, 20000);
    assert.deepEqual(Object.fromEntries(request.data), {
      type: 'link', location_url: 'https://example.com/', domain_id: '0', http_status_code: '302'
    });
    request.onload({ status: 200, responseText: '{"data":{"domain_id":0,"link_id":"aa11"}}' });
  });
  assert.equal(await api.shortenUrl('https://example.com/', ' test-token '), 'https://aka.so/aa11');
});

for (const code of [301, 302, 307, 308]) {
  test(`sends selected status ${code} and exact password`, async () => {
    const api = setup(request => {
      assert.equal(request.data.get('http_status_code'), String(code));
      assert.equal(request.data.get('password'), ' p@ss 한글 ');
      request.onload({ status: 200, responseText: '{"data":{"domain_id":0,"url":"aa11"}}' });
    });
    assert.equal(await api.shortenUrl('https://example.com/', 'token', { httpStatusCode: code, password: ' p@ss 한글 ' }), 'https://aka.so/aa11');
  });
}

test('rejects invalid URLs, tokens, and status codes before sending', () => {
  const api = setup(() => assert.fail('invalid input must not be sent'));
  assert.throws(() => api.shortenUrl('javascript:alert(1)', 'token'), /HTTP\/HTTPS/);
  assert.throws(() => api.shortenUrl('https://user:pass@example.com/', 'token'), /인증 정보/);
  for (const token of ['', 'Bearer token', 'token\nother']) {
    assert.throws(() => api.shortenUrl('https://example.com/', token), /토큰|API_TOKEN/);
  }
  assert.throws(() => api.shortenUrl('https://example.com/', 'token', { httpStatusCode: 303 }), /상태 코드/);
});

test('does not treat unknown domains or original destination as a short link', () => {
  const api = setup();
  assert.throws(() => api.extractShortUrl({ data: { domain_id: 7, url: 'aa11' } }), /단축 URL/);
  assert.throws(() => api.extractShortUrl({ data: { location_url: 'https://example.com/' } }), /단축 URL/);
  assert.equal(api.extractShortUrl({ data: { url: 'legacy' } }), 'https://aka.so/legacy');
});

test('handles HTTP and API error responses', async () => {
  for (const [status, responseText, expected] of [
    [401, '{}', /API_TOKEN/], [429, '{}', /요청 한도/],
    [200, '{"success":false}', /오류 응답/], [200, 'invalid response', /단축 URL/]
  ]) {
    const api = setup(request => request.onload({ status, responseText }));
    await assert.rejects(api.shortenUrl('https://example.com/', 'token'), expected);
  }
});

test('handles network failures, timeouts, and cancellation', async () => {
  for (const [callback, expected] of [['onerror', /연결하지/], ['ontimeout', /시간이 초과/], ['onabort', /취소/]]) {
    const api = setup(request => request[callback]());
    await assert.rejects(api.shortenUrl('https://example.com/', 'token'), expected);
  }
});

test('enforces its own timeout and aborts when the manager does not time out', async () => {
  let timeout;
  let request;
  let aborted = false;
  let cleared = false;
  const api = setup(details => {
    request = details;
    return { abort() { aborted = true; details.onabort(); } };
  }, {
    setTimeout(callback, ms) { assert.equal(ms, 20000); timeout = callback; return 1; },
    clearTimeout(id) { assert.equal(id, 1); cleared = true; }
  });
  const pending = api.shortenUrl('https://example.com/', 'token');
  timeout();
  // A late success cannot change a timed-out request into a successful result.
  request.onload({ status: 200, responseText: '{"data":{"url":"aa11"}}' });
  await assert.rejects(pending, /시간이 초과/);
  assert.equal(aborted, true);
  assert.equal(cleared, true);
});

test('starts native clipboard writing immediately and waits for completion', async () => {
  let text;
  let complete;
  let done = false;
  const api = setup(undefined, undefined, {
    navigator: { clipboard: { writeText(value) { text = value; return new Promise(resolve => { complete = resolve; }); } } },
    GM_setClipboard: () => assert.fail('native success should not use the manager')
  });
  const pending = api.copyText('https://aka.so/aa11').then(() => { done = true; });
  assert.equal(text, 'https://aka.so/aa11');
  await Promise.resolve();
  assert.equal(done, false);
  complete();
  await pending;
  assert.equal(done, true);
});

test('falls back to the manager after denied native clipboard access', async () => {
  let text;
  const api = setup(undefined, undefined, {
    navigator: { clipboard: { writeText: async () => { throw new Error('NotAllowedError'); } } },
    GM_setClipboard(value, type, done) { text = value; assert.equal(type, 'text'); done(); }
  });
  await api.copyText('https://aka.so/aa11');
  assert.equal(text, 'https://aka.so/aa11');
});

test('supports promise-based manager clipboard completion', async () => {
  const api = setup(undefined, undefined, { GM_setClipboard: async () => {} });
  await api.copyText('https://aka.so/aa11');
});

test('does not claim success when the manager gives no completion signal', async () => {
  let timeout;
  const api = setup(undefined, {
    setTimeout(callback, ms) { assert.equal(ms, 2000); timeout = callback; return 1; },
    clearTimeout() {}
  }, { GM_setClipboard: () => {} });
  const pending = api.copyText('https://aka.so/aa11');
  timeout();
  await assert.rejects(pending, /확인/);
});

test('reports unavailable and rejected clipboard APIs', async () => {
  await assert.rejects(setup().copyText('https://aka.so/aa11'), /사용할 수 없습니다/);
  const api = setup(undefined, undefined, { GM_setClipboard: async () => { throw new Error('permission denied'); } });
  await assert.rejects(api.copyText('https://aka.so/aa11'), /permission denied/);
});

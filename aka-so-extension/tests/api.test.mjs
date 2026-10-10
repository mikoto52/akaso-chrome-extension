import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../api.js', import.meta.url), 'utf8');
const { shortenUrl, extractShortUrl, validateHttpStatusCode } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
);
const destination = 'https://example.com/path?a=1&b=2';
const success = () => new Response(JSON.stringify({ data: { domain_id: 0, url: 'aa11' } }));

test('sends all required fields with default status and no empty password', async () => {
  let calls = 0;
  const result = await shortenUrl(destination, ' test-token ', {}, async (endpoint, request) => {
    calls++;
    assert.equal(endpoint, 'https://aka.so/api/links');
    assert.equal(request.method, 'POST');
    assert.equal(request.headers.Authorization, 'Bearer test-token');
    assert.equal(request.headers['Content-Type'], undefined);
    assert.equal(request.credentials, 'omit');
    assert.equal(request.redirect, 'error');
    assert.deepEqual(Object.fromEntries(request.body), {
      type: 'link', location_url: destination, domain_id: '0', http_status_code: '302'
    });
    return success();
  });
  assert.equal(result, 'https://aka.so/aa11');
  assert.equal(calls, 1);
});

for (const code of [301, 302, 307, 308]) {
  test(`sends selected status ${code} and exact password`, async () => {
    await shortenUrl(destination, 'token', { httpStatusCode: String(code), password: ' p@ss 한글 ' }, async (_, request) => {
      assert.equal(request.body.get('http_status_code'), String(code));
      assert.equal(request.body.get('password'), ' p@ss 한글 ');
      return success();
    });
  });
}

test('rejects invalid status codes before sending a request', async () => {
  for (const code of [200, 303, 0, '', null, '302x', true]) {
    assert.throws(() => validateHttpStatusCode(code), /상태 코드/);
    await assert.rejects(shortenUrl(destination, 'token', { httpStatusCode: code }, () => {
      assert.fail('invalid status must not reach the API');
    }), /상태 코드/);
  }
});

test('reads url and link_id in supported response containers', () => {
  for (const key of ['url', 'link_id']) {
    const link = { domain_id: 0, [key]: 'aa11' };
    for (const payload of [link, { data: link }, { data: { link } }, { link }]) {
      assert.equal(extractShortUrl(payload, destination), 'https://aka.so/aa11');
    }
  }
  assert.equal(extractShortUrl({ data: { domain_id: '0', url: 'aa11', link_id: 'other' } }, destination), 'https://aka.so/aa11');
  assert.equal(extractShortUrl({ data: { url: 'legacy' } }, destination), 'https://aka.so/legacy');
  assert.equal(extractShortUrl({ data: { domain_id: 0, url: 'https://aka.so/aa11' } }, destination), 'https://aka.so/aa11');
});

test('does not build an AKA.SO URL for an unknown domain or unsafe path', () => {
  for (const payload of [
    { data: { domain_id: 5, url: 'aa11' } },
    { domain_id: 5, data: { link: { link_id: 'aa11' } } },
    { data: { domain_id: 0, url: '../aa11' } },
    { data: { location_url: destination } }
  ]) assert.throws(() => extractShortUrl(payload, destination), /단축 URL/);
});

test('preserves authentication and API error handling', async () => {
  await assert.rejects(shortenUrl(destination, ''), /API_TOKEN/);
  await assert.rejects(shortenUrl(destination, 'token\nother'), /줄바꿈/);
  await assert.rejects(shortenUrl(destination, 'token', {}, async () => new Response('{}', { status: 401 })), /유효하지/);
  await assert.rejects(shortenUrl(destination, 'token', {}, async () => new Response('{"success":false}')), /오류 응답/);
});

test('aborts timed out requests', async () => {
  await assert.rejects(shortenUrl(destination, 'token', {}, async (_, { signal }) => {
    return new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
  }, 5), /시간이 초과/);
});

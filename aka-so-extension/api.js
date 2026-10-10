export const DEFAULT_HTTP_STATUS_CODE = 302;

export function validateHttpStatusCode(value = DEFAULT_HTTP_STATUS_CODE) {
  if (![301, 302, 307, 308].some(code => value === code || value === String(code))) {
    throw new Error('상태 코드는 301, 302, 307, 308 중에서 선택해 주세요.');
  }
  return Number(value);
}

export function validateUrl(value) {
  const input = String(value ?? '').trim();
  let url;
  try { url = new URL(input); } catch { throw new Error('https:// 또는 http://로 시작하는 URL을 입력해 주세요.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('인증 정보가 포함되지 않은 HTTP/HTTPS URL만 사용할 수 있습니다.');
  }
  return input;
}

export function extractShortUrl(payload, originalUrl) {
  const containers = [payload?.data?.link, payload?.data, payload?.link, payload];
  for (const object of containers) {
    if (!object || typeof object !== 'object') continue;
    // Missing domain_id preserves compatibility with earlier API responses.
    const domainId = object.domain_id ?? payload?.data?.domain_id ?? payload?.domain_id ?? 0;
    if (domainId === 0 || domainId === '0') {
      for (const slug of [object.url, object.link_id]) {
        if (typeof slug === 'string' && /^[A-Za-z0-9_-]+$/.test(slug)) {
          return `https://aka.so/${slug}`;
        }
      }
    }
    for (const key of ['short_url', 'shortUrl', 'short_link', 'shortLink', 'shortened_url', 'full_url', 'link']) {
      if (typeof object[key] !== 'string') continue;
      try { return validateUrl(object[key]); } catch { /* Try next named result. */ }
    }
    // A generic `url` can also mean the original URL; accept only AKA.SO links.
    if (typeof object.url === 'string') {
      try {
        const candidate = validateUrl(object.url);
        const parsed = new URL(candidate);
        if (parsed.hostname === 'aka.so' && parsed.pathname !== '/' && candidate !== originalUrl) return candidate;
      } catch { /* Not a full short URL. */ }
    }
  }
  if (typeof payload === 'string') {
    try { return validateUrl(payload); } catch { /* Not a URL response. */ }
  }
  throw new Error('응답에서 단축 URL을 찾지 못했습니다. API 응답 형식을 확인해 주세요.');
}

export async function shortenUrl(input, apiToken, options = {}, fetcher = fetch, timeoutMs = 20000) {
  const url = validateUrl(input);
  const httpStatusCode = validateHttpStatusCode(options.httpStatusCode);
  const password = options.password ?? '';
  if (typeof password !== 'string') throw new Error('비밀번호는 문자열로 입력해 주세요.');
  const token = String(apiToken ?? '').trim();
  if (!token) throw new Error('설정에서 API_TOKEN을 먼저 저장해 주세요.');
  if (/[\r\n]/.test(token)) throw new Error('API_TOKEN에 줄바꿈을 포함할 수 없습니다.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const body = new FormData();
    body.append('type', 'link');
    body.append('location_url', url);
    body.append('domain_id', '0');
    body.append('http_status_code', String(httpStatusCode));
    if (password !== '') body.append('password', password);
    const response = await fetcher('https://aka.so/api/links', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      // FormData supplies multipart/form-data and its required boundary.
      body, signal: controller.signal, credentials: 'omit', redirect: 'error'
    });
    const text = await response.text();
    let payload;
    try { payload = JSON.parse(text); } catch { payload = text.trim(); }
    if (!response.ok) {
      const messages = {
        400: '요청 값이 올바르지 않습니다. URL과 API 요구 항목을 확인해 주세요.',
        401: 'API_TOKEN이 없거나 유효하지 않습니다. 설정을 확인해 주세요.',
        403: 'API 사용 권한이 없습니다. 계정 권한을 확인해 주세요.',
        404: 'API 주소를 찾을 수 없습니다.',
        422: 'API가 입력 값을 처리하지 못했습니다. URL과 API 요구 항목을 확인해 주세요.',
        429: '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.'
      };
      throw new Error(messages[response.status] || `API 요청에 실패했습니다. (HTTP ${response.status})`);
    }
    if (payload?.errors?.length || payload?.error || payload?.success === false) {
      throw new Error('API가 오류 응답을 반환했습니다. 입력 값과 계정 설정을 확인해 주세요.');
    }
    return extractShortUrl(payload, url);
  } catch (error) {
    if (controller.signal.aborted) throw new Error('요청 시간이 초과되었습니다. 다시 시도해 주세요.');
    if (error instanceof TypeError) throw new Error('API에 연결하지 못했습니다. 인터넷 연결과 확장 권한을 확인해 주세요.');
    throw error;
  } finally { clearTimeout(timer); }
}

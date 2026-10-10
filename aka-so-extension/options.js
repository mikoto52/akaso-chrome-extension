import { secureStorage } from './storage.js';
import { DEFAULT_HTTP_STATUS_CODE, validateHttpStatusCode } from './api.js';
const $ = id => document.getElementById(id);
const status = (message, error = false) => { $('status').textContent = message; $('status').classList.toggle('error', error); };
function controls(disabled) { $('save').disabled = disabled; }
$('show-token').addEventListener('change', () => { $('token').type = $('show-token').checked ? 'text' : 'password'; });
$('settings-form').addEventListener('submit', async event => {
  event.preventDefault();
  const apiToken = $('token').value.trim();
  if (!apiToken || /[\r\n]/.test(apiToken) || /^Bearer\s/i.test(apiToken)) {
    status('Bearer 접두어와 줄바꿈 없이 토큰 값만 입력해 주세요.', true); return;
  }
  controls(true);
  try {
    const httpStatusCode = validateHttpStatusCode($('http-status-code').value);
    await chrome.storage.local.set({ apiToken, httpStatusCode });
    status('API_TOKEN과 기본 상태 코드를 저장했습니다.');
  }
  catch { status('저장하지 못했습니다. 다시 시도해 주세요.', true); }
  finally { controls(false); }
});
async function initialize() {
  await secureStorage();
  const { apiToken, httpStatusCode } = await chrome.storage.local.get(['apiToken', 'httpStatusCode']);
  $('token').value = apiToken || '';
  try { $('http-status-code').value = String(validateHttpStatusCode(httpStatusCode)); }
  catch { $('http-status-code').value = String(DEFAULT_HTTP_STATUS_CODE); }
  controls(false);
}
initialize().catch(() => status('설정을 읽지 못했습니다. 페이지를 새로고침해 주세요.', true));

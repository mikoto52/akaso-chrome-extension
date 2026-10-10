import { shortenUrl } from './api.js';
import { secureStorage } from './storage.js';
const $ = id => document.getElementById(id);
let busy = false;
const status = (message, error = false) => {
  $('status').textContent = message;
  $('status').classList.toggle('error', error);
};
async function currentPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url || !/^https?:\/\//i.test(tab.url)) {
    status('이 페이지의 URL은 사용할 수 없습니다. URL을 직접 입력해 주세요.');
    return;
  }
  $('url').value = tab.url;
  $('result').hidden = true;
  status('');
}
$('settings').addEventListener('click', () => chrome.runtime.openOptionsPage());
$('current-page').addEventListener('click', () => currentPage().catch(() => status('현재 페이지 URL을 가져오지 못했습니다.', true)));
$('url').addEventListener('input', () => { $('result').hidden = true; status(''); });
$('shorten-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (busy) return;
  busy = true;
  $('shorten').disabled = true;
  $('current-page').disabled = true;
  $('url').disabled = true;
  $('password').disabled = true;
  $('shorten').textContent = '줄이는 중…';
  $('result').hidden = true;
  status('');
  try {
    const { apiToken, httpStatusCode } = await chrome.storage.local.get(['apiToken', 'httpStatusCode']);
    const shortUrl = await shortenUrl($('url').value, apiToken, {
      httpStatusCode, password: $('password').value
    });
    $('password').value = '';
    $('short-url').value = shortUrl;
    $('open').href = shortUrl;
    $('result').hidden = false;
    status('단축 URL을 만들었습니다.');
  } catch (error) { status(error.message || '요청에 실패했습니다.', true); }
  finally {
    busy = false;
    $('shorten').disabled = false;
    $('current-page').disabled = false;
    $('url').disabled = false;
    $('password').disabled = false;
    $('shorten').textContent = 'URL 줄이기';
  }
});
$('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('short-url').value); status('클립보드에 복사했습니다.'); }
  catch { $('short-url').focus(); $('short-url').select(); status('복사하지 못했습니다. 선택된 URL을 직접 복사해 주세요.', true); }
});
async function initialize() {
  await secureStorage();
  await currentPage();
  const { apiToken } = await chrome.storage.local.get('apiToken');
  if (!apiToken) status('처음 사용하시나요? 설정에서 API_TOKEN을 저장해 주세요.');
  $('shorten').disabled = false;
}
initialize().catch(() => status('설정을 읽지 못했습니다. 확장을 다시 열어 주세요.', true));

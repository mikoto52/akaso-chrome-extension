# Akaso Chrome

AKA.SO API로 현재 페이지 또는 직접 입력한 URL을 단축하는 Chrome 확장 프로그램입니다. 생성한 링크를 복사하거나 새 탭에서 열 수 있습니다.

## 주요 기능

- 현재 탭 URL 자동 입력 및 직접 입력
- 단축 링크 생성, 클립보드 복사, 새 탭에서 열기
- API 토큰과 기본 리디렉션 상태 코드 설정
- 301, 302, 307, 308 지원, 초기 기본값 302
- 링크 생성 시 선택적으로 비밀번호 지정
- `icon.png`를 확장 프로그램과 도구 모음 아이콘으로 사용

## 설치

Chrome 109 이상이 필요합니다. 외부 라이브러리 설치나 별도의 빌드 과정은 없습니다.

1. 이 저장소를 내려받거나 복제합니다.
2. Chrome에서 `chrome://extensions`를 엽니다.
3. 오른쪽 위 **개발자 모드**를 켭니다.
4. **압축해제된 확장 프로그램을 로드합니다**를 누릅니다.
5. 저장소 안의 `aka-so-extension` 폴더를 선택합니다.
6. 도구 모음의 확장 프로그램 메뉴에서 **AKA.SO URL 줄이기**를 고정합니다.

## 설정과 사용

1. 확장을 열고 **설정**을 누릅니다.
2. `API_TOKEN`에 `Bearer` 접두어 없이 토큰 값만 입력합니다.
3. 기본 리디렉션 상태 코드를 선택하고 **저장**을 누릅니다.
4. 줄일 페이지에서 확장을 엽니다. 현재 페이지의 URL이 자동으로 입력됩니다.
5. 필요하면 URL을 수정하고 링크 비밀번호를 입력합니다. 비밀번호를 비우면 비밀번호 없이 생성합니다.
6. **URL 줄이기**를 누른 뒤 결과를 복사하거나 링크를 엽니다.

HTTP 또는 HTTPS URL만 사용할 수 있습니다. 요청이 끝날 때까지 팝업을 열어 두세요. 팝업을 닫으면 요청이 중단될 수 있습니다.

소스를 수정한 후에는 `chrome://extensions`에서 확장의 새로고침 버튼을 누릅니다. 확장을 삭제하지 않고 새로고침하면 저장된 설정이 유지됩니다.

## API

```text
POST https://aka.so/api/links
Authorization: Bearer {API_TOKEN}
Accept: application/json
```

요청 본문은 `FormData`를 이용한 `multipart/form-data`입니다. 브라우저가 boundary를 포함한 `Content-Type`을 자동으로 설정합니다.

| 필드 | 값 |
| --- | --- |
| `type` | `link` 고정 |
| `location_url` | 목적지 URL |
| `domain_id` | `0` 고정 |
| `http_status_code` | 설정한 301, 302, 307, 308 중 하나. 설정이 없으면 302 |
| `password` | 입력한 링크 비밀번호. 비어 있으면 생략 |

`is_bulk`는 전송하지 않습니다. 요청 제한 시간은 20초이며, 자동 재시도는 하지 않습니다. 쿠키를 전송하지 않고 리디렉션 응답은 오류로 처리합니다.

응답의 `domain_id`가 `0`이면 `url` 경로로 AKA.SO 단축 주소를 만듭니다. 사용 가능한 `url` 경로가 없으면 `link_id`를 사용합니다.

```json
{
  "data": {
    "domain_id": 0,
    "url": "aa11"
  }
}
```

위 응답의 결과는 `https://aka.so/aa11`입니다. `link_id`가 `aa11`인 응답도 같은 주소로 처리합니다. 이전 응답과의 호환성을 위해 `domain_id`가 생략되면 기본 도메인 `0`으로 처리합니다.

### curl로 요청 확인

`YOUR_API_TOKEN`과 목적지 URL을 바꾸고, 상태 코드는 확장 설정과 맞춰 실행합니다.

```bash
curl --include --silent --show-error \
  --max-time 20 \
  --request POST 'https://aka.so/api/links' \
  --header 'Authorization: Bearer YOUR_API_TOKEN' \
  --header 'Accept: application/json' \
  --form-string 'type=link' \
  --form-string 'location_url=https://example.com/' \
  --form-string 'domain_id=0' \
  --form-string 'http_status_code=302'
```

비밀번호를 지정하려면 `--form-string 'password=YOUR_LINK_PASSWORD'` 옵션을 추가합니다. 확장은 401 오류에 고정 안내 문구를 표시하므로, 상세 응답을 확인할 때는 위 명령의 응답 헤더와 본문을 확인합니다.

## 저장과 권한

API 토큰과 기본 상태 코드는 `chrome.storage.local`에 저장하며, 다른 기기와 동기화하거나 별도로 암호화하지 않습니다. 저장소 접근은 확장 프로그램의 신뢰된 컨텍스트로 제한합니다. 링크 비밀번호는 저장하지 않으며 생성 성공 시 입력란에서 지웁니다.

| 권한 | 용도 |
| --- | --- |
| `activeTab` | 확장을 열었을 때 현재 페이지 URL 읽기 |
| `storage` | API 토큰과 기본 상태 코드 저장 |
| `clipboardWrite` | 생성한 단축 URL 복사 |
| `https://aka.so/*` | AKA.SO API 요청 |

웹페이지에 스크립트를 삽입하지 않습니다. 링크 생성 요청 시 목적지 URL, 인증 토큰, 입력한 링크 비밀번호를 AKA.SO에 전송합니다.

## 배포용 패키지

### ZIP

저장소 루트에서 실행합니다. `manifest.json`이 ZIP 최상위에 포함됩니다.

```bash
cd aka-so-extension
zip ../aka-so-extension-1.0.3.zip \
  manifest.json icon.png \
  api.js storage.js popup.js popup.html \
  options.js options.html styles.css
```

Chrome 웹 스토어에는 이 ZIP을 제출합니다. 스토어 소개, 이미지, 개인정보처리방침, API 인증을 위한 테스트 안내도 준비해야 합니다. 자세한 절차는 [공식 제출 안내](https://developer.chrome.com/docs/webstore/publish)를 참고하세요.

### CRX

`chrome://extensions`에서 개발자 모드를 켜고 **확장 프로그램 압축**을 누릅니다. 루트 디렉터리는 `aka-so-extension` 폴더로 지정하며, 최초 생성 시 비공개 키 파일 항목은 비워 둡니다.

생성된 `.crx`는 확장 패키지이고 `.pem`은 서명용 개인 키입니다. `.pem`은 배포 파일에 포함하지 않고 별도로 보관하며, 다음 패키지를 만들 때 같은 키를 지정합니다. 현재 `.gitignore`는 `*.crx`만 제외합니다.

Windows와 macOS의 일반 Chrome에서는 웹 스토어 밖의 CRX 직접 설치가 제한됩니다. 개발 중에는 폴더를 로드하고, 일반 사용자에게 배포할 때는 웹 스토어를 이용할 수 있습니다. [공식 배포 안내](https://developer.chrome.com/docs/extensions/how-to/distribute/host-on-linux)

## 테스트

Node.js 20 이상에서 저장소 루트 기준으로 실행합니다.

```bash
node --test aka-so-extension/tests/api.test.mjs
```

테스트는 요청 필드, 기본값과 상태 코드 검증, 비밀번호 전달, 응답 변환, 인증 오류, 요청 시간 제한을 확인합니다. 모의 응답을 사용하며 실제 링크를 생성하지 않습니다.

## 소스 구조

```text
aka-so-extension/
├── manifest.json        # 확장 설정, 권한, 아이콘
├── icon.png             # 기본 아이콘
├── api.js               # API 요청 및 응답 처리
├── storage.js           # 저장소 접근 범위 설정
├── popup.html           # 링크 생성 화면
├── popup.js             # 링크 생성 및 복사 동작
├── options.html         # 설정 화면
├── options.js           # 토큰과 기본 상태 코드 저장
├── styles.css           # 공통 스타일
└── tests/api.test.mjs    # API 테스트
```

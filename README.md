# AKA.SO URL 줄이기

AKA.SO API로 현재 페이지 또는 직접 입력한 URL을 단축합니다. Chrome 확장과 Tampermonkey userscript를 같은 저장소에서 관리하며, 생성한 링크를 복사하거나 새 탭에서 열 수 있습니다.

| 버전 | 실행 방식 | 소스 | 현재 버전 |
| --- | --- | --- | --- |
| Chrome 확장 | 도구 모음에서 팝업 열기 | [aka-so-extension](aka-so-extension/) | 1.0.3 |
| Userscript | 웹사이트 우측 하단의 아이콘 누르기 | [akaso.user.js](userscript/akaso.user.js) | 1.0.4 |

두 버전은 독립적으로 설치하고 배포합니다. API 토큰과 기본 상태 코드 설정은 공유하지 않습니다.

## 주요 기능

- 현재 페이지 URL 자동 입력 및 직접 입력
- 단축 링크 생성, 클립보드 복사, 새 탭에서 열기
- API 토큰과 기본 리디렉션 상태 코드 설정
- 301, 302, 307, 308 지원, 초기 기본값 302
- 링크 생성 시 선택적으로 비밀번호 지정
- `icon.png`를 Chrome 확장과 userscript의 아이콘으로 사용

Userscript는 우측 하단에 44×44px 원형 아이콘을 표시합니다. 마우스 드래그 또는 터치로 오른쪽으로 밀면 숨길 수 있습니다. 사이트의 팝업에 가려지는 문제를 줄이기 위해 Popover API의 최상위 표시 영역을 사용하며, 페이지 요소가 교체되면 표시를 복구합니다. 유튜브의 Trusted Types 보안 정책에 맞춰 HTML 문자열 대신 DOM 요소를 직접 생성합니다.

## 설치

두 버전 모두 별도의 빌드 과정은 없습니다.

### Chrome 확장

Chrome 109 이상이 필요합니다.

1. 이 저장소를 내려받거나 복제합니다.
2. Chrome에서 `chrome://extensions`를 엽니다.
3. 오른쪽 위 **개발자 모드**를 켭니다.
4. **압축해제된 확장 프로그램을 로드합니다**를 누릅니다.
5. 저장소 안의 `aka-so-extension` 폴더를 선택합니다.
6. 도구 모음의 확장 프로그램 메뉴에서 **AKA.SO URL 줄이기**를 고정합니다.

### Userscript

1. 브라우저에 [Tampermonkey](https://www.tampermonkey.net/)를 설치합니다.
2. [AKA.SO Userscript 설치](https://raw.githubusercontent.com/mikoto52/akaso-chrome-extension/refs/heads/master/userscript/akaso.user.js) 링크를 엽니다.
3. Tampermonkey 설치 화면에서 **설치**를 누릅니다.
4. 사용하려는 웹사이트를 새로고침합니다.

설치 화면이 자동으로 열리지 않으면 Tampermonkey 메뉴에서 **새 스크립트 만들기**를 선택하고, 기본 내용을 설치 URL의 스크립트 전체 내용으로 교체한 뒤 저장합니다.

Tampermonkey가 userscript 실행에 필요한 브라우저 설정을 안내하면 활성화하세요. HTTP/HTTPS 웹사이트의 최상위 페이지에서 실행하며, 브라우저 내부 페이지와 스크립트 실행이 제한된 페이지에서는 표시되지 않습니다.

아이콘 이미지가 스크립트에 포함되어 있으므로 별도 이미지 파일이나 서버는 필요하지 않습니다. 자세한 설명은 [Userscript 안내](userscript/README.md)를 참고하세요.

## 설정과 사용

### Chrome 확장

1. 확장을 열고 **설정**을 누릅니다.
2. `API_TOKEN`에 `Bearer` 접두어 없이 토큰 값만 입력합니다.
3. 기본 리디렉션 상태 코드를 선택하고 **저장**을 누릅니다.
4. 줄일 페이지에서 확장을 엽니다. 현재 페이지의 URL이 자동으로 입력됩니다.
5. 필요하면 URL을 수정하고 링크 비밀번호를 입력합니다. 비밀번호를 비우면 비밀번호 없이 생성합니다.
6. **URL 줄이기**를 누른 뒤 결과를 복사하거나 링크를 엽니다.

HTTP 또는 HTTPS URL만 사용할 수 있습니다. 요청이 끝날 때까지 팝업을 열어 두세요. 팝업을 닫으면 요청이 중단될 수 있습니다.

소스를 수정한 후에는 `chrome://extensions`에서 확장의 새로고침 버튼을 누릅니다. 확장을 삭제하지 않고 새로고침하면 저장된 설정이 유지됩니다.

### Userscript

1. 우측 하단의 원형 아이콘을 누르고 **설정**을 엽니다.
2. `Bearer` 접두어 없이 API 토큰을 입력하고 기본 상태 코드를 저장합니다.
3. **링크 생성으로 돌아가기**를 누릅니다.
4. 현재 페이지 URL을 확인하거나 직접 수정하고, 필요하면 링크 비밀번호를 입력합니다.
5. **URL 줄이기**를 누른 뒤 결과를 복사하거나 링크를 엽니다.

아이콘을 오른쪽으로 32px 이상 끌면 숨겨집니다. Tampermonkey 메뉴의 **AKA.SO 아이콘 다시 표시**로 복구하거나 페이지를 새로고침하면 다시 나타납니다. 숨긴 상태에서도 메뉴의 **AKA.SO 설정**으로 설정을 열 수 있습니다.

업데이트할 때는 Tampermonkey에서 기존 스크립트 내용을 새 파일 내용으로 교체하고 저장한 뒤 페이지를 새로고침합니다.

패널을 열 때 입력란에 자동으로 포커스를 주지 않습니다. 복사 버튼은 브라우저 클립보드 API를 우선 사용하고, 필요한 경우 Tampermonkey API로 대체합니다. 자동 복사가 실패하면 단축 URL을 길게 눌러 직접 복사할 수 있습니다.

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

비밀번호를 지정하려면 `--form-string 'password=YOUR_LINK_PASSWORD'` 옵션을 추가합니다. 두 버전은 401 오류에 고정 안내 문구를 표시하므로, 상세 응답을 확인할 때는 위 명령의 응답 헤더와 본문을 확인합니다.

## 저장과 권한

Chrome 확장은 API 토큰과 기본 상태 코드를 `chrome.storage.local`에 저장하며, 다른 기기와 동기화하거나 별도로 암호화하지 않습니다. 저장소 접근은 확장 프로그램의 신뢰된 컨텍스트로 제한합니다.

Userscript는 Tampermonkey의 스크립트 전용 저장소에 설정을 보관하며, 웹사이트의 `localStorage`를 사용하지 않습니다. 화면은 닫힌 Shadow DOM으로 구성합니다. API 요청은 `GM_xmlhttpRequest`를 사용하고 연결 허용 대상은 `aka.so`입니다. 복사와 새 탭 열기도 Tampermonkey API를 사용합니다.

두 버전 모두 링크 비밀번호를 저장하지 않으며 생성 성공 시 입력란에서 지웁니다. Userscript는 패널을 닫을 때도 비밀번호 입력란을 비웁니다.

Chrome 확장의 권한은 다음과 같습니다.

| 권한 | 용도 |
| --- | --- |
| `activeTab` | 확장을 열었을 때 현재 페이지 URL 읽기 |
| `storage` | API 토큰과 기본 상태 코드 저장 |
| `clipboardWrite` | 생성한 단축 URL 복사 |
| `https://aka.so/*` | AKA.SO API 요청 |

Chrome 확장은 웹페이지에 스크립트를 삽입하지 않습니다. Userscript는 웹페이지에 아이콘과 패널을 추가합니다. 두 버전 모두 링크 생성 요청 시 목적지 URL, 인증 토큰, 입력한 링크 비밀번호를 AKA.SO에 전송합니다.

## 배포용 패키지

### Chrome 확장 ZIP

저장소 루트에서 실행합니다. `manifest.json`이 ZIP 최상위에 포함됩니다.

```bash
cd aka-so-extension
zip ../aka-so-extension-1.0.3.zip \
  manifest.json icon.png \
  api.js storage.js popup.js popup.html \
  options.js options.html styles.css
```

Chrome 웹 스토어에는 이 ZIP을 제출합니다. 스토어 소개, 이미지, 개인정보처리방침, API 인증을 위한 테스트 안내도 준비해야 합니다. 자세한 절차는 [공식 제출 안내](https://developer.chrome.com/docs/webstore/publish)를 참고하세요.

### Chrome 확장 CRX

`chrome://extensions`에서 개발자 모드를 켜고 **확장 프로그램 압축**을 누릅니다. 루트 디렉터리는 `aka-so-extension` 폴더로 지정하며, 최초 생성 시 비공개 키 파일 항목은 비워 둡니다.

생성된 `.crx`는 확장 패키지이고 `.pem`은 서명용 개인 키입니다. `.pem`은 배포 파일에 포함하지 않고 별도로 보관하며, 다음 패키지를 만들 때 같은 키를 지정합니다. 현재 `.gitignore`는 `*.crx`만 제외합니다.

Windows와 macOS의 일반 Chrome에서는 웹 스토어 밖의 CRX 직접 설치가 제한됩니다. 개발 중에는 폴더를 로드하고, 일반 사용자에게 배포할 때는 웹 스토어를 이용할 수 있습니다. [공식 배포 안내](https://developer.chrome.com/docs/extensions/how-to/distribute/host-on-linux)

### Userscript 배포

[userscript/akaso.user.js](userscript/akaso.user.js) 파일 하나를 배포합니다. Chrome 확장 ZIP 또는 CRX에는 userscript를 넣지 않습니다.

두 버전의 버전 번호는 각각 `manifest.json`과 userscript의 `@version`에서 관리합니다. 릴리스 태그는 `extension-v1.0.3`, `userscript-v1.0.4`처럼 구분할 수 있습니다.

## 테스트

Node.js 20 이상에서 저장소 루트 기준으로 실행합니다.

```bash
node --test aka-so-extension/tests/api.test.mjs userscript/tests/api.test.mjs
```

테스트는 두 버전의 요청 필드, 기본값과 상태 코드 검증, 비밀번호 전달, 응답 변환, 인증 오류, 요청 시간 제한을 확인합니다. Userscript는 포함된 아이콘이 원본과 일치하는지도 확인합니다. 모의 응답을 사용하며 실제 링크를 생성하지 않습니다.

## 소스 구조

```text
README.md                   # 프로젝트 전체 안내
aka-so-extension/           # Chrome 확장
├── manifest.json           # 확장 설정, 권한, 아이콘
├── icon.png                # 원본 아이콘
├── api.js                  # API 요청 및 응답 처리
├── storage.js              # 저장소 접근 범위 설정
├── popup.html / popup.js   # 링크 생성 화면과 동작
├── options.html / options.js # 토큰과 기본 상태 코드 설정
├── styles.css              # 공통 스타일
└── tests/api.test.mjs       # Chrome 확장 API 테스트
userscript/                 # Tampermonkey userscript
├── akaso.user.js            # 아이콘과 화면을 포함한 설치 파일
├── README.md               # Userscript 상세 안내
└── tests/api.test.mjs       # Userscript API 테스트
```

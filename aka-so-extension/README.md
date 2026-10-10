# AKA.SO URL 줄이기 — Chrome 확장

## 설치

1. ZIP 파일을 압축 해제합니다.
2. Chrome 주소창에 `chrome://extensions`를 입력합니다.
3. 오른쪽 위 **개발자 모드**를 켭니다.
4. **압축해제된 확장 프로그램을 로드합니다**를 누릅니다.
5. `manifest.json`이 들어 있는 `aka-so-extension` 폴더를 선택합니다.
6. Chrome 도구 모음의 확장 프로그램 메뉴에서 이 확장을 고정하면 편리합니다.

## 사용

1. 확장 아이콘 → **설정**에서 `API_TOKEN` 값과 기본 리디렉션 상태 코드를 저장합니다. 상태 코드는 301, 302, 307, 308 중에서 선택하며 초기값은 302입니다.
2. 줄일 페이지에서 확장을 엽니다. 현재 페이지 URL이 자동으로 입력됩니다.
3. 필요하면 URL을 직접 수정하고 링크 비밀번호를 입력한 뒤 **URL 줄이기**를 누릅니다. 비밀번호를 비우면 비밀번호 없이 생성합니다.
4. 표시된 결과를 **복사하기**로 복사하거나 **링크 열기**로 확인합니다.

설정은 Chrome 확장 관리 화면의 확장 옵션에서도 열 수 있습니다.
요청 중에는 팝업을 열어 두세요. 팝업을 닫으면 진행 중인 요청이 중단될 수 있습니다.

## API 요청

요청 주소: `POST https://aka.so/api/links`

- `Authorization: Bearer {API_TOKEN}`
- multipart 폼으로 다음 필드를 전달합니다.
  - `type`: `link` (고정)
  - `location_url`: 입력한 목적지 URL
  - `domain_id`: `0` (고정)
  - `http_status_code`: 설정에 저장한 상태 코드 (설정이 없으면 `302`)
  - `password`: 링크 생성 시 입력한 비밀번호, 비어 있으면 전송하지 않음
- JavaScript `FormData` 사용: 브라우저가 `Content-Type: multipart/form-data; boundary=...`를 자동으로 생성합니다. Content-Type을 수동으로 지정하면 boundary가 누락될 수 있으므로 지정하지 않습니다.
- 자동 재시도 없음: 중복 링크 생성을 피하기 위해 실패 시 사용자가 다시 요청합니다.
- 20초 요청 제한, HTTP 인증/권한/요청 한도 오류 안내

## 응답 처리 및 검증 범위

실제 인증 토큰이 제공되지 않아 라이브 링크 생성은 검증하지 않았습니다.
응답의 `domain_id`가 `0`이면 `url`을 단축 경로로 읽어 `https://aka.so/{url}` 형태로 표시하고 복사합니다. `url` 경로가 없으면 `link_id`를 사용합니다. 예: `{"data":{"domain_id":0,"url":"aa11"}}` 또는 `{"data":{"domain_id":0,"link_id":"aa11"}}` → `https://aka.so/aa11`. 단축 경로는 영문, 숫자, 밑줄, 하이픈으로 제한합니다. 이전 응답과의 호환성을 위해 `domain_id`가 생략된 경우에는 요청한 기본 도메인(`0`)으로 처리합니다. 다른 `domain_id`의 경로는 AKA.SO 주소로 변환하지 않습니다.
응답의 `data`, `data.link`, `link`, 최상위 객체에서 `short_url`, `shortUrl`, `short_link`, `shortLink`, `shortened_url`, `full_url`, `link` 형태의 HTTP/HTTPS 결과도 처리합니다.
`data.url`의 단축 경로 외에 `url` 필드가 완성된 URL을 반환할 경우에는 AKA.SO 도메인의 주소일 때만 사용합니다. `location_url`은 원본 주소이며 결과로 사용하지 않습니다. 다른 형태의 응답은 오류를 표시합니다.

비밀번호는 설정에 저장하지 않으며 생성 성공 시 입력란에서 지웁니다.

## 기존 설치 업데이트

새 파일로 기존 설치 폴더 안의 파일을 교체한 뒤, `chrome://extensions`에서 확장의 새로고침 버튼을 누릅니다. 버전이 `1.0.3`으로 표시되면 업데이트 완료입니다. 확장을 삭제하지 않고 업데이트하면 저장된 API_TOKEN은 유지됩니다.

## 저장과 권한

토큰과 기본 상태 코드는 `chrome.storage.local`에 저장됩니다. 기기 간 동기화하지 않으며 별도 암호화하지 않습니다. 저장소 접근은 확장 페이지로 제한합니다. 웹페이지에 스크립트를 삽입하지 않으며 토큰과 비밀번호를 로그에 출력하지 않습니다.

- `activeTab`: 사용자가 확장을 열었을 때 현재 페이지 URL 읽기
- `storage`: 토큰 설정 저장
- `clipboardWrite`: 복사 버튼
- `https://aka.so/*`: AKA.SO API 요청

외부 라이브러리나 빌드 과정 없이 Manifest V3로 동작합니다. Chrome 109 이상이 필요합니다.

## 검증

Node.js 20 이상에서 `node --test aka-so-extension/tests/api.test.mjs`로 요청 필드, 상태 코드 검증, 비밀번호 처리, 응답 변환, 오류와 시간 제한을 검증할 수 있습니다. 테스트는 모의 응답을 사용하며 실제 링크를 생성하지 않습니다.

공식 참고 문서:
- https://aka.so/api-documentation
- https://developer.chrome.com/docs/extensions/develop/concepts/network-requests
- https://developer.chrome.com/docs/extensions/reference/api/storage

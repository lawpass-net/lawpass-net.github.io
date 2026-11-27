# Lawpass.net 관리 — 작업 지침

이 저장소는 **박도현 변호사의 [로스쿨 입시 종합 정보] 사이트 Lawpass.net**이다. 이 문서는 사이트를 처음 만든 세션(2026.11.27~28)의 내용을 넘겨받기 위한 인수인계 문서이며, 앞으로 바뀌는 규칙·교훈은 이 문서에 계속 추가한다.

## 0. 작업 원칙

- 답변은 한국어, 자연스러운 이다/하다체로 쓴다. '세우다'라는 표현은 쓰지 않는다. 설정·메뉴는 한글 메뉴 이름으로 안내한다.
- **데이터 원본은 구글 시트**다. 사이트는 읽기 전용이며, 숫자를 사이트 코드에 직접 적지 않는다.
- 사이트 화면 문구(수험생이 읽는 글)는 기본적으로 '~다' 평서체, 버튼·권유 문구만 '~해 주세요'를 쓴다.
- 수정 후에는 로컬에서 띄워 화면을 확인하고(`python3 -m http.server`, Playwright 스크린샷), main에 커밋·푸시한다. GitHub Pages 반영까지 1~2분, 브라우저 캐시 때문에 사용자에게는 Ctrl+F5 안내가 필요하다.
- 커밋 작성자: `lawpass-net <lawpass-net@users.noreply.github.com>`

## 1. 주소·계정·인프라

| 항목 | 내용 |
|---|---|
| 사이트 | https://lawpass.net (www.lawpass.net → 자동 이동, HTTPS 강제 켜짐) |
| 저장소 | GitHub `lawpass-net/lawpass-net.github.io` (공개, main 브랜치 루트에서 Pages 배포) |
| 카페 이동 주소 | https://cafe.lawpass.net → 다음 카페. 저장소 `lawpass-net/cafe`(index.html 한 장, 즉시 이동 페이지, HTTPS 강제 켜짐) |
| GitHub 계정 | 사용자명 `lawpass-net`(표시 이름 zemisama), 기본 메일 Gmail. Claude GitHub 앱은 **`lawpass-net.github.io` 저장소에만** 설치됨 → `cafe` 저장소는 세션에서 푸시 불가(웹 편집기로 수정) |
| 도메인 업체 | 아이티이지(iteasy.co.kr), 네임서버 ns1/ns2.ksdom.kr, 마이페이지 → 도메인 → 웹DNS 설정 |
| 기타 도메인 | wenee.com → 다음 카페(cafe.daum.net/lsinfo) 유동포워딩(아이티이지 포워딩 서비스). 이전 연결 주소는 m.site.naver.com/1hOCB(추합 현황)였다 |

### lawpass.net DNS(아이티이지 웹DNS) — 건드리지 말 것
- 루트 A ×4: 185.199.108.153 / 109 / 110 / 111 (GitHub Pages)
- www CNAME lawpass-net.github.io, cafe CNAME lawpass-net.github.io
- TXT `_github-pages-challenge-lawpass-net` = bb6db9426782da2f65fbbdb1e4976f (도메인 소유 인증, 지우지 말 것)
- MX ×2 (ASPMX.daum.net 10, ALT.ASPMX.daum.net 20) — 다음 메일, **유지**
- class CNAME lawpass.synology.me — 시놀로지 NAS, **유지**
- ⚠️ 교훈: 아이티이지에서 **포워딩 해제를 하면 루트 A 레코드가 자동으로 삭제된다.** 포워딩·파킹 같은 부가서비스를 바꾼 뒤에는 반드시 웹DNS 레코드를 다시 확인한다.
- ⚠️ 교훈: 아이티이지 포워딩 서버(58.239.27.115)는 하위 주소(cafe.lawpass.net 등)를 처리하지 못한다. 하위 주소 이동은 GitHub Pages 저장소로 만든다.
- 웹DNS 화면은 `https://mypage.iteasy.co.kr/domain/webdns/popup01?idx=197528`(lawpass.net). 페이지 함수 `Add_record()`, `Modify_record(i)`, `Delete_record(i)`가 alert/confirm을 띄우므로 자동화할 때는 alert·confirm을 먼저 덮어쓴다. A 레코드의 호스트명은 '@'가 아니라 빈칸이다.

## 2. 데이터 원본

### 추가합격자 현황 시트
- https://docs.google.com/spreadsheets/d/11J1_WlzSdtp3BQuFiI9oVglM4RNSxuKrApN3nDaWVXs
- 탭: 2026·2025·2024·2023·2022·2021·2020학년도 (gid는 `js/config.js`의 years). 2026 탭은 누구나 편집, 이전 연도는 수정 불가.
- **연도마다 표 위치·열 배치가 다르다**(표 시작 행 6~15행, 총계 열 D 또는 E, 사이 빈 열 유무, 7주차/8주차+이후). `js/parser.js`가 "학교명" 머리글 행을 찾아 열을 자동으로 잡는다.
- 값은 자유 텍스트: `33(특1,지2)`(일반33·특별1·지역2), `77+`(이상), `3?`(추정), `법1 비4`(전북대: 합산 5), `80 내외`, `(특1)`. 원문은 그대로 보여주고 그래프에는 첫 숫자만 쓴다.
- **빨간 글자 = 박도현 변호사가 정보공개청구로 확인한 값.** CSV에는 색이 안 담기므로 `data/verified.json`에 따로 저장한다(학교명+칸 이름 기준).
- 정보공개청구 범위: 2023학년도부터 전 학교, 건국대·한국외대는 2026학년도부터(건국대 2023~2025는 행정소송 후 2026.6.30 공개받아 반영). 원자료는 `E:\OneDrive_SH_Post_LEET\{연도}\입결정보공개`.
- 확인값이 없는 칸(2026.11.28 기준): 2025 경희대(행정심판 인용 재결 2026.2.24, 자료 미수령), 2026 성균관대(비공개, 행정심판 중). 2023 한국외대는 비공개.
- 상단 배너(면접 문제 제보) 링크: https://forms.cloud.microsoft/r/9hYfptwVrL / 시트 B1 "입시결과 제보 바로가기" 링크: https://cafe.daum.net/lsinfo/nafW/79

### 모집군 규칙 (`js/config.js` groups, 2027 요강 기준)
- 나군만: 강원·고려·성균관·연세·이화·한양 / 가군만: 건국·경희·서울·시립·중앙·외대 / 나머지 13개교 가·나 분할
- 시트는 한 군만 뽑는 학교도 첫 칸(가군 칸)에 적는다 → 사이트가 실제 군으로 옮겨 표시한다.
- **가·나 분할 학교인데 총계가 한 칸에만 적힌 해 = "가·나 통합"**(회색 배지·회색 막대). 현재 해당: 2024 동아대.
- 연도별로 군이 달랐던 학교는 `groupsByYear`에 따로 적는다(현재 없음).
- 미해결: 2022 부산대 — 총계 없음, 주차(이후) 가군 칸에만 1, 비고는 "나군 1명 추가모집". 사용자 확인 대기.

### 전형일정
- `js/schedule-data.js` — 2027학년도 25개교(각 학교 2027 입학요강 원문, 2026.9.13 기준). 원본은 claude.ai 아티팩트 https://claude.ai/artifact/4AvNyB8hsF6HmcUb5sNRWr 였다. 새 학년도에는 이 파일을 교체한다.

### 다음 카페
- https://cafe.daum.net/lsinfo (grpid 1YIpC). 공지사항 게시판 fldid `nafW`, 추합 제보 게시글 nafx/82.
- 게시판 목록은 **로그인 없이** `https://cafe.daum.net/_c21_/bbs_list?grpid=1YIpC&fldid=nafW` HTML 안의 `notices.push({...})`(고정 공지), `articles.push({...})`(최근 20건)로 읽힌다. 원문 링크는 `https://cafe.daum.net/lsinfo/nafW/{dataid}`.

## 3. 파일 구조

```
index.html              탭 3개(추합현황/전형일정/바로가기), 머리글 로고(SVG 인라인), 배너 자리
css/style.css
js/config.js            ★ 운영 설정: 시트 ID, publishedId, 연도·gid, 모집군, 배너, 제보 버튼, 바로가기 링크
js/parser.js            시트 CSV 해석(브라우저·Node 공용)
js/app.js               화면 렌더링, 그래프(Chart.js 4.4.1 CDN), 카페 공지 표시
js/schedule-data.js     전형일정 데이터
data/YYYY.csv           시트 저장본(실시간 읽기 실패·미설정 시 사용)
data/verified.json      빨간 글자(확인값) 위치
data/cafe-notice.json   카페 공지 목록(자동 생성, 직접 고치지 말 것)
img/                    배너 이미지
scripts/fetch-cafe.mjs  카페 공지 수집(Actions가 실행)
scripts/sync-from-sheet.mjs  시트 → 저장본 CSV·verified.json 재생성
.github/workflows/cafe-notice.yml  1시간마다(매시 17분 UTC) 카페 공지 갱신, 수동 실행 가능
CNAME                   lawpass.net
```

## 4. 화면 구성(현재 상태)

- **머리글**: 로고 마크(갈색 둥근 사각형 + L + 체크) + "Lawpass.net"(.net 갈색) + 구분선 + "**박도현 변호사**의 / 로스쿨 입시 종합 정보". 모바일은 2줄(이름 줄 / 메뉴 줄).
- **배너**: 모든 탭 머리글 아래. `config.banners`(현재 면접 문제 제보 배너, 870/1740px).
- **추합현황**: 안내문(빨간 글자 의미 포함) → 📢 카페 공지([공지] 고정글만) → 큰 제보 버튼 2개(시트 직접 입력 = 2026 탭 / 카페 제보 게시글) → 연도 선택(2026~2020) → 전체/가군/나군 → 보기(표 / 학교별 추이 / 학교 비교) → 학교 검색.
  - 표: 원문 그대로, 확인값 빨간 굵은 글씨, 머리글 가운데 정렬, 학교명 열 고정.
  - 학교별 추이: 연도별 총계 막대(확인값 빨강/제보값 검정, 나군은 연한 막대, 통합은 "통합 n") + 아래 범례 상자 + 주차별 누적 선그래프 + 연도별 원문 표.
  - 학교 비교: 총계 가로 누적 막대(가 파랑·나 주황·통합 회색), 누르면 학교별 추이로 이동.
  - 맨 아래 자료 출처 문구는 추합현황 탭에서만 보인다.
- **전형일정**: 기본 달력, [달력 | 표] 전환, 학교 검색, 군 배지(가·나 분할 학교는 가군·나군 배지 2개).
- **바로가기**: 카드(원본 시트, 추합 제보 게시글, 입시결과 제보 게시글, 다음 카페, 로스쿨 오픈카톡 g0JMskL, 변시 오픈카톡 g50tYJdi) + 📢 카페 공지.

## 5. 자주 하는 작업

- **새 학년도(예: 2027) 추가**: 시트에 탭을 만들면 gid 확인 → `config.js` years 맨 위에 `{ year: 2027, gid: ... }` 추가, `report.sheet` 링크의 gid도 새 탭으로 변경 → `data/2027.csv` 저장본 생성.
- **저장본·빨간 글자 갱신**: Sheets 커넥터 `get_spreadsheet`(includeGridData, 위 fields) 결과 파일로 `node scripts/sync-from-sheet.mjs <파일>` 실행. CSV 줄바꿈 방식만 달라져도 diff가 크게 나므로 내용 변화가 없으면 커밋하지 않는다.
- **실시간 연결**: 시트에서 파일 → 공유 → 웹에 게시 → 전체 문서·쉼표로 구분된 값(.csv) 게시 후, 주소의 `/d/e/` 뒤 값(2PACX-...)을 `config.js`의 `publishedId`에 넣는다. ⚠️ 현재 **비어 있다 → 사이트는 저장본(2026.11.27 기준)을 보여주는 중**. `gviz/tq` 주소는 글자 섞인 칸(4+ 등)을 빈칸으로 바꾸므로 쓰지 않는다.
- **배너 추가·교체**: 이미지는 사용자 PC `E:\OneDrive_SH\1_Post_LEET\2026\홍보\이미지`에 있다(장치 연결로 가져옴) → `img/`에 넣고 `config.banners`에 추가.
- **바로가기 링크**: `config.links` 수정.
- **카페 공지 수동 갱신**: 저장소의 작업(Actions) 탭 → "카페 공지 목록 갱신" → 워크플로 실행. 봇이 data/cafe-notice.json을 커밋하므로 **푸시 전에 항상 `git pull --rebase`**.
- 빨간 막대 색 `#d1302a`, 가군 `--ga`, 나군 `--na`, 통합 회색 `#8f8a80`.

## 6. 남은 일·아이디어
- 시트 웹 게시 후 `publishedId` 설정(실시간 반영) — 사용자 작업 필요.
- 2022 부산대 군 확인.
- 다른 카페 게시판(nafx 칼럼 등) 목록 추가는 `scripts/fetch-cafe.mjs`의 BOARDS에 추가하면 된다.
- GitHub 예약 작업은 저장소 활동이 60일 없으면 멈출 수 있다(봇 커밋이 있으면 유지됨). 공지가 오래 안 바뀌면 확인.

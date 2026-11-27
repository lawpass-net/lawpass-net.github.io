# LawPass · 로스쿨 입시 종합 정보

https://lawpass-net.github.io (추후 lawpass.net 연결 예정)

## 구성
- `index.html` — 탭 3개(추합현황 / 전형일정 / 바로가기)
- `js/config.js` — 시트 ID, 웹 게시 ID, 연도별 탭 gid, 바로가기 링크
- `js/parser.js` — 연도별 시트 CSV 해석(머리글 위치 자동 탐지)
- `js/schedule-data.js` — 전형일정 데이터
- `data/YYYY.csv` — 시트를 읽지 못할 때 쓰는 저장본

## 운영
- 추합 데이터 원본은 구글 시트다. `config.js`의 `publishedId`가 채워져 있으면 사이트가 시트를 실시간으로 읽는다.
- 새 학년도 탭을 만들면 `config.js`의 `years` 맨 위에 `{ year: 2027, gid: 새탭gid }`를 추가한다.
- 새 학년도 전형일정은 `schedule-data.js`를 교체한다.

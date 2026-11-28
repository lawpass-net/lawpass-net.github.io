// 사이트 설정 — 연도 탭을 추가하거나 링크를 바꿀 때 이 파일만 고치면 된다.
window.SITE_CONFIG = {
  sheetId: '11J1_WlzSdtp3BQuFiI9oVglM4RNSxuKrApN3nDaWVXs',

  // 시트를 "웹에 게시"하면 생기는 주소의 /d/e/ 뒤 값(2PACX-로 시작). 비워 두면 내장 스냅샷을 쓴다.
  publishedId: '',

  // 사이트에 보여줄 연도 탭 목록(최신이 위). gid = 시트 탭 주소의 #gid= 값
  years: [
    { year: 2026, gid: 803920049 },
    { year: 2025, gid: 1073536929 },
    { year: 2024, gid: 957964368 },
    { year: 2023, gid: 681780583 },
    { year: 2022, gid: 1914883348 },
    { year: 2021, gid: 1972707422 },
    { year: 2020, gid: 1789979094 }
  ],

  // 연도 선택에는 보이지 않고 '학교별 추이'의 연도별 통계에만 쓰는 이전 연도(필요할 때 years에서 옮겨 온다)
  historyYears: [],

  // 학교별 모집군. 시트는 한 군만 모집하는 학교도 첫 칸(가군 칸)에 입력하므로, 사이트가 이 표로 실제 군을 붙인다.
  // A = 가군만, B = 나군만, AB = 가·나군 분할. 2027학년도 요강 기준이며, 해마다 다른 학교는 groupsByYear에 따로 적는다.
  groups: {
    '강원대학교': 'B', '건국대학교': 'A', '경북대학교': 'AB', '경희대학교': 'A', '고려대학교': 'B',
    '동아대학교': 'AB', '부산대학교': 'AB', '서강대학교': 'AB', '서울대학교': 'A', '서울시립대학교': 'A',
    '성균관대학교': 'B', '아주대학교': 'AB', '연세대학교': 'B', '영남대학교': 'AB', '원광대학교': 'AB',
    '이화여자대학교': 'B', '인하대학교': 'AB', '전남대학교': 'AB', '전북대학교': 'AB', '제주대학교': 'AB',
    '중앙대학교': 'A', '충남대학교': 'AB', '충북대학교': 'AB', '한국외국어대학교': 'A', '한양대학교': 'B'
  },
  // 예: groupsByYear: { 2021: { '강원대학교': 'A' } }
  groupsByYear: {},

  // 모든 페이지 맨 위 카운트다운. 시각(한국시간)이 빠른 것부터 하나씩 보여준다. afterText가 있으면 시각이 지난 뒤 그날 자정까지 그 문구를 보여주고, 그다음 것으로 넘어간다.
  // finals: true면 전형일정(schedule-data.js)의 학교별 최종 합격자 발표를 날짜별로 묶어 자동으로 이어 붙인다(그날 적힌 가장 이른 시각 기준, 시각이 하나도 없으면 09:00).
  countdown: {
    events: [
      { label: '나군 면접까지', note: '11.28(토) 09:00 기준', at: '2026-11-28T09:00:00+09:00', afterText: '나군 면접 응시생 모두 화이팅!' }
    ],
    finals: true
  },

  // 배너 6종. 매 방문마다 무작위로 둘을 골라 위(정사각)·아래(가로)에 하나씩 보여준다(같은 배너가 겹치지 않음).
  // 이미지 원본: E:\OneDrive_SH_Post_LEET6\홍보\이미지\배너_정사각_1080_*.png / 배너_가로_2000x400_*.png → img/banners/sq-*.png / wide-*.png
  // url이 비어 있으면 눌러도 이동하지 않는다(멘토링·서포터스는 주소 미정). 빼려면 목록에서 지운다.
  // 배너 그림을 같은 이름으로 덮어쓰면 이 값을 바꾼다(브라우저가 예전 그림을 다시 쓰지 않게).
  bannerVersion: '20261128c',
  banners: [
    { key: 'interview',  alt: '면접 문제 제보 — 가·나군 면접 응시생 리워드 증정', url: 'https://forms.cloud.microsoft/r/9hYfptwVrL' },
    { key: 'result',     alt: '로스쿨 입시 결과 제보 EVENT', url: 'https://cafe.daum.net/lsinfo/nafW/79' },
    { key: 'leet',       alt: '박도현 변호사의 LEET 추리논증·논술 과외', url: 'https://cafe.daum.net/lsinfo/nafW/80' },
    { key: 'civil',      alt: '박도현 변호사의 민법 사례형 클리닉(온라인)', url: 'https://cafe.daum.net/lsinfo/nafW/81' },
    { key: 'mentoring',  alt: '로스쿨 생활 멘토링 특강', url: '' },
    { key: 'supporters', alt: '재학생 서포터스 모집', url: '' },
    { key: 'barn',       alt: '외양간 고치기 프로젝트', url: '' }  // 2026학년도 글은 nafW/75. 2027학년도 글 확인 후 넣는다
  ],

  // 방문 통계(js/analytics.js가 읽는다). 값이 비어 있는 도구는 불러오지 않는다. lawpass.net에서만 켜진다.
  // cloudflareToken: Cloudflare 스크립트 한 줄의 data-cf-beacon 안 "token" 값 / ga4Id: GA4 측정 ID(G-…) / naverId: 네이버 애널리틱스 사이트 ID(wcs_add["wa"] 값)
  analytics: {
    cloudflareToken: '',
    ga4Id: '',
    naverId: ''
  },

  // 추합현황 페이지 상단의 큰 제보 버튼
  report: {
    sheet: 'https://docs.google.com/spreadsheets/d/11J1_WlzSdtp3BQuFiI9oVglM4RNSxuKrApN3nDaWVXs/edit#gid=803920049',
    cafe: 'https://cafe.daum.net/lsinfo/nafW/82'
  },

  links: [
    { title: '추합 현황 시트', desc: '수험생 제보로 갱신되는 원본 시트. 직접 수정·추가할 수 있다.', url: 'https://docs.google.com/spreadsheets/d/11J1_WlzSdtp3BQuFiI9oVglM4RNSxuKrApN3nDaWVXs', tag: '원본' },
    { title: '추합 제보 게시글', desc: '틀린 내용이나 새 소식은 이 게시글 댓글로 알려 달라.', url: 'https://cafe.daum.net/lsinfo/nafW/82', tag: '제보' },
    { title: '입시결과 제보 게시글', desc: 'LEET·학점·영어 등 입시결과(합불) 제보 게시글.', url: 'https://cafe.daum.net/lsinfo/nafW/79', tag: '제보' },
    { title: '다음 카페 로스쿨 입시정보', desc: '입시 정보·후기·질문 게시판.', url: 'https://cafe.daum.net/lsinfo', tag: '카페' },
    { title: '"박도현 변호사와 함께 로스쿨로 Go!" 오픈카톡방', desc: '로스쿨 입시생·예비합격자를 위한 오픈카톡방.', url: 'https://open.kakao.com/o/g0JMskL', tag: '오픈카톡' },
    { title: '"박도현 변호사와 함께 변시 합격으로 Go!" 오픈카톡방', desc: '로스쿨 재학생·변호사시험 수험생을 위한 오픈카톡방.', url: 'https://open.kakao.com/o/g50tYJdi', tag: '오픈카톡' }
  ]
};

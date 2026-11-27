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

  // 모든 페이지 머리글 아래에 보이는 배너(여러 개면 차례로 표시). 빼려면 목록에서 지운다.
  banners: [
    { img: 'img/banner-interview-870.png', img2x: 'img/banner-interview-1740.png', url: 'https://forms.cloud.microsoft/r/9hYfptwVrL', alt: '가·나군 면접 응시생 리워드 증정 — 면접 문제 제보하기' }
  ],

  // 추합현황 페이지 상단의 큰 제보 버튼
  report: {
    sheet: 'https://docs.google.com/spreadsheets/d/11J1_WlzSdtp3BQuFiI9oVglM4RNSxuKrApN3nDaWVXs/edit#gid=803920049',
    cafe: 'https://cafe.daum.net/lsinfo/nafx/82'
  },

  links: [
    { title: '추합 현황 시트', desc: '수험생 제보로 갱신되는 원본 시트. 직접 수정·추가할 수 있다.', url: 'https://docs.google.com/spreadsheets/d/11J1_WlzSdtp3BQuFiI9oVglM4RNSxuKrApN3nDaWVXs', tag: '원본' },
    { title: '추합 제보 게시글', desc: '틀린 내용이나 새 소식은 이 게시글 댓글로 알려 달라.', url: 'https://cafe.daum.net/lsinfo/nafx/82', tag: '제보' },
    { title: '입시결과 제보 게시글', desc: 'LEET·학점·영어 등 입시결과(합불) 제보 게시글.', url: 'https://cafe.daum.net/lsinfo/nafW/79', tag: '제보' },
    { title: '다음 카페 로스쿨 입시정보', desc: '입시 정보·후기·질문 게시판.', url: 'https://cafe.daum.net/lsinfo', tag: '카페' },
    { title: '"박도현 변호사와 함께 로스쿨로 Go!" 오픈카톡방', desc: '입시 소식 공유, 추합 제보, 질문은 오픈카톡방에서.', url: 'https://open.kakao.com/o/g0JMskL', tag: '오픈카톡' }
  ]
};

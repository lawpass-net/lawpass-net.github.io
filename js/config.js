// 사이트 설정 — 연도 탭을 추가하거나 링크를 바꿀 때 이 파일만 고치면 된다.
window.SITE_CONFIG = {
  sheetId: '11J1_WlzSdtp3BQuFiI9oVglM4RNSxuKrApN3nDaWVXs',

  // 시트를 "웹에 게시"하면 생기는 주소의 /d/e/ 뒤 값(2PACX-로 시작). 비워 두면 내장 스냅샷을 쓴다.
  publishedId: '',

  // 연도 탭 목록(최신이 위). gid = 시트 탭 주소의 #gid= 값
  years: [
    { year: 2026, gid: 803920049 },
    { year: 2025, gid: 1073536929 },
    { year: 2024, gid: 957964368 },
    { year: 2023, gid: 681780583 },
    { year: 2022, gid: 1914883348 },
    { year: 2021, gid: 1972707422 },
    { year: 2020, gid: 1789979094 }
  ],

  links: [
    { title: '추합 현황 시트', desc: '수험생 제보로 갱신되는 원본 시트. 직접 수정·추가할 수 있다.', url: 'https://docs.google.com/spreadsheets/d/11J1_WlzSdtp3BQuFiI9oVglM4RNSxuKrApN3nDaWVXs', tag: '원본' },
    { title: '추합 제보 게시글', desc: '틀린 내용이나 새 소식은 이 게시글 댓글로 알려 달라.', url: 'https://cafe.daum.net/lsinfo/nafx/82', tag: '제보' },
    { title: '다음 카페 로스쿨 입시정보', desc: '입시 정보·후기·질문 게시판.', url: 'https://cafe.daum.net/lsinfo', tag: '카페' },
    { title: '오픈채팅방', desc: '박도현 변호사 오픈채팅방.', url: '', tag: '오픈카톡' }
  ]
};

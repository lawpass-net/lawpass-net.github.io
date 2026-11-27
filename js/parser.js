// 추합 현황 시트(연도별 탭) CSV 파서
// - 탭마다 표 위치·열 배치가 달라서 "학교명" 머리글 행을 찾아 열을 자동으로 매핑한다.
// - 셀 값은 자유 텍스트이므로 원문(raw)과 숫자 해석(parsed)을 함께 보관한다.
(function (root) {
  'use strict';

  // ---------- CSV ----------
  function parseCSV(text) {
    const rows = [];
    let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') {
          if (text[i + 1] === '"') { cell += '"'; i++; } else q = false;
        } else cell += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  // ---------- 셀 값 해석 ----------
  // 예: "33(특1,지2)" "77+ (특2+)" "법1 비4" "3?" "(특1)" "n+" "25 특(3)" "30 (지2포함)"
  function parseValue(raw) {
    const s = String(raw == null ? '' : raw).trim();
    const r = { raw: s, n: null, plus: false, guess: false, special: 0, local: 0 };
    if (!s) return r;
    r.plus = /\+/.test(s);
    r.guess = /\?|추정/.test(s);

    // 특별전형·지역인재 숫자
    const sp = s.match(/특\s*\(?\s*(\d+)/);
    if (sp) r.special = +sp[1];
    const lc = s.match(/지(?:역)?\s*(\d+)/);
    if (lc && !/포함/.test(s)) r.local = +lc[1];

    // 괄호 안 내용 제거 후 본 숫자
    const main = s.replace(/\([^)]*\)/g, ' ').replace(/특\s*\(?\s*\d+\)?/g, ' ');
    // 전북대 방식: 법n 비n → 합산
    const lb = main.match(/(법|비)\s*\d+/g);
    if (lb) {
      r.n = lb.reduce((a, t) => a + +t.replace(/\D/g, ''), 0);
      r.lawSplit = {
        law: (main.match(/법\s*(\d+)/) || [0, 0])[1] * 1,
        non: (main.match(/비\s*(\d+)/) || [0, 0])[1] * 1
      };
      return r;
    }
    const m = main.match(/\d+/);
    if (m) r.n = +m[0];
    else if (/^\s*\(?특/.test(s)) r.n = 0; // "(특1)"만 있는 경우 일반 0
    return r;
  }

  // ---------- 탭 해석 ----------
  const GROUPS = ['가군', '나군'];

  function parseYearSheet(rows, year) {
    const norm = v => String(v || '').replace(/\s+/g, ' ').trim();
    const hIdx = rows.findIndex(r => r.some(c => /^학교명/.test(norm(c))));
    if (hIdx < 0) throw new Error(year + ': "학교명" 머리글을 찾지 못했다');
    const head = rows[hIdx], sub = rows[hIdx + 1] || [];
    const schoolCol = head.findIndex(c => /^학교명/.test(norm(c)));
    const noteCol = head.findIndex(c => /^비고/.test(norm(c)));

    // 가군/나군 열마다 소속 머리글(총계, n주차, 이후)을 찾는다
    const cols = [];
    for (let j = 0; j < sub.length; j++) {
      const g = norm(sub[j]);
      if (!GROUPS.includes(g)) continue;
      let k = j;
      while (k >= 0 && !norm(head[k])) k--;
      const label = norm(head[k]);
      let key, week = null, range = '';
      if (/^총계/.test(label)) key = 'total';
      else {
        const wm = label.match(/^(\d+)\s*주차\s*(이후)?\s*(\(([^)]*)\))?/);
        if (!wm) continue;
        week = +wm[1];
        key = wm[2] ? 'after' : 'w' + week;
        range = wm[4] || '';
      }
      cols.push({ idx: j, group: g, key, week, label, range });
    }

    const weeks = [];
    cols.forEach(c => {
      if (c.key === 'total') return;
      if (!weeks.find(w => w.key === c.key))
        weeks.push({ key: c.key, week: c.week, label: c.label, range: c.range, after: c.key === 'after' });
    });

    const schools = [];
    for (let i = hIdx + 2; i < rows.length; i++) {
      const name = norm(rows[i][schoolCol]);
      if (!name) { if (schools.length) break; else continue; }
      if (!/대학교$/.test(name)) break;
      const rec = { year, school: name, short: name.replace(/대학교$/, '대').replace('한국외국어대', '외대').replace('이화여자대', '이화여대').replace('서울시립대', '시립대'), note: noteCol >= 0 ? norm(rows[i][noteCol]) : '', notePos: i + ',' + noteCol, total: {}, weeks: {} };
      cols.forEach(c => {
        const v = parseValue(rows[i][c.idx]);
        v.pos = i + ',' + c.idx;
        if (c.key === 'total') rec.total[c.group] = v;
        else (rec.weeks[c.key] = rec.weeks[c.key] || {})[c.group] = v;
      });
      // 군 판정: 총계 또는 주차 칸에 값이 있으면 해당 군 운영
      rec.groups = GROUPS.filter(g => rec.total[g].raw || Object.values(rec.weeks).some(w => w[g] && w[g].raw));
      schools.push(rec);
    }

    // 최종 업데이트 문구
    let updated = '';
    for (let i = 0; i < hIdx; i++) {
      const t = rows[i].map(norm).find(c => /최종\s*update/i.test(c));
      if (t) { updated = t; break; }
    }
    return { year, updated, weeks, schools };
  }

  const api = { parseCSV, parseValue, parseYearSheet };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Chuhap = api;
})(this);

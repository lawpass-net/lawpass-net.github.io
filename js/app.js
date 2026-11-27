(function () {
  'use strict';
  const C = window.SITE_CONFIG, P = window.Chuhap, S = window.SCHEDULE;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  // ---------------- 탭 이동 ----------------
  function showTab() {
    const t = (location.hash || '#chuhap').slice(1).split('/')[0];
    const id = ['chuhap', 'schedule', 'links'].includes(t) ? t : 'chuhap';
    document.querySelectorAll('.tab').forEach(el => el.classList.toggle('on', el.id === 'tab-' + id));
    document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.tab === id));
    document.body.dataset.tab = id;
    $('#chuhapFoot').hidden = id !== 'chuhap';
    if (id === 'chuhap') drawCharts();
  }
  window.addEventListener('hashchange', showTab);

  function segment(el, attr, onPick) {
    el.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      onPick(b.dataset[attr]);
    });
  }

  // ---------------- 추합현황 데이터 ----------------
  const DATA = {};            // year -> parsed
  const state = { year: C.years[0].year, group: 'all', view: 'table', q: '', school: '' };
  let source = '';

  function csvUrl(y) {
    if (C.publishedId) return `https://docs.google.com/spreadsheets/d/e/${C.publishedId}/pub?gid=${y.gid}&single=true&output=csv&t=${Date.now()}`;
    return null;
  }

  async function loadYear(y) {
    const live = csvUrl(y);
    if (live) {
      try {
        const r = await fetch(live, { cache: 'no-store' });
        if (!r.ok) throw new Error(r.status);
        const t = await r.text();
        if (!/학교명/.test(t)) throw new Error('형식 오류');
        return { text: t, live: true };
      } catch (e) { console.warn(y.year, '실시간 읽기 실패 → 스냅샷 사용', e); }
    }
    const r = await fetch(`data/${y.year}.csv`);
    return { text: await r.text(), live: false };
  }

  // 한 군만 모집하는 학교: 시트의 첫 칸 값을 실제 군으로 옮긴다
  function applyGroups(d) {
    const over = (C.groupsByYear || {})[d.year] || {};
    d.schools.forEach(s => {
      const g = over[s.school] || (C.groups || {})[s.school];
      s.kind = g || '';
      const has = k => (s.total[k] && s.total[k].raw) || Object.values(s.weeks).some(w => w[k] && w[k].raw);
      if (g === 'AB') {
        // 가·나군 분할 모집 학교인데 총계가 한 칸에만 있으면 가·나 통합 선발로 본다
        const tA = !!(s.total['가군'] && s.total['가군'].raw), tB = !!(s.total['나군'] && s.total['나군'].raw);
        if (tA !== tB) {
          const src = tA ? '가군' : '나군', oth = tA ? '나군' : '가군';
          s.total['통합'] = s.total[src];
          Object.values(s.weeks).forEach(w => { w['통합'] = (w[src] && w[src].raw) ? w[src] : w[oth]; });
          s.combined = true; s.groups = ['통합'];
        }
        return;
      }
      if (g !== 'A' && g !== 'B') return;
      const to = g === 'A' ? '가군' : '나군', from = g === 'A' ? '나군' : '가군';
      if (!has(to) && has(from)) {
        [s.total[to], s.total[from]] = [s.total[from], s.total[to]];
        Object.values(s.weeks).forEach(w => { [w[to], w[from]] = [w[from], w[to]]; });
      }
      s.groups = has(to) ? [to] : [];
    });
    return d;
  }

  let VERIFIED = {};
  // 정보공개청구로 확인한 값(시트의 빨간 글자) 표시
  function applyVerified(d) {
    const v = VERIFIED[d.year] || {};
    d.schools.forEach(s => (v[s.school] || []).forEach(k => {
      if (k === 'note') { s.noteVerified = true; return; }
      const [key, g] = k.split('|');
      const cellv = key === 'total' ? s.total[g] : (s.weeks[key] || {})[g];
      if (cellv) cellv.verified = true;
    }));
    return d;
  }

  async function loadAll() {
    try { VERIFIED = await (await fetch('data/verified.json', { cache: 'no-cache' })).json(); } catch (e) { VERIFIED = {}; }
    const ALL = C.years.concat(C.historyYears || []);
    const res = await Promise.all(ALL.map(async y => {
      try {
        const { text, live } = await loadYear(y);
        DATA[y.year] = applyGroups(applyVerified(P.parseYearSheet(P.parseCSV(text), y.year)));
        return live;
      } catch (e) { console.error(y.year, e); return null; }
    }));
    const liveCnt = res.filter(x => x === true).length;
    const cur = DATA[C.years[0].year];
    const st = $('#dataStatus');
    if (liveCnt === ALL.length) { source = 'live'; st.textContent = `시트 실시간 연결 · ${cur ? cur.year + '학년도 ' + cur.updated : ''}`; }
    else if (liveCnt > 0) { source = 'mixed'; st.textContent = `일부 연도만 실시간 연결됨(${liveCnt}/${ALL.length}) · 나머지는 저장본`; st.classList.add('warn'); }
    else { source = 'snapshot'; st.textContent = `저장본 표시 중 · ${cur ? cur.year + '학년도 ' + cur.updated : ''}`; }
    buildControls();
    render();
  }

  // ---------------- 컨트롤 ----------------
  function buildControls() {
    $('#yearSeg').innerHTML = C.years.filter(y => DATA[y.year]).map(y =>
      `<button data-y="${y.year}" class="${y.year === state.year ? 'on' : ''}">${y.year}<small>학년도</small></button>`).join('');
    const names = new Set();
    C.years.concat(C.historyYears || []).forEach(y => DATA[y.year] && DATA[y.year].schools.forEach(s => names.add(s.school)));
    const list = [...names].sort((a, b) => a.localeCompare(b, 'ko'));
    state.school = state.school || list[0];
    $('#schoolSel').innerHTML = list.map(n => `<option ${n === state.school ? 'selected' : ''}>${esc(n)}</option>`).join('');
  }
  segment($('#yearSeg'), 'y', v => { state.year = +v; render(); });
  segment($('#groupSeg'), 'g', v => { state.group = v; render(); });
  segment($('#viewSeg'), 'v', v => { state.view = v; render(); });
  $('#q').addEventListener('input', e => { state.q = e.target.value.trim(); render(); });
  $('#schoolSel').addEventListener('change', e => { state.school = e.target.value; render(); });

  function goSchool(name) {
    state.school = name; state.view = 'school';
    $('#schoolSel').value = name;
    $('#viewSeg').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === 'school'));
    render(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------------- 렌더 ----------------
  const pill = g => g === '통합' ? '<span class="pill tg" title="가·나군 통합 선발">가·나 통합</span>' : `<span class="pill ${g === '가군' ? 'ga' : 'na'}">${g === '가군' ? '가' : '나'}</span>`;
  const sGroups = s => s.combined ? ['통합'] : showGroups();
  const cell = v => v && v.raw ? (v.verified ? `<span class="vf" title="정보공개청구로 확인한 값">${esc(v.raw)}</span>` : esc(v.raw)) : '<span class="empty">·</span>';
  const noteHtml = s => s.noteVerified ? `<span class="vf">${esc(s.note)}</span>` : esc(s.note);

  function render() {
    document.querySelectorAll('#tab-chuhap .view').forEach(v => v.classList.toggle('on', v.id === 'view-' + state.view));
    renderTable();
    if (state.view === 'school') renderSchoolHist();
    drawCharts();
  }

  function renderTable() {
    const d = DATA[state.year]; if (!d) return;
    const groups = state.group === 'all' ? ['가군', '나군'] : [state.group];
    let h = `<thead><tr><th>학교</th><th>총계</th>${d.weeks.map(w => `<th>${w.after ? w.week + '주차 이후' : w.week + '주차'}<small>${esc(w.range)}</small></th>`).join('')}<th>비고</th></tr></thead><tbody>`;
    let rows = 0;
    d.schools.filter(s => !state.q || s.school.includes(state.q) || s.short.includes(state.q)).forEach(s => {
      let gs = s.combined ? ['통합'] : groups.filter(g => s.groups.includes(g));
      if (!gs.length) { if (state.group !== 'all') return; gs = []; }
      const span = Math.max(gs.length, 1);
      const first = `<td class="sch" rowspan="${span}"><a data-s="${esc(s.school)}">${esc(s.short)}</a></td>`;
      const note = `<td class="note" rowspan="${span}">${noteHtml(s)}</td>`;
      if (!gs.length) {
        h += `<tr class="split">${first}<td class="num empty" colspan="${d.weeks.length + 1}">제보 없음</td>${note}</tr>`; rows++; return;
      }
      gs.forEach((g, i) => {
        h += `<tr class="${i === 0 ? 'split' : ''}">${i === 0 ? first : ''}<td class="num tot">${pill(g)} ${cell(s.total[g])}</td>${d.weeks.map(w => `<td class="num">${cell(s.weeks[w.key] && s.weeks[w.key][g])}</td>`).join('')}${i === 0 ? note : ''}</tr>`;
        rows++;
      });
    });
    if (!rows) h += `<tr><td colspan="${d.weeks.length + 3}" class="num">검색 결과 없음</td></tr>`;
    $('#chTable').innerHTML = h + '</tbody>';
  }
  $('#chTable').addEventListener('click', e => { const a = e.target.closest('a[data-s]'); if (a) goSchool(a.dataset.s); });

  function renderSchoolHist() {
    let h = '<thead><tr><th>학년도</th><th>군</th><th>총계</th><th>주차별(제보)</th><th>비고</th></tr></thead><tbody>';
    C.years.concat(C.historyYears || []).sort((a, b) => b.year - a.year).forEach(y => {
      const d = DATA[y.year]; if (!d) return;
      const s = d.schools.find(x => x.school === state.school);
      if (!s) return;
      const gs = s.groups.length ? s.groups : [null];
      gs.forEach((g, i) => {
        const weeks = g ? d.weeks.map(w => { const v = s.weeks[w.key] && s.weeks[w.key][g]; return v && v.raw ? `${w.after ? '이후' : w.week + '주'} ${cell(v)}` : ''; }).filter(Boolean).join(' · ') : '';
        h += `<tr class="${i === 0 ? 'split' : ''}">${i === 0 ? `<td class="sch" rowspan="${gs.length}">${y.year}</td>` : ''}<td>${g ? pill(g) : '-'}</td><td class="num tot">${g ? cell(s.total[g]) : '<span class="empty">제보 없음</span>'}</td><td>${weeks || '<span class="empty">·</span>'}</td>${i === 0 ? `<td class="note" rowspan="${gs.length}">${noteHtml(s)}</td>` : ''}</tr>`;
      });
    });
    $('#schoolHist').innerHTML = h + '</tbody>';
  }

  // ---------------- 그래프 ----------------
  const charts = {};
  function chart(id, cfg) {
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(document.getElementById(id), cfg);
    return charts[id];
  }
  function baseOpts(extra) {
    const ink = css('--ink-dim'), grid = css('--border');
    Chart.defaults.font.family = "'Pretendard Variable',Pretendard,sans-serif";
    Chart.defaults.color = ink;
    return Object.assign({
      responsive: true, maintainAspectRatio: false, animation: { duration: 250 },
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true } } },
      scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: grid }, ticks: { precision: 0 } } }
    }, extra || {});
  }
  const showGroups = () => state.group === 'all' ? ['가군', '나군'] : [state.group];
  const gColor = g => g === '가군' ? css('--ga') : g === '통합' ? css('--ink-dim') : css('--na');

  function drawCharts() {
    if (typeof Chart === 'undefined' || !DATA[state.year]) return;
    if (!$('#tab-chuhap').classList.contains('on')) return;
    if (state.view === 'school') drawSchool();
    if (state.view === 'compare') drawCompare();
  }

  function drawSchool() {
    const years = C.years.concat(C.historyYears || []).map(y => y.year).filter(y => DATA[y]).sort();
    const find = y => DATA[y].schools.find(s => s.school === state.school);
    const RED = '#d1302a', BLK = css('--ink');
    // 통합 선발한 해는 첫 번째 막대 자리에 '통합'으로 그린다
    const tv = (y, g) => { const s = find(y); if (!s) return null; if (s.combined) return g === showGroups()[0] ? s.total['통합'] : null; return s.total[g]; };
    const comb = y => { const s = find(y); return !!(s && s.combined); };
    const gs = showGroups().filter(g => years.some(y => { const v = tv(y, g); return v && v.n != null; }));
    const two = gs.length > 1 || years.some(comb);
    chart('cYear', {
      type: 'bar',
      data: {
        labels: years.map(y => y + ''),
        datasets: gs.map(g => ({
          label: g, borderRadius: 4,
          data: years.map(y => { const v = tv(y, g); return v && v.n != null ? v.n : null; }),
          raws: years.map(y => { const v = tv(y, g); return v ? v.raw : ''; }),
          vf: years.map(y => { const v = tv(y, g); return !!(v && v.verified); }),
          backgroundColor: years.map(y => { const v = tv(y, g); const c = v && v.verified ? RED : BLK; return g === '나군' && two && !comb(y) ? c + '99' : c; })
        }))
      },
      plugins: [{
        id: 'labels',
        afterDatasetsDraw(ch) {
          const ctx = ch.ctx; ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
          ch.data.datasets.forEach((ds, di) => ch.getDatasetMeta(di).data.forEach((bar, i) => {
            if (ds.data[i] == null) return;
            ctx.fillStyle = ds.vf[i] ? RED : BLK; ctx.font = "700 12px 'Pretendard Variable',sans-serif";
            ctx.fillText((two ? (comb(years[i]) ? '통합 ' : ds.label === '가군' ? '가 ' : '나 ') : '') + ds.data[i] + (/\+/.test(ds.raws[i]) ? '+' : ''), bar.x, bar.y - 3);
          }));
          ctx.restore();
        }
      }],
      options: baseOpts({
        layout: { padding: { top: 18 } },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${comb(years[c.dataIndex]) ? '가·나 통합' : c.dataset.label}: ${c.dataset.raws[c.dataIndex] || c.raw} · ${c.dataset.vf[c.dataIndex] ? '정보공개청구 확인' : '수험생 제보(미확인)'}` } } }
      })
    });

    const d = DATA[state.year], s = find(state.year);
    $('#cWeekTitle').textContent = `${state.year}학년도 주차별 누적 추합`;
    const labels = d.weeks.map(w => w.after ? '이후' : w.week + '주');
    chart('cWeek', {
      type: 'line',
      data: {
        labels,
        datasets: (s ? sGroups(s) : []).map(g => {
          let acc = 0, any = false;
          const vals = d.weeks.map(w => { const v = s.weeks[w.key] && s.weeks[w.key][g]; if (v && v.n != null) { acc += v.n; any = true; } return acc; });
          return { label: g, data: any ? vals : [], borderColor: gColor(g), backgroundColor: gColor(g), tension: .25, pointRadius: 3,
            raws: d.weeks.map(w => { const v = s.weeks[w.key] && s.weeks[w.key][g]; return v ? v.raw : ''; }) };
        }).filter(ds => ds.data.length)
      },
      options: baseOpts({ plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: c => `${c.dataset.label}: 누적 ${c.raw}${c.dataset.raws[c.dataIndex] ? ' (해당 주 ' + c.dataset.raws[c.dataIndex] + ')' : ''}` } } } })
    });
  }

  function drawCompare() {
    const d = DATA[state.year];
    $('#cCmpTitle').textContent = `${state.year}학년도 학교별 추합 총계`;
    // 가·나 통합 선발한 학교는 별도 막대(회색)로 그린다
    const gs = showGroups().concat(d.schools.some(s => s.combined) ? ['통합'] : []);
    const cv = (s, g) => s.combined ? (g === '통합' ? s.total['통합'] : null) : (g === '통합' ? null : s.total[g]);
    const rows = d.schools.map(s => ({ s, v: gs.map(g => { const x = cv(s, g); return x && x.n; }), sum: gs.reduce((a, g) => { const x = cv(s, g); return a + ((x && x.n) || 0); }, 0) }))
      .filter(r => r.v.some(x => x != null)).sort((a, b) => b.sum - a.sum);
    $('#cCmp').parentElement.style.height = Math.max(260, rows.length * 24 + 60) + 'px';
    const c = chart('cCmp', {
      type: 'bar',
      data: {
        labels: rows.map(r => r.s.short),
        datasets: gs.map((g, i) => ({ label: g === '통합' ? '가·나 통합' : g, backgroundColor: g === '통합' ? '#8f8a80' : gColor(g), borderRadius: 3, data: rows.map(r => r.v[i]), raws: rows.map(r => { const x = cv(r.s, g); return x ? x.raw : ''; }) }))
      },
      options: baseOpts({
        indexAxis: 'y',
        scales: { x: { stacked: true, beginAtZero: true, grid: { color: css('--border') }, ticks: { precision: 0 } }, y: { stacked: true, grid: { display: false } } },
        plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.dataset.raws[c.dataIndex] || c.raw}` } } },
        onClick: (e, els) => { if (els.length) goSchool(rows[els[0].index].s.school); }
      })
    });
    return c;
  }

  // ---------------- 전형일정 ----------------
  const GL = { A: '가군', B: '나군', AB: '가/나군' };
  const TYPES = ['doc', 'intA', 'intB', 'final', 'add1', 'add2'];
  const TL = { doc: '1차', intA: '가군', intB: '나군', final: '최종', add1: '추가1', add2: '추가2+' };
  const TF = { doc: '1차(서류) 발표', intA: '가군 면접', intB: '나군 면접', final: '최종 발표', add1: '1차 추가합격', add2: '2차+ 추가/마감' };
  const SHORT = { '서울시립대': '시립', '한국외대': '외대', '이화여대': '이화', '성균관대': '성균관' };
  const short = n => SHORT[n] || n.replace(/대$/, '');
  let schView = 'cal', schQ = '';

  function renderSchedule() {
    $('#schTitle').textContent = S.title;
    $('#schSub').textContent = '1차(서류) 합격자 발표 · 가/나군 면접 · 최종 합격자 발표 · 추가합격자 발표. ' + S.basis + '.';
    const list = S.schools.filter(s => !schQ || s.name.includes(schQ));
    $('#schBody').innerHTML = list.map(s => `<tr>
      <td class="sch">${esc(s.name)}${s.group !== 'B' ? '<span class="pill ga">가군</span>' : ''}${s.group !== 'A' ? '<span class="pill na">나군</span>' : ''}</td>
      <td>${esc(s.doc)}</td>
      <td>${s.interview.map(i => `${i.g === 'A' ? '가' : '나'} ${esc(i.d)}`).join('<br>')}</td>
      <td>${esc(s.final)}</td><td>${esc(s.add1)}</td><td class="note">${esc(s.add2)}</td></tr>`).join('')
      || '<tr><td colspan="6" class="num">검색 결과 없음</td></tr>';

    const by = {};
    list.forEach(s => {
      const d = s.dates, push = (k, t) => { if (d[k]) (by[d[k]] = by[d[k]] || []).push({ n: s.name, t }); };
      push('doc', 'doc'); push('docB', 'doc'); push('intA', 'intA'); push('intB', 'intB'); push('intB2', 'intB');
      push('final', 'final'); push('add1', 'add1'); push('add1b', 'add1'); push('add2', 'add2');
    });
    const pad = n => String(n).padStart(2, '0');
    const now = new Date(), today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    $('#calMonths').innerHTML = S.months.map(mo => {
      const start = new Date(mo.y, mo.m, 1).getDay(), days = new Date(mo.y, mo.m + 1, 0).getDate();
      let cells = '<div class="dow">일</div><div class="dow">월</div><div class="dow">화</div><div class="dow">수</div><div class="dow">목</div><div class="dow">금</div><div class="dow">토</div>';
      for (let i = 0; i < start; i++) cells += '<div class="cell x"></div>';
      for (let day = 1; day <= days; day++) {
        const ds = `${mo.y}-${pad(mo.m + 1)}-${pad(day)}`, dow = (start + day - 1) % 7, evs = by[ds] || [];
        const groups = {}; evs.forEach(e => (groups[e.t] = groups[e.t] || []).push(e.n));
        const body = TYPES.filter(t => groups[t]).map(t => `<div class="ev" style="--c:var(--${t})"><b>${TL[t]}</b><div class="tags">${groups[t].map(n => `<i title="${esc(n)} · ${TF[t]}">${esc(short(n))}</i>`).join('')}</div></div>`).join('');
        cells += `<div class="cell ${dow > 4 ? 'wide' : ''} ${ds === today ? 'today' : ''}"><span class="d">${day}</span>${body}</div>`;
      }
      return `<div><h4>${mo.y}년 ${mo.m + 1}월</h4><div class="cal">${cells}</div></div>`;
    }).join('');
  }
  segment($('#schSeg'), 'v', v => {
    schView = v;
    $('#sch-table').classList.toggle('on', v === 'table');
    $('#sch-cal').classList.toggle('on', v === 'cal');
  });
  $('#schQ').addEventListener('input', e => { schQ = e.target.value.trim(); renderSchedule(); });

  // ---------------- 바로가기 ----------------
  $('#linkList').innerHTML = C.links.map(l => `<a class="${l.url ? '' : 'off'}" href="${esc(l.url || '#')}" target="_blank" rel="noopener">
    <span class="k">${esc(l.tag)}</span><div class="t">${esc(l.title)}</div><div class="d">${esc(l.desc)}${l.url ? '' : ' (준비 중)'}</div></a>`).join('');

  $('#banners').innerHTML = (C.banners || []).map(b => `<a class="banner" href="${esc(b.url)}" target="_blank" rel="noopener"><img src="${esc(b.img)}" srcset="${esc(b.img)} 1x, ${esc(b.img2x || b.img)} 2x" alt="${esc(b.alt)}" width="870" height="180"></a>`).join('');

  // ---------------- 카운트다운 ----------------
  (function countdown() {
    const cfg = C.countdown, box = $('#countdown'); if (!cfg || !box) return;
    const events = (cfg.events || []).map(e => ({ ...e, t: new Date(e.at).getTime(), until: new Date(e.at.slice(0, 10) + 'T23:59:59+09:00').getTime() }));
    if (cfg.finals && window.SCHEDULE) {
      // 학교별 최종 발표를 날짜로 묶고, 그날 가장 이른 발표 시각까지 센다
      const byDay = {};
      SCHEDULE.schools.forEach(s => {
        const day = s.dates && s.dates.final; if (!day) return;
        const tm = String(s.final).match(/(\d{1,2}):(\d{2})/);
        const hm = tm ? tm[1].padStart(2, '0') + ':' + tm[2] : '';
        const g = byDay[day] || (byDay[day] = { day, label: String(s.final).match(/^[\d.]+\([^)]+\)/)?.[0] || day, hm: '', names: [] });
        if (hm && (!g.hm || hm < g.hm)) g.hm = hm;
        g.names.push(s.name);
      });
      Object.values(byDay).forEach(g => {
        g.hm = g.hm || '09:00';
        const who = g.names.length <= 3 ? g.names.join('·') : `${g.names.length}개교`;
        events.push({ label: `${who} 합격자 발표까지`, note: `${g.label} ${g.hm} 기준`, title: g.names.join(', '), t: new Date(`${g.day}T${g.hm}:00+09:00`).getTime() });
      });
    }
    events.sort((a, b) => a.t - b.t);
    const nowOverride = new URLSearchParams(location.search).get('cdnow');   // 점검용: ?cdnow=2026-12-10T12:00:00%2B09:00
    const offset = nowOverride ? new Date(nowOverride).getTime() - Date.now() : 0;
    const p2 = n => String(n).padStart(2, '0');
    const unit = (v, l) => `<div class="cd-u"><b>${p2(v)}</b><span>${l}</span></div>`;
    let t;
    function tick() {
      const now = Date.now() + offset;
      const after = events.find(e => e.afterText && e.t <= now && now <= e.until);
      if (after) { box.title = ''; box.innerHTML = `<div class="cd-after">${esc(after.afterText)}</div>`; box.hidden = false; return; }
      const ev = events.find(e => e.t > now);
      if (!ev) { box.hidden = true; clearInterval(t); return; }
      const s = Math.floor((ev.t - now) / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
      box.title = ev.title || '';
      box.innerHTML = `<div class="cd-txt"><b>${esc(ev.label)}</b><small>${esc(ev.note || '')}</small></div><div class="cd-units">${unit(d, '일')}${unit(h, '시간')}${unit(m, '분')}</div>`;
      box.hidden = false;
    }
    t = setInterval(tick, 1000); tick();
  })();

  if (C.report) { $('#btnSheet').href = C.report.sheet; $('#btnCafe').href = C.report.cafe; }

  // ---------------- 카페 공지 ----------------
  async function loadNotices() {
    let d;
    try { d = await (await fetch('data/cafe-notice.json', { cache: 'no-cache' })).json(); } catch (e) { return; }
    const b = (d.boards || [])[0]; if (!b || !b.items || !b.items.length) return;
    const pinned = b.items.filter(x => x.pinned);
    const yr = String(new Date().getFullYear());
    const md = s => !s ? '' : s.slice(0, 4) === yr ? s.slice(5).replace('-', '.') : s.slice(2).replace(/-/g, '.');
    const row = x => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${x.pinned ? '<span class="pin">공지</span>' : ''}<span class="t">${esc(x.title)}</span><span class="d">${esc(md(x.date))}</span></a></li>`;
    if (!pinned.length) return;
    $('#noticeTopList').innerHTML = pinned.map(row).join('');
    $('#noticeFullList').innerHTML = pinned.map(row).join('');
    $('#noticeMore').href = $('#noticeMore2').href = b.url;
    $('#noticeTop').hidden = $('#noticeFull').hidden = false;
  }

  // ---------------- 시작 ----------------
  loadNotices();
  renderSchedule();
  showTab();
  loadAll();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', drawCharts);
})();

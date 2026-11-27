// 구글 시트 → 저장본(data/YYYY.csv)과 빨간 글자 목록(data/verified.json)을 다시 만든다.
//
// 입력: Google Sheets API spreadsheets.get 결과 JSON (includeGridData=true)
//   ranges: 각 연도 탭 'YYYY학년도'!A1:AP80
//   fields: sheets.properties.title,
//           sheets.data.rowData.values.formattedValue,
//           sheets.data.rowData.values.effectiveFormat.textFormat.foregroundColorStyle,
//           sheets.data.rowData.values.textFormatRuns
//   (Claude 세션에서는 Google Sheets 커넥터 get_spreadsheet로 받으면 결과가 파일로 저장된다)
//
// 사용: node scripts/sync-from-sheet.mjs <spreadsheets.get 결과 JSON 경로>
//   - 결과가 {"content": {...}} 형태로 감싸져 있어도 된다.
//   - 빨간 글자 = 정보공개청구로 확인한 값. 셀 전체 또는 일부가 빨간색이면 그 칸을 확인값으로 본다.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const P = require('../js/parser.js');

const src = process.argv[2];
if (!src) { console.error('사용: node scripts/sync-from-sheet.mjs <JSON 경로>'); process.exit(1); }
let j = JSON.parse(readFileSync(src, 'utf8'));
if (j.content) j = j.content;

const isRed = c => { const r = (c && c.rgbColor) || {}; return (r.red || 0) > 0.6 && (r.green || 0) < 0.4 && (r.blue || 0) < 0.4; };
const csvCell = v => /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;

const verified = {};
for (const sh of j.sheets) {
  const year = parseInt(sh.properties.title, 10);
  if (!year) continue;
  const rows = (sh.data[0].rowData || []).map(r => (r.values || []).map(c => c.formattedValue || ''));
  const width = Math.max(...rows.map(r => r.length));
  writeFileSync(`data/${year}.csv`, rows.map(r => r.concat(Array(width - r.length).fill('')).map(csvCell).join(',')).join('\n') + '\n');

  // 빨간 셀 위치
  const red = new Set();
  (sh.data[0].rowData || []).forEach((r, i) => (r.values || []).forEach((c, k) => {
    if (!c.formattedValue || k < 2) return;
    const base = c.effectiveFormat && c.effectiveFormat.textFormat && c.effectiveFormat.textFormat.foregroundColorStyle;
    const runs = c.textFormatRuns || [];
    const any = runs.length ? runs.some(x => { const f = x.format && x.format.foregroundColorStyle; return f ? isRed(f) : isRed(base); }) : isRed(base);
    if (any) red.add(i + ',' + k);
  }));

  // 위치를 학교·칸 이름으로 바꾼다(시트 행이 밀려도 유지되도록)
  const d = P.parseYearSheet(P.parseCSV(readFileSync(`data/${year}.csv`, 'utf8')), year);
  const res = {};
  d.schools.forEach(s => {
    const keys = [];
    for (const g of ['가군', '나군']) {
      if (red.has(s.total[g].pos)) keys.push('total|' + g);
      for (const [k, w] of Object.entries(s.weeks)) if (w[g] && w[g].raw && red.has(w[g].pos)) keys.push(k + '|' + g);
    }
    if (s.note && red.has(s.notePos)) keys.push('note');
    if (keys.length) res[s.school] = keys;
  });
  if (Object.keys(res).length) verified[year] = res;
  console.log(`${year}: 저장본 ${rows.length}행, 확인값 ${Object.values(res).reduce((a, k) => a + k.length, 0)}칸`);
}
writeFileSync('data/verified.json', JSON.stringify(verified, null, 1) + '\n');
console.log('data/verified.json 저장');

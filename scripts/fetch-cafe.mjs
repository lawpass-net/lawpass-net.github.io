// 다음 카페 게시판 목록을 읽어 data/cafe-notice.json으로 저장한다 (GitHub Actions에서 1시간마다 실행).
// 로그인 없이 공개된 게시판 목록 페이지에 들어 있는 notices / articles 데이터를 읽는다.
import { writeFileSync, readFileSync, existsSync } from 'node:fs';

const CAFE = 'lsinfo', GRPID = '1YIpC';
const BOARDS = [{ fldid: 'nafW', name: '공지사항' }];
const OUT = 'data/cafe-notice.json';

export function parseList(html) {
  const unesc = s => JSON.parse('"' + s.replace(/\\'/g, "'").replace(/"/g, '\\"') + '"');
  const pick = (blk, key) => { const m = blk.match(new RegExp(key + ":\\s*'((?:[^'\\\\]|\\\\.)*)'")); return m ? m[1] : ''; };
  const num = (blk, key) => { const m = blk.match(new RegExp(key + ':\\s*(\\d+)')); return m ? +m[1] : 0; };
  const items = [];
  for (const m of html.matchAll(/(notices|articles)\.push\(\{([\s\S]*?)\}\);/g)) {
    const blk = m[2];
    items.push({
      pinned: m[1] === 'notices',
      id: +pick(blk, 'dataid'),
      title: unesc(pick(blk, 'title')),
      created: pick(blk, 'created'),
      views: num(blk, 'viewCnt'),
      comments: num(blk, 'commentCnt')
    });
  }
  return items;
}

function normDate(s) {
  if (/^\d{2}\.\d{2}\.\d{2}$/.test(s)) return '20' + s.replace(/\./g, '-');
  // 오늘 올라온 글은 시:분만 나온다 → 한국 날짜로 바꾼다
  const kst = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  return kst;
}

async function main() {
  const out = { updated: new Date().toISOString(), boards: [] };
  for (const b of BOARDS) {
    const url = `https://cafe.daum.net/_c21_/bbs_list?grpid=${GRPID}&fldid=${b.fldid}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36', 'Accept-Language': 'ko-KR,ko;q=0.9' } });
    if (!res.ok) throw new Error(`${b.name} 목록 읽기 실패: HTTP ${res.status}`);
    const items = parseList(await res.text());
    if (!items.length) throw new Error(`${b.name} 목록이 비어 있다(페이지 구조 변경 또는 차단 가능성)`);
    const seen = new Set();
    const list = items.filter(x => x.id && !seen.has(x.id) && seen.add(x.id)).map(x => ({
      ...x, date: normDate(x.created), url: `https://cafe.daum.net/${CAFE}/${b.fldid}/${x.id}`
    }));
    out.boards.push({ fldid: b.fldid, name: b.name, url: `https://cafe.daum.net/${CAFE}/${b.fldid}`, items: list });
  }
  // 내용이 같으면 파일을 바꾸지 않는다(불필요한 커밋 방지)
  const strip = o => JSON.stringify(o.boards);
  if (existsSync(OUT)) {
    try { if (strip(JSON.parse(readFileSync(OUT, 'utf8'))) === strip(out)) { console.log('변경 없음'); return; } } catch (e) {}
  }
  writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  console.log('저장:', out.boards.map(b => `${b.name} ${b.items.length}건`).join(', '));
}

if (process.argv[1] && process.argv[1].endsWith('fetch-cafe.mjs')) main().catch(e => { console.error(e.message); process.exit(1); });

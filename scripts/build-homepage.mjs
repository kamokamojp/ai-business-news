import fs from 'node:fs';
import path from 'node:path';

const archive = JSON.parse(fs.readFileSync('scripts/archive-index.json', 'utf8'));
const latest = JSON.parse(fs.readFileSync('scripts/edition-data.json', 'utf8'));
if (archive.schemaVersion !== 1 || archive.timezone !== 'Asia/Tokyo' || !Array.isArray(archive.editions) || !archive.editions.length) {
  throw new Error('Invalid archive index');
}
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
for (let i = 0; i < archive.editions.length; i++) {
  const item = archive.editions[i];
  if (!datePattern.test(item.editionDate) || !datePattern.test(item.sourceDate) || !item.path || !['ready', 'partial'].includes(item.status)) {
    throw new Error('Invalid edition record: ' + JSON.stringify(item));
  }
  if (i && item.editionDate >= archive.editions[i - 1].editionDate) {
    throw new Error('Archive index must be newest first');
  }
  const file = path.join('dist', item.path);
  if (!fs.existsSync(file)) throw new Error('Missing dated edition HTML: ' + file);
}
if (archive.editions[0].editionDate !== latest.editionDate || archive.editions[0].sourceDate !== latest.sourceDate) {
  throw new Error('Archive index latest entry does not match current edition data');
}
fs.mkdirSync('dist', { recursive: true });
fs.copyFileSync('scripts/archive-index.json', 'dist/edition-index.json');

const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const labelDate = d => {
  const parts = d.split('-').map(Number);
  return parts[0] + '年' + parts[1] + '月' + parts[2] + '日';
};
const links = archive.editions.map((item, i) => {
  const isLatest = i === 0;
  const issue = labelDate(item.editionDate);
  const source = labelDate(item.sourceDate);
  const badge = isLatest ? '<span class="badge">最新号</span>' : '';
  const status = isLatest && latest.articles && latest.articles.length
    ? '確認できたニュース ' + latest.articles.length + '件' + (latest.status === 'partial' ? '（部分版）' : '')
    : '過去の配信号';
  return '<li class="edition' + (isLatest ? ' latest' : '') + '">' +
    '<div class="edition-head"><h2>' + esc(issue) + '配信</h2>' + badge + '</div>' +
    '<p class="meta">対象ニュース：' + esc(source) + '（日本時間）</p>' +
    '<p class="status">' + esc(status) + '</p>' +
    '<a class="open" href="' + esc(item.path) + '">この号を読む <span aria-hidden="true">→</span></a>' +
    '</li>';
}).join('\n');

const html = '<!doctype html>\n' +
'<html lang="ja">\n<head>\n' +
'<meta charset="utf-8">\n' +
'<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
'<meta name="color-scheme" content="light">\n' +
'<meta name="description" content="AIビジネスニュースの最新号と過去の配信号を、新しい順に一覧できます。">\n' +
'<title>AIビジネスニュース｜最新号と過去のニュース</title>\n' +
'<style>\n' +
':root{font-family:system-ui,-apple-system,"Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif;color:#17312f;background:#f5f8f6;font-synthesis:none;text-rendering:optimizeLegibility}\n' +
'*{box-sizing:border-box}body{margin:0}header{background:#e5f1ec;border-bottom:1px solid #cadbd3}.wrap{width:min(980px,100% - 32px);margin:auto}.hero{padding:30px 0 26px}.hero img{display:block;width:100%;height:auto;border-radius:18px;box-shadow:0 8px 26px #13332e18}\n' +
'h1{font-size:clamp(1.7rem,4vw,2.35rem);margin:24px 0 8px;letter-spacing:.02em}.intro{font-size:1rem;line-height:1.8;margin:0;max-width:66ch;color:#36514b}main{padding:28px 0 52px}h2.section-title{font-size:1.25rem;margin:0 0 16px}\n' +
'.editions{list-style:none;padding:0;margin:0;display:grid;gap:14px}.edition{background:#fff;border:1px solid #d8e3de;border-radius:16px;padding:20px 22px;box-shadow:0 4px 16px #123a3010}.edition.latest{border:2px solid #317b69}.edition-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.edition h2{font-size:1.15rem;margin:0}.badge{font-size:.82rem;font-weight:700;color:#fff;background:#28725f;border-radius:99px;padding:4px 10px}\n' +
'.meta,.status{margin:8px 0 0;color:#526962;font-size:.94rem}.open{display:inline-block;margin-top:14px;font-weight:700;color:#125f50;text-decoration-thickness:1px;text-underline-offset:3px}.open:focus-visible{outline:3px solid #6fc9b3;outline-offset:4px;border-radius:3px}footer{border-top:1px solid #d9e4df;padding:20px 0 34px;color:#60716c;font-size:.9rem}\n' +
'</style>\n</head>\n<body>\n' +
'<header><div class="wrap hero">\n' +
'<img src="hosts-hero.png" alt="AIビジネスニュースの架空の司会者、水野あかりと高瀬直人。画像内に番組タイトルと二人の名前入り" width="1672" height="941">\n' +
'<h1>AIビジネスニュース</h1>\n' +
'<p class="intro">実務に関わるAIのニュースを、確認できた一次情報とともにお届けします。最新号から過去の配信号まで、新しい順に読めます。</p>\n' +
'</div></header>\n<main class="wrap">\n' +
'<h2 class="section-title">ニュース一覧</h2>\n<ol class="editions">\n' + links + '\n</ol>\n</main>\n' +
'<footer><div class="wrap">配信日とニュースの対象日を分けて掲載しています。出典は各号をご確認ください。</div></footer>\n' +
'</body>\n</html>\n';
fs.writeFileSync('dist/index.html', html);
console.log('Built homepage with ' + archive.editions.length + ' verified editions.');

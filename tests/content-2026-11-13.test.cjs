// Content verification for 2026-11-14 edition (sourceDate 2026-11-13). No git dependency:
// previous repo index is read from the prior run's directory.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const sourceDate = '2026-11-13', editionDate = '2026-11-14', previousSourceDate = '2026-11-12';
const html = fs.readFileSync(`dist/editions/${sourceDate}.html`, 'utf8');
const archiveHtml = fs.readFileSync(`html/ai-business-news-${sourceDate}.html`, 'utf8');
const latest = JSON.parse(fs.readFileSync('scripts/edition-data.json', 'utf8'));
const feed = JSON.parse(fs.readFileSync('dist/news-data.json', 'utf8'));
const dataIssue = JSON.parse(fs.readFileSync(`data/editions/${sourceDate}.json`, 'utf8'));
const publicFeed = JSON.parse(fs.readFileSync('data/feed.json', 'utf8'));
const repoIndex = JSON.parse(fs.readFileSync('data/index.json', 'utf8'));
const previousRepoIndex = JSON.parse(fs.readFileSync('tests/head-index-2026-11-14.json', 'utf8'));
const embedded = JSON.parse(html.match(/<script type="application\/json" id="news-data">([\s\S]*?)<\/script>/)[1]);
const index = JSON.parse(fs.readFileSync('scripts/archive-index.json', 'utf8'));
const publicIndex = JSON.parse(fs.readFileSync('dist/edition-index.json', 'utf8'));
const homepage = fs.readFileSync('dist/index.html', 'utf8');
assert.deepEqual(embedded, latest);
assert.deepEqual(feed, latest);
assert.deepEqual(dataIssue, latest);
assert.deepEqual(publicFeed, dataIssue);
assert.equal(repoIndex.schemaVersion, 1);
assert.equal(repoIndex.timezone, 'Asia/Tokyo');
assert.equal(repoIndex.editions[0].editionDate, editionDate);
assert.equal(repoIndex.editions[0].sourceDate, sourceDate);
assert.equal(repoIndex.editions[0].jsonPath, `data/editions/${sourceDate}.json`);
assert.equal(repoIndex.editions[0].markdownPath, `digests/${sourceDate}.md`);
assert.equal(repoIndex.editions[0].htmlPath, `html/ai-business-news-${sourceDate}.html`);
assert.ok(repoIndex.editions.every((e, i, a) => !i || e.editionDate < a[i - 1].editionDate));
assert.deepEqual(repoIndex.editions.slice(1), previousRepoIndex.editions);
assert.deepEqual(publicIndex, index);
assert.equal(archiveHtml, html);
assert.equal(latest.sourceDate, sourceDate);
assert.equal(latest.editionDate, editionDate);
assert.equal(latest.status, 'partial');
assert.equal(latest.timezone, 'Asia/Tokyo');
assert.equal(latest.articles.length, 9);
assert.equal((html.match(/class="story item"/g) || []).length, 9);
assert.deepEqual(latest.articles.map(a => a.id), [
  'narekomu-kyushu-20261113',
  'yappli-ai-agent-20261113',
  'niusia-repocall-20261113',
  'scsk-trading-ai-agent-20261113',
  'aicall-recruiting-20261113',
  'apcom-ai-governance-20261113',
  'google-gemini-4-hydrogen-20261113',
  'anthropic-claude-meetings-20261113',
  'anthropic-claude-for-manufacturing-20261113'
]);
assert.equal(latest.articles.filter(a => a.region === 'japan').length, 6);
assert.equal(latest.articles.filter(a => a.region === 'world').length, 3);
assert.ok(latest.articles.every(a => a.publicationDateJst === sourceDate && a.originalUrl.startsWith('https://') && a.publicationDateEvidenceUrl.startsWith('https://') && a.publishedAtOriginal && a.publicationDateNote && a.eventDate && a.eventDateNote && a.metricsNote));
assert.ok(latest.articles.every(a => a.publicationTimezoneEvidenceUrl?.startsWith('https://')));
assert.ok(html.includes('radio_show-2026-11-13.mp3'));
assert.ok(homepage.includes('href="editions/2026-11-13.html"'));
assert.ok(homepage.includes('href="editions/2026-11-12.html"'));
assert.ok(homepage.includes('2026年11月14日配信'));
assert.ok(!homepage.includes('href="/editions/') && !homepage.includes('src="/hosts-hero.png"'));
assert.ok(fs.existsSync(`dist/editions/radio_show-${sourceDate}.mp3`));
assert.equal(latest.radioAudioUrl, `https://kamokamojp.github.io/ai-business-news/editions/radio_show-${sourceDate}.mp3`);
const script = JSON.parse(fs.readFileSync('scripts/radio-script.json', 'utf8'));
assert.deepEqual(script, JSON.parse(fs.readFileSync('scripts/radio-script-2026-11-13.json', 'utf8')));
assert.equal(script.utterances[0].speaker, 'akari');
assert.ok(script.utterances[0].text.includes('水野あかり'));
assert.equal(script.utterances[1].speaker, 'naoto');
assert.ok(script.utterances[1].text.includes('高瀬直人'));
assert.equal(script.utterances[2].speaker, 'akari');
assert.equal(script.utterances[2].text, 'この番組の音声はAIで生成しています。発音や話し方が不自然な場合がありますが、ご了承ください。');
assert.ok(script.utterances.every(u => ['akari', 'naoto'].includes(u.speaker) && Array.from(u.text).length <= 90));
for (const term of ['九州農政局', 'ヤプリ', 'レポコール', 'SCSK', 'AIコール', 'ガバナンス', 'Hydrogen', 'Meetings', '製造業']) assert.ok(script.utterances.some(u => u.text.includes(term)), `Missing ${term} in radio script`);
// The displayed transcript in the HTML must match the dated radio script exactly
// (regression guard: the 2026-11-10 builder once embedded the previous day's script).
const transcriptHtml = html.match(/<ol class="radio-script">([\s\S]*?)<\/ol>/)[1];
const transcriptItems = [...transcriptHtml.matchAll(/<li><strong>(?:水野あかり|高瀬直人)：<\/strong>(.*?)<\/li>/g)].map(m => m[1]);
assert.deepEqual(transcriptItems, script.utterances.map(u => u.text));
assert.ok(fs.statSync(`dist/editions/radio_show-${sourceDate}.mp3`).size > 500000);
console.log('PASS: content test for 2026-11-13 edition (9 stories, archive order, homepage links, relative refs, radio script, transcript match).');

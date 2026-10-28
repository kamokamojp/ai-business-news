#!/usr/bin/env node
import fs from 'node:fs';

const sourceDate = '2026-10-28';
const editionDate = '2026-10-29';
const templatePath = 'dist/editions/2026-10-27.html';
const outputPath = `dist/editions/${sourceDate}.html`;
const archiveHtmlPath = `html/ai-business-news-${sourceDate}.html`;
const edition = JSON.parse(fs.readFileSync('scripts/edition-data.json', 'utf8'));
const radio = JSON.parse(fs.readFileSync('scripts/radio-script-2026-10-28.json', 'utf8'));
if (edition.sourceDate !== sourceDate || edition.editionDate !== editionDate || edition.articles.length !== 6) throw new Error('Edition data does not match the dated builder.');
if (!radio.utterances?.length || !radio.utterances.every(u => ['akari', 'naoto'].includes(u.speaker) && Array.from(u.text).length <= 90)) throw new Error('Radio script has an invalid speaker or overlong utterance.');
if (!edition.articles.length || edition.articles.some(a => !['japan', 'world'].includes(a.region))) throw new Error('This dated issue has an invalid region.');
const audioPath = `dist/editions/radio_show-${sourceDate}.mp3`;
if (!fs.existsSync(audioPath)) throw new Error(`Dated audio is missing: ${audioPath}`);
const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const speakerNames = { akari: '水野あかり', naoto: '高瀬直人' };
const transcript = radio.utterances.map(u => `<li><strong>${speakerNames[u.speaker]}：</strong>${esc(u.text)}</li>`).join('');
const label = { japan: '日本', world: '海外' };
const category = { product: '製品・機能', business_case: '実務事例', trend: '動向' };
function card(a, i) {
  const id = `story-${String(i + 1).padStart(2, '0')}`;
  const extra = a.corroborationUrl ? ` <a href="${esc(a.corroborationUrl)}" target="_blank" rel="noopener noreferrer">${esc(a.corroborationLabel || '関連する公式情報')}</a>` : '';
  const timezoneEvidence = a.publicationTimezoneEvidenceUrl ? ` <a href="${esc(a.publicationTimezoneEvidenceUrl)}" target="_blank" rel="noopener noreferrer">時刻表示のタイムゾーン根拠</a>` : '';
  return `<li><article class="story item" id="${id}"><div class="meta"><span class="region">${label[a.region]}</span><span>${category[a.category] || 'AIビジネス'}</span><span>·</span><span>${esc(a.publisher)}</span></div><h2>${esc(a.title)}</h2><button class="read-one" type="button" data-article="${id}" aria-label="この記事を読み上げ">この記事を読み上げ</button><p class="summary">${esc(a.summary)}</p><p class="why"><strong>実務での見どころ：</strong>${esc(a.whyItMatters)}</p><p class="dates"><strong>記事公開日：</strong>${esc(a.publicationDate)} ／ JST：${esc(a.publicationDateJst || '未確認')}</p><p class="dates"><strong>公開日時：</strong>${esc(a.publishedAtOriginal)}</p><p class="dates"><strong>公開日の根拠：</strong>${esc(a.publicationDateNote)} <a href="${esc(a.publicationDateEvidenceUrl)}" target="_blank" rel="noopener noreferrer">公開・配信の日時根拠</a>${timezoneEvidence}</p><p class="dates"><strong>提供・実施時期：</strong>${esc(a.eventDate || '記載なし')}。${esc(a.eventDateNote || '')}</p><p class="reported"><strong>数値・条件：</strong>${esc(a.metricsNote)}</p><p class="source"><strong>一次情報：</strong><a href="${esc(a.originalUrl)}" target="_blank" rel="noopener noreferrer">${esc(a.publisher)}の発表を開く</a>${extra}</p></article></li>`;
}
const stories = edition.articles.map(card).join('');
const notice = esc(edition.notice);
let html = fs.readFileSync(templatePath, 'utf8');
function replaceOnce(regex, replacement, name) {
  if (!regex.test(html) || (html.match(regex) || []).length !== 1) throw new Error(`Could not uniquely replace ${name}.`);
  html = html.replace(regex, replacement);
}
replaceOnce(/<meta name="description" content="[^"]*">/, '<meta name="description" content="2026年10月29日配信。10月28日（日本時間）に公開時刻まで確認したAIビジネス関連ニュース6件。一次情報、実務上の見どころ付き。">', 'description');
replaceOnce(/<title>[^<]*<\/title>/, '<title>AIビジネスニュース｜2026年10月29日配信</title>', 'title');
replaceOnce(/<header class="masthead">[\s\S]*?<\/header>/, `<header class="masthead"><div class="topline"><span class="brand">AI BUSINESS NEWS</span><span class="edition">日刊 · JST</span></div><h1>AIビジネスニュース</h1><p class="subtitle">日本と海外のAIビジネス活用を、実務への影響とともに</p><div class="datebox">対象日：2026年10月28日（水）<br>配信日：2026年10月29日（木）</div><p class="notice">${notice}</p></header>`, 'masthead');
const main = `<main id="news"><h2 class="section-heading">ニュース一覧</h2><p class="section-note">2026年10月28日（日本時間）に公開時刻まで確認できた一次情報を掲載。日本発の発表は東京の日付表示、米国の発表は現地時刻から日本時間に換算しています。発表日と実際の提供・展開時期を分け、自己申告値や引用値も注記しました。</p><ol class="story-list">${stories}</ol></main>`;
replaceOnce(/<main id="news">[\s\S]*?<\/main>/, main, 'news list');
const radioHtml = `<section class="radio-player" aria-labelledby="radio-title"><h2 id="radio-title" class="radio-title">AIビジネスニュース</h2><p class="radio-sub">2026年10月29日配信 · VOICEVOX Nemoの男女ラジオ版</p><audio id="radio-audio" controls preload="none" aria-label="AIビジネスニュースの音声" src="radio_show-2026-10-28.mp3">このブラウザーでは音声を再生できません。</audio><label class="radio-speed" for="radio-speed">ラジオ音声の速度<select id="radio-speed"><option value="0.8">0.8倍</option><option value="0.9">0.9倍</option><option value="1" selected>1.0倍</option><option value="1.1">1.1倍</option><option value="1.25">1.25倍</option><option value="1.5">1.5倍</option></select></label><p class="radio-warning">この番組の音声はAIで生成しています。発音や話し方が不自然な場合がありますが、ご了承ください。</p><p class="radio-credit">音声：VOICEVOX Nemo（女声：スタイル10005・水野あかり、男声：スタイル10001・高瀬直人）</p><details class="radio-transcript"><summary>ラジオの台本を表示</summary><ol class="radio-script">${transcript}</ol></details></section>`;
replaceOnce(/<section class="radio-player"[\s\S]*?<\/section>/, radioHtml, 'radio player');
const footer = `<footer class="footer"><p><strong>対象ニュース：</strong>${notice}</p><p>各項目は掲載元の一次情報をもとに独自に要約しています。記事の公開日と提供・展開時期を区別し、数値は発表主体の自己申告か、評価段階の値かを注記しました。</p><p>この号は2026年10月29日配信（対象ニュース：2026年10月28日、日本時間）です。</p></footer>`;
replaceOnce(/<footer class="footer">[\s\S]*?<\/footer>/, footer, 'footer');
edition.radioAudioUrl = `https://kamokamojp.github.io/ai-business-news/editions/radio_show-${sourceDate}.mp3`;
edition.radioScriptPath = `scripts/radio-script-${sourceDate}.json`;
edition.radioBuilderPath = `scripts/build-radio-${sourceDate}.mjs`;
edition.radioSpeechPath = `scripts/speech-${sourceDate}.js`;
replaceOnce(/<script type="application\/json" id="news-data">[\s\S]*?<\/script>/, `<script type="application/json" id="news-data">${JSON.stringify(edition).replaceAll('<', '\\u003c')}</script>`, 'embedded data');

fs.mkdirSync('dist/editions', { recursive: true });
fs.mkdirSync('html', { recursive: true });
fs.writeFileSync(outputPath, html);
fs.copyFileSync(outputPath, archiveHtmlPath);
fs.writeFileSync('dist/news-data.json', JSON.stringify(edition, null, 2) + '\n');
console.log(`Built ${outputPath} and ${archiveHtmlPath} with ${edition.articles.length} stories.`);

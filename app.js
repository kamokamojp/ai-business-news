'use strict';
(() => {
  const $ = (id) => document.getElementById(id);
  const formatDate = (date) => new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year:'numeric', month:'long', day:'numeric' }).format(new Date(date + 'T12:00:00+09:00'));
  const categoryNames = { business_case: '活用事例', product: '機能・サービス', trend: '動向' };
  function el(tag, className, text) { const node = document.createElement(tag); if(className) node.className = className; if(text) node.textContent = text; return node; }
  function card(article) {
    const a = el('article', 'article');
    const meta = el('div', 'article-meta'); meta.append(el('span','region-badge '+article.region,article.region==='japan'?'日本':'海外'),el('span','category',categoryNames[article.category] || '注目記事'),el('span','',article.publisher));
    a.append(meta, el('h3','',article.title),el('p','summary',article.summary));
    if(article.whyItMatters) { const why = el('p','why'); why.append(el('strong','','仕事へのヒント'),document.createTextNode(article.whyItMatters)); a.append(why); }
    if(article.selfReportedMetrics) a.append(el('p','reported',article.metricsNote || '効果・実績の数値は発表元による公表値です。'));
    const foot = el('div','article-foot'); const dates = el('div','dates'); dates.append(el('p','','公開：'+formatDate(article.publicationDateJst)+'（日本時間）'));
    if(article.publicationDateNote) dates.append(el('p','',article.publicationDateNote));
    if(article.eventDate) dates.append(el('p','','出来事：'+article.eventDate));
    const link=el('a','source-link','原文を読む');
    try { const url = new URL(article.originalUrl); if(!['https:','http:'].includes(url.protocol)) throw new Error('Invalid URL'); link.href=url.href; } catch { link.removeAttribute('href'); link.textContent='出典リンクを確認中'; }
    link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',article.title+'：原文を読む');foot.append(dates,link);a.append(foot);return a;
  }
  function render(data) {
    const edition = data.latest || data;
    if(!edition.editionDate || !Array.isArray(edition.articles)) throw new Error('Unexpected data');
    $('edition-date').textContent=formatDate(edition.editionDate);
    $('source-window').textContent='対象：'+formatDate(edition.sourceDate)+'に公開された記事';
    $('article-count').textContent=String(edition.articles.length); const list=$('articles'); list.replaceChildren(); if(edition.articles.length)edition.articles.forEach(a=>list.append(card(a))); else list.append(el('p','empty',edition.status==='pending'?'確認できた記事を、ここに掲載します。':'この日の条件に合う重要記事は、現時点で確認できていません。'));
    const status=$('status');status.replaceChildren();status.hidden=false;
    if(edition.status==='pending'){status.append(el('h3','','初回配信を準備しています'),el('p','','10月5日（月）8:00に、前日公開のAIニュースをお届けする予定です。'));}
    else if(edition.status==='partial'){status.append(el('h3','','確認できた記事から掲載しています'),el('p','',edition.notice||'一部の情報源を確認できなかったため、確認済みの記事のみ掲載しています。'));}
    else if(edition.notice){status.append(el('p','',edition.notice));}
    else{status.hidden=true;}
    if(edition.updatedAt && edition.status!=='pending') $('updated-at').textContent='最終更新：'+new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(edition.updatedAt))+' JST';
  }
  fetch('./data/feed.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('Cannot load');return r.json();}).then(render).catch(()=>{const status=$('status');status.hidden=false;status.classList.add('error');status.replaceChildren(el('h3','','ニュースを読み込めませんでした'),el('p','','少し待ってから、このページを再読み込みしてください。'));});
})();

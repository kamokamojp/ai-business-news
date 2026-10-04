(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const all = $('read-all'), stop = $('read-stop'), rate = $('speech-rate'), status = $('speech-status'), voices = $('speech-voice');
  const buttons = [...document.querySelectorAll('.read-one')];
  const synth = window.speechSynthesis;
  const say = text => { status.textContent = text; };
  let generation = 0, active = null, queue = [], watchdog = null;
  const supported = synth && typeof synth.speak === 'function' && typeof window.SpeechSynthesisUtterance === 'function';
  function refreshVoices() {
    const selected = voices.value;
    voices.replaceChildren(new Option('端末にまかせる（日本語）', ''));
    const available = supported ? synth.getVoices() : [];
    available.filter(v => /^ja(?:[-_]|$)/i.test(v.lang)).forEach(v => voices.add(new Option(v.name, v.voiceURI)));
    if ([...voices.options].some(o => o.value === selected)) voices.value = selected;
    $('voice-detail').textContent = `日本語音声：${voices.options.length - 1}件。音声が未表示でも、端末の標準音声で試せます。`;
  }
  function clear() {
    ++generation; clearTimeout(watchdog); active = null; queue = [];
    if (supported) synth.cancel();
    stop.disabled = true;
    document.querySelectorAll('.is-reading').forEach(el => el.classList.remove('is-reading'));
  }
  function chunks(text) {
    return (text.match(/[^。！？!?\n]+[。！？!?]?/g) || []).flatMap(sentence => {
      const result = []; const chars = Array.from(sentence.trim());
      while (chars.length) result.push(chars.splice(0, 90).join(''));
      return result;
    }).filter(Boolean);
  }
  function fail(code) {
    clear();
    const messages = {
      'not-allowed': '再生が許可されませんでした。SafariまたはChromeでこのページを直接開き、もう一度ボタンを押してください。',
      'voice-unavailable': '選んだ音声が使えません。「端末にまかせる」を選んで試してください。',
      'language-unavailable': '日本語音声を利用できません。端末の読み上げ音声設定を確認してください。',
      'audio-hardware': '音声の出力先を確認してください。Bluetooth・イヤホン接続や音量を確認して、もう一度お試しください。',
      'synthesis-unavailable': 'このブラウザーでは音声を利用できません。SafariまたはChromeで開いてください。',
      'network': '音声の取得に失敗しました。通信状態を確認し、別の音声でも試してください。'
    };
    say((messages[code] || '読み上げを開始できませんでした。音声テストや別の音声を試してください。') + `（${code}）`);
  }
  function next(session) {
    if (session !== generation) return;
    const item = queue.shift();
    if (!item) { active = null; stop.disabled = true; say('読み上げが終わりました。'); document.querySelectorAll('.is-reading').forEach(el => el.classList.remove('is-reading')); return; }
    const u = new window.SpeechSynthesisUtterance(item.text);
    active = u; // Keep a strong reference for mobile engines.
    u.lang = 'ja-JP'; u.rate = Number(rate.value) || 1; u.volume = 1; u.pitch = 1;
    const chosen = synth.getVoices().find(v => v.voiceURI === voices.value);
    if (chosen) u.voice = chosen;
    let began = false;
    u.onstart = () => {
      if (session !== generation) return;
      began = true; clearTimeout(watchdog);
      say(`${item.label}を読み上げ中です。`);
      document.querySelectorAll('.is-reading').forEach(el => el.classList.remove('is-reading'));
      if (item.article) item.article.classList.add('is-reading');
    };
    u.onend = () => { if (session === generation) { clearTimeout(watchdog); active = null; next(session); } };
    u.onerror = event => { if (session === generation) fail(event.error || 'unknown'); };
    watchdog = setTimeout(() => { if (session === generation && !began) fail('start-timeout'); }, 10000);
    // The first speak() is synchronous inside the click handler: no await, timer or voice-loading gate.
    try { synth.speak(u); } catch (e) { fail(e.name || 'synthesis-failed'); }
  }
  function start(items) {
    if (!supported) return;
    clear(); refreshVoices();
    queue = items.flatMap(item => chunks(item.text).map(text => ({...item, text})));
    if (!queue.length) { say('読み上げる記事がありません。'); return; }
    stop.disabled = false; say('音声を開始しています…');
    if (synth.paused) synth.resume();
    next(generation);
  }
  function articleItem(article) {
    return {article, label: article.querySelector('h2').textContent.trim(), text: ['.region','h2','.summary','.why','.reported'].map(s => article.querySelector(s)?.textContent.trim() || '').join('。')};
  }
  $('sound-test').addEventListener('click', () => start([{label:'音声テスト', text:'こんにちは。AIニュースの音声テストです。'}]));
  all.addEventListener('click', () => start([...document.querySelectorAll('.item')].map(articleItem)));
  buttons.forEach(button => button.addEventListener('click', () => start([articleItem($(button.dataset.article))])));
  stop.addEventListener('click', () => { clear(); say('読み上げを停止しました。'); });
  [all, ...buttons, rate, voices, $('sound-test')].forEach(el => { el.disabled = !supported; });
  if (supported) {
    refreshVoices();
    synth.addEventListener ? synth.addEventListener('voiceschanged', refreshVoices) : synth.onvoiceschanged = refreshVoices;
    say('ボタンを押すと読み上げます。最初は「音声テスト」をお試しください。');
    window.addEventListener('pagehide', clear);
  } else say('この画面では音声読み上げが使えません。共有メニューからSafariまたはChromeでこのページを開いてください。');
})();

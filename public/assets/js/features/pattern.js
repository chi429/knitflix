// Pattern explainer: paste an English pattern, Claude explains the abbreviations
// and translates it line by line. Talks to /api/explain-pattern (Vercel function).

(function () {
  const ENDPOINT = '/api/explain-pattern';
  const MAX_CHARS = 4000;
  const STREAM_ERROR_MARK = '\u001eERR';

  const SAMPLE = [
    'Cast on 24 sts.',
    'Row 1 (RS): *k2, p2; rep from * to end.',
    'Row 2 (WS): work sts as they appear.',
    'Rep rows 1–2 until piece measures 5cm from CO edge.',
    'Next row (dec): k1, ssk, k to last 3 sts, k2tog, k1. (22 sts)',
    'BO loosely in patt.',
  ].join('\n');

  const T = {
    placeholder: {
      zh: '貼上英文 pattern，例如：\nRow 1: *k2, p2; rep from * to end.',
      en: 'Paste an English pattern, e.g.\nRow 1: *k2, p2; rep from * to end.',
    },
    count: { zh: (n) => `${n} / ${MAX_CHARS} 字`, en: (n) => `${n} / ${MAX_CHARS} characters` },
    empty: { zh: '請先貼上 pattern', en: 'Paste a pattern first' },
    too_long: {
      zh: `太長喇，請分段貼（每次最多 ${MAX_CHARS} 字）`,
      en: `Too long. Paste it in parts (up to ${MAX_CHARS} characters each).`,
    },
    server_config: {
      zh: '解讀功能未設定好：伺服器未有 API key',
      en: 'Explain isn’t set up yet: the server has no API key',
    },
    busy: { zh: '而家太多人用緊，等一陣再試', en: 'Too many requests right now. Try again in a minute.' },
    upstream: { zh: 'AI 服務暫時出錯，再撳一次試吓', en: 'The AI service had an error. Try again.' },
    forbidden: { zh: '呢個網址唔可以用解讀功能', en: 'Explain isn’t available from this address' },
    bad_request: { zh: '傳送出錯，再試一次', en: 'Something went wrong sending that. Try again.' },
    network: { zh: '連唔到伺服器，檢查吓網絡再試', en: 'Can’t reach the server. Check your connection and try again.' },
    broke: {
      zh: '解讀中途斷咗，上面係已經收到嘅部分。可以再撳「解讀」重新嚟過。',
      en: 'The explanation stopped part-way. What arrived so far is above. Press Explain to run it again.',
    },
    stopped: { zh: '已停止', en: 'Stopped' },
    copied: { zh: '已複製', en: 'Copied' },
  };

  let controller = null;
  let rawText = '';

  const $ = (id) => document.getElementById(id);
  const t = (key, ...args) => {
    const v = T[key][lang === 'en' ? 'en' : 'zh'];
    return typeof v === 'function' ? v(...args) : v;
  };

  // ── Rendering ───────────────────────────────────────────
  // Model text is only ever put in the page with textContent, never innerHTML.

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function renderOutput(text, streaming) {
    const out = $('patOut');
    out.replaceChildren();
    const lines = text.split('\n');
    let table = null;

    lines.forEach((line, i) => {
      const isLast = i === lines.length - 1;
      const trimmed = line.trim();
      if (!trimmed) { table = null; return; }

      if (trimmed.startsWith('## ')) {
        table = null;
        out.append(el('div', 'card-label pat-h', trimmed.slice(3)));
        return;
      }

      const parts = trimmed.split('｜');
      if (parts.length === 3 && !(streaming && isLast)) {
        if (!table) { table = el('div', 'pat-abbr'); out.append(table); }
        const row = el('div', 'pat-abbr-row');
        row.append(el('div', 'pat-abbr-key', parts[0].trim()));
        const meaning = el('div');
        meaning.append(el('div', 'pat-abbr-en', parts[1].trim()));
        meaning.append(el('div', 'pat-abbr-zh', parts[2].trim()));
        row.append(meaning);
        table.append(row);
        return;
      }

      table = null;
      if (trimmed.startsWith('→')) {
        out.append(el('p', 'pat-tr', trimmed.replace(/^→\s*/, '')));
      } else if (trimmed.startsWith('- ')) {
        out.append(el('p', 'pat-note', trimmed.slice(2)));
      } else {
        out.append(el('p', 'pat-src', trimmed));
      }
    });

    if (streaming) {
      const caret = el('span', 'pat-caret');
      caret.setAttribute('aria-hidden', 'true');
      (out.lastElementChild && !out.lastElementChild.classList.contains('pat-abbr')
        ? out.lastElementChild
        : out
      ).append(caret);
    }
  }

  function setBusy(busy) {
    $('patGo').hidden = busy;
    $('patStop').hidden = !busy;
    $('patIn').readOnly = busy;
    $('patResult').setAttribute('aria-busy', busy ? 'true' : 'false');
  }

  function setStatus(msg, isError) {
    const s = $('patStatus');
    s.textContent = msg || '';
    s.classList.toggle('is-err', !!isError);
  }

  function updateCount() {
    const n = $('patIn').value.length;
    const c = $('patCount');
    c.textContent = t('count', n);
    c.classList.toggle('is-over', n > MAX_CHARS);
  }

  // ── Actions ─────────────────────────────────────────────

  window.patternSample = function () {
    $('patIn').value = SAMPLE;
    updateCount();
    $('patIn').focus();
  };

  window.patternStop = function () {
    if (controller) controller.abort();
  };

  window.patternCopy = async function () {
    if (!rawText) return;
    try {
      await navigator.clipboard.writeText(rawText);
      setStatus(t('copied'));
    } catch {
      // Clipboard can be blocked (http, old browsers): select the text instead.
      const range = document.createRange();
      range.selectNodeContents($('patOut'));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  window.patternExplain = async function () {
    const pattern = $('patIn').value.trim();
    if (!pattern) { setStatus(t('empty'), true); $('patIn').focus(); return; }
    if (pattern.length > MAX_CHARS) { setStatus(t('too_long'), true); return; }

    controller = new AbortController();
    rawText = '';
    setStatus('');
    $('patResult').classList.add('show');
    $('patFoot').hidden = true;
    renderOutput('', true);
    setBusy(true);

    let failed = false;
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern, lang }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let code = 'upstream';
        try { code = (await res.json()).error || code; } catch {}
        failed = true;
        setStatus(T[code] ? t(code) : t('upstream'), true);
        $('patResult').classList.remove('show');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let pending = 0;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        rawText += decoder.decode(value, { stream: true });
        // Re-render at most once per frame; streams can arrive in tiny pieces.
        if (!pending) {
          pending = requestAnimationFrame(() => { pending = 0; renderOutput(cleanText(), true); });
        }
      }
      if (pending) cancelAnimationFrame(pending);

      if (rawText.includes(STREAM_ERROR_MARK)) {
        failed = true;
        rawText = cleanText();
        setStatus(t('broke'), true);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setStatus(t('stopped'));
      } else {
        failed = true;
        setStatus(rawText ? t('broke') : t('network'), true);
        if (!rawText) $('patResult').classList.remove('show');
      }
    } finally {
      controller = null;
      setBusy(false);
      if (rawText) {
        renderOutput(rawText, false);
        $('patFoot').hidden = false;
      } else if (!failed) {
        $('patResult').classList.remove('show');
      }
    }
  };

  function cleanText() {
    return rawText.replace(STREAM_ERROR_MARK, '');
  }

  // ── Language toggle ─────────────────────────────────────
  // toggleLang() swaps every [data-zh] element's text; the textarea needs its
  // placeholder swapped separately.

  window.renderPatternLang = function () {
    const input = $('patIn');
    if (!input) return;
    input.placeholder = t('placeholder');
    updateCount();
  };

  document.addEventListener('DOMContentLoaded', () => {
    const input = $('patIn');
    if (!input) return;
    input.addEventListener('input', updateCount);
    input.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') window.patternExplain();
    });
    window.renderPatternLang();
  });
})();

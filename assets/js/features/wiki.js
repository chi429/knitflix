// Fiber Wiki feature (render + search)

window.renderWiki = function renderWiki() {
  const fibers = window.FIBERS || [];
  const trLbls = window.FIBER_RATING_LABELS || {};
  const trColors = window.FIBER_RATING_COLORS || {};

  const q = (document.getElementById('wikiQ')?.value || '').toLowerCase();
  const list = document.getElementById('fiberList');
  if (!list) return;

  const filtered = fibers.filter(f => !q || f.nz.toLowerCase().includes(q) || f.ne.toLowerCase().includes(q));
  list.innerHTML = filtered.map((f, i) => {
    const name = lang==='zh' ? f.nz : f.ne;
    const type = lang==='zh' ? f.tz : f.te;
    const desc = lang==='zh' ? f.dz : f.de;
    const uses = (lang==='zh' ? f.uz : f.ue).map(u => `<span class="use-tag">${u}</span>`).join('');
    const care = (lang==='zh' ? f.cz : f.ce).map(c => `<div class="care-row">· ${c}</div>`).join('');
    const lbl = trLbls[lang] || {};
    const bars = Object.entries(f.tr || {}).map(([k,v]) =>
      `<div class="bar-row"><div class="bar-lbl">${lbl[k] || k}</div><div class="bar-track"><div class="bar-fill" style="width:${v*20}%;background:${trColors[k] || 'var(--rust)'}"></div></div><div class="bar-score">${v}/5</div></div>`
    ).join('');
    return `<div class="fiber-card" id="fb-${i}">
      <div class="fiber-head" onclick="document.getElementById('fb-${i}').classList.toggle('open')">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="fiber-icon" style="background:${f.c}">${f.icon}</div>
          <div><div class="f-name">${name}</div><div class="f-type">${type}</div></div>
        </div>
        <span class="fiber-chevron">▾</span>
      </div>
      <div class="fiber-body">
        <div class="f-section"><div class="f-sec-lbl">${lang==='zh'?'特性':'About'}</div><div class="f-desc">${desc}</div></div>
        <div class="f-section"><div class="f-sec-lbl">${lang==='zh'?'評分':'Rating'}</div><div class="bar-list">${bars}</div></div>
        <div class="f-section"><div class="f-sec-lbl">${lang==='zh'?'適合用途':'Uses'}</div><div class="use-wrap">${uses}</div></div>
        <div class="f-section"><div class="f-sec-lbl">${lang==='zh'?'保養':'Care'}</div><div class="care-wrap">${care}</div></div>
      </div>
    </div>`;
  }).join('');
};


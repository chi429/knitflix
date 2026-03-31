// Reference feature (render tables from REF data)

function _esc(s) {
  return String(s ?? '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#39;");
}

function _yarnTagClass(tag) {
  const t = (tag || '').toLowerCase();
  if (t.includes('lace') || t.includes('fingering')) return 'ytag ytag-lace';
  return 'ytag ytag-yarn';
}

window.renderReference = function renderReference(force) {
  const ref = window.REF;
  if (!ref) return;
  const shouldReset = !!force;

  // Crochet symbols
  const crochetEl = document.getElementById('symCrochetTable');
  if (crochetEl && (shouldReset || crochetEl.childElementCount === 0)) {
    if (shouldReset) crochetEl.innerHTML = '';
    crochetEl.innerHTML = [
      `<div class="sym-row hdr"><div></div><div data-zh="鈎針" data-en="Crochet">鈎針</div><div data-zh="針織對應" data-en="Knit Equiv">針織對應</div></div>`,
      ...ref.symbols.crochet.map(r => {
        const name = lang === 'zh' ? r.nameZh : r.nameEn;
        const equiv = lang === 'zh' ? r.equivZh : r.equivEn;
        return `<div class="sym-row">
          <div class="sym-ico">${_esc(r.ico)}</div>
          <div><div class="sn">${_esc(name)}</div><div class="sd">${_esc(r.abbr)}</div></div>
          <div><div class="se">${_esc(equiv)}</div></div>
        </div>`;
      })
    ].join('');
  }

  // Knit symbols
  const knitEl = document.getElementById('symKnitTable');
  if (knitEl && (shouldReset || knitEl.childElementCount === 0)) {
    if (shouldReset) knitEl.innerHTML = '';
    knitEl.innerHTML = [
      `<div class="sym-row hdr"><div></div><div data-zh="針織" data-en="Knitting">針織</div><div data-zh="鈎針對應" data-en="Crochet">鈎針對應</div></div>`,
      ...ref.symbols.knit.map(r => {
        const name = lang === 'zh' ? r.nameZh : r.nameEn;
        return `<div class="sym-row">
          <div class="sym-ico">${_esc(r.ico)}</div>
          <div><div class="sn">${_esc(name)}</div><div class="sd">${_esc(r.abbr)}</div></div>
          <div><div class="se">${_esc(r.equiv)}</div></div>
        </div>`;
      })
    ].join('');
  }

  // UK <-> US
  const ukUsEl = document.getElementById('ukUsTable');
  if (ukUsEl && (shouldReset || ukUsEl.childElementCount === 0)) {
    if (shouldReset) ukUsEl.innerHTML = '';
    ukUsEl.innerHTML = [
      `<div class="sym-row hdr"><div></div><div>US</div><div>UK</div></div>`,
      ...ref.symbols.ukUs.map(r => {
        return `<div class="sym-row">
          <div class="sym-ico" style="font-size:11px">${_esc(r.abbr)}</div>
          <div><div class="sn">${_esc(r.us)}</div></div>
          <div><div class="se">${_esc(r.uk)}</div></div>
        </div>`;
      })
    ].join('');
  }

  // Hook sizes
  const hookEl = document.getElementById('hookSizeTable');
  if (hookEl && (shouldReset || hookEl.childElementCount === 0)) {
    if (shouldReset) hookEl.innerHTML = '';
    hookEl.innerHTML = `<table class="size-tbl">
      <thead><tr><th>mm</th><th>US</th><th>JP</th><th data-zh="線材" data-en="Yarn">線材</th></tr></thead>
      <tbody>
        ${ref.sizes.hooks.map(r => `<tr>
          <td class="mm-val">${_esc(r.mm)}</td>
          <td>${_esc(r.us)}</td>
          <td>${_esc(r.jp)}</td>
          <td><span class="${_yarnTagClass(r.yarnTag)}">${_esc(r.yarnTag)}</span></td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  }

  // Needle sizes
  const needleEl = document.getElementById('needleSizeTable');
  if (needleEl && (shouldReset || needleEl.childElementCount === 0)) {
    if (shouldReset) needleEl.innerHTML = '';
    needleEl.innerHTML = `<table class="size-tbl">
      <thead><tr><th>mm</th><th>US</th><th>UK</th><th data-zh="線材" data-en="Yarn">線材</th></tr></thead>
      <tbody>
        ${ref.sizes.needles.map(r => `<tr>
          <td class="mm-val">${_esc(r.mm)}</td>
          <td>${_esc(r.us)}</td>
          <td>${_esc(r.uk)}</td>
          <td><span class="${_yarnTagClass(r.yarnTag)}">${_esc(r.yarnTag)}</span></td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  }
};


// Knitflix prototype logic extracted from knitflix.html

// Use `var` so feature scripts can access these globals.
var lang = 'zh', rowCount = 0, areaFilter = 'all';
const refPanels = ['sym-crochet','sym-knit','uk-us','hook-sz','knit-sz'];

// panels: home=0,calc=1,count=2,shops=3,wiki=4,ref=5
// tabs:   0=home,1=calc,2=count,3=shops,4=wiki,4.5=ref
const PANEL_IDS = ['p-home','p-calc','p-count','p-shops','p-wiki','p-ref'];
const TAB_TO_PANEL = {0:0, 1:1, 2:2, 3:3, 4:4, 4.5:5};
let currentPanel = 0;
let undoTimer = null, prevRowCount = 0;

function goTo(tabIdx) {
  const panelIdx = tabIdx === 4.5 ? 5 : tabIdx === 4 ? 4 : Math.round(tabIdx);
  if (window._goToPanel) window._goToPanel(panelIdx);
}

(function initSwipe() {
  const container = document.getElementById('swipeContainer');
  const track = document.getElementById('panelsTrack');
  if (!container || !track) return;
  let startX = 0, startY = 0, isDragging = false, isHoriz = null;
  let dragDelta = 0;
  const PANELS = PANEL_IDS.length;

  container.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = true; isHoriz = null; dragDelta = 0;
    track.style.transition = 'none';
  }, {passive:true});

  container.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (isHoriz === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      isHoriz = Math.abs(dx) > Math.abs(dy);
    }
    if (!isHoriz) return;
    e.preventDefault();
    dragDelta = dx;
    const baseX = currentPanel * 100;
    const pct = (dragDelta / container.offsetWidth) * 100;
    const resist = Math.abs(pct) > 30 ? 0.3 : 1;
    track.style.transform = `translateX(calc(-${baseX}% + ${dragDelta * resist}px))`;
  }, {passive:false});

  container.addEventListener('touchend', () => {
    if (!isDragging || !isHoriz) { isDragging = false; return; }
    isDragging = false;
    track.style.transition = '';
    const threshold = container.offsetWidth * 0.25;
    if (dragDelta < -threshold && currentPanel < PANELS - 1) {
      goToPanel(currentPanel + 1);
    } else if (dragDelta > threshold && currentPanel > 0) {
      goToPanel(currentPanel - 1);
    } else {
      track.style.transform = `translateX(-${currentPanel * 100}%)`;
    }
  });

  function goToPanel(idx) {
    if (idx < 0 || idx >= PANELS) return;
    currentPanel = idx;
    track.style.transform = `translateX(-${idx * 100}%)`;
    const tMap = [0,1,2,3,4,4.5];
    document.querySelectorAll('.tab-item').forEach((b,i) => {
      const isActive = TAB_TO_PANEL[tMap[i]] === idx;
      b.classList.toggle('active', isActive);
      if (isActive) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    const panel = document.getElementById(PANEL_IDS[idx]);
    if (panel) panel.scrollTop = 0;
    if (idx === 0) updateHeroBadge();
  }
  window._goToPanel = goToPanel;
})();

function toggleLang() {
  lang = lang==='zh'?'en':'zh';
  document.getElementById('langBtn').textContent = lang==='zh'?'EN':'中';
  document.querySelectorAll('[data-zh]').forEach(el => {
    if (el.tagName !== 'INPUT') el.textContent = lang==='zh'?el.dataset.zh:el.dataset.en;
  });
  if (typeof renderShops === 'function') renderShops();
  if (typeof renderWiki === 'function') renderWiki();
  if (typeof renderReference === 'function') renderReference(true);
  updateProg();
}

function toggleSwatchTip() {
  const tip = document.getElementById('swatchTip');
  tip?.classList.toggle('show');
}

function showErr(id) {
  const input = document.getElementById(id);
  const err = document.getElementById(id+'-err');
  input?.classList.add('err');
  err?.classList.add('show');
}
function clearErr(elOrId) {
  const id = typeof elOrId === 'string' ? elOrId : elOrId?.id;
  if (!id) return;
  const input = document.getElementById(id);
  const err = document.getElementById(id+'-err');
  input?.classList.remove('err');
  err?.classList.remove('show');
}

function setCalcMode(m, btn) {
  document.querySelectorAll('#calcChips .chip').forEach(c=>c.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('m-predict').style.display = m==='predict'?'block':'none';
  document.getElementById('m-remain').style.display = m==='remain'?'block':'none';
}

function calcYarn() {
  const sG=+document.getElementById('sGm').value;
  const pW=+document.getElementById('pW').value;
  const pH=+document.getElementById('pH').value;
  const bG=+document.getElementById('bG').value;
  let valid = true;
  ['sSt','sRw','sGm','pW','pH'].forEach(id => clearErr(id));
  if (!document.getElementById('sSt').value) { showErr('sSt'); valid=false; }
  if (!document.getElementById('sRw').value) { showErr('sRw'); valid=false; }
  if (!sG || sG <= 0) { showErr('sGm'); valid=false; }
  if (!pW || pW <= 0) { showErr('pW'); valid=false; }
  if (!pH || pH <= 0) { showErr('pH'); valid=false; }
  if (!valid) return;
  const g=Math.ceil(pW*pH/100*sG*1.1);
  document.getElementById('r-yarn-g').textContent=g+'g';
  document.getElementById('r-yarn-n').textContent=bG?
    (lang==='zh'?`約 ${Math.ceil(g/bG)} 球（每球 ${bG}g）· 含10%預留`:`~${Math.ceil(g/bG)} ball(s) (${bG}g each) · 10% buffer included`):
    (lang==='zh'?'已含10%預留份量':'Includes 10% buffer');
  document.getElementById('r-yarn').classList.add('show');
}

function calcRemain() {
  const done=+document.getElementById('dR').value;
  const total=+document.getElementById('tR').value;
  const used=+document.getElementById('uG').value;
  let valid = true;
  ['dR','tR','uG'].forEach(id => clearErr(id));
  if (!done || done <= 0) { showErr('dR'); valid=false; }
  if (!total || total <= 0) { showErr('tR'); valid=false; }
  if (!used || used <= 0) { showErr('uG'); valid=false; }
  if (valid && done >= total) {
    showErr('dR');
    const errEl = document.getElementById('dR-err');
    if (errEl) errEl.textContent = lang==='zh'?'已織行數不能多於總行數':'Rows done must be less than total';
    valid=false;
  }
  if (!valid) return;
  const rem=Math.ceil(used/done*(total-done));
  document.getElementById('r-rem-g').textContent=rem+'g';
  document.getElementById('r-rem-n').textContent=lang==='zh'?`總用量約 ${Math.ceil(used+rem)}g · 完成度 ${Math.round(done/total*100)}%`:`Total ~${Math.ceil(used+rem)}g · ${Math.round(done/total*100)}% done`;
  document.getElementById('r-rem').classList.add('show');
}

// 浮誇 pixel fireworks — multi-wave burst + shockwave ring + screen flash
function spawnPixelFireworks(originEl, direction) {
  const addColors   = ['#ff99cc','#cc99ff','#99ffff','#ffffcc','#ffb7ff','#99ccff','#ff66aa','#ffffff','#ffcc00'];
  const minusColors = ['#cc99ff','#99ccff','#b2e0ff','#ddeaf5','#e8d5f5','#ffffff','#aaddff'];
  const colors = direction === 1 ? addColors : minusColors;

  const rect = originEl.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;

  // ── 1. Screen flash ──────────────────────────────────────────────
  const flash = document.createElement('div');
  flash.className = 'pixel-flash';
  flash.style.background = direction === 1
    ? 'radial-gradient(circle at ' + cx + 'px ' + cy + 'px, #ffb7ff 0%, #cc99ff 40%, transparent 70%)'
    : 'radial-gradient(circle at ' + cx + 'px ' + cy + 'px, #b2e0ff 0%, #cc99ff 50%, transparent 70%)';
  flash.style.animation = 'flashPop 220ms ease-out forwards';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 280);

  // ── 2. Shockwave rings (2 rings, staggered) ──────────────────────
  const ringSize = direction === 1 ? 160 : 110;
  [0, 80].forEach((delay, ri) => {
    const ring = document.createElement('div');
    ring.className = 'pixel-ring';
    const ringColors = direction === 1
      ? ['#ff99cc','#cc99ff','#99ffff']
      : ['#cc99ff','#99ccff','#b2e0ff'];
    ring.style.setProperty('--ring-color', ringColors[ri % ringColors.length]);
    const rs = ringSize * (ri === 0 ? 1 : 0.65);
    ring.style.width  = rs + 'px';
    ring.style.height = rs + 'px';
    ring.style.left   = cx + 'px';
    ring.style.top    = cy + 'px';
    ring.style.borderWidth = (ri === 0 ? 4 : 3) + 'px';
    ring.style.borderStyle = 'solid';
    const dur = direction === 1 ? 420 : 320;
    ring.style.animation = `ringExpand ${dur}ms ${delay}ms cubic-bezier(0.16,1,0.3,1) forwards`;
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), dur + delay + 50);
  });

  // ── 3. Spark waves (2 waves for +, 1 for −) ─────────────────────
  const waves = direction === 1 ? 2 : 1;
  const countPerWave = direction === 1 ? 24 : 14;
  const maxDist = direction === 1 ? 150 : 90;
  // Pixel sizes: mix of 1×1, 2×2, 4×4, 6×6, 8×8, 10×10 blocks
  const sizes = direction === 1 ? [4,4,6,6,8,8,10,12] : [4,4,6,6,8];

  for (let w = 0; w < waves; w++) {
    const waveDelay = w * 90;
    const waveCount = w === 0 ? countPerWave : Math.floor(countPerWave * 0.6);
    const waveDist  = w === 0 ? maxDist : maxDist * 0.65;

    for (let i = 0; i < waveCount; i++) {
      const spark = document.createElement('div');
      spark.className = 'pixel-spark';

      const sz = sizes[Math.floor(Math.random() * sizes.length)];
      // Some sparks are tall rectangles (like pixel streaks)
      const isStreak = direction === 1 && Math.random() < 0.25;
      spark.style.width  = sz + 'px';
      spark.style.height = isStreak ? sz * 2 + 'px' : sz + 'px';

      const baseAngle = (i / waveCount) * 360;
      const angle = (baseAngle + (Math.random() - 0.5) * (360 / waveCount) * 1.4) * (Math.PI / 180);
      const dist  = waveDist * (0.5 + Math.random() * 0.5);
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const rot = (Math.random() - 0.5) * 720;

      spark.style.setProperty('--dx', dx + 'px');
      spark.style.setProperty('--dy', dy + 'px');
      spark.style.setProperty('--rot', rot + 'deg');
      spark.style.setProperty('--s0', (0.8 + Math.random() * 0.6).toFixed(2));
      spark.style.left = (cx - sz / 2) + 'px';
      spark.style.top  = (cy - sz / 2) + 'px';
      spark.style.background = colors[Math.floor(Math.random() * colors.length)];
      spark.style.border = '1px solid rgba(51,34,68,0.4)';
      // Bright glow on larger sparks
      if (sz >= 8 && direction === 1) {
        spark.style.boxShadow = '0 0 4px 2px ' + colors[Math.floor(Math.random() * colors.length)];
      }

      const dur   = direction === 1 ? 550 + Math.random() * 300 : 380 + Math.random() * 180;
      const delay = waveDelay + Math.random() * 80;
      const anim  = direction === 1 ? 'sparkFly' : 'sparkFlyMinus';
      spark.style.animation = `${anim} ${dur}ms ${delay}ms cubic-bezier(0.16,1,0.3,1) forwards`;

      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), dur + delay + 60);
    }
  }
}

function animateCounter(direction, originEl) {
  const el = document.getElementById('rowNum');
  if (!el) return;
  el.classList.remove('pop','minus');
  void el.offsetWidth;
  el.classList.add(direction === 1 ? 'pop' : 'minus');
  if (navigator.vibrate) navigator.vibrate(direction === 1 ? 30 : 15);
  if (originEl) spawnPixelFireworks(originEl, direction);
}

function changeRow(d, btn) {
  rowCount = Math.max(0, rowCount + d);
  document.getElementById('rowNum').textContent = rowCount;
  animateCounter(d, btn || null);
  try { localStorage.setItem('knitflix_rows', rowCount); } catch(e) {}
  updateProg(); updateHeroBadge();
}

function resetRow() {
  if (rowCount === 0) return;
  prevRowCount = rowCount;
  rowCount = 0;
  document.getElementById('rowNum').textContent = 0;
  animateCounter(-1);
  try { localStorage.setItem('knitflix_rows', 0); } catch(e) {}
  updateProg(); updateHeroBadge();
  showUndoToast();
}

function undoReset() {
  rowCount = prevRowCount;
  document.getElementById('rowNum').textContent = rowCount;
  animateCounter(1);
  try { localStorage.setItem('knitflix_rows', rowCount); } catch(e) {}
  updateProg(); updateHeroBadge();
  hideUndoToast();
}

function getTargetRows() {
  const el = document.getElementById('tgtRow');
  if (!el) return 0;
  // If user hasn't typed anything, use placeholder as the implicit target (e.g. 100).
  const raw = (el.value ?? '').trim();
  const val = raw ? Number(raw) : Number(el.placeholder || 0);
  return Number.isFinite(val) ? val : 0;
}

function showUndoToast() {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toastMsg');
  const btn = document.getElementById('toastUndo');
  if (!toast || !msg || !btn) return;
  msg.textContent = lang==='zh'?`已重設（原：${prevRowCount} 行）`:`Reset (was ${prevRowCount} rows)`;
  btn.textContent = lang==='zh'?'復原':'Undo';
  toast.classList.add('show');
  if (undoTimer) clearTimeout(undoTimer);
  undoTimer = setTimeout(hideUndoToast, 5000);
}

function hideUndoToast() {
  document.getElementById('toast')?.classList.remove('show');
  if (undoTimer) { clearTimeout(undoTimer); undoTimer = null; }
}

function updateProg() {
  const t = getTargetRows();
  const fill = document.getElementById('progFill');
  const txt  = document.getElementById('progTxt');
  const lbl  = document.getElementById('progRowLabel');
  const track = fill?.parentElement;
  if (t > 0) {
    const p = Math.min(100, Math.round(rowCount / t * 100));
    fill.style.width = p + '%';
    txt.textContent  = p + '%';
    lbl.textContent  = lang === 'zh' ? `${rowCount} / ${t} 行` : `${rowCount} / ${t} rows`;
    const done = rowCount >= t;
    track?.classList.toggle('prog-done', done);
    txt.classList.toggle('prog-pct-done', done);
    // Only persist when user explicitly set a value (not just placeholder).
    const tgtEl = document.getElementById('tgtRow');
    if (tgtEl && (tgtEl.value ?? '').trim()) {
      try { localStorage.setItem('knitflix_target', t); } catch(e) {}
    }
  } else {
    fill.style.width = '0%';
    txt.textContent  = '0%';
    lbl.textContent  = '—';
    track?.classList.remove('prog-done');
    txt.classList.remove('prog-pct-done');
  }
  updateHeroBadge();
}

function updateHeroBadge() {
  const t = getTargetRows();
  const w = lang==='zh' ? '行' : 'rows';
  document.getElementById('heroRowVal').innerHTML = `${rowCount} <span style="font-size:16px;font-weight:300">${w}</span>`;
  const pct = t > 0 ? Math.min(100, Math.round(rowCount / t * 100)) : 0;
  document.getElementById('heroProgFill').style.width = pct + '%';
  document.getElementById('heroProgPct').textContent = pct + '%';
}

function setRef(id, btn) {
  refPanels.forEach(r => document.getElementById(r).style.display = 'none');
  document.querySelectorAll('#refToggle .pill-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).style.display = 'block';
  btn.classList.add('active');
}

// Data + renderers (shops + wiki) still live in knitflix.html for now.

document.addEventListener('DOMContentLoaded', function() {
  // Render icons as soon as lucide is ready (don't block on shops fetch).
  // Note: Lucide removed in favor of pixelarticons.
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  try {
    const saved = parseInt(localStorage.getItem('knitflix_rows') || '0');
    const savedT = parseInt(localStorage.getItem('knitflix_target') || '0');
    if (saved > 0) { rowCount = saved; document.getElementById('rowNum').textContent = saved; }
    if (savedT > 0) { document.getElementById('tgtRow').value = savedT; updateProg(); }
  } catch(e) {}

  // 1) Fast path: render immediately from cached shops (if available).
  try {
    const cached = localStorage.getItem('knitflix_shops_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) window.SHOPS = parsed;
    }
  } catch (e) {}

  // Show where shops came from (cache vs live).
  try {
    const t = localStorage.getItem('knitflix_shops_cache_ts');
    if (t) window.__SHOPS_CACHE_TS = parseInt(t, 10);
  } catch (e) {}
  window.__SHOPS_SOURCE = window.SHOPS?.length ? (window.__SHOPS_CACHE_TS ? 'cache' : 'unknown') : 'none';

  if (typeof renderShops === 'function') renderShops();
  if (typeof renderWiki === 'function') renderWiki();
  if (typeof renderReference === 'function') renderReference();
  updateHeroBadge();
  document.querySelectorAll('.tab-item')[0]?.classList.add('active');

  // 2) Slow path: refresh shops from remote/local sources and rerender.
  (async function loadShops() {
    try {
      async function fetchJsonWithTimeout(url, opts) {
        const timeoutMs = typeof opts?.timeoutMs === 'number' ? opts.timeoutMs : 4500;
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const res = await fetch(url, { ...opts, signal: controller.signal });
          return res;
        } finally {
          clearTimeout(t);
        }
      }

      const remoteUrl =
        (typeof window !== 'undefined' && typeof window.SHOPS_ENDPOINT === 'string' && window.SHOPS_ENDPOINT.trim())
          ? window.SHOPS_ENDPOINT.trim()
          : null;

      if (remoteUrl) {
        const remoteRes = await fetchJsonWithTimeout(remoteUrl, { cache: 'no-store', timeoutMs: 4500 });
        if (remoteRes.ok) {
          const remoteData = await remoteRes.json();
          if (Array.isArray(remoteData)) {
            window.SHOPS = remoteData;
            try {
              localStorage.setItem('knitflix_shops_cache', JSON.stringify(remoteData));
              localStorage.setItem('knitflix_shops_cache_ts', String(Date.now()));
            } catch (e) {}
            window.__SHOPS_CACHE_TS = Date.now();
            window.__SHOPS_SOURCE = 'google';
            if (typeof renderShops === 'function') renderShops();
            return;
          }
        }
      }

      const localRes = await fetchJsonWithTimeout('./assets/data/shops.json', { cache: 'no-store', timeoutMs: 2500 });
      if (!localRes.ok) return;
      const localData = await localRes.json();
      if (Array.isArray(localData)) {
        window.SHOPS = localData;
        window.__SHOPS_SOURCE = 'local';
        if (typeof renderShops === 'function') renderShops();
      }
    } catch (e) {
      // If fetch fails (e.g. opened as file://), keep whatever we have (cached/global)
    }
  })();
});

document.addEventListener('keydown', (e) => {
  const t = e.target;
  if (!t || !(t instanceof HTMLElement)) return;
  if (e.key !== 'Enter' && e.key !== ' ') return;
  if (t.getAttribute('role') === 'button' && t.tabIndex === 0) {
    e.preventDefault();
    t.click();
  }
});


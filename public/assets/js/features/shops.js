// Shops feature (render + filtering)

let shopMode = 'curated'; // 'curated' | 'osm'
let lastOsmResults = [];
let lastOsmSearch = null; // { mode: 'geo'|'place', origin, radius, keyword, place }
let osmPlaceOptionsOpen = true;

window.setShopMode = function setShopMode(mode, btn) {
  shopMode = mode;
  document.querySelectorAll('#shopModeChips .chip').forEach(c => c.classList.remove('on'));
  btn?.classList.add('on');
  const curated = document.getElementById('shopsCurated');
  const osm = document.getElementById('shopsOsm');
  curated?.classList.toggle('is-hidden', mode !== 'curated');
  osm?.classList.toggle('is-hidden', mode !== 'osm');
  if (mode === 'curated') window.renderShops();
  if (mode === 'osm') window.renderOsmShops();
};

window.toggleShopFilters = function toggleShopFilters() {
  const chips = document.getElementById('areaChips');
  chips?.classList.toggle('is-hidden');
};

window.toggleOsmPlaceOptions = function toggleOsmPlaceOptions(force) {
  osmPlaceOptionsOpen = typeof force === 'boolean' ? force : !osmPlaceOptionsOpen;
  const wrap = document.getElementById('osmPlaceWrap');
  const btn = document.getElementById('osmPlaceToggle');
  wrap?.classList.toggle('is-hidden', !osmPlaceOptionsOpen);
  if (btn) {
    btn.classList.toggle('on', osmPlaceOptionsOpen);
    btn.setAttribute('aria-expanded', osmPlaceOptionsOpen ? 'true' : 'false');
  }
  if (osmPlaceOptionsOpen) document.getElementById('osmPlace')?.focus();
};

function setOsmRetryVisible(on) {
  document.getElementById('osmActions')?.classList.toggle('is-hidden', !on);
}

window.retryOsmSearch = function retryOsmSearch() {
  if (!lastOsmSearch) return;
  if (lastOsmSearch.mode === 'place') window.searchOsmByPlace(true, lastOsmSearch.place);
  else window.searchOsmShops(true);
};

window.setArea = function setArea(btn) {
  areaFilter = btn.dataset.area;
  document.querySelectorAll('#areaChips .chip').forEach(c => c.classList.remove('on'));
  btn.classList.add('on');
  window.renderShops();
};

window.renderShops = function renderShops() {
  if (shopMode !== 'curated') return;
  const shops = window.SHOPS || [];
  const q = (document.getElementById('shopQ')?.value || '').toLowerCase();
  const list = document.getElementById('shopList');
  if (!list) return;

  const sourceLine = document.getElementById('shopSourceLine');
  if (sourceLine) {
    const src = window.__SHOPS_SOURCE || '—';
    const ts = typeof window.__SHOPS_CACHE_TS === 'number' ? window.__SHOPS_CACHE_TS : null;
    const ageMin = ts ? Math.max(0, Math.round((Date.now() - ts) / 60000)) : null;
    const left = lang === 'zh' ? '資料來源' : 'Source';
    const right =
      src === 'google' ? (lang === 'zh' ? 'Google Sheet（已同步）' : 'Google Sheet (synced)') :
      src === 'cache' ? (lang === 'zh' ? `快取${ageMin !== null ? ` · ${ageMin} 分鐘前` : ''}` : `Cache${ageMin !== null ? ` · ${ageMin} min ago` : ''}`) :
      src === 'local' ? (lang === 'zh' ? '本機備用資料' : 'Local fallback') :
      (lang === 'zh' ? '—' : '—');
    sourceLine.textContent = `${left}: ${right}`;
  }

  const filtered = shops.filter(s => {
    const aMatch = areaFilter==='all' || s.area===areaFilter || (areaFilter==='online' && s.online);
    const qMatch = !q || s.nameZh.includes(q) || s.nameEn.toLowerCase().includes(q) || s.areaZh.includes(q) || s.areaEn.toLowerCase().includes(q);
    return aMatch && qMatch;
  });

  list.innerHTML = filtered.map(s => {
    const name = lang==='zh' ? s.nameZh : s.nameEn;
    const area = lang==='zh' ? s.areaZh : s.areaEn;
    const hrs = lang==='zh' ? s.hrsZh : s.hrsEn;
    const desc = lang==='zh' ? s.descZh : s.descEn;
    const tags = (lang==='zh' ? s.tagsZh : s.tagsEn).map(t => {
      const cls = t.includes('手染')||t.includes('Hand') ? 'stag-purple'
        : t.includes('網')||t.includes('Online') ? 'stag-blue'
        : t.includes('班')||t.includes('Class')||t.includes('Heritage')||t.includes('字號') ? 'stag-orange'
        : t.includes('平')||t.includes('Afford') ? 'stag-gold' : 'stag-green';
      return `<span class="stag ${cls}">${t}</span>`;
    }).join('');
    const ratingHtml = s.rating
      ? `★ ${s.rating}`
      : `<span style="font-size:10px;color:var(--ink3)">${lang==='zh'?'未評分':'Not rated'}</span>`;
    const statusHtml = `<span class="status-dot ${s.status==='open'?'dot-green':'dot-amber'}"></span>${lang==='zh'?(s.status==='open'?'已確認':'建議致電確認'):(s.status==='open'?'Verified':'Call ahead')}`;
    const links = [];
    if (s.web) links.push(`<a class="act-btn" href="${s.web}" target="_blank" rel="noopener noreferrer">↗ ${lang==='zh'?'網店':'Website'}</a>`);
    if (s.ig) links.push(`<a class="act-btn" href="https://instagram.com/${s.ig}" target="_blank" rel="noopener noreferrer">IG</a>`);
    if (s.tel) links.push(`<a class="act-btn" href="tel:${s.tel}">${lang==='zh'?'致電':'Call'}</a>`);
    return `<div class="shop-card">
      <div class="shop-top"><div><div class="shop-name">${name}</div><div class="shop-area">${area}</div></div><div class="shop-rating">${ratingHtml}</div></div>
      <div class="tag-row">${tags}</div>
      <div class="shop-desc">${desc}</div>
      <div class="shop-addr">${s.addr}</div>
      <div class="shop-hrs">${hrs} · ${statusHtml}</div>
      ${links.length ? `<div class="shop-actions">${links.join('')}</div>` : ''}
    </div>`;
  }).join('') || `<div style="text-align:center;padding:32px;color:var(--ink3);font-size:14px;">${lang==='zh'?'找不到舖頭':'No shops found'}</div>`;
};

function setOsmStatus(msg) {
  const el = document.getElementById('osmStatus');
  if (!el) return;
  el.textContent = msg || '';
}

function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function normalizeOsmElement(el) {
  const tags = el.tags || {};
  const name = tags.name || tags['name:en'] || tags['name:zh'] || tags['name:ja'] || null;
  const lat = el.lat ?? el.center?.lat ?? null;
  const lon = el.lon ?? el.center?.lon ?? null;
  if (!name || lat === null || lon === null) return null;

  const kind =
    tags.shop ? `shop=${tags.shop}` :
    tags.craft ? `craft=${tags.craft}` :
    tags.amenity ? `amenity=${tags.amenity}` : null;

  return {
    id: `${el.type}/${el.id}`,
    name,
    lat,
    lon,
    kind,
    addr: tags['addr:full'] || [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ') || null,
    website: tags.website || tags['contact:website'] || null,
    phone: tags.phone || tags['contact:phone'] || null
  };
}

window.renderOsmShops = function renderOsmShops() {
  const list = document.getElementById('osmShopList');
  if (!list) return;
  const osmLine = document.getElementById('osmSourceLine');
  if (osmLine) osmLine.textContent = lang === 'zh' ? '資料來源: OpenStreetMap（即時搜尋）' : 'Source: OpenStreetMap (live search)';
  if (!lastOsmResults.length) {
    list.innerHTML = `<div style="text-align:center;padding:32px;color:var(--ink3);font-size:14px;">${lang==='zh'?'按上面按鈕搜尋附近舖頭':'Tap the button above to search nearby'}</div>`;
    return;
  }
  list.innerHTML = lastOsmResults.map(s => {
    const dist = typeof s.distanceM === 'number'
      ? (s.distanceM >= 1000 ? `${(s.distanceM/1000).toFixed(1)} km` : `${Math.round(s.distanceM)} m`)
      : null;
    const mapLink = `https://www.openstreetmap.org/?mlat=${encodeURIComponent(s.lat)}&mlon=${encodeURIComponent(s.lon)}#map=18/${encodeURIComponent(s.lat)}/${encodeURIComponent(s.lon)}`;
    const gmapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.lat},${s.lon}`)}`;
    const actions = [];
    actions.push(`<a class="act-btn" href="${mapLink}" target="_blank" rel="noopener noreferrer">↗ OSM</a>`);
    actions.push(`<a class="act-btn" href="${gmapLink}" target="_blank" rel="noopener noreferrer">↗ ${lang==='zh'?'地圖':'Maps'}</a>`);
    if (s.website) actions.push(`<a class="act-btn" href="${escapeHtml(s.website)}" target="_blank" rel="noopener noreferrer">↗ ${lang==='zh'?'網站':'Website'}</a>`);
    if (s.phone) actions.push(`<a class="act-btn" href="tel:${escapeHtml(s.phone)}">${lang==='zh'?'致電':'Call'}</a>`);

    return `<div class="shop-card">
      <div class="shop-top">
        <div>
          <div class="shop-name">${escapeHtml(s.name)}</div>
          <div class="shop-area">${escapeHtml(s.kind || (lang==='zh'?'附近':'Nearby'))}${dist ? ` · ${escapeHtml(dist)}` : ''}</div>
        </div>
        <div class="shop-rating"><span style="font-size:10px;color:var(--ink3)">OSM</span></div>
      </div>
      <div class="shop-desc">${lang==='zh'?'來自 OpenStreetMap 的即時搜尋結果':'Live result from OpenStreetMap'}</div>
      ${s.addr ? `<div class="shop-addr">${escapeHtml(s.addr)}</div>` : ''}
      <div class="shop-hrs"><span class="status-dot dot-amber"></span>${lang==='zh'?'建議出發前確認營業時間':'Call ahead for hours'}</div>
      <div class="shop-actions">${actions.join('')}</div>
    </div>`;
  }).join('');
};

window.searchOsmShops = async function searchOsmShops() {
  setOsmRetryVisible(false);
  setOsmStatus(lang === 'zh' ? '取得定位中…' : 'Getting location…');
  const radius = Math.max(200, Math.min(20000, parseInt(document.getElementById('osmRadius')?.value || '1500', 10) || 1500));
  const keyword = (document.getElementById('osmKeyword')?.value || '').trim();

  if (!navigator.geolocation) {
    setOsmStatus(lang === 'zh' ? '此瀏覽器不支援定位。' : 'Geolocation not supported.');
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const origin = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    lastOsmSearch = { mode: 'geo', origin, radius, keyword, place: null };
    await runOverpass(origin, radius, keyword);
  }, () => {
    setOsmStatus(lang === 'zh' ? '未取得定位權限。' : 'Location permission denied.');
    setOsmRetryVisible(true);
  }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
};

async function geocodePlace(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1`;
  const res = await fetch(url, { headers: { 'accept': 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const hit = Array.isArray(json) ? json[0] : null;
  if (!hit?.lat || !hit?.lon) throw new Error('No results');
  return { lat: parseFloat(hit.lat), lon: parseFloat(hit.lon) };
}

async function runOverpass(origin, radius, keyword) {
  setOsmRetryVisible(false);
  setOsmStatus(lang === 'zh' ? '搜尋附近中…' : 'Searching nearby…');

  const base =
    `(
      nwr(around:${radius},${origin.lat},${origin.lon})[shop=wool];
      nwr(around:${radius},${origin.lat},${origin.lon})[shop=craft];
      nwr(around:${radius},${origin.lat},${origin.lon})[shop=haberdashery];
      nwr(around:${radius},${origin.lat},${origin.lon})[craft=knitting];
      nwr(around:${radius},${origin.lat},${origin.lon})[craft=sewing];
    );`;
  const kw = keyword ? `["name"~"${keyword.replace(/["\\]/g, '')}",i]` : '';
  const query = `[out:json][timeout:25];(${base.replace(/\n/g, '')})${kw}out center tags;`;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: `data=${encodeURIComponent(query)}`
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const els = Array.isArray(json?.elements) ? json.elements : [];
    const normalized = els.map(normalizeOsmElement).filter(Boolean);

    const seen = new Set();
    const out = [];
    for (const s of normalized) {
      const key = `${s.name.toLowerCase()}|${s.lat.toFixed(5)}|${s.lon.toFixed(5)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ ...s, distanceM: haversineMeters(origin, { lat: s.lat, lon: s.lon }) });
    }
    out.sort((a, b) => (a.distanceM ?? 0) - (b.distanceM ?? 0));

    lastOsmResults = out.slice(0, 30);
    setOsmStatus(
      lastOsmResults.length
        ? (lang === 'zh' ? `找到 ${lastOsmResults.length} 間（半徑 ${radius}m）` : `Found ${lastOsmResults.length} within ${radius}m`)
        : (lang === 'zh' ? '附近找不到結果（可加大半徑試試）' : 'No results nearby (try a larger radius)')
    );
    window.renderOsmShops();
  } catch (e) {
    setOsmStatus(lang === 'zh' ? '搜尋失敗（OSM 服務可能繁忙），請稍後再試。' : 'Search failed (OSM service busy). Try again.');
    setOsmRetryVisible(true);
  }
}

window.searchOsmByPlace = async function searchOsmByPlace(shouldRun, placeOverride) {
  if (!shouldRun) {
    document.getElementById('osmPlace')?.focus();
    return;
  }
  setOsmRetryVisible(false);
  const place = (placeOverride ?? document.getElementById('osmPlace')?.value ?? '').trim();
  if (!place) {
    setOsmStatus(lang === 'zh' ? '請輸入地區／城市。' : 'Enter an area/city.');
    setOsmRetryVisible(true);
    return;
  }
  const radius = Math.max(200, Math.min(20000, parseInt(document.getElementById('osmRadius')?.value || '1500', 10) || 1500));
  const keyword = (document.getElementById('osmKeyword')?.value || '').trim();
  setOsmStatus(lang === 'zh' ? '尋找地點中…' : 'Finding place…');
  try {
    const origin = await geocodePlace(place);
    lastOsmSearch = { mode: 'place', origin, radius, keyword, place };
    await runOverpass(origin, radius, keyword);
  } catch (e) {
    setOsmStatus(lang === 'zh' ? '搵唔到呢個地點（試下輸入更大範圍，例如「Tokyo」）。' : 'Could not find that place (try a broader name like “Tokyo”).');
    setOsmRetryVisible(true);
  }
};


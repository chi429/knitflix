## Knitflix

Knitting & crochet toolkit for Hong Kong · 織冷工具箱 (plain HTML/CSS/JS on Vite).

### Run locally

From the project folder:

```bash
cd "/Users/gracelee/Documents/GitHub/knitflix"
npm install
npm run dev
```

Open:
- Vite opens `http://localhost:5173/app/` automatically

Legacy redirect:
- `http://localhost:5173/knitflix.html` → `/app/`

### Project structure

Site: `knitflix.gracelee.me` (Vercel, deploys from `main`).

- `index.html`: the landing page at `/` (for now a redirect to `/app/`)
- `app/index.html`: the toolkit at `/app/` — six tools, one per URL hash: `#home` `#calc` `#rows` `#shops` `#wiki` `#ref`
- `knitflix.html`: redirect for the legacy URL
- `public/`: served as-is at the domain root (no bundling — the scripts are classic, not modules)
  - `assets/css/tokens.css`: colours, type, spacing (shared by app and landing)
  - `assets/css/app.css`: app styles (components)
  - `assets/js/app.js`: core app logic (navigation + hash routing, lang toggle, counter, calc, toast)
  - `assets/js/data/fibers.js`, `reference.js`, `shops.js`: datasets
  - `assets/js/features/shops.js`, `wiki.js`, `reference.js`: rendering per tool
  - `assets/data/shops.json`: local fallback shop dataset
  - `site.webmanifest`: PWA manifest (`start_url` is `/app/`)
- `vite.config.js`: three HTML entries (`/`, `/app/`, `knitflix.html`), `base: '/'`

Open `http://localhost:5173/app/` in dev.

### Shops data (Google Sheet + Apps Script)

This app can load shop data from a Google Sheet via a Google Apps Script web app that returns JSON.

- **Remote (preferred)**: set `window.SHOPS_ENDPOINT` in `index.html` to your Apps Script URL
- **Fallback**: `assets/data/shops.json` if the endpoint is blank/unreachable

#### Sheet tab name + columns

Create a tab named **`shops`** with a header row containing these columns:

`nameZh, nameEn, area, areaZh, areaEn, addr, hrsZh, hrsEn, tel, rating, web, ig, tagsZh, tagsEn, descZh, descEn, online, status`

For `tagsZh` / `tagsEn`, use `|` separated text like `實體店|教班|老字號`.

#### Apps Script (Code.gs)

Create a new Apps Script project, then deploy as a **Web app** (Execute as: Me; Who has access: Anyone).

```js
const SHEET_NAME = 'shops';

function doGet() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return jsonOut({ error: `Missing sheet tab: ${SHEET_NAME}` }, 404);
  }

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return jsonOut([], 200);

  const headers = values[0].map(h => String(h || '').trim());
  const rows = values.slice(1);

  const data = rows
    .filter(r => r.some(cell => String(cell || '').trim() !== ''))
    .map(r => rowToShop(headers, r));

  return jsonOut(data, 200);
}

function rowToShop(headers, row) {
  const o = {};
  headers.forEach((h, i) => (o[h] = row[i]));

  const toStr = (v) => (v === null || v === undefined ? '' : String(v)).trim();
  const toNullStr = (v) => {
    const s = toStr(v);
    return s ? s : null;
  };
  const toBool = (v) => {
    const s = toStr(v).toLowerCase();
    return s === 'true' || s === 'yes' || s === 'y' || s === '1';
  };
  const toNumOrNull = (v) => {
    const s = toStr(v);
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };
  const toTags = (v) => {
    const s = toStr(v);
    return s ? s.split('|').map(t => t.trim()).filter(Boolean) : [];
  };

  return {
    nameZh: toStr(o.nameZh),
    nameEn: toStr(o.nameEn),
    area: toStr(o.area),
    areaZh: toStr(o.areaZh),
    areaEn: toStr(o.areaEn),
    addr: toStr(o.addr),
    hrsZh: toStr(o.hrsZh),
    hrsEn: toStr(o.hrsEn),
    tel: toNullStr(o.tel),
    rating: toNumOrNull(o.rating),
    web: toNullStr(o.web),
    ig: toNullStr(o.ig),
    tagsZh: toTags(o.tagsZh),
    tagsEn: toTags(o.tagsEn),
    descZh: toStr(o.descZh),
    descEn: toStr(o.descEn),
    online: toBool(o.online),
    status: toStr(o.status) || 'verify'
  };
}

function jsonOut(obj, status) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Deploy (GitHub Pages)

1. Push this repo to GitHub.
2. In GitHub: **Settings → Pages**
3. **Source**: Deploy from a branch
4. **Branch**: `main` and **Folder**: `/ (root)`
5. Save, then wait for the Pages URL to appear.

Then the page will be available at:
- `.../` (recommended)
- `.../knitflix.html`


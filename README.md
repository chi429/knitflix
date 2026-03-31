## Knitflix

Cute pastel knitting & crochet toolkit prototype (HTML/CSS/JS).

### Run locally

From the project folder:

```bash
cd "/Users/gracelee/Documents/GitHub/knitflix"
npm install
npm run dev
```

Open:
- Vite will open the app automatically, or visit `http://localhost:5173/`

Legacy redirect:
- `http://localhost:5173/knitflix.html`

### Project structure

- `index.html`: main UI markup
- `knitflix.html`: redirect for legacy URL
- `assets/css/app.css`: app styles (theme + components)
- `assets/js/app.js`: core app logic (navigation, lang toggle, counter, calc, toast)
- `assets/data/shops.json`: local fallback shop dataset
- `assets/js/data/fibers.js`: fiber wiki dataset (`window.FIBERS`, icons, labels)
- `assets/js/features/shops.js`: shops rendering/filtering
- `assets/js/features/wiki.js`: wiki rendering/search

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


# Receipt Analyzer

Personal-finance receipt tracker PWA. Snap a receipt, Claude parses it, store in IndexedDB, export to CSV.

**Phase: v1.0** — local-only (no Google Sheets / Drive yet). See `receipt-analyzer-spec.md` §0 for the v1.0/v1.1/v1.2 split.

## Dev

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
npm run preview  # serve dist/ on local network
```

## First-run setup (in the app)

1. Open Settings → paste your Claude API key (get one at https://console.anthropic.com/)
2. Capture screen → Camera or Gallery
3. Tap a parsed receipt thumbnail → review/edit → Save
4. List screen → Export CSV

## Install on iPhone

1. `npm run build && npm run preview` — serves on your LAN
2. Open the network URL it prints in Safari on the phone
3. Share → Add to Home Screen

For real deployment, see spec §15 (GitHub Pages).

## v1.0 limitations (by design)

- No Google Sheets sync (use CSV export → open in Sheets manually for now)
- No Drive photo backup (photos live only on the device — export CSV often, treat IndexedDB as ephemeral)
- No analytics dashboard, no duplicate detection
- Bulk gallery upload works but each receipt needs individual review/save in v1.0

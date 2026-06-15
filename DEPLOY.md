# Deploy (Cloudflare Workers, Static Assets)

Cloudflare bygger `main` slik:

- **Build command:** `bash build.sh`  (lager `dist/` med kun app-filene)
- **Deploy command:** `npx wrangler deploy`  (leser `wrangler.jsonc` → publiserer `dist/`)
- **Root directory:** `/`

`build.sh` kopierer index.html, styles.css, content.js, service-worker.js,
manifest.webmanifest, `_headers`, `js/` og `assets/` til `dist/`. `.git`,
tester og dokumenter publiseres aldri.

Lokalt: `bash build.sh && npx wrangler deploy --dry-run`

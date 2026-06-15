#!/usr/bin/env bash
# Bygger en ren publiseringsmappe (dist/) med KUN det appen trenger i drift.
# SporLab har ingen kompilering — dette er bare en kopiering, så .git, tester,
# dokumenter og deploy-konfig aldri havner på nett. Brukes av Cloudflare som
# Build command (Deploy command: npx wrangler deploy).
set -euo pipefail

rm -rf dist
mkdir -p dist

# Enkeltfiler i roten
cp index.html styles.css content.js service-worker.js manifest.webmanifest _headers dist/

# Kataloger
cp -R js dist/
cp -R assets dist/

# Cache-versjonering: erstatt placeholderen i service-worker.js med en hash av
# app-innholdet (alt unntatt service-worker.js selv). Da endrer SW-filens
# bytes seg automatisk når noe annet endres, og brukerne får "ny versjon"-
# varselet uten at noen må huske å bumpe et versjonsnummer manuelt.
HASH=$(find dist -type f ! -name service-worker.js -print0 | sort -z | xargs -0 cat | sha256sum | cut -c1-12)
sed -i.bak "s/__BUILD_HASH__/${HASH}/" dist/service-worker.js
rm -f dist/service-worker.js.bak

echo "dist/ bygget med $(find dist -type f | wc -l | tr -d ' ') filer. SW-cache: sporlab-e8-e9-${HASH}"

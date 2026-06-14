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

echo "dist/ bygget med $(find dist -type f | wc -l | tr -d ' ') filer."

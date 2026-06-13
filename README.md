# SporLab E8/E9

Interaktivt lese- og felthefte basert på `Lesehefte ettersøkning: E8 Sporoppsøk og E9 Spor`.

## Åpne appen

Appen er statisk, men bruker ES-moduler og må derfor serveres over HTTP
(`file://` fungerer ikke). Lokalt holder det med for eksempel:

```
npx serve .
```

og så åpne adressen som vises (typisk http://localhost:3000).

## Publiser på Netlify

1. Gå til Netlify og velg å legge ut et nytt nettsted.
2. Dra hele denne mappen inn i Netlify sin manuelle deploy, eller koble mappen til et Git-repo.
3. Netlify skal bruke `.` som publiseringsmappe. Det er allerede satt i `netlify.toml`.
4. Når Netlify gir deg en nettadresse, kan den deles direkte eller som QR-kode.
5. På mobil kan brukerne åpne lenken og velge "Legg til på hjemskjerm".

## Innhold

Appen er bygget rundt to likeverdige moduler som forsterker hverandre, koblet
i data og pedagogikk. Bunnmenyen har fem mål — **Oversikt · Lær · + · Felt ·
Oppslag** — der «+» åpner planlegging eller hurtiglogg. Du vet alltid om du er
i lærings- eller feltmodus (farget topplinje og fane).

**Læringsmodul (Lær)** — et interaktivt kurs du jobber deg gjennom:

- Læringsløype med åtte temaer i myk rekkefølge: progresjonsring, tydelig
  «hvor er du» og «neste steg»
- Hvert tema har Kjernen, Teoridykk, Ute i felt og Refleksjon, kontrollspørsmål
  (quiz) og «marker som mestret»
- Tre statuslys per tema: **Lest** (teori), **Quiz** (kontroll) og **Trent**
  (felt) — det siste kommer fra feltmodulen

**Praktisk verktøy (Felt)** — planlegging og loggføring av reell trening:

- Lagrede øktplaner (med feltmodus, utskrift og QR-deling)
- Hurtiglogg bygget for felt: store treffflater, ett tema per skjerm, «logg
  neste hund» for lagstrening
- Hele treningsloggen med filtre

**Koblingen mellom modulene er kjernen:**

- En logget økt krediterer riktig tema og markerer det som «trent på»
- Et lest-men-utrent tema foreslås øverst som fokus når du planlegger
- **Oversikt** viser teori og praksis samlet (broen), med full progresjonsside
  (grafer, eksamensklarhet og instruktørdeling)

**Oppslag** støtter begge: søkbare fagkort med sidehenvisninger, i detaljark
med snarvei til modulen.

Data lagres lokalt i nettleseren.

Appen er klargjort som PWA med `manifest.webmanifest`, appikoner og
`service-worker.js`. Etter første åpning kan mye av appen brukes offline.

## Tester

Kjernelogikken (migrering, import/eksport, CSV og quiz) er dekket av tester
basert på Nodes innebygde testkjører — ingen avhengigheter eller byggesteg.
Kjør dem fra prosjektmappen med:

```
node --test
```

Testene ligger i `tests/` og importerer ES-modulene i `js/` direkte (se
`tests/helpers/load-app.js`). `tests/`-mappen trengs ikke i deploy-zipen.

Koden er delt i ES-moduler: `js/state.js` (tilstand/persistens/migrering),
`js/utils.js` (hjelpere), `js/snapshot.js` (deling/import/CSV), `js/quiz.js`
(quizlogikk) og `js/app.js` (UI og oppstart). `content.js` eksporterer alt
fag- og quizinnholdet. Modulene er typesjekket med `@ts-check` og JSDoc-typer
(Plan, Log, QuizQuestion, State m.fl.). Kjør sjekken med:

```
npx -p typescript tsc -p jsconfig.json
```

(NB: rene `npx tsc` treffer en utdatert navnebror-pakke på npm.)
`jsconfig.json` og `types/globals.d.ts` brukes bare av typesjekken og trengs
ikke i deploy-zipen.

## Profil

Visuelt uttrykk er tilpasset NRH-profilmanualen med NRH blå, mørkeblå og lyseblå,
plusstegnet som grafisk element og fontvalg som prioriterer Source Sans Pro /
Bebas Neue når fontene finnes på maskinen. Appen bruker original Romerike-logo
lagt i `assets/`.

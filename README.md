# SporLab E8/E9

Interaktivt lese- og felthefte basert på `Lesehefte ettersøkning: E8 Sporoppsøk og E9 Spor`.

## Åpne appen

Åpne `index.html` i en nettleser. Appen er statisk og trenger ingen server.

## Publiser på Netlify

1. Gå til Netlify og velg å legge ut et nytt nettsted.
2. Dra hele denne mappen inn i Netlify sin manuelle deploy, eller koble mappen til et Git-repo.
3. Netlify skal bruke `.` som publiseringsmappe. Det er allerede satt i `netlify.toml`.
4. Når Netlify gir deg en nettadresse, kan den deles direkte eller som QR-kode.
5. På mobil kan brukerne åpne lenken og velge "Legg til på hjemskjerm".

## Innhold

- Læringsløype med fem moduler og quiz
- Utvidet teoridel med faglige fordypninger fra heftet
- Feltmodus med sjekklister og momentkort
- Øktplanlegger for praktiske spor- og sporoppsøksøkter
- Lokal treningslogg for hund/fører/lag
- Søkbare fagkort med sidehenvisninger til heftet

Data lagres lokalt i nettleseren.

Appen er klargjort som PWA med `manifest.webmanifest`, appikoner og
`service-worker.js`. Etter første åpning kan mye av appen brukes offline.

## Profil

Visuelt uttrykk er tilpasset NRH-profilmanualen med NRH blå, mørkeblå og lyseblå,
plusstegnet som grafisk element og fontvalg som prioriterer Source Sans Pro /
Bebas Neue når fontene finnes på maskinen. Appen bruker original Romerike-logo
lagt i `assets/`.

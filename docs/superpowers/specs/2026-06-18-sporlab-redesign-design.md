# SporLab E8/E9 — Redesign spec
**Dato:** 2026-06-18  
**Status:** Godkjent av Per, klar for implementasjonsplan  
**Kontekst:** Brainstorming-sesjon med Claude Code (Sonnet 4.6)

---

## Mål

Redesigne SporLab fra en to-dørsmeny til en sammenhengende **læringsplattform** som:
- Suger brukeren inn og beholder dem (retention-problem A)
- Gir mestringsfølelse og fremgangsglede (engagement-problem D)
- Kobler teori hjemme til praksis i skogen på en meningsfull måte
- Fungerer som et naturlig feltverktøy — ikke bare en nettside

Målgruppe: Hundeførere i NRH Romerike som trener E8 Sporoppsøk / E9 Spor. Laget består av 5–13 personer som trener to ganger i uken + egentrening.

---

## Kjerneløkken

```
Lær teori (hjemme)
  → Quiz (sjekk forståelse)
  → Planlegg økt (fokus fra det du nettopp leste)
  → Tren i skogen (feltmodus)
  → Logg økt (rask, stor treffflate)
  → Se kobling (bro-øyeblikket: teori møter praksis)
  → Fremgang (mestringskurve, hundens utvikling)
  → Neste tema låses opp
```

---

## Informasjonsarkitektur

### Navigasjon (bunnmeny, 5 elementer)

| Posisjon | Tab | Ikon | Funksjon |
|---|---|---|---|
| 1 | Hjem | `ti-home` | Progress-hub, neste steg, siste aktivitet |
| 2 | Lær | `ti-book` | Kursmoduler, teori, quiz |
| 3 (senter) | Felt (FAB) | `ti-trees` | Kontekstsensitiv: planlegg eller logg |
| 4 | Fremgang | `ti-chart-line` | Mestringskurve, hundestatistikk |
| 5 | Oppslag | `ti-search` | Søkbare fagkort fra heftet |

### Views (beholdes fra eksisterende arkitektur, redesignes)

| View-ID | Ny rolle |
|---|---|
| `dashboardView` | Hjem-skjerm (kursvei, neste steg, aktivitetsfeed) |
| `learnView` | Læringsmodul-oversikt + leksjonsskjerm |
| `quizView` | Quiz integrert i læringsmodulen |
| `trainingView` | Erstattes av Felt-fane (planlegger + logghistorikk) |
| `plannerView` | Wizard, redesignet, nåes fra Felt-fane |
| `logView` | Hurtiglogg, feltoptimalisert |
| `progressView` | Fremgang-fane (grafer, hundestatistikk) |
| `referenceView` | Oppslag-fane (uendret funksjonalitet) |
| `settingsView` | Uendret |

---

## Seksjon 1: Hjem-skjermen

### Tre soner

**1. Kursvei-stripe (øverst, mørk NRH-bakgrunn)**
- Horisontal stripe med 8 punkter (ett per modul)
- Fullførte: fylt blå ring med hake
- Aktiv: hvit ring med gul kant og modulnummer (amber, `#EF9F27`)
- Låste: halvgjennomsiktig ring
- Koblende linjer mellom punktene fylles blå etterhvert som moduler fullføres
- Animeres inn ved app-åpning: tegner seg fra venstre til høyre (400ms, ease-out)

**2. Neste steg-kort (midten)**
- Tittel: modulnavn og nummer ("Tema 4 av 8: Sporarbeid i hardt underlag")
- Tre statuslinjer med ikon: Teori lest · Quiz bestått · Trent i felt
- Fullførte linjer: blå, ikon `ti-check`
- Manglende linjer: grå, ikon `ti-minus`
- Primærknapp endrer seg etter hva som mangler: "Les teori" → "Ta quiz" → "Planlegg økt"
- Alle tre grønne: "Gå til Tema 5" låser opp neste modul med animasjon

**3. Siste aktivitet-liste (bunnen)**
- 2–3 rader med ikonede aktivitetsinnslag
- Viser bro-koblinger: "Tema 3 fullført · Lest · Quiz · Trent 14. juni"
- Viser loggede økter: dato, hundenavn, vurdering
- Viser leste temaer som ennå ikke er trent (amber-ikon, "planlegg økt"-snarvei)

---

## Seksjon 2: Lær-modulen

### Moduloversikt

- Grid av 8 modul-kort
- Fullførte: grønn ramme, grønn hake, lett transparent bakgrunn
- Aktiv: blå ramme, "Aktiv"-pill, fremgangsindikator
- Låste: grå, lås-ikon, halvgjennomsiktig — ikke klikkbare
- Progresjonsbar øverst: "3 av 8 fullført — 37 %"

### Leksjonsskjerm (per modul)

Fire trinn i rekkefølge, vist som accordion eller stepper:

**Trinn 1 — Kjerne (Les)**
- 3–5 nøkkelpunkter i kort format
- "Teoridykk"-ekspander for den som vil dypere (eksisterende `<details>`)
- Lese-tid estimat (f.eks. "ca. 5 min")
- Merkad som lest ved scroll til bunnen eller manuell bekreftelse

**Trinn 2 — Quiz**
- 3–5 spørsmål, ett om gangen
- Stort spørsmål (clamp 1.4–2rem)
- 4 svarsalternativer som store, klikkbare kort
- Umiddelbar tilbakemelding + forklaring
- Bestått ved ≥ 60 %. Kan repeteres.
- Animasjon ved riktig svar: kort grønn flash + hake

**Trinn 3 — Til skogen**
- Én setning: hva du skal se etter ute (pre-brief)
- Knapp: "Planlegg økt for dette temaet" → sender til planlegger med tema forhåndsvalgt

**Trinn 4 — Mester**
- Tilgjengelig etter trinn 1–3
- Knapp: "Marker som mestret"
- Trigger: **Fullføring-seremoni** (se Seksjon 5)

---

## Seksjon 3: Felt-fanen

### Visuell modus-endring

Felt-fanen skifter til mørk layout:
- Bakgrunn: `#042C53` (mørk NRH-marineblå)
- Tekst: hvit / `#B5D4F4`
- Overgang: smooth fade (250ms) når fanen aktiveres

### Planlegger (3-stegs wizard, redesignet)

**Steg 1 — Velg fokus**
- Foreslått tema øverst (det du har lest men ikke trent, med forklaring)
- Liste over andre tilgjengelige temaer
- Kompakt teorisammendrag for valgt tema (1–3 kulepunkter)

**Steg 2 — Øktdetaljer**
- Dato (forhåndsutfylt dagens dato)
- Type (Spor / Sporoppsøk / Momenttrening / Frisøk)
- Liggetid, underlag, vind — store chip-knapper, ikke dropdowns
- 3 observasjonspunkter (forhåndsutfylt fra temaets feltpunkter)

**Steg 3 — Plan klar**
- Oppsummering av øktplanen
- Del som QR / skriv ut / kopier (eksisterende funksjonalitet beholdes)
- "Start økt"-knapp → åpner hurtiglogg med planen koblet inn

### Hurtiglogg (feltoptimalisert)

- Mestringsrating: 5 store stjerner (min 56px treffflate)
- Vær: 5 store chip-knapper på én rad
- 3 observasjonsfelt med prompt fra plan
- "Neste hund"-knapp for lagtrening (eksisterende funksjon)
- Lagre-knapp: full bredde, 56px, tydelig primær
- Alle inputs: min-height 48px, font-size 16px (hindrer iOS-zoom)

---

## Seksjon 4: Bro-øyeblikket og animasjoner

### Fullføring-seremoni (etter "Marker som mestret")

1. Full-screen overlay glir inn (fade + scale fra 0.95 til 1.0, 300ms)
2. Modulnummer og tittel
3. Animert ring fyller seg fra 0 til 100 % (600ms, ease-out, NRH-blå)
4. Tekst: "Tema 4 fullført"
5. Subtil burst-animasjon: 8–12 små prikker spretter ut fra ringen (CSS keyframes)
6. "Neste tema er nå tilgjengelig" (hvis relevant)
7. Lukkes automatisk etter 3 sekunder, eller ved trykk

### Bro-bekreftelse (etter loggføring av en økt)

Aktiveres når logget økt kobles til et modul-tema som var lest men ikke trent:

1. Full-screen overlay: mørk blå bakgrunn
2. Ikon: `ti-check` i stor grønn ring
3. Tekst: *"Teori møter praksis"*
4. Undertekst: *"Tema 4 er nå trent på med Juno."*
5. Progresjonsringen på Hjem oppdateres synlig når overlay lukkes

### Øvrige animasjoner

| Element | Animasjon | Varighet |
|---|---|---|
| View-bytte | `translateY(8px) → 0` + `opacity 0 → 1` | 260ms ease-out |
| Kursvei-inngang | Linje tegner seg fra venstre, punkter popper inn | 400ms ease-out |
| Quiz riktig svar | Grønn flash på valgt kort | 200ms |
| Modul låses opp | Lås-ikon fades ut, ring animeres inn | 350ms |
| Progresjonsring | Conic-gradient animerer fra forrige til ny prosent | 500ms |
| Felt-modus-bytte | Bakgrunn cross-fader fra lys til mørk | 250ms |
| Splash/onboarding | Ambient MP4-loop (lav filstørrelse, autoplay muted) | Loop |

Alle animasjoner respekterer `prefers-reduced-motion: reduce`.

---

## Seksjon 5: Visuelt språk

### Fargepalett (beholdes fra NRH-profil)

```css
--blue:        #0077da   /* NRH Blå — primærhandling */
--blue-2:      #005fab   /* Mørkere blå — hover */
--dark-blue:   #0a2850   /* Mørkeblå — headers, felt-bakgrunn */
--navy:        #042C53   /* Dypeste navy — felt-modus, status-bar */
--light-blue:  #d4edfc   /* Lyseblå — tint-bakgrunner */
--amber:       #f4c542   /* Eneste varme aksent — achievements, streak */
```

### Typografi

- **Display:** Bebas Neue (selvhostet, allerede i `assets/fonts/`)
- **Body:** Source Sans 3 (selvhostet, allerede i `assets/fonts/`)
- Ingen nye fonter introduseres

### Glassmorfisme-komponenter

Brukes på kort som ligger over mørke bakgrunner (Felt-modus, splash):
```css
background: rgba(255, 255, 255, 0.08);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.15);
```
Fallback for nettlesere uten `backdrop-filter`: solid `#0C447C`.

### Felt-modus-layout

- Bakgrunn `#042C53`
- Tekst `#eaf3fc`
- Inputs: mørke bakgrunner med hvit tekst
- Alle knapper min-height 56px
- Subtilt trestruktur-bakgrunnsmotiv (SVG inline, opacity 0.04)

### Splash/onboarding (første åpning)

- Ambient MP4-loop av spor/skog i bakgrunnen (autoplay, muted, loop, <500KB)
- Velkomstkort i forgrunnen med glassmorfisme
- Eksisterende intro-slide-logikk beholdes, kledd i nytt design
- Fallback: mørk gradient

---

## Seksjon 6: Team og sosial (fase 2)

Ikke implementert i fase 1, men designet for det:
- Alle NRH-medlemmer har Microsoft-konto via NRH-medlemskapet
- Fase 2: Microsoft-login (MSAL) + sky-sync via Cloudflare Workers + D1
- Sosial: lagsamlet fremgang (ikke individuell konkurranse), instruktør kan dele ukens fokustema
- UI-komponenter er designet med "tom tilstand" der sosiale data vil vises

---

## Tekniske rammer

- **Stack:** Beholdes. Statisk HTML/CSS/JS ES-moduler. Ingen nye rammeverk.
- **Ingen nye avhengigheter** uten eksplisitt begrunnelse.
- **State-skjema:** Ingen endringer i localStorage-skjema i fase 1. Animasjoner og UI-lag er rent presentasjonslag.
- **PWA/SW:** Ingen endringer i service-worker cache-logikk.
- **Arbeidsgrein:** All implementasjon skjer på feature-branch, aldri direkte på `main`.
- **Tester:** Alle eksisterende tester (`node --test`) skal passere etter endringer.
- **Typesjekk:** `npx -p typescript tsc -p jsconfig.json` skal passere.

---

## Hva som IKKE endres i fase 1

- `content.js` — innholdsstruktur og fagkortdata
- `js/state.js` — localStorage-skjema og migrasjoner
- `js/quiz.js` — quizlogikk
- `js/snapshot.js` — import/eksport/CSV
- `service-worker.js` — cache-strategi
- `wrangler.jsonc` / `build.sh` — deploy-konfig

---

## Implementasjonsprioritering

### Fase 1a — Struktur og navigasjon (høyest prioritet)
1. Ny bunnmeny med 5 tabs (Hjem, Lær, Felt-FAB, Fremgang, Oppslag)
2. Hjem-skjerm med kursvei-stripe og neste steg-kort
3. Lær-modulen med stepper (les → quiz → til skogen → mester)
4. Felt-fane med mørk visuell modus

### Fase 1b — Animasjoner og polish
5. Fullføring-seremoni (ring + burst)
6. Bro-bekreftelse overlay
7. Kursvei inn-animasjon
8. Felt-modus-overgang

### Fase 1c — Visuelle detaljer
9. Glassmorfisme-komponenter
10. Ambient video-loop splash
11. Illustrerte modul-ikoner
12. Mikrointeraksjoner (quiz-svar, knapper)

---

## Suksesskriterier

- Hundeførere returnerer til appen mellom treninger (retention)
- Terskelen for å starte en økt er lavere (wizard er raskere)
- Bro-øyeblikket registreres og oppleves som meningsfull belønning
- Appen føles som et produkt man er stolt av å bruke
- Alle eksisterende funksjoner fungerer som før

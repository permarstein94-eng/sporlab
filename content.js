import { escapeHtml } from "./js/utils.js";

export const modules = [
  {
    id: "grunnlag",
    title: "1. Grunnlaget",
    pages: "s. 3-5",
    minutes: 12,
    tags: ["motivasjon", "utfordring", "hjelp"],
    summary:
      "På aksjon er sporene eldre, været annet og miljøet ukjent. Treningen må strekkes lenger enn prøvene — og hunden må få jobbe selv mens den prøver å løse oppgaven.",
    learn: [
      "Uten sporoppsøk får dere ikke begynt. Sporoppsøket er starten på alt sporarbeid.",
      "På aksjon møter dere eldre spor, dårligere vær og ukjent terreng. Tren under forhold som ligner det.",
      "Hvis hunden går for fort og unøyaktig, gjør oppgaven vanskeligere. Ikke hold igjen i linen.",
      "Støtt hunden mens den jobber. Når den snur seg og spør, stå rolig.",
    ],
    field: "Velg én ting som skal være vanskeligere denne økta — alder, underlag, vind, forstyrrelser eller oppsøkstype. Bare én.",
    reflection: "Hva er hundens beste forsterker, og når blir den så høyverdi at konsentrasjonen taper?",
    drill: {
      title: "Strekk én variabel",
      focus: "gamle-spor",
      duration: "30-40 min",
      description: "Legg et spor som er litt for vanskelig for hunden: dobbel liggetid av det dere pleier. Hold alt annet kjent. Mål: at oppgaven kommuniserer roen, ikke linen.",
    },
  },
  {
    id: "spor",
    title: "2. Sporarbeidet",
    pages: "s. 6-10",
    minutes: 16,
    tags: ["luktbilde", "underlag", "belønning"],
    summary:
      "Sporet er ikke én lukt. Hunden bruker det som er enklest å følge i øyeblikket. Variert trening lærer den å håndtere endringer.",
    learn: [
      "Et to-timers spor og et tjuetimers spor lukter ulikt. Strekk alderen — gå over døgnet, ikke fra én til tre timer.",
      "Skog, grus, sti, hardt underlag, høy og lav vegetasjon: hver overgang er en egen oppgave. Planlegg dem.",
      "Det finnes flere innganger til sportreningen (godbitspor, spontanspor, kongbiter, slepespor, fertgrop). Velg det som passer hunden, ikke det som er trendy.",
      "Når noe ikke fungerer, sjekk belønningen først. For sterk gir uro, for svak gir stillstand.",
    ],
    field: "Loggfør underlag, liggetid, vind og belønning hver gang. Da skjønner du senere hvorfor noe gikk bra eller dårlig.",
    reflection: "Hvor i sporet endret hunden tempo, snusefrekvens eller linebruk?",
    drill: {
      title: "Underlagsovergang",
      focus: "gamle-spor",
      duration: "30 min",
      description: "Legg et spor som starter i skog og krysser hardt underlag (vei/sti) før det fortsetter. Ikke gjør sporet langt — fokuset er overgangen. Observer hva hunden gjør i selve byttet.",
    },
  },
  {
    id: "oppsok",
    title: "3. Sporoppsøk",
    pages: "s. 11-18",
    minutes: 18,
    tags: ["arbeidstegn", "bil", "gjenstand", "frisøk"],
    summary:
      "Sporoppsøk er en egen øvelse, ikke bare 'starten på sporet'. Hver variant (bil, gjenstand, bygning, frisøk) trenger sin egen plan.",
    learn: [
      "Bruk faste arbeidstegn — sporline frem, samme startprosedyre. Da skjønner hunden at nå skal vi spore.",
      "Fra bil: tenk førerdør og hjulkant som sannsynlig startpunkt. Tilpass etter underlag og forstyrrelser.",
      "Fra gjenstand: hold verdien av funnet høyt. Blir sporet mer attraktivt enn gjenstanden, hopper hunden over meldingen.",
      "Under frisøk kan hunden finne spor som ikke er den savnedes. Avtal på forhånd hva hunden skal gjøre — og hvor langt den skal følge.",
    ],
    field: "Avslutt funn/melding skikkelig før dere veksler. Kort pause, sporline frem, så sporoppsøk.",
    reflection: "Hvor var sporet et tydelig avvik i miljøet, og hvor ble det bare ett av mange spor?",
    drill: {
      title: "Oppsøk fra gjenstand",
      focus: "oppsok-gjenstand",
      duration: "30 min",
      description: "Legg en enkel teig med gjenstand, og et kort spor som starter ved gjenstanden. Tren overgangen funn → spor med tydelige arbeidstegn. Bruk sirkeloppsøk hvis området er tråkket.",
    },
  },
  {
    id: "gamle",
    title: "4. Gamle spor",
    pages: "s. 19-20",
    minutes: 10,
    tags: ["liggetid", "problemløsning", "hvile"],
    summary:
      "Døgn-gamle spor løser sjelden en aksjon, men de lærer hunden å jobbe rolig og metodisk når luktbildet er svakt. Det er overførbart til alt annet sporarbeid.",
    learn: [
      "Når liggetiden økes kraftig: hold sporlegger og underlag kjent. Endre bare én ting av gangen.",
      "Legg et kort 'læringsspor' først som introduserer dagens luktbilde. Etter hvile går dere et lengre.",
      "Belønningen skal ramme sporopplevelsen — ikke overskygge den. Kort og god, så bilen.",
      "Hvile er en del av læringen. Det hunden opplever mellom arbeid og hvile påvirker hva som fester seg.",
    ],
    field: "Legg gjerne to spor samme dag: ett kort læringsspor og ett lengre arbeidsspor med samme liggetid.",
    reflection: "Ble hunden roligere, mer metodisk eller bare mer frustrert da sporet ble eldre?",
    drill: {
      title: "To-spor-økt",
      focus: "gamle-spor",
      duration: "40-50 min (med hvile)",
      description: "Legg ett kort læringsspor (30-50 m) og ett lengre arbeidsspor (~250 m, to vinkler), begge med samme liggetid (1-2 døgn). Gå dem etter hverandre med kort hvile i bilen mellom.",
    },
  },
  {
    id: "retning",
    title: "5. Retningsbestemming",
    pages: "s. 21-23",
    minutes: 10,
    tags: ["retning", "analyse", "intensitet"],
    summary:
      "Hunden kan kjenne retningen i sporet, men bare hvis den får tid til å analysere. Høy intensitet gjør valget tilfeldig.",
    learn: [
      "Tre fotavtrykk er nok, sier forskningen heftet viser til. Problemet er ikke informasjon, men tid til å bruke den.",
      "Mer motivasjon gir mer intensitet, som gir mindre analyse. Det er en kjede du må kjenne på din egen hund.",
      "Metode 1: rolig start 10-15 cm fra fotavtrykkene. Hunden ligger og analyserer før den får gå.",
      "Metode 2: spor som krysser sti gjentatte ganger, med belønning bare i riktig retning. Hunden lærer ved valg.",
    ],
    field: "Hvis hunden alltid velger riktig, ikke kast bort økter på dette. Tren noe annet.",
    reflection: "Tar hunden din seg tid til å analysere før den velger retning, eller starter den i den retningen den tilfeldigvis står?",
    drill: {
      title: "Sporkryss over sti",
      focus: "retning",
      duration: "30 min",
      description: "Legg et spor som krysser samme sti 3-4 ganger, med minst 60 m mellom hver krysning. Belønning bare i riktig retning. Hunden lærer ved valg, ikke ved instruksjon.",
    },
  },
  {
    id: "sportap",
    title: "6. Sportap",
    pages: "s. 24-25",
    minutes: 10,
    tags: ["sportap", "lesiden", "systematikk"],
    summary:
      "Sportap kommer til å skje. Målet er at hunden stopper, faller av på lesiden og søker rasjonelt bakover — uten at fører forstyrrer.",
    learn: [
      "Når hunden mister sporet, ligger løsningen nesten alltid bak den.",
      "I sidevind faller hunden av på lesiden — ikke rett bak. Det er der dere må lete.",
      "Stå stille til hunden begynner å jobbe. Gå så rolig baklengs for å gi plass. Ikke vis svaret med kroppen.",
      "Momentøvelsen: 50-100 m spor, snu i eget spor, 10-15 m tilbake, hopp ut på lesiden, kort strekk til slutt.",
      "Sett flere slike moment etter hverandre i ett lengre spor. Mange repetisjoner gir rask læring.",
    ],
    field: "Stå stille når hunden jobber, gå bakover når du inviterer. Ikke vis svaret med kroppen.",
    reflection: "Når hunden mistet sporet sist, hvor lang tid tok det før den falt av på lesiden?",
    drill: {
      title: "Sportap-moment i sidevind",
      focus: "sportap",
      duration: "30 min",
      description: "Legg 50-100 m spor i sidevind, snu i eget spor, gå 10-15 m tilbake, hopp ut på lesiden. Sett 4-5 slike momenter etter hverandre. Mange repetisjoner gir rask læring.",
    },
  },
  {
    id: "kryssende",
    title: "7. Kryssende spor",
    pages: "s. 26-27",
    minutes: 8,
    tags: ["kryssende", "merkeband", "planlegging"],
    summary:
      "Hunden kan bytte spor fordi det andre er enklere eller mer interessant. Planlagte krysninger med belønning på rett valg lærer hunden at det lønner seg å holde seg på vårt spor.",
    learn: [
      "Hovedsporet merkes med merkeband akkurat der forstyrrelsessporet skal krysse. Uten merkeband treffer ikke sporleggerne samme punkt.",
      "Legg belønning etter krysningen. Det er valget som skal forsterkes, ikke bare det å komme i mål.",
      "Etter hvert som hunden mestrer det: variér alder på hoved- og forstyrrelsesspor. Endre én ting av gangen.",
      "Metoden fungerer både med menneske- og dyrespor som forstyrrelse. Prinsippet er det samme.",
    ],
    field: "Tenk gjennom rekkefølgen: hvis du legger forstyrrelse først, må sporlegger av forstyrrelsen henge opp merkebandene.",
    reflection: "Hvilke krysninger er reelle i ditt nærtreningsområde - sti, dyrespor, andre hundeførere?",
    drill: {
      title: "Planlagt kryssing med belønning",
      focus: "kryssende",
      duration: "30 min",
      description: "Heng merkeband nøyaktig der det andre sporet skal krysse. Legg belønning etter hver krysning på hovedsporet — det er valget som skal forsterkes. Endre én variabel om gangen.",
    },
  },
  {
    id: "sirkel",
    title: "8. Sirkelspor (Olsrud-svingen)",
    pages: "s. 28",
    minutes: 6,
    tags: ["sirkel", "konsentrasjon", "presisjon"],
    summary:
      "Sirkelsporet har ingen rette strekk. Hunden må konsentrere seg hele tiden, og fører får sett tydelig når konsentrasjonen ryker.",
    learn: [
      "Anker i midten, sporline festet i ankeret — det gir en jevn sirkel.",
      "Lenger sporline gir videre sirkel. Kortere line gir strammere sirkel og tøffere konsentrasjonsoppgave.",
      "Legg sluttgjenstand nær der du gikk inn/ut. Hent ankeret til slutt.",
      "Sporet går aldri rett frem. Det er det som gjør øvelsen så god.",
    ],
    field: "Sett sporflagg etter 3-4 meter for å markere sporstart. Gå inn/ut samme vei.",
    reflection: "Hvor mange ganger gjennom sirkelen klarer hunden å holde konsentrasjonen før den faller av?",
    drill: {
      title: "Olsrud-svingen som diagnose",
      focus: "sirkelspor",
      duration: "20-30 min",
      description: "Sett anker, fest sporline, lag en jevn sirkel. Sluttgjenstand nær inn/utgangen. Mål: se nøyaktig hvor konsentrasjonen ryker — bruk den observasjonen i neste vanlige spor.",
    },
  },
];

export const theoryDeepDives = {
  grunnlag: [
    {
      title: "Hvorfor prøvekrav ikke er nok",
      pages: "s. 3",
      text:
        "Heftet peker på et viktig gap mellom prøve og aksjon: prøven kan kontrolleres, mens aksjon gir ukjent liggetid, ukjent vær, skiftende døgnrytme og ukjent menneskelig ferdsel. Teorien bør derfor brukes som en treningsfilosofi: vi trener ikke bare for å bestå en øvelse, men for å bygge en hund som kjenner igjen spor som løsning i mange typer virkelighet.",
      full:
        "Under utdanning og ved prøver har vi et problem med å skape de forholdene som vi trolig møter på aksjon. Mange aksjoner handler om at noen blir borte i løpet av dagen, det går noen timer før de meldes savnet, og det går igjen noe tid før det blir en leteaksjon. Når vi skal ut og lete har det gått flere timer, og tid på døgnet kan ofte være kveld eller natt. Hvilket miljø sporet går i, vet vi ikke før vi er der. Og hvilke vær- og temperaturforhold det er, vil variere fra gang til gang.\n\nDette betyr at for å benytte oss av spor som en øvelse for å finne den savnede, har vi ofte en vanskeligere oppgave enn hva vi gjenskaper på eksamen. Alder på sporet blir annerledes, tid på døgnet er annerledes. Vær og temperatur har vi ikke kontroll på.\n\nSelv om vi av praktiske årsaker ikke kan teste under de samme forholdene som vi forventer på aksjon, så forventer vi at alle trener spor og sporoppsøk under forhold som nærmer seg det vi møter på aksjon. Det vil si å strekke alder på sporene godt over 8 timer, gjerne over 20 timer, trene til forskjellige tider på døgnet og under forskjellige værforhold.\n\nSpor og sporoppsøk benytter hunden seg av hele livet. Når vi trener redningshunder, benytter hunden seg av spor også under frisøk, og det at hunden tar opp og følger et spor i teigsøk, flankesøk o.l., er essensielt for at hunden skal bli en god redningshund. Tenk derfor på spor og sporoppsøk som noe mer enn øvelsen der du går bak hunden i sporline.",
    },
    {
      title: "Oppgaven kommuniserer mer enn linen",
      pages: "s. 4",
      text:
        "Når hunden går for fort, blir det fristende å bruke linen til å tvinge frem nøyaktighet. Heftet dreier dette over til et læringsprinsipp: det er oppgavens utforming som skal forklare hunden hva som lønner seg. En eldre, mer krevende eller mer presist lagt oppgave kan forme roligere sporatferd uten at fører blir bremsen.",
      full:
        "Når vi skal trene en hund i en øvelse, samme hvilken, så er det – litt forenklet – to ting vi er ute etter: vi skal skape motivasjon for å gjøre 'jobben', og vi skal skape forståelse for hvordan 'jobben' skal utføres. Mangler en av disse, så vil vi ikke få til øvelsen slik vi vil. Motivasjon kommer som et resultat av at det lønner seg å gjøre oppgaven. Forståelse kommer når vi klarer å kommunisere hva vi ønsker. Problemet er ofte at vi ikke kommuniserer godt nok hva vi ønsker – da tenker vi ikke bare på ord, signaler og kroppsspråk, men like mye på hvordan vi legger oppgaver.\n\nEn aktuell problemstilling: Du skal trene hunden til å gå spor. Gjennom å løse oppgavene (hunden kommer til sporslutt og belønning) får hunden stor motivasjon for å gå sporet. Du er imidlertid ikke fornøyd med hvordan hunden går sporet. For å få hunden til å gå bedre, holder du hunden igjen i sporlinen for å fremtvinge mer nøyaktig sporgang. Resultat: hunden trekker hardt i linen, men sporgangen er ikke nødvendigvis bedre. Noen hunder lærer seg i tillegg at det å 'gå på riktig måte' er det som gjør at hunden får lov å gå fremover.\n\nOm du tenker litt annerledes: 'Når jeg skal lære hunden å gå riktig, så er det ikke linen som skal kommunisere dette, det er oppgaven jeg legger som skal forme atferden.' Går hunden fort og hardt, så er trolig oppgaven for enkel for hunden å løse. Den må ikke konsentrere seg, den tillates å være ukonsentrert og unøyaktig. Den klarer å gjennomføre oppgaven og kommer til belønningen uansett fordi oppgaven er enkel.\n\nHva om du tenker slik: Jeg skal gi hunden sporoppgaver som er så vanskelig at hunden må konsentrere seg og gå nøyaktig – ellers mislykkes den. Dette kan gjøres på mange måter, en av de enkleste er å øke alderen på sporet. Da tenker vi ikke på å øke alderen fra 1 til 3 timer – begge deler er ferskspor for hunden. Prøv med ett døgn, prøv med to døgn. Du vil se at når du gir hunden litt vanskeligere oppgaver, så endrer du atferden på en måte du ikke får til gjennom lette oppgaver.\n\nForsøk viser at det er en sammenheng mellom hvor høy motivasjon hunden har for øvelsen, hvor mye du utfordrer hunden, og resultatet vist gjennom målrettet sporatferd eller annen atferd. Høy motivasjon og lite utfordringer gir høyere andel av stress/annen atferd. Om vi endrer forholdet mellom motivasjon og utfordring, bedrer vi forholdet mellom riktig sporatferd og stress/annen atferd.",
    },
    {
      title: "Den første sporøkten",
      pages: "s. 7-8",
      text:
        "Heftet sier eksplisitt at nyinnlæring skal tilpasses i samarbeid med instruktør, men gir noen generelle prinsipper: kartlegg hunden først, velg en startmetode som passer den, og hold første økt enkel — kjent område, kjent vegetasjon, lite forstyrrelser. Målet er én ting: hunden skal lære at menneskelukten gir lønn.",
      full:
        "Når vi skal begynne å trene spor, er det en ting vi bør være bevisst: treningen går lettere når hunden er konsentrert. For at hunden skal være konsentrert, må vi ha et bevisst forhold til hva som motarbeider konsentrasjonen.\n\nFørst av alt: kartlegg hunden. Hva er den beste forsterkeren for hunden? Ball, Kong, godbiter, det å finne folk? Er hunden selvstendig eller veldig avhengig av hundefører? Er hunden veldig eller bare moderat nysgjerrig? Hvordan er det med intensitet, for eksempel når den leter etter leken sin? Dette er forhold som er greit å vite før du begynner å legge den første planen for treningen.\n\nDet finnes flere innganger til sportreningen: godbitspor, spontanspor, søk etter kongbiter, synspåvirkning av figurant, slepespor. I tillegg er fertgrop en tilleggsteknikk for selve startpunktet. Heftet beskriver ikke nyinnlæringen i detalj — det skal tilpasses hver hund i samarbeid mellom hundefører og instruktør — men prinsippene er klare: velg én metode bevisst, og hold første økt så enkel at hunden lykkes.\n\nEn typisk start (godbitspor): tråkk opp en firkant, fyll den med godbiter, la hunden søke og spise. Hunden vil etter noen repetisjoner lære at godbiter finnes bare der det er tråkk av menneske. Utviklingen går på at firkanten som man har tråkket, går over i et spor med godbiter, og at man siden reduserer mengden med godbiter slik at hunden følger menneskesporet lenger og lenger mellom hver godbit.\n\nUavhengig av metode er rytmen den samme: tydelig arbeidstegn ved start (sporline frem), kort økt, rolig belønning, og hvile etterpå. Hvile er en del av læringen — det er der inntrykkene fester seg.",
    },
    {
      title: "Selvstendighet bygges i små valg",
      pages: "s. 5",
      text:
        "Hunden lærer ikke bare av sluttbelønningen, men av hva fører gjør når oppgaven blir vanskelig. Hvis fører blir aktiv hver gang hunden spør, kan hunden lære at løsningen ligger hos fører. Hvis fører støtter aktivt søk og er rolig ved passivitet, lærer hunden at eget arbeid flytter oppgaven videre.",
      full:
        "Ofte opplever vi at hunden under trening tar kontakt med oss fordi oppgaven er litt vanskelig. Det som da gjerne føles naturlig, er å gi hunden litt hjelp, for eksempel ved å gå litt fremover i den retningen løsningen (sporet) ligger. Dette kan være med på å forsterke 'hjelpeløsheten' til hunden – det kan gjøre at hyppigheten av at hunden ber om hjelp øker. Man kan si det slik at hunden har trent deg til å bli aktiv og vise løsningen hver gang hunden snur seg mot deg. Vil dette fungere når du ikke kjenner løsningen på oppgaven? Nei, selvsagt ikke.\n\nDet du bør tenke på, er timingen for når du hjelper hunden. Ha som mål at du bare støtter hunden når den er aktiv, det vil si når den prøver å finne løsningen. Når hunden blir passiv og tar kontakt med deg, så skal du ikke gi hjelp. Kort fortalt: når hunden søker etter sporet, så kan du gå etter og støtte; når hunden slutter å søke og tar kontakt, så står du stille. Da lærer du hunden å bli selvstendig i å løse problemer.\n\nTips: Generelt når du trener hund – om du 'pusher grenser' for hva dere klarer, det vil si trener på stadig vanskeligere oppgaver, så vil dere oppleve at det du på ett stadium syntes var vanskelig, etter en stund føles lett. Om du eksperimenterer med eksempelvis alder på spor, vil du finne at hunden generelt blir mye bedre til å løse vanskeligheter i sporet. Hunden har egenskaper som gjør den i stand til å følge spor som er vanskeligere enn hva vi tror den klarer. Tro på hunden din. Utfordre hunden din.\n\nEn annen effekt av å trene med eldre spor og sporoppsøk er at hunden din endrer atferd i søket. Eksempelvis vil hundene endre søksatferden i et flankesøk dersom hunden har et fokus på at det er gamle spor som er løsningen på oppgaven. Hunden vil sette ned tempoet, den vil søke med mer fokus mot bakken. Kort sagt: søksatferd kan justeres med målbevisst plan for hva hundene skal finne.",
    },
  ],
  spor: [
    {
      title: "Spor er ikke én lukt",
      pages: "s. 6",
      text:
        "Menneskelukt, hudpartikler, bakterier, påvirkning i vegetasjon, sko mot underlag og forstyrrelser i miljøet inngår i et samlet luktbilde. Hunden kan bruke ulike deler av dette bildet etter hva som er enklest. Variert trening lærer hunden hva som fortsatt er relevant spor når ett sporgrunnlag blir svakere.",
      full:
        "Spor vil si at hunden finner og følger fert etter et menneskespor gjennom ulike miljøer. For å utdype beskrivelsen litt: hunden følger luktmolekyler som mennesker avgir. Disse luktmolekylene kommer fra bakterier og hudflak som løsner fra kroppen. Luktmolekylene fester seg i det miljøet mennesket beveger seg i – det være seg direkte i fotavtrykkene eller i nærmiljøet der sporet går.\n\nHer kan man nerde seg langt inn i teorien om alle molekylene, men det gir lite praktisk effekt. En ting man likevel bør tenke på: de ulike molekylene har ulik 'holdbarhet'. Det vil si at menneskelukten som vi legger igjen i sporet, vil endre seg over tid. Lukten av sporet vil endre seg. Hunden bør derfor tilvennes lukten av spor med forskjellig alder.\n\nI tillegg til luktmolekylene fra mennesket vil endring av miljøet – gjennom at vi 'roter til' bakken når vi tråkker, at skoene avgir gummipartikler når de gnis mot hardt underlag o.l. – skape endring i miljøet som hunden kan benytte seg av for å følge etter der vi har gått. Alle disse faktorene kan hunden bruke når den skal følge et menneskespor.\n\nHvilke deler av luktbildet hunden benytter seg mest av, er vanskelig å si. Hunden vil trolig utnytte den delen av luktbildet som enklest gir resultat. Dette er viktig å ta med i planleggingen av sportreningen. Gjennom variert og bevisst trening kan vi lære hunden hvilken av disse faktorene som er viktigst for å løse sporoppgaven.",
    },
    {
      title: "Alder endrer luktbildet",
      pages: "s. 6 / s. 19",
      text:
        "Når et spor blir eldre, forsvinner noen luktkomponenter raskere enn andre. Derfor er ikke ett, seks og tjuefire timer bare mer eller mindre av samme lukt. Det er delvis et annet bilde hunden må forstå. Dette er grunnen til at gamle spor kan være god problemløsningstrening selv om de ikke alltid er den mest realistiske aksjonsløsningen.",
      full:
        "Nye og gamle spor lukter forskjellig – selv om det er samme sporlegger. Dette kommer av hvilke luktmolekyler som forsvinner først. Når et spor blir eldre, forsvinner noen luktkomponenter raskere enn andre, og hunden møter dermed delvis et annet luktbilde enn på et ferskt spor.\n\nDette er grunnen til at gamle spor er nyttig trening, selv om de ikke alltid er den mest realistiske aksjonsløsningen. Hunden bør tilvennes lukten av spor med forskjellig alder. Da tenker vi ikke på å øke fra 1 til 3 timer – begge deler er ferskspor. Prøv med ett døgn, prøv med to døgn. Når du gir hunden litt vanskeligere oppgaver, endrer du atferden på en måte du ikke får til gjennom lette oppgaver.\n\nLukter beveger seg også med vinden og kan bli fanget i vegetasjon, noe som kan føre til at hunden går langs sporet i stedet for rett på det. Luftstrømmene langs sporet kan variere betydelig. Stigende varm luft og synkende kald luft skaper vertikale bevegelser som kompliserer luktspredningen.",
    },
    {
      title: "Underlag styrer sporatferd",
      pages: "s. 6-8",
      text:
        "Høy lyng, lav vegetasjon, grus, vei og hardt underlag gir ulike betingelser. Hunden kan virke sikker i ett miljø og bli usikker i overgangen til et annet. Overganger bør derfor trenes som egne momenter, ikke bare dukke opp tilfeldig i et langt spor.",
      full:
        "Det er viktig å trene sporhundene i ulike typer terreng. En hund som sporer i områder med lyng eller blåbærbusker, har en relativt enkel oppgave, men kan bli usikker eller miste sporet helt når den når en grusvei. Hunden må trenes til å gjenkjenne forskjellige miljøer slik at den vet at når den kommer til en grusvei, så må den konsentrere seg mer, være mer nøye og kanskje øke frekvensen av snusingen.\n\nTrening i skogsterreng er naturlig for mange. Det gir gode forutsetninger for å bygge opp sporøvelsen. Men skogsterreng kan være mye forskjellig sett fra hundens side. Tenk over hvilken vegetasjon du legger spor på, høyden på lyngen, andel skiftende underlag og lignende. Eksempelvis: trening på spor i høy vegetasjon gir en annen sporatferd enn trening på spor i lav vegetasjon.\n\nSportrening på hardt underlag gir hunden større utfordringer med tanke på å gå nøyaktig i sporet. Dette kan gi deg en hund som går konsentrert, men det er noen ting du skal tenke på: bruk av godbiter og gjenstander kan gi hunden erfaring i at den finner ved hjelp av synet, og dermed kan det være at den 'slipper sporet' for å gå mot ting den ser. At hunden går gode spor på hardt underlag, er heller ingen garanti for at den går nøyaktig når den går spor i skogsterreng. Overgang til trening i annet terreng bør derfor planlegges nøye.",
    },
    {
      title: "Forsterkeren kan både hjelpe og forstyrre",
      pages: "s. 9",
      text:
        "Belønning med høy verdi bygger motivasjon, men kan også gi for høy intensitet. Belønning med for lav verdi gir lite fremgang. Praktisk teori her er å se belønning, hundens kontroll og oppgavens vanskelighetsgrad som ett system.",
      full:
        "Problemløsning når vi trener hunder, handler ofte om å vurdere den forsterker/belønning du benytter. Noen ganger benytter vi for sterk belønning, og noen ganger for dårlig belønning. For sterk belønning kan medføre at hunden ikke klarer å konsentrere seg, at vi får atferd som vi ikke ønsker i situasjonen. Dette kan også ha sammenheng med at hundefører ikke har kontroll på hunden – det er ikke nødvendigvis bare belønningen som er problemet. For å løse problemer med for sterk motivasjon må man vurdere om man kan hjelpe hundefører til å bedre kontrollen over hunden, eller om man skal bytte belønningen til en med lavere verdi for hunden.\n\nEr belønningen for dårlig, noe som gjelder i svært mange tilfeller når vi ikke får fremgang i treningen, så må vi kartlegge hunden for å finne hvilken belønning som er best. Verdien av en belønning kan også variere med den som gir belønningen. En godbit kan være topp hos en figurant som får kontakt med hunden og som gjør noe ut av situasjonen, men kan være kjedelig dersom figuranten er kjedelig. Kamplek kan være topp gjennomført på riktig måte, men oppleves belastende i andre situasjoner. Jaktlek etter ball eller Kong er stort sett positivt for hunder, men husk at avslutningen ('slipp') også må være positivt.\n\nFør du starter sportreningen: kartlegg hunden. Hva er den beste forsterkeren – ball/Kong, godbiter, det å finne folk? Er hunden selvstendig eller veldig avhengig av hundefører? Er hunden veldig eller bare moderat nysgjerrig? Hvordan er det med intensitet, for eksempel når den leter etter leken sin? Dette er forhold som er greit å vite før du begynner å legge den første planen for treningen.",
    },
  ],
  oppsok: [
    {
      title: "Sporoppsøk er en egen øvelse",
      pages: "s. 11",
      text:
        "Det er lett å tenke at sporoppsøk bare er starten på sporet, men heftet behandler det som en ferdighet med egne varianter. Direkte påsett, spontant opptak, oppsøk fra bil, gjenstand, bygning, ledelinje og frisøk gir forskjellige beslutninger for både hund og fører.",
      full:
        "Som nevnt tidligere må vi ha et bevisst forhold til hva vi trener når – det vil si når skal vi trene spor, og når skal vi trene sporoppsøk. Øvelsene henger sammen, og progresjonen i treningen henger ofte sammen. Momenttrening er nøkkelen til å utvikle hunden riktig.\n\nFor å gå spor må det være et sporoppsøk i forkant. Dette kan eksempelvis være direkte påsett eller spontant opptak av spor. Om hunden skal ta opp sporet, så må den ha motivasjon for å følge sporet. Motivasjonen kan være nysgjerrighet eller at hunden gjennom erfaring har lært at det lønner seg å gå spor. Dette vil i praksis si at hunden må ha gått en del spor før du systematiserer treningen av sporoppsøk.\n\nFelles for mange av sporoppsøk-situasjonene er at sporet som vi vil at hunden skal følge, er et avvik i miljøet der vi søker. Hundene er flinke til å finne avvik. Det er derfor viktig at vi trener på de variantene som er mest aktuelle for oss: direkte påsett, spontant opptak, oppsøk i terreng, fra bil, fra gjenstand, fra bygning, spor som forlater en ledelinje, og sporopptak under frisøk.",
    },
    {
      title: "Arbeidstegn gir mental omkobling",
      pages: "s. 11",
      text:
        "Faste arbeidstegn gjør at hunden lettere skjønner hvilken oppgave som starter. Det er særlig viktig når hunden skal veksle mellom andre NRH-oppgaver, for eksempel fra teigsøk og gjenstandsmelding til sporoppsøk.",
      full:
        "Treningen går ofte lettere om du bruker faste signaler (arbeidstegn) hver gang dere skal trene en øvelse. Ved spor og sporoppsøk kan dette eksempelvis være at du tydelig tar frem sporlinen, løser den opp og kaster ut sporlinen før du fester karabinkroken i hundens halsbånd eller sele.\n\nGjør du dette hver gang før dere skal gå spor, vil hunden forbinde din atferd (dine bevegelser) med at nå skal vi trene spor. Hunden vil da være i 'spormodus' når du ber den søke spor.\n\nDette er særlig nyttig når hunden skal veksle mellom flere NRH-oppgaver, for eksempel fra teigsøk og gjenstandsmelding over til sporoppsøk.",
    },
    {
      title: "Avvik i miljøet – oppsøkstypene",
      pages: "s. 11-12",
      text:
        "Mange sporoppsøk handler om at hunden finner et avvik: et spor fra en bil, en gjenstand, en bygning eller en ledelinje. I lite beferdet miljø er avviket tydelig. I beferdet miljø må fører ha en plan for hva som er sannsynlig riktig spor, og hva hunden skal gjøre med andre spor.",
      full:
        "Her følger en kort gjennomgang av de typene sporoppsøk som er mest aktuelle for oss på trening, prøver og aksjoner. Listen er ikke komplett.\n\nDirekte påsett: Hundefører viser hvor hunden skal søke / hvor sporet går. Hunden blir vist nøyaktig sted der sporet går, men må fortsatt analysere retning på sporet. Hundefører peker helt ned mot bakken for å henlede oppmerksomheten dit, slik at hunden får begynt å analysere sporet. Vanskelighetsgraden kan varieres ut fra hvilken vinkel ekvipasjen kommer inn til sporet på: rett på, 90 grader på eller en annen vinkel.\n\nSpontant opptak av spor: Hunden tar opp spor uten å 'være i spormodus'. Dere krysser et spor som hunden oppfatter og som hunden analyserer og begynner å følge. Dette er en fin måte å vurdere hundens motivasjon for å ta opp spor på egen hånd, fordi du ikke har gitt noe signal om at dere skal gå spor.\n\nSporoppsøk i terreng: Ekvipasjen søker etter spor fremover i terrenget. Hunden gis kommando 'søk spor' eller lignende og søker aktivt fremover til den finner sporet. Når hunden finner sporet, skal den analysere retningen og begynne å følge det. Når man starter hunden i et aktivt søk etter spor, er det større sjanse for at hunden oppfatter sporet når den finner det.\n\nSporoppsøk fra bil: Ekvipasjen søker etter spor med utgangspunkt i en forlatt bil. Hundefører angir hvor hunden skal begynne å søke. Med unntak av kreative treningskamerater vil føreren av en personbil ha forlatt bilen ut fra førerdøren. Det er da det mest sannsynlige stedet å finne riktig spor. Når man går ut av en personbil, tråkker man ofte litt på bakken mens man lukker bildøren, så går man i en retning – bak langs bilen, ut fra bilen eller frem langs bilen. For å gi hunden gode muligheter til å finne riktig spor, kan det å komme inntil bilen langs forhjulet eller bakhjulet, og sette hunden i søk ved bakre kant av førerdøren, være en god løsning. Kan hunden komme inn i bilen og lukte på førersetet? Det kan gi hunden et utgangspunkt for å følge riktig lukt.\n\nSporoppsøk fra gjenstand: Ekvipasjen søker etter spor med utgangspunkt i en gjenstand funnet i terrenget, gjerne i forbindelse med teigsøk eller flankesøk. Verdien av å finne/melde/påvise gjenstanden må være minst like høy som å følge sporet – ellers kan hunden begynne å følge sporet uten å melde på gjenstanden først.\n\nSporoppsøk fra bygning: Likheter med oppsøk fra bil, men objektet (hus/hytte) er mye større. Her kan søk både tett på objektet og i sirkel rundt være aktuell fremgangsmåte.\n\nSpor som forlater en ledelinje: Ekvipasjen søker en ledelinje (vei, sti e.l.) og hunden oppfatter spor som forlater ledelinjen og går ut i terrenget. Dette er en veldig aktuell situasjon for våre ekvipasjer.",
    },
    {
      title: "Frisøk gir et beslutningsdilemma",
      pages: "s. 15-17",
      text:
        "Når hunden tar spor under frisøk, vet den ikke om sporet tilhører savnede. Derfor må laget bestemme ønsket atferd: skal hunden vise sporet, følge det et stykke, følge til funn eller fortsette søket i områder med mange spor?",
      full:
        "Under frisøk (patruljegang, flankesøk, teigsøk) kan hunden komme over sporet av den savnede. Ønsker du at hunden skal vise deg det? Ja, vil du trolig si. Dersom hunden kommer over sporet til en annen person enn den savnede, vil du at hunden skal vise deg det? Om du svarte ja på første spørsmål, så må du svare ja på andre spørsmål. For hunden kan ikke avgjøre hva som er riktig spor.\n\nVil du at hunden skal følge sporet helt frem til den savnede og melde på vedkommende? Om hunden skal gjøre det, så vil den også følge sporet av andre personer. Hvor langt skal hunden følge et spor før den slipper det og returnere til deg – 100 meter, 1000 meter, 2000 meter?\n\nSom nevnt innledningsvis må vi forvente at spor etter den savnede er mange timer gamle. Om vi trener mye spor og sporoppsøk som er 12–15 timer gamle, så vil hunden forholdsvis enkelt kunne detektere disse også under frisøk.\n\nEn trinnvis treningsplan kan se slik ut. Forutsetning: hunden er godt trent i spor og har erfaring med spor opp til 12 timer, og er godt trent i sporoppsøk i ulike situasjoner.\n\nSteg 1 – Legg en oppgave som starter med et frisøk (her: flankesøk). Flanken før første sporopptak bør være så lang at hunden din har roet seg litt i søket. Sporet hunden skal finne, skal hunden møte ute på flanken – ikke ut fra ledelinjen – for å skape riktig søksmønster. Legg en belønning eller gjenstand (som hunden ikke tar på overvær) etter at hunden har fulgt sporet et stykke. Som hundefører skal du kunne se hunden når den tar opp sporet, slik at du lærer å tolke atferdsendringen som hunden viser ved sporfunn under frisøk.\n\nSteg 2 – Legg en ny oppgave der sporet nå går ut fra ledelinjen i en retning du velger etter behov. Variér slik at hunden enkelte ganger kan ta opp sporet rett, og andre ganger må analysere hvilken vei sporet går. Hundens atferd i søket endrer seg over tid, så gå tilbake og repeter slike oppgaver ut fra hva du ønsker å endre.\n\nSteg 3 – Øk alderen på sporene. En redningshund bør kunne ta opp spor som er 8–12 timer gamle under frisøk, under forutsetning av at sporet utgjør et klart avvik i miljøet. Tester viser at hundene under flankesøk ikke har problemer med å ta opp spor på ca. 24 timer når disse utgjør et avvik i miljøet. Du får til det du trener på.",
    },
  ],
  gamle: [
    {
      title: "Gamle spor som læringsverktøy",
      pages: "s. 19",
      text:
        "Heftet er nyansert: svært gamle spor er ikke alltid praktisk som aksjonsstrategi, men de kan være svært nyttige i trening. De tvinger frem ro, metodikk og problemløsning fordi hunden ikke kan løse oppgaven med fart og høy intensitet alene.",
      full:
        "Praktisk sett er det å gå spor med liggetid eldre enn et døgn lite hensiktsmessig. Sannsynligheten for å løse et oppdrag basert på å gå så gamle spor er liten – den du leter etter er ikke i nærheten om vedkommende er i bevegelse. Samtidig er muligheten for at ekvipasjen ikke klarer å løse oppgaven, mye større enn om sporet bare er noen få timer gammelt.\n\nHvorfor skal vi da ha fokus på gamle spor? Fordi det utvikler hunden og gjør den i stand til bedre å løse andre spor og oppgaver. Når hunden trenes i å gå gamle spor, holder den på med problemløsning gjennom hele sporet. Hunden får da erfaring i hvordan arbeide med problemstillinger som hunden tar med seg til andre situasjoner.\n\nHva oppnår vi med å trene gamle spor? Først og fremst at hunden blir bedre til å løse problemstillinger. Den får erfaring på hvordan den må arbeide for å løse oppgavene – rolig og metodisk i stedet for å øke intensitet og fart. Når oppgaven er vanskelig og sporet lukter lite, hjelper det ikke å sette opp tempoet. At hunden lærer seg å løse problemer på denne måten, er direkte overførbart til andre situasjoner hunden møter i sporet.\n\nFor det andre blir du en bedre hundefører dersom du bruker muligheten som treningen gir deg. Det viktigste du som hundefører skal lære, er å bruke øynene – ta inn informasjonen som hunden gir. Øynene er den viktigste informasjonskanalen for å lære å tolke hundens signaler når den sporer. Når du trener på dette under slike sporoppgaver, lærer du deg å plukke opp signaler som bekrefter at hunden er på sporet, eller at nå har hunden vanskeligheter med å følge sporet. Denne erfaringen kan være det som avgjør om dere lykkes når oppgavene blir vanskelige.",
    },
    {
      title: "Kort spor før hovedspor",
      pages: "s. 19-20",
      text:
        "Opplegget med et kort første spor og et lengre andre spor er en elegant læringsstruktur. Første spor handler om å introdusere dagens luktbilde. Etter hvile får hunden en ny oppgave hvor den kan bruke den ferske erfaringen i en mer krevende kontekst.",
      full:
        "Forutsetning: hunden har forståelse og motivasjon for å gå spor med kortere liggetid. Første fokus er å få hunden til å forstå hvilket luktbilde den skal følge. Siden dette avviker fra det luktbildet som hunden vanligvis følger, må vi hjelpe hunden til å forstå hvilken lukt den skal fokusere på.\n\nJeg starter med kjent sporlegger og kjent underlag (med vegetasjon) slik at disse variablene ikke endres. Oppgaven legges som følger:\n\nSpor 1: Sporet går rett frem i 30–50 meter. Det legges ned Kong som sluttgjenstand. Sluttgjenstanden legges ned i / under vegetasjonen.\n\nSpor 2: Sporet er +/- 250 meter langt med to vinkler. Det legges ned Kong som sluttgjenstand. Sluttgjenstanden legges ned i / under vegetasjonen.\n\nSporene får ligge ønsket tid, ett eller to døgn. Jeg legger gjerne opp flere oppgaver samme dag slik at jeg kan ha spor som kan gås etter både ett og to døgn.\n\nHvorfor legge to ulike spor? Fordi det første sporet kun har til hensikt å lære hunden hvordan sporet lukter i dag. Det første sporet har jeg ingen forventninger til utover at jeg håper hunden viser interesse til å følge det godt nok til å komme frem til sluttgjenstanden. Når hunden har kommet til slutten, kjører jeg en kort belønningsfase og legger hunden i bilen. Målsetning: modne/lagre inntrykkene av det første sporet.\n\nEtter en kort hvile (10 minutter?) tas hunden ut og frem til det andre sporet. Nå har jeg litt mer forventning til at hunden er i stand til å gå sporet. Vi gjennomfører sporpåsett, og hunden får mulighet til å utrede sporet slik den vil. Med litt mer lengde på sporet i tillegg til vinkler, må hunden arbeide en del for å utrede og følge sporet. Når vi kommer til slutten, kjører jeg en kort belønningsfase og legger hunden i bilen igjen. Målsetning med kort belønningsfase: hunden skal oppleve oppgaven som positiv, men belønningsfasen skal ikke overskygge inntrykket av sporet.\n\nNår du har trent spor med liggetid på ett døgn, anbefaler jeg at du prøver å trene med liggetid på to døgn og så gå tilbake til spor med liggetid på ett døgn. Har hunden blitt bedre på å løse sporoppgaver som er ett døgn gamle fordi den har fått erfaring med å gå to døgn gamle spor? Har hunden din blitt bedre på å finne og gå 6 timer gamle spor?",
    },
    {
      title: "Hvile er del av treningen",
      pages: "s. 20",
      text:
        "Etter krevende spor bør hunden få ro. Heftet kobler dette til læring: inntrykkene fra arbeidet skal få feste seg. Derfor er det ikke likegyldig hva hunden gjør rett etterpå, spesielt etter nye eller vanskelige luktbilder.",
      full:
        "Hundene har god effekt av hvile etter arbeid for at læringen skal overføres fra korttidshukommelsen til langtidshukommelsen. Det vil si: for at varig læring skal skje. Derfor er det viktig å ha et bevisst forhold til hvilke opplevelser hunden skal få mellom arbeid og hvileperioden.\n\nDette gjelder spesielt etter krevende eller nye sporoppgaver. Inntrykkene fra arbeidet skal få feste seg, og det er ikke likegyldig hva hunden gjør rett etterpå.",
    },
  ],
  retning: [
    {
      title: "Retning krever analyse",
      pages: "s. 21",
      text:
        "Hunden kan avgjøre retning gjennom lukt, men det forutsetter at den tar seg tid til å analysere. Høy motivasjon kan gi høy intensitet, og høy intensitet kan gjøre retningen mer tilfeldig. Retningstrening handler derfor like mye om sinnstilstand som om nese.",
      full:
        "Hundene kan gjennom lukt bestemme hvilken vei et spor går. Likevel opplever vi ofte at det blir litt tilfeldig hvilken vei hunden velger når den skal gå spor slik vi planlegger at den skal. Bakgrunnen for dette kan være litt ulik fra hund til hund, eller situasjon til situasjon, men forsøk tyder på at det henger sammen med intensitet og konsentrasjon når hunden skal detektere sporet.\n\nTrenger vi å trene hunden på å retningsbestemme spor? Dersom hunden alltid velger riktig vei, så er det kanskje ikke nødvendig. Samtidig kan en hund endre seg. Økt motivasjon for å gå spor kan gi økt intensitet. Økt intensitet kan redusere analysen av sporet og medføre at det blir mer tilfeldig hvilken vei hunden velger. Du må selv vurdere om denne treningen er nødvendig for din hund.\n\nFør du starter, må du gjøre noen vurderinger med tanke på hvilken forsterker du vil benytte. I heftet brukes Kong som forsterker til denne treningen.",
    },
    {
      title: "Tre fotavtrykk holder",
      pages: "s. 21",
      text:
        "Heftet refererer et forskningsprosjekt som konkluderte med at tre fotavtrykk er nok til at en hund kan være sikker på retningen. Det betyr at oppgaven ikke handler om å gi hunden mer informasjon, men om å gi den tid til å bruke informasjonen.",
      full:
        "Hva skal til for at hunden kan retningsbestemme spor? Det er gjort ulike forsøk, og i et forskningsprosjekt som ble gjennomført, undersøkte de hvor mange fotavtrykk en hund trenger for å være sikker på retningen. Konklusjonen var at tre fotavtrykk er nok til at en hund er sikker på retningen.\n\nDet betyr at oppgaven ikke handler om å gi hunden mer informasjon, men om å gi den tid til å bruke informasjonen. Praktisk konsekvens: retningstrening handler like mye om hundens sinnstilstand (ro nok til å analysere) som om nesen i seg selv.",
    },
    {
      title: "To metoder, ett mål",
      pages: "s. 21-23",
      text:
        "Heftet beskriver to varianter: rolig start tett inntil sporet (10-15 cm), og gjentatte sporkryss over sti. Begge handler om at hunden får erfaring med å analysere. Forfatteren mener selv at sporkryss-metoden er mest effektiv for tjenestehunder.",
      full:
        "Heftet beskriver to alternativer for retningstrening. Forutsetning: hunden har motivasjon og forståelse for å gå spor.\n\nAlternativ 1 – Rolig start tett på sporet. Du legger ut spor som merkes slik at det er kjent for hundefører nøyaktig hvor sporet går. Hundefører legger hunden ned i kort avstand fra sporet – innledningsvis bare 10–15 cm fra fotavtrykkene. Tanken er at hunden skal begynne å analysere lukten mens den ligger der. Når hunden har sjekket ut lukten og analysert retning, lar du hunden begynne å følge sporet. Det kan da være en god løsning at det kommer en gjenstand eller avslutning etter noen få meter. Gjenta opplegget, og etter noen få gjennomføringer begynner du å legge hunden ned litt og litt lenger fra sporet. Fokuset skal nå være at hunden begynner å bruke nesen for å finne og analysere lukten uten å ha høy intensitet eller fremdrift.\n\nAlternativ 2 – Sporkryss over sti. Legg et spor som krysser en sti gjentatte ganger. Det bør være minst 60–70 meter mellom hvert sted der sporet krysser stien. Ved hvert kryss legges det ned en Kong, gjerne litt ned i mosen/lyngen, slik at belønningen ikke skal tas på overvær, men finnes når hunden går spor.\n\nDu starter ved første spor (ingen bakspor, kun riktig vei). La hunden gå ut og finne belønningen. Gå så tilbake på stien og start på nytt 5–10 meter foran der sporet gikk ut. Etter ca. 50 meter finner hunden en krysning, og denne gangen må hunden ta et valg om hvilken retning den vil gå. Uansett hvilken vei hunden velger, så lar du den gå.\n\nGår hunden bakspor, vil den komme til det stedet der den for 4 minutter siden fant Kong, men nå er Kongen borte. Hunden vil kjenne seg igjen og vite at det var her jeg var. Ideelt sett vil hunden nå snu og gå motsatt vei. Om den ikke gjør det, gi den litt hjelp. Når hunden går riktig vei, vil den krysse stien og gå ut og finne belønningen på motsatt side. Gjenta som tidligere: gå tilbake til stien, søk fremover og finn neste sporkrysning. Etter noen repetisjoner vil hunden ha tilegnet seg erfaring i å analysere hvilken retning den skal velge når den møter et spor.\n\nNoen ganger vises ikke effekten av treningen før ved neste trening. Når du går i gang med en treningsplan, hold deg til denne en viss tid og mål effekten over tid. Gir du opp med en gang, får du ikke fremgang.\n\nEn siste ting: om du kan, tren dette uten line på hunden. Til mindre vi er delaktig i øvelsen, til bedre/fortere lærer hunden. Erfaring viser at begge teknikker hjelper på at hunden skal bli bedre å analysere retningen. Forfatteren mener selv at alternativ 2 er mest effektivt når vi trener tjenestehunder.",
    },
  ],
  sportap: [
    {
      title: "Sportap er normalt",
      pages: "s. 24",
      text:
        "Sportap er ikke et tegn på at treningen har feilet. Det er en del av sporarbeidet. Målet er at hunden får et system for å finne tilbake uten stort tidstap, og at fører lærer å se forskjell på målrettet problemløsning og at hunden er ute av sporet.",
      full:
        "Sportap er en naturlig del av det å gå et spor. Sportapet kan være større eller mindre, og gjennom trening kan vi lære hunden å jobbe rasjonelt med å finne tilbake til sporet. Dersom hunden får frihet til å løse problemet på egen måte, vil hundene trolig finne tilbake i de fleste tilfeller. Problemet er at vi mennesker er til stede og forstyrrer hundens arbeid.\n\nForutsetning for momentet: hunden har forståelse og motivasjon for å gå spor under de forholdene du velger å benytte under treningen (underlag, liggetid mm.).\n\nHva lærer hunden av denne momenttreningen? Først og fremst et systematisk søk for å finne igjen sporet ved sportap. Dette reduserer bruk av tid og energi. Hunden vil lære å søke rasjonelt: er det ikke lukt av spor foran meg, så ligger løsningen bak meg. For det andre gir det deg som hundefører trening i å identifisere at hunden har mistet sporet. Begge deler er viktig for at dere skal bli en god sporekvipasje.",
    },
    {
      title: "Lesiden er nøkkelen",
      pages: "s. 24",
      text:
        "I sidevind drar lukten fra sporet av på lesiden. Hunden som har erfaring med dette, stopper umiddelbart når sporlukten blir borte, faller av på vinden og søker bakover på lesiden. Det er en betydelig tidsbesparelse på aksjon.",
      full:
        "Det vi setter fokus på nå, er at hunden skal lære å stoppe opp og finne tilbake til sporet så fort som mulig dersom hunden mister sporet. Ved sportap vil løsningen til å finne igjen sporet så å si alltid ligge bak hunden.\n\nOppgaven legges som følger: Legg et spor i sidevind. Lengden behøver ikke være så lang – hunden skal bare få mulighet til å feste seg på sporet, så mellom 50 og 100 meter er langt nok. Se deg ut et punkt du kjenner igjen, eksempelvis et tre eller en stubbe som skiller seg ut. Stopp ved dette punktet, snu og gå tilbake i eget spor. Gå 10–15 meter, hopp så langt du kan ut på lesiden av sporet i forhold til vindretningen. Legg sporet ca. 30 meter før du legger ned en avslutning (gjenstand eller belønning). Avslutning som lukter mye bør legges ned i/under vegetasjonen slik at den ikke finnes på overvær, men ved sporgang. La oppgaven ligge så lenge du vil, men siden dette er momenttrening trenger den ikke ligge så lenge.\n\nSlike oppgaver kan settes sammen i et litt lengre spor der det er 5–6 momenter som kommer etter hverandre. På den måten får du gitt hunden flere repetisjoner etter hverandre, noe som er effektivt for læringen.\n\nEn hund som er trent i dette, vil ofte stoppe umiddelbart når sporlukten blir borte, falle av på vinden og søke bakover på lesiden av sporet. På denne måten løser hunden problemstillingen på veldig kort tid.",
    },
    {
      title: "Fører er ofte forstyrreren",
      pages: "s. 24-25",
      text:
        "Hundene finner som regel tilbake hvis de får jobbe selv. Problemet er at vi mennesker er til stede og forstyrrer. Praktisk konsekvens: stå stille når hunden jobber, gå rolig baklengs når du vil invitere - aldri vis svaret med kroppen eller linen.",
      full:
        "Ta frem hunden og sett den i gang på sporet. Når hunden kommer til der du snudde, skjer i hovedsak to ting: ideelt sett stopper hunden og leter etter løsningen. Alternativt fortsetter hunden fremover mens den leter etter løsningen – dette fordi hunden tidligere har lært at selv om jeg mister sporet, så finner jeg det igjen lenger fremme.\n\nUansett hva hunden gjør, stå stille og la hunden forsøke å løse problemet innenfor sporlinens lengde. Når hunden har jobbet litt med problemstillingen, begynner du å gå baklengs bakover i sporet. Dette både for å gi hunden plass til å jobbe, og samtidig invitere hunden til å jobbe i den retningen. Hunden vil på ett eller annet tidspunkt finne sporet/avhoppet og følge dette til avslutningen.\n\nPraktisk konsekvens: stå stille når hunden jobber, gå rolig baklengs når du vil invitere. Ikke vis svaret med kroppen eller linen. Hundene finner som regel tilbake hvis de får jobbe selv – problemet er at vi mennesker er til stede og forstyrrer.",
    },
  ],
  kryssende: [
    {
      title: "Hvorfor bytter hunden spor",
      pages: "s. 26",
      text:
        "Et kryssende spor kan være enklere, ferskere eller mer interessant. Det kan komme fra mennesker eller dyr. Atferden er rasjonell fra hundens side: den følger sporet som lønner seg mest. Vår jobb er å belønne riktig valg så ofte at det blir det mest lønnsomme.",
      full:
        "Sportap ved kryssende spor kan vi oppleve når vi trener opp hundene våre. At hunden bytter til et annet spor, kan komme av flere årsaker: det kan være at det er et enklere spor å følge, at nysgjerrighet gjør at hunden bare må finne ut av hva det andre sporet er, eller andre årsaker. Det andre sporet kan være fra mennesker, eller det kan være fra dyr – problemstillingen er ganske lik.\n\nAtferden er rasjonell fra hundens side: den følger sporet som lønner seg mest. Vår jobb er å belønne riktig valg så ofte at det blir det mest lønnsomme. For å trene på at hunden ikke skal bytte spor underveis, legger vi opp til kjente oppgaver der hunden belønnes for ikke å bytte spor.",
    },
    {
      title: "Merkebandet er sjefen",
      pages: "s. 26-27",
      text:
        "Planlagte krysninger krever merkeband nøyaktig der forstyrrelsessporet skal krysse. Uten merkebandet kan ikke sporleggerne treffe samme punkt, og treningen mister kontrollen. Tenk gjennom rekkefølgen: hvem legger først, hvem henger merkene.",
      full:
        "Slik kan oppgaven legges: Sort = sporet hunden skal gå. Blått kryss = merkeband som markerer hvor det kryssende sporet skal gå. Rødt punkt = gjenstand eller belønning. Så legges sporet som skal krysse hundens spor, nøyaktig der det er planlagt og merket.\n\nVed å planlegge oppgavene godt, unngår vi feil. Vi legger et spor som hunden skal følge, og vi planlegger og merker hvor krysningene skal skje. Så legges det kryssende sporet nøyaktig der det er planlagt. Med slik momenttrening kan vi gi hunden erfaring på at det lønner seg å følge det sporet vi har begynt på. Gjennom gjentatte erfaringer vil hunden vise mindre og mindre interesse for å bytte spor. Metoden vil kunne fungere både når sporet vårt er krysset av mennesker og dyr.\n\nUten merkebandet kan ikke sporleggerne treffe samme punkt, og treningen mister kontrollen. Tenk gjennom rekkefølgen: hvis du legger 'forstyrrelses-sporet' først, så må sporlegger av dette henge opp merkebandene.",
    },
    {
      title: "Variér når du vil endre atferd",
      pages: "s. 27",
      text:
        "Variasjoner som påvirker hva hunden lærer: hvilket spor du legger først, alder på hovedspor versus forstyrrelse, vinkel på krysningen, og hvor mange krysninger på rad. Endre én ting av gangen så du kan se hva som faktisk flyttet atferden.",
      full:
        "Variasjoner i treningen:\n\nHvilket spor legger du først – det hunden skal gå, eller det som er forstyrrelse? Om du legger 'forstyrrelses-sporet' først, så må sporlegger av dette henge opp merkebandene.\n\nHvilken alder skal de ulike sporene ha? Variér over tid både alder på hovedspor og forstyrrelse for å gjøre oppgaven mer aksjonsnær.\n\nVinkel på krysningen og hvor mange krysninger på rad er to andre variabler du kan endre. Endre én ting av gangen så du kan se hva som faktisk flyttet atferden.",
    },
  ],
  sirkel: [
    {
      title: "Sirkelspor trener kontinuerlig presisjon",
      pages: "s. 28",
      text:
        "Sirkelsporet fjerner lange rette strekk. Hunden må hele tiden justere seg etter luktbildet, og fører får en tydelig øvelse for å observere konsentrasjon og linjearbeid.",
      full:
        "'Olsrud-svingen' har som mål å lære hunden konsentrasjon i sporarbeidet. Oppgaven går ut på at det finnes ikke rette strekninger i sporet – hunden må hele tiden konsentrere seg for å følge retningen på sporet. Dette gjøres ved å legge et spor som går i en sirkel.\n\nDu har nå lagt en sporoppgave der hunden kontinuerlig må justere seg inn etter sporet, da dette aldri går rett fremover. Oppgaven er effektiv for å trene hunden til å konsentrere seg under sporgangen.",
    },
    {
      title: "Ankeret gir geometrisk presisjon",
      pages: "s. 28",
      text:
        "Med stang/anker i sentrum og sporline som mål gir du en 'perfekt sirkel'. Variér linelengden for å endre radius og vanskelighetsgrad. Smal sirkel = mer konsentrasjon, vid sirkel = lengre strekk uten å bli rett.",
      full:
        "Utstyr: stang/anker til å markere midten av sirkelen, sporline, alternativt sporflagg for å merke start, og en sluttgjenstand.\n\nStart ved å gå inn til det som skal bli midten av sirkelen. Sett ned stang/anker og fest sporlinen i denne. Gå tilbake i sporet der du gikk inn mens du gir ut line (sporlinen).\n\nHold et fast tak i sporlinen, og begynn å gå. Sett ned eventuelt sporflagg etter 3–4 meter for å markere sporstart.\n\nNår du nærmer deg stedet der du har gått inn og ut av sirkelen, legger du ned sluttgjenstand. Du går så inn til midten og henter stang/anker.\n\nBruken av anker og sporline gjør at du lager en 'perfekt sirkel'. Hvor lang sporline du bruker når du legger oppgaven, påvirker hvor vid eller skarp sirkelen blir. Smal sirkel gir mer konsentrasjonskrav; vid sirkel gir lengre strekk uten å bli rett.",
    },
    {
      title: "Bruk det som diagnose",
      pages: "s. 28",
      text:
        "Når hunden faller av sirkelen, gir det deg tydelig signal om når konsentrasjonen svikter - lengde, tid på dagen, intensitet, distraksjoner. Bruk observasjonen til å justere andre øvelser, ikke bare sirkelen.",
      full:
        "Sirkelsporet er også god observasjonstrening for hundefører. Fordi hunden hele tiden må justere seg, blir det tydelig når konsentrasjonen svikter – eksempelvis sent i økten, ved spesielle distraksjoner eller når intensiteten begynner å bygge seg opp.\n\nBruk observasjonen til å justere andre øvelser i treningsplanen, ikke bare sirkelsporet. Det du ser i sirkelen, kan fortelle deg noe om når og hvorfor konsentrasjonen ryker andre steder også.",
    },
  ],
};

export const references = [
  {
    title: "Motivasjon + utfordring",
    category: "grunnlag",
    pages: "s. 4-5",
    text:
      "Høy motivasjon og for enkel oppgave kan gi mer uro enn nøyaktig sporatferd. Øk vanskeligheten slik at hunden må konsentrere seg, for eksempel med eldre spor eller mer presise momenter.",
  },
  {
    title: "Hjelp hunden mens den arbeider",
    category: "grunnlag",
    pages: "s. 5",
    text:
      "Støtte skal helst gis når hunden søker aktivt. Når hunden blir passiv og søker fasit hos fører, står fører rolig. Målet er selvstendig problemløsning.",
  },
  {
    title: "Spor som luktbilde",
    category: "spor",
    pages: "s. 6",
    text:
      "Hunden bruker lukt fra menneske, påvirkning i underlaget og miljøendringer. Treningen bør lære hunden hva som er viktigst i ulike miljøer.",
  },
  {
    title: "Hardt underlag",
    category: "spor",
    pages: "s. 9",
    text:
      "Hardt underlag kan gi god konsentrasjonstrening, men overgangen tilbake til skog eller blandet terreng bør planlegges. Synlige gjenstander kan trekke hunden bort fra sporet.",
  },
  {
    title: "Arbeidstegn",
    category: "oppsok",
    pages: "s. 11",
    text:
      "Faste signaler før spor/sporoppsøk, som å ta frem og feste sporline på samme måte, hjelper hunden over i riktig arbeidsmodus.",
  },
  {
    title: "Sporoppsøk fra bil",
    category: "oppsok",
    pages: "s. 12, 14-15",
    text:
      "Start gjerne der riktig spor er mest sannsynlig. Førerdør, hjulområde og spor ut fra bilen er praktiske vurderingspunkter. Legg først en enkel oppgave, øk deretter forstyrrelser.",
  },
  {
    title: "Sporoppsøk fra gjenstand",
    category: "oppsok",
    pages: "s. 12, 14",
    text:
      "Etter funn/melding/påvisning av gjenstand bør verdien av gjenstanden ivaretas før hunden settes om til spor. Trekk eventuelt 5-10 meter ut dersom området ved gjenstanden er mye tråkket.",
  },
  {
    title: "Sporopptak under frisøk",
    category: "oppsok",
    pages: "s. 15-17",
    text:
      "Fører må bestemme ønsket atferd på forhånd: skal hunden vise spor, følge det, eller fortsette frisøk i beferdet område? Gamle spor kan være tydelige avvik i miljøet.",
  },
  {
    title: "Gamle spor",
    category: "plan",
    pages: "s. 19-20",
    text:
      "Spor med liggetid over ett døgn utvikler problemløsning. Bruk kjent sporlegger og underlag først, gjerne ett kort læringsspor og ett lengre arbeidsspor.",
  },
  {
    title: "Retningsbestemming",
    category: "problem",
    pages: "s. 21-23",
    text:
      "Høy intensitet kan redusere analyse av retning. Tren rolig start nær sporet eller gjentatte sporkryss der hunden erfarer hvilken retning som lønner seg.",
  },
  {
    title: "Sportap",
    category: "problem",
    pages: "s. 24-25",
    text:
      "Ved tap ligger løsningen ofte bak hunden. La hunden jobbe, gi plass i linen, og inviter bakover uten å overta oppgaven.",
  },
  {
    title: "Kryssende spor",
    category: "problem",
    pages: "s. 26-27",
    text:
      "Planlagte krysninger gir hunden erfaring i at det lønner seg å holde seg til sporet den startet på. Varier etter hvert alder på hovedspor og forstyrrelsesspor.",
  },
  {
    title: "Sirkelspor",
    category: "problem",
    pages: "s. 28",
    text:
      "Olsrud-svingen trener konsentrasjon fordi sporet aldri går rett frem. Sporline festet i midtanker gir en presis sirkel.",
  },
  {
    title: "Neste økt",
    category: "plan",
    pages: "s. 10, 13, 18",
    text:
      "Planleggingen går i syklus: tenk, planlegg, tren og evaluer. En økt bør avsluttes med et konkret neste steg.",
  },
];

references.push(
  {
    title: "Fert og vind",
    category: "spor",
    pages: "s. 6",
    text:
      "Lukt flytter seg med luftstrømmer og kan fanges i vegetasjon. Hunden kan derfor følge fert ved siden av selve fotsporet. Noter vind og terrengform når du evaluerer spornøyaktighet.",
  },
  {
    title: "Godbitspor",
    category: "spor",
    pages: "s. 7",
    text:
      "Mat i sporet kan starte innlæring ved å koble mennesketråkk og funn. Etter hvert må mengden reduseres slik at hunden følger menneskesporet mellom belønningene.",
  },
  {
    title: "Spontanspor",
    category: "spor",
    pages: "s. 8, 11",
    text:
      "Spontanspor tester hundens egen nysgjerrighet og motivasjon. Hunden tar initiativ uten tydelig spormodus og får uttelling ved å følge opp lukten.",
  },
  {
    title: "Kongbiter og passiv markering",
    category: "spor",
    pages: "s. 8",
    text:
      "Søk etter kongbiter kan gi presis sporinnlæring hvis passiv markering er godt etablert. Metoden gir kontroll på luktmengden fra funnobjektet og kan brukes på flere underlag.",
  },
  {
    title: "Påvirkning og slepespor",
    category: "spor",
    pages: "s. 8",
    text:
      "Synspåvirkning eller slepespor kan få enkelte hunder i gang, men bør brukes bevisst. Påvirkningen må ikke bli det hunden tror øvelsen handler om.",
  },
  {
    title: "Fertgrop",
    category: "spor",
    pages: "s. 8",
    text:
      "En fertgrop gir ekstra interesse ved start og kan hjelpe hunden i gang. Den bør fases ut gradvis når hunden forstår oppgaven bedre.",
  },
  {
    title: "Skog er ikke bare skog",
    category: "spor",
    pages: "s. 9",
    text:
      "Høy vegetasjon, lav vegetasjon, lyng, blåbærbusker og blandede underlag skaper ulike sporatferder. Bruk skogen aktivt som variasjon, ikke som én fast kategori.",
  },
  {
    title: "For sterk motivasjon",
    category: "problem",
    pages: "s. 9",
    text:
      "Hvis belønningen er så sterk at hunden ikke klarer å konsentrere seg, kan løsningen være bedre kontroll hos fører, lavere belønningsverdi eller en oppgave som krever roligere analyse.",
  },
  {
    title: "For svak motivasjon",
    category: "problem",
    pages: "s. 9",
    text:
      "Manglende fremgang skyldes ofte at belønningen ikke er god nok i situasjonen. Verdi påvirkes både av hva belønningen er og hvordan den presenteres.",
  },
  {
    title: "Direkte påsett",
    category: "oppsok",
    pages: "s. 11",
    text:
      "Ved direkte påsett viser fører nøyaktig hvor hunden skal analysere sporet. Vanskeligheten kan økes med vinkelen ekvipasjen kommer inn mot sporet.",
  },
  {
    title: "Sporoppsøk i terreng",
    category: "oppsok",
    pages: "s. 11-12",
    text:
      "I aktivt sporoppsøk søker hunden fremover i terrenget etter spor. Siden hunden allerede er i søk etter spor, er sjansen større for at den oppfatter og analyserer funnet.",
  },
  {
    title: "Sporoppsøk fra bygning",
    category: "oppsok",
    pages: "s. 12",
    text:
      "Fra bygning kan både søk tett på objektet og sirkel rundt være aktuelt. Objektet er større enn en bil, og oppgaven må planlegges deretter.",
  },
  {
    title: "Spor fra ledelinje",
    category: "oppsok",
    pages: "s. 12, 17-18",
    text:
      "Spor som forlater vei eller sti er en svært aktuell situasjon. Treningen bør lære hunden å søke fremover langs ledelinjen og oppdage avvik ut i terrenget.",
  },
  {
    title: "To ekvipasjer langs vei",
    category: "oppsok",
    pages: "s. 17",
    text:
      "Når ledelinjen er vei, kan to ekvipasjer søke hver sin side og øke fremdriften betydelig. Dette krever at hundene kan arbeide selvstendig langs veien.",
  },
  {
    title: "Tren førerens øyne",
    category: "plan",
    pages: "s. 20, 24-25",
    text:
      "Krevende spor lærer ikke bare hunden. De lærer fører å se små signaler: når hunden er på spor, når den utreder, når den mister luktbildet og når den ber om hjelp.",
  },
  {
    title: "10 minutters hvile mellom spor",
    category: "plan",
    pages: "s. 19-20",
    text:
      "Heftet konkretiserer pausen mellom kort læringsspor og hovedspor til ca. 10 minutter. Hunden legges i bilen for å modne luktbildet før neste oppgave. Konsekvent kort hvile reduserer risiko for at belønningsfasen overskygger sporopplevelsen.",
  },
  {
    title: "8-12 timer under frisøk",
    category: "oppsok",
    pages: "s. 17",
    text:
      "En redningshund bør kunne ta opp 8-12 timer gamle spor under frisøk når sporet utgjør et klart avvik i miljøet. Hunder uten andre spor rundt seg har vist evne til å detektere ~24 timer gamle spor. Tren mot dette - du får til det du trener på.",
  },
  {
    title: "5 km/t langs vei med to ekvipasjer",
    category: "oppsok",
    pages: "s. 17",
    text:
      "To ekvipasjer som søker hver sin side av en vei kan opprettholde ca. 5 km/t fremdrift og markere 20 timer gamle spor. På bred vei kan dette være tre til fire ganger raskere enn én ekvipasje alene.",
  },
  {
    title: "Markering av funn: passiv eller apport",
    category: "spor",
    pages: "s. 6",
    text:
      "Hvilken markeringsform du velger påvirker hva du kan trene. Apportering er enkelt å bygge på lydigheten. Passiv markering (sette/legge seg ved funn) gir bedre kontroll på små gjenstander - viktig for kongbit-spor og rene sporopptak. Snakk med instruktør om hva som passer hund og fører.",
  },
  {
    title: "Tren 2 døgn, sjekk effekt på 1 døgn",
    category: "plan",
    pages: "s. 20",
    text:
      "Etter å ha trent spor med ett døgns liggetid, anbefaler heftet å prøve to døgn og deretter gå tilbake til ett døgn. Mål om hunden har blitt bedre på ett-døgnsporene og på 6-timers spor. Trene 'over toppen' viser om treningen har gitt effekt.",
  },
  {
    title: "Spor fra bygning",
    category: "oppsok",
    pages: "s. 12",
    text:
      "Sporoppsøk fra bygning ligner bil-oppsøk, men objektet er mye større. Aktuelle løsninger er søk tett på objektet og søk i sirkel rundt det. Hytte, fjøs eller uthus gir ofte mer beferdet område enn en bil - planlegg for det.",
  },
  {
    title: "Stress er ikke bare stress",
    category: "grunnlag",
    pages: "s. 4-5",
    text:
      "Heftet bemerker at 'stress' her er feil bruk av begrepet teknisk sett, men det gir bilde på 'annen atferd' som oppstår når motivasjon ikke matches av utfordring. Praktisk: hvis du ser uro eller fart uten konsentrasjon, øk vanskeligheten - ikke skru ned belønningen først.",
  },
  {
    title: "Søksatferd kan justeres",
    category: "plan",
    pages: "s. 5",
    text:
      "En sideeffekt av å trene gamle spor: hunden endrer søksatferd også i flankesøk. Den senker tempoet og søker mer mot bakken når den har fokus på at det er gamle spor som er løsningen. Søksatferd er ikke fastlåst - den følger det du belønner.",
  },
  {
    title: "Sporbinding ved bil",
    category: "oppsok",
    pages: "s. 14-15",
    text:
      "Når hunden 'binder seg' til sporet ved bilen er det fordi den har analysert sporlukt fra omgivelsene og funnet en sammenhengende retning. Ikke avbryt analysen — gi tid og rom selv om det tar litt før hunden trekker ut.",
  },
  {
    title: "Snusefrekvens som indikator",
    category: "spor",
    pages: "s. 6, 24",
    text:
      "Endringer i hvor ofte hunden snuser kan fortelle deg om dagsformen, om luktbildet endrer seg (overgang underlag), eller om hunden nærmer seg tap. Lær å lese det som signal — det er ofte tidligere enn andre tegn.",
  },
  {
    title: "Førsteminuttene på sporet",
    category: "spor",
    pages: "s. 4-6",
    text:
      "De første 30-60 sekundene på et spor sier mye om dagsform og om sporet matcher hundens nivå. Hvis fart og uro starter høyt, øk vanskeligheten neste gang — ikke skru ned belønningen.",
  },
  {
    title: "Belønningsplassering",
    category: "spor",
    pages: "s. 7, 15-17",
    text:
      "Hvor du legger belønningen styrer hvor hunden tror løsningen er. På flanken under frisøk → ute i terrenget. Etter krysninger → å holde seg til sporet. Tett ved sluttgjenstand → markeringen. Plassering = læringsdesign.",
  },
  {
    title: "Stress vs uro vs frustrasjon",
    category: "grunnlag",
    pages: "s. 4-5",
    text:
      "Heftet skiller mellom 'stress' (teknisk feil bruk, men praktisk: annen atferd), uro (for lav utfordring) og frustrasjon (for høy utfordring). Diagnose før løsning: hvilken av de tre ser du? Behandlingen er ulik.",
  },
  {
    title: "Førerens kroppsspråk",
    category: "problem",
    pages: "s. 24-25",
    text:
      "Hunden leser føreren hele tiden. Snur du deg mot der du tror sporet ligger? Beveger du linen rytmisk? Står du i veien for hundens naturlige sirkel? Tren bort egen kroppsstøy — særlig ved sportap.",
  },
  {
    title: "Sporlinens spenning",
    category: "problem",
    pages: "s. 24-25",
    text:
      "En lett, jevn spenning gir hunden informasjon uten å være styrende. Stram line = kommando. Slakk line = signal om at fører forstyrrer. Lær følelsen av 'levende kontakt' og kjenn forskjellen.",
  },
  {
    title: "Veksling teig → spor",
    category: "oppsok",
    pages: "s. 11, 14",
    text:
      "Etter funn/melding i teig må hunden skifte mental modus før sporet. Avslutt funnet skikkelig, ta en kort pause, vis arbeidstegn, og start sporoppsøk tydelig. Sammenfletting svekker begge oppgavene.",
  },
  {
    title: "Mørke- og kveldsspor",
    category: "plan",
    pages: "s. 3, 19-20",
    text:
      "Aksjoner skjer ofte i mørke. Tren minst noen økter i lyssvake forhold slik at både hund og fører lærer hvordan luktbildet og førerlesing endrer seg når synet ikke hjelper.",
  },
  {
    title: "Aksjon vs trening",
    category: "grunnlag",
    pages: "s. 3-5",
    text:
      "Heftet poengterer at prøvesituasjonen ikke speiler aksjon. Tren bredt: ukjent liggetid, ukjente miljøer, skiftende vær og døgn. Du får til det du trener på — så tren det aksjonen krever.",
  },
  {
    title: "Sporlegger som feilkilde",
    category: "problem",
    pages: "s. 6-8, 26-27",
    text:
      "Sporlegger som tråkker tilbake, går utenom merkebånd eller legger feil belønning kan ødelegge læringssignaler. Brief grundig, gå gjennom plan på forhånd, og evaluer sporlegger like ofte som hund og fører.",
  },
  {
    title: "Loggføringens verdi",
    category: "plan",
    pages: "s. 5, 20",
    text:
      "Uten loggføring forsvinner mønstre. Loggfør liggetid, underlag, vind, belønning og atferd over flere økter — da begynner du å se hva som faktisk flytter hunden, og hva som bare er dagsform.",
  },
  {
    title: "Endre én variabel",
    category: "plan",
    pages: "s. 4-5",
    text:
      "Klassisk fagprinsipp: når mange ting endres samtidig vet du ikke hva som virket. Velg én hovedvariabel (alder, underlag, vind, lengde, forstyrrelse, intensitet) og hold de andre faste den økta.",
  },
  {
    title: "Snø som underlag",
    category: "spor",
    pages: "s. 9",
    text:
      "Fersk snø kan dempe lukt, gammel skare kan gi annen overflate enn sommerunderlag. Tren bevisst i ulike snøforhold — det er praktisk aksjonsnært i Norge.",
  },
  {
    title: "Lyng og blåbærlyng",
    category: "spor",
    pages: "s. 9",
    text:
      "Vegetasjon som binder lukt gir lengre 'holdetid' på sporet. Hunden kan jobbe roligere her, og det er nyttig som tidlig læringsmiljø før den må håndtere hardt underlag eller åpen sti.",
  },
  {
    title: "Hundens dagsform",
    category: "grunnlag",
    pages: "s. 4-5",
    text:
      "Dagsform svinger naturlig. Når formen er lav, prioriter mestringsoppgaver. Når den er høy, utfordre. Forventning om perfekt prestasjon hver økt ødelegger både motivasjon og analyse.",
  },
  {
    title: "Førerens dagsform",
    category: "grunnlag",
    pages: "s. 4-5",
    text:
      "Fører påvirker hunden mer enn vi tror. Stress, dårlig tid eller utålmodighet leses umiddelbart. Si det høyt før økta hvis du er sliten — så kan laget tilpasse.",
  },
  {
    title: "Vinkler i sporet",
    category: "spor",
    pages: "s. 6-10",
    text:
      "Skarpe vinkler tvinger hunden til å analysere. Få vinkler tidlig, flere senere. Vinklenes plassering (etter eller før belønning) påvirker også konsentrasjonen gjennom sporet.",
  },
  {
    title: "Forstyrrelser fra dyr",
    category: "problem",
    pages: "s. 26-27",
    text:
      "Dyrespor kryser ofte i Norge. Tren bevisst med kjente, planlagte forstyrrelser så hunden lærer at hovedsporet alltid lønner seg mest — uavhengig av hvor friskt rådyrsporet er.",
  },
  {
    title: "Etterregistrering på laget",
    category: "plan",
    pages: "s. 10, 13, 18",
    text:
      "Bruk 5 minutter på laget etter økta: hva fungerte, hva overrasket, hva er neste steg? Lagets felles refleksjon bygger felles språk og fanger opp ting den enkelte fører overser.",
  },
  {
    title: "Funn/melding under spor",
    category: "oppsok",
    pages: "s. 15-17",
    text:
      "Hvis hunden gjør funn underveis i et spor, må fører kunne lese om hunden trenger å avslutte funnet før den kan gå tilbake til sporet. Avtale ønsket atferd på forhånd og tren overgangen.",
  },
  {
    title: "Tempo som diagnose",
    category: "problem",
    pages: "s. 4, 24",
    text:
      "Tempo høyt og likt gjennom sporet → for lett oppgave. Tempo som faller mot tap-områder eller vinkler → konsentrert hund. Tempo som blir kaotisk → fører eller belønning bør justeres.",
  },
  {
    title: "Treningsmiljø-rotasjon",
    category: "plan",
    pages: "s. 3-5, 9",
    text:
      "Bytt treningsområde regelmessig. Hjemmeplassen lærer hunden 'her sporer vi'. Nytt sted krever ny analyse. Rotér 3-4 miljøer for å bygge bredde uten å forvirre.",
  },
  {
    title: "Sluttgjenstand som signal",
    category: "spor",
    pages: "s. 6, 28",
    text:
      "Sluttgjenstanden er hundens signal om at oppgaven er løst og belønning kommer. Plasser den så det matcher modus du vil trene — synlig ved tidlig læring, mer skjult senere.",
  }
);

export const reflectionLibrary = {
  grunnlag: [
    "Hva er hundens beste forsterker, og når blir den så høyverdi at konsentrasjonen taper?",
    "Hvor ofte tar du selv aktive grep når hunden ber om fasit, og hvor ofte står du rolig?",
    "Hvilke 'enkle' oppgaver kjører dere gjentatte ganger uten egentlig fremgang?",
    "Hva forteller hundens første 30 sekunder på sporet om dagsformen?",
  ],
  spor: [
    "Hvor i sporet endret hunden tempo, snusefrekvens eller linebruk?",
    "Hvilket underlag har hunden minst erfaring med, og hva er planen for å bygge den?",
    "Hvilken belønning gir best balanse mellom motivasjon og konsentrasjon akkurat nå?",
    "Hva ville endret seg hvis dere alltid loggførte vind, vær og liggetid?",
  ],
  oppsok: [
    "Hvor var sporet et tydelig avvik i miljøet, og hvor ble det bare ett av mange spor?",
    "Hvor lenge bør hunden følge et avvikende spor under frisøk - og er den regelen tydelig for laget?",
    "Når veksler hunden trygt fra funn/melding til spor, og når faller den ut av spormodus?",
    "Hvilket arbeidstegn bruker du, og er det likt for hele laget?",
  ],
  gamle: [
    "Ble hunden roligere, mer metodisk eller bare mer frustrert da sporet ble eldre?",
    "Hva opplevde hunden mellom kort spor, hvile og hovedspor sist?",
    "Hvor lang liggetid har dere faktisk trent over de siste 10 øktene?",
    "Hva forteller dette deg om hva som vil skje på aksjon med 18 timer gammelt spor?",
  ],
  retning: [
    "Tar hunden din seg tid til å analysere før den velger retning, eller starter den i den retningen den tilfeldigvis står?",
    "Hvor ofte trener dere uten line - og merkes forskjellen?",
    "Hvilken metode tror du virker best på din hund - rolig start eller sporkryss?",
  ],
  sportap: [
    "Når hunden mistet sporet sist, hvor lang tid tok det før den falt av på lesiden?",
    "Hva gjorde du med kroppen og linen da hunden mistet sporet?",
    "Stoppet hunden umiddelbart, eller fortsatte den fremover en god stund?",
  ],
  kryssende: [
    "Hvilke krysninger er reelle i ditt nærtreningsområde - sti, dyrespor, andre hundeførere?",
    "Hvor ofte bytter hunden til kryssende spor, og er det noe mønster (alder, ferskhet, vinkel)?",
    "Når trente dere sist en planlagt kryssing - eller er det alltid tilfeldig?",
  ],
  sirkel: [
    "Hvor mange ganger gjennom sirkelen klarer hunden å holde konsentrasjonen før den faller av?",
    "Hvilken radius gir mest læring akkurat nå for din hund?",
    "Hva forteller en sirkelspor-økt om dagsformen som du kunne brukt i neste vanlige spor?",
  ],
};

export const protocols = [
  {
    id: "before",
    title: "Før økta",
    items: [
      ["mål", "Definer ett moment", "Eksempel: oppsøk fra gjenstand, retning, sportap eller gammel liggetid."],
      ["variabel", "Velg hovedvariabel", "Endre bare én stor vanskelighet av gangen: alder, underlag, vind, forstyrrelse eller lengde."],
      ["hund", "Kartlegg hunden", "Forsterker, intensitet, selvstendighet, tidligere erfaring og dagsform."],
      ["sporlegger", "Brief sporlegger", "Avtal start, slutt, krysninger, merkebånd, belønning og hva fører skal vite."],
      ["sikkerhet", "Avklar sikkerhet", "Trafikk, terreng, jakt, mørke, samband, førstehjelp og hvor laget møtes etterpå."],
    ],
  },
  {
    id: "during",
    title: "Under arbeid",
    items: [
      ["arbeidstegn", "Bruk faste arbeidstegn", "Gjør startprosedyren tydelig, særlig ved veksling fra funn/melding til spor."],
      ["observer", "Se på hunden", "Tempo, hodeføring, snusefrekvens, linepress, stopp og valg ved avvik."],
      ["hjelp", "Støtt aktivt arbeid", "Gå med når hunden søker. Stå rolig når hunden ber om fasit."],
      ["line", "Gi plass i linen", "Ved sportap skal hunden ha nok rom til å jobbe bakover og på lesiden."],
      ["belonn", "Belønn riktig moment", "Belønningen skal treffe læringsmålet, ikke bare slutten på hele sporet."],
    ],
  },
  {
    id: "after",
    title: "Etter økta",
    items: [
      ["fakta", "Loggfør fakta", "Dato, hund, fører, liggetid, underlag, vær, lengde og moment."],
      ["atferd", "Loggfør atferd", "Hva viste hunden før funn, ved tap, ved krysning og ved belønning?"],
      ["forer", "Evaluer fører", "Hvor påvirket kropp, line eller forventning hundens løsning?"],
      ["hvile", "Planlegg hvile", "Særlig etter krevende spor skal hunden få modne erfaringen uten mye støy."],
      ["neste", "Skriv neste steg", "Neste økt skal være bestemt før dagens trening er helt ferdig."],
    ],
  },
];

export const diagrams = [
  {
    module: "grunnlag",
    title: "Balansen motivasjon ↔ utfordring",
    text: "For lav utfordring gir fart og uro. For høy gir frustrasjon. Sweet spot er konsentrert sporatferd.",
    svg: `<svg viewBox="0 0 260 180" role="img" aria-label="U-formet kurve som viser balanse mellom for lett og for vanskelig">
      <defs>
        <linearGradient id="balZone" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#0077da" stop-opacity="0.12"/>
          <stop offset="1" stop-color="#0077da" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="244" height="148" rx="8" fill="#fbfdff" stroke="#c7dceb"/>
      <!-- Aksene -->
      <line x1="32" y1="132" x2="232" y2="132" stroke="#9bb6cf" stroke-width="1.5"/>
      <line x1="32" y1="24" x2="32" y2="132" stroke="#9bb6cf" stroke-width="1.5"/>
      <text x="32" y="18" font-size="9" fill="#53677d">konsentrasjon</text>
      <text x="232" y="148" font-size="9" fill="#53677d" text-anchor="end">utfordring →</text>
      <!-- Sweet-spot sone -->
      <rect x="105" y="32" width="50" height="100" fill="url(#balZone)"/>
      <!-- Kurve: lav venstre (uro), topp midt (sweet spot), lav høyre (frustrasjon) -->
      <path d="M 40 110 Q 80 90 100 50 Q 130 28 160 50 Q 180 90 220 115" fill="none" stroke="#0077da" stroke-width="4" stroke-linecap="round"/>
      <!-- Markører -->
      <circle cx="60" cy="100" r="6" fill="#a33c30"/>
      <text x="60" y="124" font-size="9" fill="#a33c30" text-anchor="middle">uro / fart</text>
      <circle cx="130" cy="36" r="7" fill="#0077da"/>
      <text x="130" y="32" font-size="10" font-weight="700" fill="#005fab" text-anchor="middle">sweet spot</text>
      <circle cx="200" cy="105" r="6" fill="#a33c30"/>
      <text x="200" y="124" font-size="9" fill="#a33c30" text-anchor="middle">frustrasjon</text>
      <text x="130" y="170" font-size="10" fill="#53677d" text-anchor="middle">Øk én variabel av gangen: alder, underlag, vind, forstyrrelser.</text>
    </svg>`,
  },
  {
    module: "oppsok",
    title: "Sporoppsøk fra bil",
    text: "Førerdøren er ofte sannsynlig startpunkt. Hjulområde og spor ut fra bilen er praktiske analysepunkt.",
    svg: `<svg viewBox="0 0 260 180" role="img" aria-label="Bil sett ovenfra med sannsynlige sporutganger">
      <rect x="8" y="8" width="244" height="148" rx="8" fill="#fbfdff" stroke="#c7dceb"/>
      <!-- Vegstripe -->
      <line x1="20" y1="60" x2="240" y2="60" stroke="#dbe7f3" stroke-width="2" stroke-dasharray="4 6"/>
      <text x="240" y="54" font-size="9" fill="#9bb6cf" text-anchor="end">vei</text>
      <!-- Bil -->
      <rect x="80" y="70" width="100" height="42" rx="9" fill="#d4edfc" stroke="#0a2850" stroke-width="2"/>
      <!-- Frontrute -->
      <path d="M 96 73 L 110 88 L 150 88 L 164 73 Z" fill="#ffffff" stroke="#0a2850" stroke-width="1.2"/>
      <!-- Bakrute -->
      <path d="M 96 109 L 110 96 L 150 96 L 164 109 Z" fill="#ffffff" stroke="#0a2850" stroke-width="1.2"/>
      <!-- Hjul -->
      <rect x="76" y="74" width="8" height="14" rx="2" fill="#0a2850"/>
      <rect x="176" y="74" width="8" height="14" rx="2" fill="#0a2850"/>
      <rect x="76" y="94" width="8" height="14" rx="2" fill="#0a2850"/>
      <rect x="176" y="94" width="8" height="14" rx="2" fill="#0a2850"/>
      <!-- Førerdør (markert) -->
      <line x1="84" y1="92" x2="108" y2="92" stroke="#f4c542" stroke-width="3"/>
      <circle cx="96" cy="92" r="4" fill="#f4c542"/>
      <text x="40" y="92" font-size="9" font-weight="700" fill="#a37b00" text-anchor="middle">FØRERDØR</text>
      <line x1="62" y1="92" x2="78" y2="92" stroke="#a37b00" stroke-width="1"/>
      <!-- Sporvalg 1: rolig ut i terrenget (blå) -->
      <path d="M 96 95 Q 80 120 50 138 Q 35 142 22 144" fill="none" stroke="#0077da" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="22" cy="144" r="4" fill="#0077da"/>
      <!-- Sporvalg 2: langs bilen og rundt (lilla-amber) -->
      <path d="M 96 95 Q 140 130 180 138 Q 210 142 234 138" fill="none" stroke="#f4c542" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="6 4"/>
      <circle cx="234" cy="138" r="4" fill="#f4c542"/>
      <!-- Forklaring -->
      <text x="22" y="172" font-size="9" fill="#0077da">enkel: rett ut</text>
      <text x="234" y="172" font-size="9" fill="#a37b00" text-anchor="end">progresjon: langs bil → rundt</text>
    </svg>`,
  },
  {
    module: "sportap",
    title: "Sportap i sidevind",
    text: "Sporlukten drar av på lesiden av vinden. Hunden stopper, faller av på lesiden, søker rasjonelt bakover.",
    svg: `<svg viewBox="0 0 260 180" role="img" aria-label="Sporlinje med sportap og hvordan hunden løser tap i sidevind">
      <rect x="8" y="8" width="244" height="148" rx="8" fill="#fbfdff" stroke="#c7dceb"/>
      <!-- Vindpil -->
      <g transform="translate(20,28)">
        <line x1="0" y1="0" x2="34" y2="0" stroke="#0a2850" stroke-width="2"/>
        <path d="M 28 -5 L 34 0 L 28 5" fill="none" stroke="#0a2850" stroke-width="2"/>
        <text x="40" y="4" font-size="10" fill="#0a2850" font-weight="700">VIND</text>
      </g>
      <!-- Spor (intakt del) -->
      <path d="M 30 80 Q 90 70 140 90 Q 165 100 180 105" fill="none" stroke="#0077da" stroke-width="4.5" stroke-linecap="round"/>
      <!-- Tapt del (stiplet) -->
      <path d="M 180 105 Q 210 110 240 108" fill="none" stroke="#0077da" stroke-width="3" stroke-dasharray="4 5" stroke-linecap="round"/>
      <text x="240" y="100" font-size="9" fill="#0077da" text-anchor="end">sporet fortsetter</text>
      <!-- Hund (faktisk vei, faller av på lesiden) -->
      <path d="M 30 82 Q 90 72 140 92 Q 160 102 175 108 Q 185 114 188 130" fill="none" stroke="#a33c30" stroke-width="3" stroke-linecap="round"/>
      <!-- Lesidesøk -->
      <path d="M 188 130 Q 175 122 160 118 Q 150 116 148 110" fill="none" stroke="#a33c30" stroke-width="2.5" stroke-dasharray="3 4" stroke-linecap="round"/>
      <circle cx="148" cy="110" r="4" fill="#a33c30"/>
      <text x="195" y="146" font-size="9" fill="#a33c30">hund stopper</text>
      <text x="148" y="100" font-size="9" fill="#a33c30" text-anchor="middle">finner spor igjen</text>
      <!-- Lesidesone -->
      <line x1="140" y1="115" x2="240" y2="135" stroke="#9bb6cf" stroke-width="1" stroke-dasharray="2 3"/>
      <text x="240" y="148" font-size="9" fill="#53677d" text-anchor="end">lesiden</text>
      <!-- Forklaring -->
      <text x="130" y="170" font-size="10" fill="#53677d" text-anchor="middle">Stå stille når hunden jobber. Gå rolig bakover for å invitere — vis aldri svaret.</text>
    </svg>`,
  },
  {
    module: "sirkel",
    title: "Sirkelspor (Olsrud-svingen)",
    text: "Sporlinen festes i et anker i midten. Linelengden = radius = vanskelighetsgrad. Aldri rette strekk.",
    svg: `<svg viewBox="0 0 260 180" role="img" aria-label="Sirkelspor sett ovenfra med anker, sporline, sirkel og sluttgjenstand">
      <rect x="8" y="8" width="244" height="148" rx="8" fill="#fbfdff" stroke="#c7dceb"/>
      <!-- Ytre sirkel hint -->
      <circle cx="130" cy="92" r="68" fill="none" stroke="#e6f2fb" stroke-width="2"/>
      <!-- Selve sporet (sirkel) -->
      <circle cx="130" cy="92" r="58" fill="none" stroke="#0077da" stroke-width="4" stroke-dasharray="9 6"/>
      <!-- Sporline fra anker til sporlegger -->
      <line x1="130" y1="92" x2="188" y2="92" stroke="#f4c542" stroke-width="2.5"/>
      <!-- Anker i midten -->
      <circle cx="130" cy="92" r="5" fill="#0a2850"/>
      <rect x="124" y="80" width="12" height="6" fill="#0a2850"/>
      <text x="130" y="74" font-size="9" font-weight="700" fill="#0a2850" text-anchor="middle">ANKER</text>
      <!-- Sporlegger (figur ute på sirkelen) -->
      <circle cx="188" cy="92" r="6" fill="#f4c542" stroke="#a37b00" stroke-width="1.5"/>
      <!-- Sluttgjenstand -->
      <rect x="76" y="138" width="12" height="9" rx="2" fill="#a33c30"/>
      <text x="64" y="158" font-size="9" fill="#a33c30">sluttgjenstand</text>
      <line x1="82" y1="138" x2="82" y2="148" stroke="#a33c30" stroke-width="1"/>
      <!-- Inngang/utgang (sporflagg) -->
      <line x1="82" y1="148" x2="82" y2="158" stroke="#0a2850" stroke-width="2"/>
      <polygon points="82,148 90,150 82,153" fill="#0a2850"/>
      <text x="92" y="158" font-size="9" fill="#0a2850">sporflagg</text>
      <!-- Radius-pil -->
      <line x1="130" y1="92" x2="172" y2="92" stroke="#a37b00" stroke-width="1" stroke-dasharray="2 2"/>
      <text x="148" y="86" font-size="9" fill="#a37b00" text-anchor="middle">radius = vanskelighet</text>
      <!-- Forklaring -->
      <text x="130" y="172" font-size="10" fill="#53677d" text-anchor="middle">Smal sirkel = mer konsentrasjon. Vid sirkel = lengre justeringer.</text>
    </svg>`,
  },
];

export const planBlueprints = {
  "forste-spor": {
    title: "Aller første sporøkt",
    pages: "s. 7-8",
    module: "grunnlag",
    intro: "Den aller første sporøkten handler om at hunden lærer én ting: menneskelukt = lønn. Hold det kort, lavt og enkelt. Dette eksempelet bruker godbitspor — snakk med instruktør om hvilken metode som passer din hund.",
    steps: [
      "Velg et område med kjent, lav vegetasjon (lyng/blåbær) og lite forstyrrelser.",
      "Tråkk opp en firkant på ca. 2×2 meter — grundig, så det blir masse menneskelukt.",
      "Strø godbiter ut over firkanten. (Eller plasser én kongbit hvis dere bruker passiv markering.)",
      "Sett arbeidstegnet tydelig: ta frem sporlinen og fest karabinen i selen.",
      "La hunden søke fritt i firkanten. Den skal lære at menneskelukten gir lønn.",
      "Avslutt rolig — kort belønningsfase. Den skal ikke overskygge selve sporopplevelsen.",
      "Legg hunden i bilen etterpå. Hvile er en del av læringen.",
    ],
    success: "Hunden viser interesse for det opptråkkete området og søker selvstendig — uten å se etter deg.",
    observations: [
      "Tok hunden initiativ til å søke selv, eller måtte du oppmuntre den i gang?",
      "Hvilken forsterker traff best — godbiter, Kong, lek eller ros?",
      "Når begynte konsentrasjonen å tape mot forventningen om belønning?",
    ],
    theoryKeys: ["Den første sporøkten", "Selvstendighet bygges i små valg", "Oppgaven kommuniserer mer enn linen"],
  },
  "gamle-spor": {
    title: "Spor med lang liggetid",
    pages: "s. 19-20",
    module: "gamle",
    intro: "Eldre spor tvinger hunden til å jobbe rolig og metodisk. Det er overførbart til alt annet sporarbeid.",
    steps: [
      "Legg ett kort læringsspor på 30-50 meter med kjent sporlegger og kjent underlag.",
      "Gi kort, god belønning ved slutt og legg hunden til hvile.",
      "Etter kort pause går dere et lengre spor med to vinkler og samme liggetid.",
      "Loggfør hvordan hunden løser problemene: tempo, snusefrekvens, tap og selvstendighet.",
    ],
    success: "Hunden blir roligere og mer metodisk når luktbildet er svakt.",
    observations: [
      "Ble hunden roligere etter hvile, eller fortsatte den å jobbe likt som på første spor?",
      "Hvor i sporet endret hunden tempo eller snusefrekvens?",
      "Hva gjorde hunden ved vinklene — analyserte den, eller løp den forbi?",
    ],
    theoryKeys: ["Gamle spor som læringsverktøy", "Kort spor før hovedspor", "Hvile er del av treningen"],
  },
  "oppsok-gjenstand": {
    title: "Sporoppsøk fra gjenstand",
    pages: "s. 14",
    module: "oppsok",
    intro: "Funnet av gjenstanden må beholde verdi — ellers hopper hunden over meldingen.",
    steps: [
      "Legg enkel teig der hunden finner og melder/påviser gjenstand.",
      "Belønn funnet slik at gjenstanden beholder verdi.",
      "Ta frem sporlinen etter en kort pause og start oppsøk tydelig.",
      "Varier om oppsøket starter tett ved gjenstanden eller i sirkel 5-10 meter unna.",
    ],
    success: "Hunden veksler trygt fra funn/melding til spor uten å hoppe over gjenstanden.",
    observations: [
      "Meldte hunden tydelig på gjenstanden før den ville videre på spor?",
      "Hvordan reagerte hunden på arbeidstegnet (sporlinen frem)?",
      "Var sporstartet ved gjenstanden tydelig for hunden, eller måtte den lete?",
    ],
    theoryKeys: ["Sporoppsøk er en egen øvelse", "Arbeidstegn gir mental omkobling", "Avvik i miljøet – oppsøkstypene"],
  },
  "oppsok-bil": {
    title: "Sporoppsøk fra bil",
    pages: "s. 12, 14-15",
    module: "oppsok",
    intro: "Førerdøren er ofte sannsynlig startpunkt. Tenk hjulkant og bakre kant av førerdøren.",
    steps: [
      "Velg bilplassering med egnet underlag og lite forstyrrelser første gang.",
      "Legg kort spor fra sannsynlig startpunkt ved førerdør.",
      "Tren flere varianter: rett ut, langs bilen, rundt bilen og med annet tråkk.",
      "Øk forstyrrelser og underlagsbytte først når hunden forstår oppgaven.",
    ],
    success: "Hunden analyserer sporstart ved bilen uten å bli fanget av alt annet tråkk.",
    observations: [
      "Hvor ved bilen begynte hunden å analysere — førerdør, hjul eller et annet sted?",
      "Hvor lang tid brukte hunden på å binde seg til sporet før den trakk ut?",
      "Forsto hunden retningen på sporet, eller måtte den prøve seg flere veier?",
    ],
    theoryKeys: ["Avvik i miljøet – oppsøkstypene", "Sporoppsøk er en egen øvelse"],
  },
  frisok: {
    title: "Sporopptak under frisøk",
    pages: "s. 15-17",
    module: "oppsok",
    intro: "Hunden vet ikke om sporet tilhører savnede. Laget må ha en regel for hva som skal skje.",
    steps: [
      "Start med et frisøk der hunden har roet seg før den møter sporet.",
      "Legg sporet ute på flanken for å bygge riktig søksmønster.",
      "Plasser belønning slik at fører kan se atferdsendringen og opptaket.",
      "Repetér før alder og kompleksitet økes.",
    ],
    success: "Fører ser tydelig når hunden registrerer spor som avvik i miljøet.",
    observations: [
      "Hvilken atferdsendring viste hunden idet den traff sporet — tempo, hode, snusing?",
      "Klarte du som fører å se opptaket idet det skjedde, eller først etterpå?",
      "Hvor langt fulgte hunden sporet før dere fikk gjort noe med det?",
    ],
    theoryKeys: ["Frisøk gir et beslutningsdilemma", "Avvik i miljøet – oppsøkstypene"],
  },
  retning: {
    title: "Retningsbestemming",
    pages: "s. 21-23",
    module: "retning",
    intro: "Tre fotavtrykk er nok. Problemet er ikke informasjon, men tid til å bruke den.",
    steps: [
      "Start med rolig hund tett på sporet, 10-15 cm fra fotavtrykkene.",
      "La hunden analysere før den får gå.",
      "Legg belønning etter få meter riktig vei.",
      "Øk gradvis avstand fra sporet eller bruk gjentatte krysninger over sti.",
    ],
    success: "Hunden bruker tid på analyse før den velger retning.",
    observations: [
      "Tok hunden seg tid til å analysere før den valgte retning?",
      "Hvor høy var intensiteten ved start — påvirket den valget?",
      "Ved sporkryss: hvor mange ganger valgte hunden riktig av seg selv?",
    ],
    theoryKeys: ["Retning krever analyse", "Tre fotavtrykk holder", "To metoder, ett mål"],
  },
  sportap: {
    title: "Sportap",
    pages: "s. 24-25",
    module: "sportap",
    intro: "Ved tap ligger løsningen nesten alltid bak hunden. I sidevind: på lesiden.",
    steps: [
      "Legg kort spor i sidevind og snu tilbake i eget spor.",
      "Hopp ut på lesiden etter 10-15 meter og legg slutt etter kort strekk.",
      "La hunden jobbe innenfor linelengden når tapet oppstår.",
      "Gå rolig baklengs for å gi plass og invitere bakover.",
    ],
    success: "Hunden stopper raskt ved tap og søker rasjonelt tilbake.",
    observations: [
      "Stoppet hunden umiddelbart da sporet ble borte, eller fortsatte den fremover?",
      "Falt hunden av på lesiden av seg selv, eller måtte du invitere?",
      "Hvor lang tid tok det fra tap til at hunden hadde sporet igjen?",
    ],
    theoryKeys: ["Sportap er normalt", "Lesiden er nøkkelen", "Fører er ofte forstyrreren"],
  },
  kryssende: {
    title: "Sportap ved kryssende spor",
    pages: "s. 26-27",
    module: "kryssende",
    intro: "Belønning etter krysningen forsterker valget — ikke bare det å nå mål.",
    steps: [
      "Planlegg og merk nøyaktig hvor forstyrrelsesspor skal krysse.",
      "Legg hovedsporet med belønninger etter krysningene.",
      "Legg kryssende spor kontrollert på merkene.",
      "Varier etter hvert alder på hovedspor og forstyrrelse.",
    ],
    success: "Hunden viser mindre interesse for å bytte spor over tid.",
    observations: [
      "Ved hver krysning: holdt hunden seg på hovedsporet, eller vurderte den å bytte?",
      "Var det noe spesielt ved krysningene der hunden tvilte — vinkel, alder, lukt?",
      "Endret hunden atferd over flere krysninger — ble valget tydeligere?",
    ],
    theoryKeys: ["Hvorfor bytter hunden spor", "Merkebandet er sjefen", "Variér når du vil endre atferd"],
  },
  sirkelspor: {
    title: "Sirkelspor",
    pages: "s. 28",
    module: "sirkel",
    intro: "Aldri rette strekk. Hunden må konsentrere seg kontinuerlig — fører ser tydelig når den ryker.",
    steps: [
      "Sett anker i midten og fest sporline for å lage jevn sirkel.",
      "Gå ut fra midten og start sirkelen etter 3-4 meter.",
      "Legg sluttgjenstand nær inngang/utgang før du henter ankeret.",
      "Juster radius med linelengden for å styre vanskelighetsgrad.",
    ],
    success: "Hunden holder konsentrasjonen når sporet hele tiden endrer retning.",
    observations: [
      "Hvor mange ganger rundt sirkelen klarte hunden å holde konsentrasjonen?",
      "Hvor i sirkelen ryker konsentrasjonen først — innover, utover, ved sluttgjenstanden?",
      "Hva forteller dette deg om dagsformen som du kan ta med til neste vanlige spor?",
    ],
    theoryKeys: ["Sirkelspor trener kontinuerlig presisjon", "Ankeret gir geometrisk presisjon", "Bruk det som diagnose"],
  },
};

export const gettingStartedGuide = {
  pages: "s. 7-11",
  lead:
    "Heftet sier eksplisitt at detaljene i nyinnlæring skal tilpasses i samarbeid med instruktør. Denne siden gir deg utgangspunktet: det heftet kaller «litt forenklet» — det du må ha tenkt gjennom før du legger første spor.",
  kartlegging: {
    title: "1. Kartlegg hunden",
    pages: "s. 7",
    intro:
      "Treningen går mye lettere når hunden er konsentrert. For å forme konsentrasjonen må du ha kartlagt hunden før du legger en plan.",
    questions: [
      {
        id: "forsterker",
        text: "Hva er den beste forsterkeren? Ball/Kong, godbiter, eller det å finne folk?",
        options: ["Ball/Kong", "Godbiter", "Finne folk"],
        multi: true,
      },
      {
        id: "selvstendighet",
        text: "Er hunden selvstendig eller veldig avhengig av deg som fører?",
        options: ["Selvstendig", "Litt av begge", "Avhengig av fører"],
      },
      {
        id: "nysgjerrighet",
        text: "Er hunden svært nysgjerrig, moderat eller lite nysgjerrig?",
        options: ["Svært nysgjerrig", "Moderat nysgjerrig", "Lite nysgjerrig"],
      },
      {
        id: "intensitet",
        text: "Hvilken intensitet viser den når den leter etter leken sin?",
        options: ["Høy intensitet", "Middels intensitet", "Lav intensitet"],
      },
      {
        id: "andre-forhold",
        text: "Er det andre forhold (helse, alder, tidligere erfaring) du må ta hensyn til?",
        note: true,
      },
    ],
  },
  metoder: {
    title: "2. Velg startmetode",
    pages: "s. 7-8",
    intro:
      "Det finnes flere innganger til sportreningen. Velg den som passer din hund — ikke den som er trendy. Heftet beskriver fem hovedmetoder som alle brukes i praksis, pluss fertgrop som tilleggsteknikk. Samtale med instruktør avgjør hvilken som passer.",
    items: [
      {
        name: "Godbitspor (næringsspor)",
        suits: "Hunder med god matmotivasjon. Brukes i mange miljøer.",
        how: "Tråkk opp en firkant, fyll den med godbiter, la hunden søke og spise. Etter noen repetisjoner går firkanten over til et spor med godbiter, og du reduserer mengden gradvis slik at hunden følger menneskesporet lenger og lenger mellom hver godbit.",
      },
      {
        name: "Spontanspor",
        suits: "Hunder med stor nysgjerrighet som tar initiativ selv.",
        how: "Hunden tar selv initiativ til å begynne å gå sporet, og får belønning ved å finne noe i sporet. Egner seg ikke for alle — krever en hund som «slår på» av seg selv.",
      },
      {
        name: "Søk etter kongbiter",
        suits: "Hunder som allerede har passiv markering på Kong.",
        how: "Som godbitspor, men du legger én kongbit i den opptråkkete ruten. Når hunden har lært å søke i ruten, gjør du den smal og lang — så til en stripe/spor. Gir høyere intensitet enn godbitspor og god kontroll på luktmengden fra funnobjektet.",
      },
      {
        name: "Synspåvirkning av figurant",
        suits: "Hunder som er vanskelige å få i gang.",
        how: "Hunden holdes tilbake i linen mens den ser figurant (eller fører) gå innover i skogen. Etter kort eller lengre tid får hunden følge etter. Brukes bevisst som døråpner — påvirkningen er ikke i overensstemmelse med atferden du vil ha på sikt, så den fases ut.",
      },
      {
        name: "Slepespor",
        suits: "Hunder som er vanskelige å få i gang og som tenner på leke.",
        how: "Som synspåvirkning, men figuranten viser hunden en leke, slipper den og sleper den i line etter seg. Brukes for å komme i gang — ikke som langsiktig metode.",
      },
    ],
    extra: {
      name: "Fertgrop (tilleggsteknikk)",
      how: "Tråkk litt ekstra der hunden skal starte å søke. Dette gir interesse for stedet og ferten, og lar hunden komme godt i gang. Fases gradvis ut når hunden blir bedre i øvelsen.",
    },
  },
  arbeidstegn: {
    title: "3. Etabler arbeidstegn",
    pages: "s. 11",
    text:
      "Treningen går lettere om du bruker et fast signal hver gang dere skal trene sporet. Et godt arbeidstegn er en synlig handling: ta tydelig frem sporlinen, lås den opp, kast den ut og fest karabinkroken i hundens sele. Da skjønner hunden at «nå skal vi spore» — og det blir lettere å skille spor fra andre øvelser.",
  },
  forsteOkt: {
    title: "4. Aller første sporøkt",
    pages: "s. 7-8",
    intro:
      "Her er et eksempel basert på godbitspor — en av flere metoder heftet beskriver. Dette er bare ett eksempel på hvordan en helt første økt kan se ut. Tilpass både metode og detaljene med instruktøren din.",
    steps: [
      "Velg et område med kjent, lav vegetasjon (lyng/blåbær) og lite forstyrrelser.",
      "Tråkk opp en firkant på ca. 2×2 meter — grundig, så det blir masse menneskelukt i ruten.",
      "Strø godbiter ut over firkanten. (Eller plasser én kongbit hvis dere bruker passiv markering.)",
      "Sett arbeidstegnet tydelig — ta frem sporlinen og fest karabinen i selen.",
      "La hunden søke fritt i firkanten. Den skal lære én ting: menneskelukten gir lønn.",
      "Avslutt rolig. Belønningsfasen skal ikke overskygge selve sporopplevelsen.",
      "Legg hunden i bilen etterpå. Hvile er en del av læringen — det er der inntrykkene fester seg.",
    ],
  },
  progresjon: {
    title: "5. Når dere har gjort det 3-5 ganger",
    pages: "s. 7",
    items: [
      "Gjør firkanten avlang (rektangel) i stedet for kvadratisk.",
      "Etter hvert: gjør den om til en bred stripe.",
      "Til slutt: en tynn stripe som blir et reelt spor.",
      "Reduser mengden godbiter mellom hver gang, så hunden følger menneskesporet lenger og lenger mellom hver belønning.",
    ],
  },
  sirkel: {
    title: "Husk sirkelen",
    pages: "s. 10",
    text:
      "Tenk → Planlegg → Tren → Tenk → Planlegg → Tren ... Enhver treningsøkt er ikke ferdig før neste økt er planlagt. Lag en plan etter denne første økta — selv om planen er kort.",
  },
  instruktor: {
    text:
      "Heftet sier: «Detaljer om hvordan hver hund bør trenes må tas i praksis ute i samarbeid mellom ekvipasje og instruktør.» Bruk denne siden som utgangspunkt, ikke fasit. Avtal første økt med instruktøren din.",
  },
};

// Render ett spørsmål i kartleggingskortet: avkrysningsbokser/radioknapper for
// faste alternativer, og/eller et fritekstfelt. `saved` er brukerens lagrede
// svar for dette spørsmålet (eller undefined hvis ubesvart).
function renderGsQuestion(q, saved) {
  const savedOptions = saved?.options || [];
  const optionsHtml = (q.options || [])
    .map((opt) => {
      const type = q.multi ? "checkbox" : "radio";
      const checked = savedOptions.includes(opt) ? " checked" : "";
      return `<label class="gs-option">
          <input type="${type}" name="gsq-${escapeHtml(q.id)}" data-gs-question="${escapeHtml(q.id)}" data-gs-option="${escapeHtml(opt)}" data-gs-multi="${q.multi ? "1" : "0"}"${checked} />
          <span>${escapeHtml(opt)}</span>
        </label>`;
    })
    .join("");
  const noteHtml = q.note
    ? `<textarea class="gs-note" data-gs-note="${escapeHtml(q.id)}" rows="2" placeholder="Skriv inn notater …">${escapeHtml(saved?.note || "")}</textarea>`
    : "";
  return `
    <div class="gs-question">
      <p class="gs-question-text">→ ${escapeHtml(q.text)}</p>
      ${optionsHtml ? `<div class="gs-options">${optionsHtml}</div>` : ""}
      ${noteHtml}
    </div>`;
}

// Læringsmodulen vises som en stegvis kortbunke — én fordøyelig bit av gangen,
// likt velkomstintroen. All informasjonen fra heftet er bevart, bare delt opp i
// mindre kort slik at brukeren blar seg gjennom én tanke om gangen.
// `answers` er brukerens lagrede svar på kartleggingsspørsmålene, nøklet på spørsmåls-id.
export function renderGettingStarted(answers = {}) {
  const g = gettingStartedGuide;
  const stepLi = (s, i) => `<li><span class="step-index">${i + 1}</span><span>${escapeHtml(s)}</span></li>`;

  const slides = [];

  // Kort 1: rammen rundt det hele.
  slides.push(`
    <div class="gs-card gs-card-intro">
      <p class="eyebrow">Slik kommer du i gang</p>
      <h4 class="gs-card-title">Før du legger første spor</h4>
      <p>${escapeHtml(g.lead)}</p>
      <p class="small gs-hint">Bla deg gjennom — ett kort om gangen.</p>
    </div>`);

  // Steg 1: kartlegg hunden — intro og spørsmål delt i to kort.
  slides.push(`
    <div class="gs-card">
      <header class="gs-card-head"><span class="gs-step-pill">1</span><div><h4>${escapeHtml(g.kartlegging.title.replace(/^1\.\s*/, ""))}</h4><p class="small">${escapeHtml(g.kartlegging.pages)}</p></div></header>
      <p>${escapeHtml(g.kartlegging.intro)}</p>
    </div>`);
  slides.push(`
    <div class="gs-card">
      <p class="eyebrow">Kartlegg hunden · ${escapeHtml(g.kartlegging.pages)}</p>
      <h4 class="gs-card-title">Tenk gjennom dette først</h4>
      <div class="gs-question-list">${g.kartlegging.questions.map((q) => renderGsQuestion(q, answers[q.id])).join("")}</div>
      <p class="small gs-hint">Svarene lagres på denne enheten.</p>
    </div>`);

  // Steg 2: velg metode — intro, så alle metodene som en utvidbar liste på samme kort.
  const methodsHtml = g.metoder.items
    .map(
      (m) => `<details class="start-method">
        <summary>
          <span class="start-method-name">${escapeHtml(m.name)}</span>
          <span class="start-method-suits">${escapeHtml(m.suits)}</span>
        </summary>
        <p>${escapeHtml(m.how)}</p>
      </details>`
    )
    .join("");
  slides.push(`
    <div class="gs-card">
      <header class="gs-card-head"><span class="gs-step-pill">2</span><div><h4>${escapeHtml(g.metoder.title.replace(/^2\.\s*/, ""))}</h4><p class="small">${escapeHtml(g.metoder.pages)}</p></div></header>
      <p>${escapeHtml(g.metoder.intro)}</p>
      <div class="start-methods">${methodsHtml}</div>
      <details class="start-method start-method-extra">
        <summary>
          <span class="start-method-name">${escapeHtml(g.metoder.extra.name)}</span>
          <span class="start-method-suits">Tilleggsteknikk</span>
        </summary>
        <p>${escapeHtml(g.metoder.extra.how)}</p>
      </details>
    </div>`);

  // Steg 3: arbeidstegn.
  slides.push(`
    <div class="gs-card">
      <header class="gs-card-head"><span class="gs-step-pill">3</span><div><h4>${escapeHtml(g.arbeidstegn.title.replace(/^3\.\s*/, ""))}</h4><p class="small">${escapeHtml(g.arbeidstegn.pages)}</p></div></header>
      <p>${escapeHtml(g.arbeidstegn.text)}</p>
    </div>`);

  // Steg 4: selve økta — intro, så oppskriften delt i «gjør klar» og «gjennomfør».
  slides.push(`
    <div class="gs-card gs-step-highlight">
      <header class="gs-card-head"><span class="gs-step-pill">4</span><div><h4>${escapeHtml(g.forsteOkt.title.replace(/^4\.\s*/, ""))}</h4><p class="small">${escapeHtml(g.forsteOkt.pages)}</p></div></header>
      <p>${escapeHtml(g.forsteOkt.intro)}</p>
    </div>`);
  slides.push(`
    <div class="gs-card gs-step-highlight">
      <p class="eyebrow">Aller første sporøkt · gjør klar</p>
      <h4 class="gs-card-title">Slik gjør du det</h4>
      <ol class="plan-steps gs-steps">${g.forsteOkt.steps.slice(0, 4).map((s, i) => stepLi(s, i)).join("")}</ol>
    </div>`);
  slides.push(`
    <div class="gs-card gs-step-highlight">
      <p class="eyebrow">Aller første sporøkt · gjennomfør og avslutt</p>
      <ol class="plan-steps gs-steps">${g.forsteOkt.steps.slice(4).map((s, i) => stepLi(s, i + 4)).join("")}</ol>
    </div>`);

  // Steg 5: progresjon.
  slides.push(`
    <div class="gs-card">
      <header class="gs-card-head"><span class="gs-step-pill">5</span><div><h4>${escapeHtml(g.progresjon.title.replace(/^5\.\s*/, ""))}</h4><p class="small">${escapeHtml(g.progresjon.pages)}</p></div></header>
      <ul class="gs-progression">${g.progresjon.items.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
    </div>`);

  // Sirkelen og instruktør-påminnelsen som egne, korte kort.
  slides.push(`
    <div class="gs-card gs-card-callout">
      <p class="eyebrow">${escapeHtml(g.sirkel.title)} · ${escapeHtml(g.sirkel.pages)}</p>
      <p class="gs-callout-big">Tenk → Planlegg → Tren →&nbsp;…</p>
      <p>${escapeHtml(g.sirkel.text)}</p>
    </div>`);
  slides.push(`
    <div class="gs-card gs-card-amber">
      <p class="eyebrow">Viktig</p>
      <p>${escapeHtml(g.instruktor.text)}</p>
    </div>`);

  // Siste kort: handlingen.
  slides.push(`
    <div class="gs-card gs-card-cta">
      <h4 class="gs-card-title">Klar til å lage en plan?</h4>
      <p>Du har vært gjennom hele oppstarten. Lag en kort plan for den aller første økta — så er du klar til å gå ut.</p>
      <div class="gs-cta">
        <button class="primary-button" data-drill-plan="forste-spor" type="button">Lag plan for aller første økt</button>
        <button class="ghost-button" type="button" data-close-getstarted>Tilbake til løypa</button>
      </div>
    </div>`);

  const slidesHtml = slides.map((s) => `<article class="gs-slide" role="group" aria-roledescription="kort">${s}</article>`).join("");
  const dotsHtml = slides.map((_, i) => `<span class="gs-dot${i === 0 ? " is-active" : ""}"></span>`).join("");

  return `
    <section class="getting-started gs-carousel">
      <button class="text-button gs-back" type="button" data-close-getstarted>◀ Tilbake til løypa</button>
      <header class="gs-head">
        <p class="eyebrow">Før første spor · ${escapeHtml(g.pages)}</p>
        <h3>Aller første sporøkt med hunden</h3>
      </header>

      <div class="gs-viewport" id="gsViewport">
        <div class="gs-track" id="gsTrack">${slidesHtml}</div>
      </div>

      <div class="gs-cardfooter">
        <div class="gs-dots" id="gsDots" aria-hidden="true">${dotsHtml}</div>
        <p class="gs-progress" id="gsProgress" aria-live="polite">Kort 1 av ${slides.length}</p>
        <div class="gs-nav">
          <button class="text-button gs-prev" id="gsPrev" type="button" hidden>← Forrige</button>
          <button class="primary-button gs-next" id="gsNext" type="button">Neste</button>
        </div>
      </div>
    </section>`;
}

export const focusOrder = [
  "forste-spor",
  "gamle-spor",
  "oppsok-gjenstand",
  "oppsok-bil",
  "frisok",
  "retning",
  "sportap",
  "kryssende",
  "sirkelspor",
];

export function theoryForFocus(focus) {
  const blueprint = planBlueprints[focus];
  if (!blueprint) return [];
  const moduleDeepDives = theoryDeepDives[blueprint.module] || [];
  const wanted = blueprint.theoryKeys || [];
  const matched = wanted
    .map((key) => moduleDeepDives.find((d) => d.title === key))
    .filter(Boolean);
  return matched.length ? matched : moduleDeepDives.slice(0, 3);
}

export function moduleForFocus(focus) {
  const blueprint = planBlueprints[focus];
  if (!blueprint) return null;
  return modules.find((m) => m.id === blueprint.module) || null;
}

/* ---------- Koblingen mellom læring og praksis ----------
   Disse hjelperne binder en loggført økt til et læringstema, slik at praksis
   kan oppdatere teorien og omvendt. Brukes av kreditering, migrering og UI. */

// Entydig kartlegging fra økt-type til tema. «Momenttrening» er tvetydig (fire
// mulige moduler) og krediteres derfor bare via plan/fokus, ikke via type.
export const TYPE_TO_MODULE = {
  Spor: "spor",
  "Sporoppsøk": "oppsok",
  "Frisøk med sporopptak": "oppsok",
};

// Hvilket fokus (øvelse) hører til et tema? For at koblingen skal lukkes må en
// logget økt på dette fokuset kreditere SAMME tema — derfor prioriteres et
// blueprint som peker tilbake på temaet, foran temaets generelle drill-øvelse
// (drill.focus kan tilhøre et annet tema og brukes bare som fallback).
export function focusForModule(moduleId) {
  const entry = Object.entries(planBlueprints).find(([, b]) => b.module === moduleId);
  if (entry) return entry[0];
  const mod = modules.find((m) => m.id === moduleId);
  if (mod?.drill?.focus && planBlueprints[mod.drill.focus]) return mod.drill.focus;
  return "";
}

// Plantitler er entydige (jf. planBlueprints). Gjør at eldre logger uten
// lagret fokus likevel kan spores tilbake til riktig øvelse.
export function planFocusByTitle(title) {
  if (!title) return "";
  const entry = Object.entries(planBlueprints).find(([, b]) => b.title === title);
  return entry ? entry[0] : "";
}

// Det primære temaet en logg krediterer: lagret felt først, så fokus/plan,
// så økt-type. Returnerer "" hvis økta ikke kan bindes til ett tema.
export function moduleForLog(log) {
  if (!log) return "";
  const mod = modules.find((m) => m.id === log.module);
  if (mod) return mod.id;
  const focus = log.planFocus || planFocusByTitle(log.planTitle);
  if (focus && planBlueprints[focus]) return planBlueprints[focus].module;
  return TYPE_TO_MODULE[log.type] || "";
}

export const quizQuestions = [
  {
    id: "grunnlag-1",
    module: "grunnlag",
    examRelevant: true,
    question: "Hva er hovedpoenget når hunden går fort og unøyaktig i et enkelt spor?",
    options: [
      "Endre oppgaven slik at hunden må konsentrere seg mer.",
      "Holde hardere igjen i linen for å få lavere fart.",
      "Avslutte sportreningen og bare trene lydighet.",
    ],
    answer: 0,
    explain: "Heftet peker på at oppgaven, ikke linen, bør forme sporatferden.",
    pages: "s. 4",
  },
  {
    id: "grunnlag-2",
    module: "grunnlag",
    examRelevant: true,
    question: "Når bør fører helst gi støtte til hunden?",
    options: [
      "Når hunden søker aktivt etter løsningen.",
      "Når hunden stopper og ser på fører for hjelp.",
      "Med en gang hunden bruker mer enn noen sekunder.",
    ],
    answer: 0,
    explain: "Støtte mens hunden arbeider bygger selvstendighet. Fasit når hunden blir passiv kan forsterke hjelpeløshet.",
    pages: "s. 5",
  },
  {
    id: "spor-1",
    module: "spor",
    examRelevant: true,
    question: "Hvorfor bør hunden trenes på spor med ulik alder?",
    options: [
      "Fordi luktbildet endrer seg over tid.",
      "Fordi gamle spor alltid er lettere.",
      "Fordi prøvene bare består av gamle spor.",
    ],
    answer: 0,
    explain: "Ulike luktmolekyler har ulik holdbarhet. Hunden må lære flere luktbilder.",
    pages: "s. 6",
  },
  {
    id: "spor-2",
    module: "spor",
    question: "Hva er en risiko ved hardt underlag?",
    options: [
      "Synlige gjenstander eller godbiter kan lære hunden å slippe sporet for synsfunn.",
      "Hunden kan ikke lære noe nytt på hardt underlag.",
      "Hardt underlag bør bare trenes med helt ferske spor.",
    ],
    answer: 0,
    explain: "Hardt underlag kan være nyttig, men må planlegges slik at hunden faktisk sporer.",
    pages: "s. 9",
  },
  {
    id: "oppsok-1",
    module: "oppsok",
    examRelevant: true,
    question: "Hva er arbeidstegn i sporoppsøk?",
    options: [
      "Faste signaler og rutiner som forteller hunden hvilken jobb som starter.",
      "Merkebånd som viser fører hvor sporet ligger.",
      "Et tegn på at økten skal avsluttes.",
    ],
    answer: 0,
    explain: "Sporline og fast startprosedyre kan hjelpe hunden inn i spormodus.",
    pages: "s. 11",
  },
  {
    id: "oppsok-2",
    module: "oppsok",
    examRelevant: true,
    question: "Hva er viktig ved sporoppsøk fra gjenstand?",
    options: [
      "At funn/melding/påvisning fortsatt har høy verdi før sporarbeidet starter.",
      "At hunden alltid starter helt inntil gjenstanden.",
      "At gjenstanden fjernes før hunden får belønning.",
    ],
    answer: 0,
    explain: "Hvis sporet får all verdi, kan hunden begynne å følge spor uten å melde gjenstanden.",
    pages: "s. 14",
  },
  {
    id: "gamle-1",
    module: "gamle",
    examRelevant: true,
    question: "Hvorfor trene spor med liggetid over ett døgn?",
    options: [
      "For å utvikle hundens problemløsning i vanskelige sporoppgaver.",
      "Fordi de fleste aksjoner løses med to døgn gamle spor.",
      "Fordi belønning blir unødvendig på gamle spor.",
    ],
    answer: 0,
    explain: "Poenget er utvikling av rolig, metodisk arbeid som overføres til andre spor.",
    pages: "s. 19-20",
  },
  {
    id: "retning-1",
    module: "retning",
    examRelevant: true,
    question: "Hva kan høy intensitet gjøre med retningsbestemming?",
    options: [
      "Den kan redusere analysen og gjøre retningsvalget mer tilfeldig.",
      "Den gjør alltid retningsvalget sikrere.",
      "Den gjør at hunden ikke trenger luktinformasjon.",
    ],
    answer: 0,
    explain: "Retningsarbeid krever analyse. For høy intensitet kan flytte hunden ut av analysen.",
    pages: "s. 21",
  },
  {
    id: "retning-2",
    module: "retning",
    examRelevant: true,
    question: "Hvor ligger løsningen ofte ved sportap?",
    options: [
      "Bak hunden, gjerne på lesiden av sporet.",
      "Rett frem i samme tempo.",
      "Alltid hos fører.",
    ],
    answer: 0,
    explain: "Momentet trener hunden i å stoppe og søke rasjonelt tilbake til sporet.",
    pages: "s. 24",
  },
  {
    id: "sirkel-1",
    module: "sirkel",
    question: "Hva trener sirkelspor særlig godt?",
    options: [
      "Høy fart i lange rette strekk.",
      "Konsentrasjon, fordi sporet aldri går rett frem.",
      "At hunden alltid skal søke på overvær.",
    ],
    answer: 1,
    explain: "Olsrud-svingen holder hunden i kontinuerlig justering.",
    pages: "s. 28",
  },
  {
    id: "grunnlag-3",
    module: "grunnlag",
    question: "Hva er hovedrasjonalet i heftet for å trene spor med liggetid over ett døgn?",
    options: [
      "Fordi det er den mest realistiske aksjonsløsningen.",
      "Fordi belønning blir overflødig på gamle spor.",
      "For å utvikle hundens problemløsning og overføre roen til andre spor.",
    ],
    answer: 2,
    explain: "Praktisk aksjonsbruk er liten, men læringseffekten er stor.",
    pages: "s. 19",
  },
  {
    id: "spor-3",
    module: "spor",
    question: "Hvilken pauselengde gir heftet som eksempel mellom kort læringsspor og hovedspor?",
    options: [
      "Ca. 10 minutter.",
      "Minst en time.",
      "Ingen pause, hovedsporet skal følge umiddelbart.",
    ],
    answer: 0,
    explain: "Heftet bruker '10 minutter?' som veiledende eksempel.",
    pages: "s. 19",
  },
  {
    id: "spor-4",
    module: "spor",
    question: "Hvorfor faser man ut godbiter i godbitspor?",
    options: [
      "For å straffe hunden ved feil sporvalg.",
      "Slik at hunden følger menneskesporet lenger mellom hver belønning.",
      "Fordi godbiter er forbudt på prøve.",
    ],
    answer: 1,
    explain: "Etter hvert skal hunden følge selve sporet, ikke bare hoppe fra mat til mat.",
    pages: "s. 7",
  },
  {
    id: "oppsok-3",
    module: "oppsok",
    examRelevant: true,
    question: "Hvilken posisjon angir heftet som sannsynlig startpunkt for spor fra forlatt personbil?",
    options: [
      "Bagasjerommet.",
      "Bakre kant av førerdøren.",
      "Frontstøtfangeren.",
    ],
    answer: 1,
    explain: "Føreren går vanligvis ut førerdøren og tråkker ofte litt rundt bilen før retning velges.",
    pages: "s. 15",
  },
  {
    id: "oppsok-4",
    module: "oppsok",
    question: "Hva er en anbefalt løsning hvis området ved gjenstanden er mye tråkket?",
    options: [
      "Avlys oppsøket og legg nytt spor.",
      "Trekk 5-10 meter unna og søk i sirkel.",
      "Bytt hund.",
    ],
    answer: 1,
    explain: "Heftet foreslår å trekke ut og søke i sirkel når starten ved gjenstanden er forstyrret.",
    pages: "s. 14",
  },
  {
    id: "oppsok-5",
    module: "oppsok",
    question: "Hvorfor bør spor på flanken legges litt ut i terrenget under frisøk-trening?",
    options: [
      "For å skape riktig søksmønster - hunden lærer at det lønner seg å søke i terrenget, ikke bare langs ledelinjen.",
      "Fordi det er forbudt å legge spor langs ledelinjen.",
      "For å spare sporlegger tid.",
    ],
    answer: 0,
    explain: "Plassering av belønning og spor styrer søksatferden.",
    pages: "s. 15-17",
  },
  {
    id: "oppsok-6",
    module: "oppsok",
    question: "Hvor gamle spor kan en godt trent redningshund typisk ta opp under frisøk når sporet er et tydelig avvik i miljøet?",
    options: [
      "Maks 2 timer.",
      "8-12 timer (og opp mot 24 timer ved klart avvik).",
      "Aldri eldre enn 30 minutter.",
    ],
    answer: 1,
    explain: "Heftet refererer testresultater som viser opp mot 24 timer når miljøet er rent.",
    pages: "s. 17",
  },
  {
    id: "oppsok-7",
    module: "oppsok",
    question: "Hvilken fremdrift kan to ekvipasjer holde langs vei iflg heftet?",
    options: [
      "Ca. 1 km/t.",
      "Ca. 5 km/t, og tre til fire ganger raskere enn én ekvipasje på bred vei.",
      "Det er ingen forskjell på én og to ekvipasjer.",
    ],
    answer: 1,
    explain: "Konkret praktisk tall fra heftet om søk langs vei.",
    pages: "s. 17",
  },
  {
    id: "gamle-2",
    module: "gamle",
    question: "Hvorfor legger heftet opp til to spor samme dag når man trener gamle spor?",
    options: [
      "For å spare tid for sporlegger.",
      "Det første sporet lærer hunden dagens luktbilde; det andre er den egentlige oppgaven.",
      "Fordi prøvene har to spor.",
    ],
    answer: 1,
    explain: "Først introduksjon av luktbildet, så modning, så hovedoppgave.",
    pages: "s. 19",
  },
  {
    id: "gamle-3",
    module: "gamle",
    question: "Hva anbefaler heftet etter å ha trent ett-døgn spor en stund?",
    options: [
      "Hold deg til ett døgn for alltid.",
      "Prøv to døgn og gå deretter tilbake til ett døgn for å måle effekt.",
      "Hopp rett til tre døgn.",
    ],
    answer: 1,
    explain: "Trene 'over toppen' viser om treningen har gitt effekt på enklere oppgaver.",
    pages: "s. 20",
  },
  {
    id: "retning-3",
    module: "retning",
    question: "Hvor mange foravtrykk er nok for at en hund er sikker på retningen iflg forskningen heftet refererer?",
    options: [
      "Tjue.",
      "Tre.",
      "Hunden kan aldri vite retningen uten kommando fra fører.",
    ],
    answer: 1,
    explain: "Tre foravtrykk er konklusjonen som heftet siterer.",
    pages: "s. 21",
  },
  {
    id: "retning-4",
    module: "retning",
    question: "Hva er alternativ 2 for retningstrening i heftet?",
    options: [
      "Gjentatte sporkryss over sti der hunden tar valg på hver krysning.",
      "Belønning hver gang hunden snur seg.",
      "Bruk av snutemaske som blokkerer feil retning.",
    ],
    answer: 0,
    explain: "Hunden får erfare hvilken retning som lønner seg gjennom mange repetisjoner.",
    pages: "s. 22-23",
  },
  {
    id: "sportap-1",
    module: "sportap",
    examRelevant: true,
    question: "Hva bør fører gjøre når hunden stopper opp etter å ha mistet sporet?",
    options: [
      "Trekke aktivt i linen mot der man tror sporet ligger.",
      "Stå stille, deretter gå rolig baklengs for å gi plass og invitere bakover.",
      "Avbryte økten umiddelbart.",
    ],
    answer: 1,
    explain: "Fører er ofte forstyrreren. Stille → bakover gir hunden rom til å løse selv.",
    pages: "s. 24",
  },
  {
    id: "sportap-2",
    module: "sportap",
    question: "Hvor lange spor anbefaler heftet for sportap-momenttrening?",
    options: [
      "Mellom 50 og 100 meter er nok.",
      "Minst 2 km.",
      "Ingen anbefalt lengde - jo lengre jo bedre.",
    ],
    answer: 0,
    explain: "Lengden trenger bare å la hunden feste seg til sporet.",
    pages: "s. 24",
  },
  {
    id: "kryssende-1",
    module: "kryssende",
    examRelevant: true,
    question: "Hvilken rolle spiller merkebandet ved trening av kryssende spor?",
    options: [
      "Det viser fører løsningen på sporet.",
      "Det markerer nøyaktig hvor det kryssende sporet skal legges.",
      "Det skremmer dyr fra området.",
    ],
    answer: 1,
    explain: "Uten merkebandet kan ikke sporleggerne treffe samme punkt.",
    pages: "s. 26-27",
  },
  {
    id: "kryssende-2",
    module: "kryssende",
    question: "Hva oppnår man over tid ved gjentatte planlagte krysninger?",
    options: [
      "Hunden viser mindre og mindre interesse for å bytte spor.",
      "Hunden mister all motivasjon for å spore.",
      "Hunden begynner å markere alle dyrespor.",
    ],
    answer: 0,
    explain: "Belønning på rett valg gjør den ene linjen mer lønnsom enn forstyrrelsen.",
    pages: "s. 27",
  },
  {
    id: "sirkel-2",
    module: "sirkel",
    question: "Hvilket utstyr er sentralt for å lage en presis sirkel i Olsrud-svingen?",
    options: [
      "GPS-spor.",
      "Stang/anker i midten og sporline festet til ankeret.",
      "Bare merkebånd.",
    ],
    answer: 1,
    explain: "Ankeret + sporlinen styrer en jevn radius.",
    pages: "s. 28",
  },
  {
    id: "sirkel-3",
    module: "sirkel",
    question: "Hva styrer vanskelighetsgraden i sirkelsporet?",
    options: [
      "Lengden på sporlinen som brukes ved sporlegging (= radius).",
      "Type sluttgjenstand.",
      "Antall personer som ser på.",
    ],
    answer: 0,
    explain: "Smal sirkel = mer konsentrasjon, vid sirkel = lengre justering.",
    pages: "s. 28",
  },
  {
    id: "grunnlag-4",
    module: "grunnlag",
    examRelevant: true,
    question: "Hvilket prinsipp ligger bak begrepet 'arbeidstegn'?",
    options: [
      "Faste signaler/rutiner som setter hunden i riktig arbeidsmodus.",
      "Tegn fra dommer om at øvelsen er bestått.",
      "Merkeband som viser sporet.",
    ],
    answer: 0,
    explain: "Hunden lærer av rutinen - sporline frem = nå skal vi spore.",
    pages: "s. 11",
  },
];



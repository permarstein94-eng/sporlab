"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadApp } = require("./helpers/load-app.js");

const SAFE_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

test("escapeHtml", async (t) => {
  const { escapeHtml } = await loadApp();

  await t.test("escaper alle HTML-spesialtegn", async () => {
    assert.equal(escapeHtml("&<>\"'"), "&amp;&lt;&gt;&quot;&#039;");
  });

  await t.test("nøytraliserer et XSS-forsøk", async () => {
    const escaped = escapeHtml('<img src=x onerror="alert(1)">');
    assert.ok(!escaped.includes("<"));
    assert.ok(!escaped.includes(">"));
    assert.ok(!escaped.includes('"'));
    assert.equal(escaped, "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  });

  await t.test("tåler null, undefined og tall", async () => {
    assert.equal(escapeHtml(null), "");
    assert.equal(escapeHtml(undefined), "");
    assert.equal(escapeHtml(42), "42");
  });
});

test("migrateState v4 → v5", async (t) => {
  await t.test("oversetter mestring og quiz-økt fra indeks til id", async () => {
    const { migrateState, quizQuestions, SCHEMA_VERSION } = await loadApp();
    const v4 = {
      schemaVersion: 4,
      completed: ["grunnlag"],
      plans: [],
      logs: [],
      mastery: {
        0: { correct: 3, wrong: 1, lastSeen: 111 },
        1: { correct: 0, wrong: 2, lastSeen: 222 },
        9999: { correct: 1, wrong: 0, lastSeen: 5 },
      },
      quiz: {
        questionIds: [0, 1],
        optionMaps: [[0, 1, 2], [2, 1, 0]],
        index: 1,
        score: 1,
        answered: { 0: true },
        mode: "all",
        modeLabel: "Alle moduler",
        finished: false,
      },
    };
    const migrated = migrateState(v4);
    assert.equal(migrated.schemaVersion, SCHEMA_VERSION);
    assert.deepEqual(migrated.mastery[quizQuestions[0].id], { correct: 3, wrong: 1, lastSeen: 111 });
    assert.deepEqual(migrated.mastery[quizQuestions[1].id], { correct: 0, wrong: 2, lastSeen: 222 });
    // Indeks 9999 finnes ikke i innholdet og skal droppes.
    assert.equal(Object.keys(migrated.mastery).length, 2);
    assert.deepEqual(migrated.quiz.questionIds, [quizQuestions[0].id, quizQuestions[1].id]);
    // Pågående økt beholder posisjon og poeng.
    assert.equal(migrated.quiz.index, 1);
    assert.equal(migrated.quiz.score, 1);
  });

  await t.test("forkaster quiz-økt med indekser utenfor innholdet", async () => {
    const { migrateState } = await loadApp();
    const migrated = migrateState({
      schemaVersion: 4,
      quiz: { questionIds: [0, 99999], index: 1, score: 1 },
    });
    assert.deepEqual(migrated.quiz.questionIds, []);
    assert.equal(migrated.quiz.index, 0);
  });

  await t.test("setter hasSeenWelcome ut fra om brukeren har data", async () => {
    const { migrateState } = await loadApp();
    const withData = migrateState({ schemaVersion: 4, logs: [{ id: "l1" }] });
    assert.equal(withData.hasSeenWelcome, true);
    const empty = migrateState({ schemaVersion: 4 });
    assert.equal(empty.hasSeenWelcome, false);
  });

  await t.test("v1-tilstand får friske quiz-, mestrings- og temafelter", async () => {
    const { migrateState, SCHEMA_VERSION } = await loadApp();
    const migrated = migrateState({ completed: ["grunnlag"], mastery: { 0: { correct: 9 } } });
    assert.equal(migrated.schemaVersion, SCHEMA_VERSION);
    assert.deepEqual(migrated.mastery, {});
    assert.equal(migrated.theme, "auto");
    assert.deepEqual(migrated.quiz.questionIds, []);
  });
});

test("importSnapshot", async (t) => {
  await t.test("kaster på ugyldig fil", async () => {
    const api = await loadApp();
    assert.throws(() => api.importSnapshot(null), /Ugyldig fil/);
    assert.throws(() => api.importSnapshot("bare tekst"), /Ugyldig fil/);
  });

  await t.test("saniterer planer og logger ved import", async () => {
    const api = await loadApp();
    api.setState(api.defaultState());
    const result = api.importSnapshot({
      plans: [
        {
          id: '"><script>alert(1)</script>',
          title: "<b>Plan</b>",
          focus: "ukjent-fokus",
          steps: ["a", 42, "b"],
          observations: ["én"],
          evil: "ukjent felt",
        },
        "ikke et objekt",
      ],
      logs: [{ id: "ok-id_1", date: "2026-01-01", rating: "99", type: 7 }],
      completed: ["grunnlag", "finnes-ikke"],
      mastery: {
        [api.quizQuestions[0].id]: { correct: "3", wrong: -2, lastSeen: 1 },
        "ukjent-id": { correct: 1, wrong: 0, lastSeen: 1 },
      },
    });
    assert.deepEqual(result, { plans: 1, logs: 1 });

    const state = api.getState();
    const plan = state.plans[0];
    // Utrygg id regenereres til noe attributt-trygt.
    assert.match(plan.id, SAFE_ID_PATTERN);
    // Tittel beholdes som tekst — escaping skjer ved rendering.
    assert.equal(plan.title, "<b>Plan</b>");
    assert.equal(plan.focus, "");
    assert.ok(!("evil" in plan));
    assert.deepEqual(plan.steps, ["a", "b"]);
    assert.equal(plan.observations.length, 3);

    const log = state.logs[0];
    assert.equal(log.id, "ok-id_1");
    assert.equal(log.rating, "5");
    assert.equal(log.type, "");

    assert.deepEqual(state.completed, ["grunnlag"]);
    assert.deepEqual(Object.keys(state.mastery), [api.quizQuestions[0].id]);
    assert.deepEqual(state.mastery[api.quizQuestions[0].id], { correct: 3, wrong: 0, lastSeen: 1 });
  });

  await t.test("fletter uten å duplisere eksisterende id-er", async () => {
    const api = await loadApp();
    const state = api.defaultState();
    state.plans = [{ id: "plan-1", title: "Original" }];
    api.setState(state);
    const result = api.importSnapshot({
      plans: [
        { id: "plan-1", title: "Kopi som skal ignoreres" },
        { id: "plan-2", title: "Ny plan" },
      ],
    });
    assert.deepEqual(result, { plans: 1, logs: 0 });
    const plans = api.getState().plans;
    assert.equal(plans.length, 2);
    assert.equal(plans.find((p) => p.id === "plan-1").title, "Original");
    assert.equal(plans.find((p) => p.id === "plan-2").title, "Ny plan");
  });

  await t.test("mestring: oppføringen med mest historikk vinner", async () => {
    const api = await loadApp();
    const qid = api.quizQuestions[0].id;
    const state = api.defaultState();
    state.mastery = { [qid]: { correct: 5, wrong: 0, lastSeen: 50 } };
    api.setState(state);

    // Innkommende har mindre historikk (totalt 2 < 5) → eksisterende beholdes.
    api.importSnapshot({ mastery: { [qid]: { correct: 1, wrong: 1, lastSeen: 99 } } });
    assert.deepEqual(api.getState().mastery[qid], { correct: 5, wrong: 0, lastSeen: 50 });

    // Innkommende har mer historikk (totalt 7 > 5) → erstattes.
    api.importSnapshot({ mastery: { [qid]: { correct: 4, wrong: 3, lastSeen: 99 } } });
    assert.deepEqual(api.getState().mastery[qid], { correct: 4, wrong: 3, lastSeen: 99 });
  });
});

test("shareSnapshot: komplett rundtur eksport → import → eksport", async () => {
  const api = await loadApp();
  const state = api.defaultState();
  state.plans = [
    {
      id: "plan-rundtur",
      createdAt: 1700000000000,
      title: "Gamle spor i skog",
      pages: "s. 11-13",
      focus: "gamle-spor",
      meta: ["Fører: Kari", "Hund: Rex"],
      steps: ["Legg sporet", "Vent to timer"],
      success: "Hunden holder sporet rolig.",
      note: "Husk vann.",
      observations: ["Ro i oppsøket", "", ""],
      handler: "Kari",
      dog: "Rex",
      experience: "litt",
      intensity: "medium",
      age: "6-12",
      terrain: "skog",
    },
  ];
  state.logs = [
    {
      id: "logg-rundtur",
      createdAt: 1700000100000,
      date: "2026-06-01",
      type: "Spor",
      handler: "Kari",
      dog: "Rex",
      age: "6-12",
      length: "800 m",
      terrain: "skog",
      wind: "svak",
      weather: "regn",
      rating: "4",
      next: "Øke liggetid.",
      observation: "",
      observations: [{ prompt: "Hvordan var oppsøket?", answer: "Rolig" }],
      planId: "plan-rundtur",
      planTitle: "Gamle spor i skog",
      planPages: "s. 11-13",
      image: "data:image/png;base64,SKAL-IKKE-DELES",
    },
  ];
  state.completed = ["grunnlag"];
  state.mastery = { [api.quizQuestions[0].id]: { correct: 2, wrong: 1, lastSeen: 10 } };
  api.setState(state);

  const first = api.shareSnapshot();
  assert.equal(first.schemaVersion, api.SCHEMA_VERSION);
  assert.ok(!Number.isNaN(Date.parse(first.exportedAt)));
  // Bilder skal aldri bli med i delte øyeblikksbilder.
  assert.ok(!("image" in first.logs[0]));

  // Rundtur: serialiser, importer i tom tilstand, eksporter igjen.
  const transported = JSON.parse(JSON.stringify(first));
  api.setState(api.defaultState());
  const result = api.importSnapshot(transported);
  assert.deepEqual(result, { plans: 1, logs: 1 });

  const second = api.shareSnapshot();
  delete first.exportedAt;
  delete second.exportedAt;
  assert.deepEqual(second, first);
});

test("logsToCsv", async (t) => {
  await t.test("verner mot formelinjeksjon og siterer spesialtegn", async () => {
    const { logsToCsv } = await loadApp();
    const csv = logsToCsv([
      {
        date: "=2+2",
        type: "Spor, med komma",
        handler: "+47 99887766",
        dog: 'Rex "Sporhund"',
        rating: "4",
        age: "fersk",
        length: "500 m",
        weather: "@regn",
        wind: "-svak",
        terrain: "skog",
        planTitle: "Plan",
        next: "\tfane først",
        observations: [{ prompt: "Hva så du?", answer: "Ro" }],
      },
    ]);
    const lines = csv.split("\n");
    assert.equal(
      lines[0],
      "date,type,handler,dog,rating,age,length,weather,wind,terrain,planTitle,obs1,obs2,obs3,next"
    );
    // Verdier som starter med =, +, -, @ eller tab får '-prefiks så Excel/Sheets
    // ikke tolker dem som formler; komma og anførselstegn utløser sitering.
    assert.equal(
      lines[1],
      `'=2+2,"Spor, med komma",'+47 99887766,"Rex ""Sporhund""",4,Ferskt,500 m,'@regn,'-svak,skog,Plan,Hva så du? → Ro,,,'\tfane først`
    );
  });

  await t.test("løfter eldre fritekst-observasjon inn i obs1", async () => {
    const { logsToCsv } = await loadApp();
    const csv = logsToCsv([{ date: "2026-01-01", observation: "Gammel fritekst" }]);
    assert.ok(csv.split("\n")[1].includes("Gammel fritekst"));
  });
});

test("buildQuizSession", async (t) => {
  await t.test("'all' bruker alle spørsmål med stokkede svaralternativer", async () => {
    const api = await loadApp();
    api.setState(api.defaultState());
    api.buildQuizSession("all");
    const quiz = api.getState().quiz;
    assert.equal(quiz.questionIds.length, api.quizQuestions.length);
    assert.equal(new Set(quiz.questionIds).size, quiz.questionIds.length);
    const byId = new Map(api.quizQuestions.map((q) => [q.id, q]));
    quiz.questionIds.forEach((id, i) => {
      const question = byId.get(id);
      assert.ok(question, `ukjent spørsmåls-id: ${id}`);
      // optionMaps[i] skal være en permutasjon av svarindeksene.
      assert.deepEqual(
        [...quiz.optionMaps[i]].sort((a, b) => a - b),
        question.options.map((_, idx) => idx)
      );
    });
    assert.equal(quiz.index, 0);
    assert.equal(quiz.score, 0);
    assert.equal(quiz.finished, false);
    assert.equal(quiz.modeLabel, "Alle moduler");
  });

  await t.test("'weak' prioriterer spørsmål med dårligst mestring", async () => {
    const api = await loadApp();
    const weakest = api.quizQuestions[3].id;
    const state = api.defaultState();
    state.mastery = { [weakest]: { correct: 0, wrong: 5, lastSeen: 1 } };
    api.setState(state);
    api.buildQuizSession("weak");
    const quiz = api.getState().quiz;
    assert.equal(quiz.questionIds.length, Math.min(10, api.quizQuestions.length));
    assert.ok(quiz.questionIds.includes(weakest));
  });

  await t.test("modulmodus holder seg til modulens spørsmål", async () => {
    const api = await loadApp();
    api.setState(api.defaultState());
    const moduleId = api.modules[0].id;
    api.buildQuizSession(`module:${moduleId}`);
    const quiz = api.getState().quiz;
    const byId = new Map(api.quizQuestions.map((q) => [q.id, q]));
    assert.ok(quiz.questionIds.length > 0);
    quiz.questionIds.forEach((id) => assert.equal(byId.get(id).module, moduleId));
  });

  await t.test("tomt utvalg faller tilbake til alle spørsmål", async () => {
    const api = await loadApp();
    api.setState(api.defaultState());
    api.buildQuizSession("module:finnes-ikke");
    const quiz = api.getState().quiz;
    assert.equal(quiz.questionIds.length, api.quizQuestions.length);
  });
});

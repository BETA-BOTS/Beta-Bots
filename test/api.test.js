"use strict";
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

const { loadScholarships } = require("../src/data/csvLoader");
const { settings } = require("../src/config");
const { evaluate } = require("../src/services/eligibilityEngine");
const { asNearMatch } = require("../src/services/nearMatch");
const explanationService = require("../src/services/explanationService");
const { buildCsv } = require("../src/services/exportService");

const dataset = loadScholarships(settings.DATA_FILE);
const byName = Object.fromEntries(dataset.map((s) => [s.name, s]));

function profile(overrides = {}) {
  return {
    cgpa: 3.3,
    department: "CSE",
    financial_support_needed: false,
    gender: "female",
    lang: "en",
    ...overrides,
  };
}

test("CGPA gap is a near match with the exact gap", () => {
  const result = evaluate(profile(), byName["Future Engineer Scholarship"]); // min 3.5
  const near = asNearMatch(result);
  assert.notEqual(near, null);
  assert.equal(near.status, "NEAR_MATCH");
  assert.ok(near.missing.some((m) => m.includes("0.20 below the minimum 3.50")));
});

test("department failure is never a near match", () => {
  const result = evaluate(profile({ department: "English" }), byName["Coders of Tomorrow Grant"]);
  assert.equal(asNearMatch(result), null);
});

test("gender failure is never a near match", () => {
  const result = evaluate(
    profile({ cgpa: 3.2, gender: "male" }),
    byName["Women in Tech Scholarship"]
  );
  assert.equal(asNearMatch(result), null);
});

test("an unknown criterion blocks a near match", () => {
  const result = evaluate(
    profile({ cgpa: 3.2, gender: "unspecified" }),
    byName["Women in Tech Scholarship"]
  );
  assert.equal(result.status, "NEEDS_REVIEW");
  assert.equal(asNearMatch(result), null);
});

test("AI-unavailable fallback explanation (template)", async () => {
  const saved = settings.GEMINI_API_KEY;
  settings.GEMINI_API_KEY = "";
  explanationService._cache.clear();
  try {
    const s = byName["Coders of Tomorrow Grant"];
    const p = profile({ cgpa: 3.68, financial_support_needed: true });
    const result = evaluate(p, s);
    const ex = await explanationService.explain(p, s, result.checks, result.status, []);
    assert.equal(ex.source, "template");
    assert.ok(ex.summary.includes("Coders of Tomorrow Grant"));
    assert.ok(ex.passed_reasons.length > 0);
  } finally {
    settings.GEMINI_API_KEY = saved;
  }
});

test("export contains the displayed records", () => {
  const s = byName["Coders of Tomorrow Grant"];
  const content = buildCsv([
    {
      name: s.name,
      provider: s.provider,
      status: "ELIGIBLE",
      amount_bdt: s.amount_bdt,
      deadline: "2027-02-28",
      minimum_cgpa: s.minimum_cgpa,
      missing: [],
    },
  ]).toString("utf-8");
  assert.ok(content.includes("Coders of Tomorrow Grant"));
  assert.ok(content.includes("ELIGIBLE"));
});

/* ------------------------- API end-to-end ------------------------- */

let server;
let base;

before(async () => {
  const app = require("../src/server");
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

async function postMatch(body) {
  const res = await fetch(`${base}/api/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

test("health and meta endpoints", async () => {
  const health = await (await fetch(`${base}/api/health`)).json();
  assert.equal(health.records_loaded, 136);
  const meta = await (await fetch(`${base}/api/meta`)).json();
  assert.equal(meta.cgpa_scale, 4.0);
  assert.ok(meta.departments.includes("CSE"));
  assert.ok(!meta.departments.includes("All"));
});

test("match API end to end (profile A counts match the Python app)", async () => {
  const { status, data } = await postMatch({
    cgpa: 3.68, department: "CSE", financial_support_needed: true, gender: "female",
  });
  assert.equal(status, 200);
  assert.equal(data.summary.records_checked, 136);
  assert.equal(data.summary.eligible_count, 89);
  assert.equal(data.summary.near_match_count, 8);
  assert.equal(data.summary.needs_review_count, 0);
  for (const item of data.eligible) {
    assert.equal(item.status, "ELIGIBLE");
    assert.ok(item.ai_explanation.summary);
  }
  // First by deadline (default sort)
  assert.equal(data.eligible[0].name, "Shonar STEM Scholarship");
  assert.equal(data.eligible[0].amount_display, "BDT 40,000");
  assert.equal(data.eligible[0].deadline, "2027-01-18");
});

test("match API profile B counts match the Python app", async () => {
  const { data } = await postMatch({
    cgpa: 2.4, department: "BBA", financial_support_needed: false, gender: "male",
  });
  assert.equal(data.summary.eligible_count, 3);
  assert.equal(data.summary.near_match_count, 67);
});

test("match API profile C: gender unspecified -> needs review", async () => {
  const { data } = await postMatch({
    cgpa: 3.9, department: "EEE", financial_support_needed: true, gender: "unspecified",
  });
  assert.equal(data.summary.eligible_count, 75);
  assert.equal(data.summary.needs_review_count, 12);
});

test("match API low profile has no eligible", async () => {
  const { status, data } = await postMatch({
    cgpa: 1.5, department: "English", financial_support_needed: false, gender: "male",
  });
  assert.equal(status, 200);
  assert.equal(data.summary.eligible_count, 0);
});

test("match API rejects CGPA above the scale with 422", async () => {
  const { status } = await postMatch({
    cgpa: 5.5, department: "CSE", financial_support_needed: true, gender: "female",
  });
  assert.equal(status, 422);
});

test("sort by deadline keeps missing dates last", async () => {
  const { data } = await postMatch({
    cgpa: 3.9, department: "CSE", financial_support_needed: true,
    gender: "female", sort_by: "deadline",
  });
  const deadlines = data.eligible.map((i) => i.deadline);
  const present = deadlines.filter((d) => d);
  assert.deepEqual(present, [...present].sort());
  assert.deepEqual(
    deadlines.slice(present.length),
    Array(deadlines.length - present.length).fill(null)
  );
});

test("scholarship detail endpoint returns checks with a profile", async () => {
  const women = byName["Women in Tech Scholarship"];
  const url =
    `${base}/api/scholarships/${women.id}?cgpa=3.2&department=CSE` +
    `&financial_support_needed=true&gender=female`;
  const res = await fetch(url);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, "ELIGIBLE");
  assert.equal(data.checks.length, 4);
  assert.ok(data.checks.every((c) => c.status === "PASS"));
  assert.equal(data.application_checklist.type, "generic");
});

test("scholarship detail for an unknown id is 404", async () => {
  const res = await fetch(`${base}/api/scholarships/nope-not-real`);
  assert.equal(res.status, 404);
});

test("export endpoint returns a CSV download", async () => {
  const res = await fetch(`${base}/api/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      results: [
        {
          name: "Coders of Tomorrow Grant", provider: "Digital Bangladesh Trust",
          status: "ELIGIBLE", amount_bdt: 25000, deadline: "2027-02-28",
          minimum_cgpa: 3.2, missing: [],
        },
      ],
    }),
  });
  assert.equal(res.status, 200);
  assert.match(res.headers.get("content-type"), /text\/csv/);
  const text = await res.text();
  assert.ok(text.includes("Coders of Tomorrow Grant"));
  assert.ok(text.includes("ELIGIBLE"));
});

test("frontend is served at /", async () => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.ok(text.includes("ScholarSync"));
});

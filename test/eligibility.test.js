"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");

const { loadScholarships } = require("../src/data/csvLoader");
const { settings } = require("../src/config");
const { evaluate } = require("../src/services/eligibilityEngine");

const dataset = loadScholarships(settings.DATA_FILE);
const byName = Object.fromEntries(dataset.map((s) => [s.name, s]));

function profile(overrides = {}) {
  return {
    cgpa: 3.68,
    department: "CSE",
    financial_support_needed: true,
    gender: "female",
    lang: "en",
    ...overrides,
  };
}

function checkOf(result, criterion) {
  return result.checks.find((c) => c.criterion === criterion);
}

test("valid profile with qualifying record is eligible", () => {
  const result = evaluate(profile(), byName["Coders of Tomorrow Grant"]);
  assert.equal(result.status, "ELIGIBLE");
});

test("CGPA exactly equal to the minimum passes", () => {
  const s = byName["Merit Excellence Award"]; // min 3.8, All depts, not need-based
  const result = evaluate(
    profile({ cgpa: 3.8, department: "BBA", financial_support_needed: false, gender: "male" }),
    s
  );
  assert.equal(checkOf(result, "cgpa").status, "PASS");
  assert.equal(result.status, "ELIGIBLE");
});

test("CGPA below the minimum is not eligible and states the gap", () => {
  const result = evaluate(profile({ cgpa: 3.4 }), byName["Future Engineer Scholarship"]); // min 3.5
  assert.equal(result.status, "NOT_ELIGIBLE");
  const cgpaCheck = checkOf(result, "cgpa");
  assert.equal(cgpaCheck.status, "FAIL");
  assert.ok(cgpaCheck.detail.includes("0.10"));
});

test("wrong department is not eligible", () => {
  const result = evaluate(profile({ department: "English" }), byName["Coders of Tomorrow Grant"]);
  assert.equal(result.status, "NOT_ELIGIBLE");
  assert.equal(checkOf(result, "department").status, "FAIL");
});

test("department matching ignores case and spaces", () => {
  const result = evaluate(profile({ department: " cse " }), byName["Coders of Tomorrow Grant"]);
  assert.equal(checkOf(result, "department").status, "PASS");
});

test("'All' departments passes any department", () => {
  const result = evaluate(
    profile({ department: "English", cgpa: 3.9 }),
    byName["Merit Excellence Award"]
  );
  assert.equal(checkOf(result, "department").status, "PASS");
});

test("need-based scholarship requires financial need", () => {
  const s = byName["Need-Based Tuition Support"]; // need_based = yes, min 2.5, All
  const denied = evaluate(profile({ cgpa: 3.0, financial_support_needed: false }), s);
  assert.equal(denied.status, "NOT_ELIGIBLE");
  assert.equal(checkOf(denied, "financial_need").status, "FAIL");
  const granted = evaluate(profile({ cgpa: 3.0, financial_support_needed: true }), s);
  assert.equal(granted.status, "ELIGIBLE");
});

test("gender-restricted: female student passes", () => {
  const s = byName["Women in Tech Scholarship"]; // Female, CSE;EEE, min 3.0
  const result = evaluate(profile({ cgpa: 3.2, gender: "female" }), s);
  assert.equal(result.status, "ELIGIBLE");
});

test("gender-restricted: male student fails", () => {
  const s = byName["Women in Tech Scholarship"];
  const result = evaluate(profile({ cgpa: 3.2, gender: "male" }), s);
  assert.equal(result.status, "NOT_ELIGIBLE");
  assert.equal(checkOf(result, "gender").status, "FAIL");
});

test("gender-restricted: unspecified gender needs review, never silently eligible", () => {
  const s = byName["Women in Tech Scholarship"];
  const result = evaluate(profile({ cgpa: 3.2, gender: "unspecified" }), s);
  assert.equal(result.status, "NEEDS_REVIEW");
  assert.equal(checkOf(result, "gender").status, "UNKNOWN");
});

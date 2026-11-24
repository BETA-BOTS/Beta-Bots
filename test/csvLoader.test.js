"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { loadScholarships, DatasetError } = require("../src/data/csvLoader");
const { settings } = require("../src/config");

const dataset = loadScholarships(settings.DATA_FILE);

test("loads all 136 records", () => {
  assert.equal(dataset.length, 136);
});

test("record fields are mapped", () => {
  const first = dataset[0];
  assert.equal(first.id, "1");
  assert.equal(first.name, "Merit Excellence Award");
  assert.equal(first.provider, "Bayview University");
  assert.equal(first.minimum_cgpa, 3.8);
  assert.equal(first.all_departments, true);
  assert.equal(first.financial_need_rule, "not_required");
  assert.equal(first.gender_rule, null);
  assert.equal(first.amount_bdt, 30000);
  assert.equal(first.amount_display, "BDT 30,000");
  assert.equal(first.deadline, "2027-02-15");
  assert.equal(first.source_row, 2); // header is line 1
});

test("semicolon departments are split", () => {
  const s = dataset.find((x) => x.name === "Future Engineer Scholarship");
  assert.deepEqual(s.eligible_departments, ["CSE", "EEE", "CE"]);
  assert.equal(s.all_departments, false);
});

test("missing name column is a clear data error", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ss-"));
  const bad = path.join(dir, "bad.csv");
  fs.writeFileSync(bad, "id,provider\n1,Someone\n", "utf-8");
  assert.throws(() => loadScholarships(bad), DatasetError);
});

test("missing file is a clear data error", () => {
  assert.throws(
    () => loadScholarships(path.join(os.tmpdir(), "does-not-exist-ss.csv")),
    DatasetError
  );
});

test("missing optional amount is null, not faked", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ss-"));
  const file = path.join(dir, "partial.csv");
  fs.writeFileSync(
    file,
    "id,name,provider,min_cgpa,department,need_based,gender,amount_bdt,deadline,description\n" +
      "9,Partial Award,Org,3.0,All,no,All,,2027-01-01,Desc\n",
    "utf-8"
  );
  const records = loadScholarships(file);
  assert.equal(records.length, 1);
  assert.equal(records[0].amount_bdt, null);
  assert.equal(records[0].amount_display, null); // UI shows "Not provided..."
});

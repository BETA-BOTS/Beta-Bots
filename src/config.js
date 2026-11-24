"use strict";
/* Application configuration, read from environment variables.
 *
 * Secrets (API keys) live only here on the server side and are never
 * sent to the frontend. A small .env loader keeps local setup dependency-free.
 */
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");

function loadLocalEnv() {
  const envPath = path.join(ROOT_DIR, ".env");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadLocalEnv();

const DATA_FILE = process.env.SCHOLARSHIPS_CSV
  ? path.resolve(process.env.SCHOLARSHIPS_CSV)
  : path.join(ROOT_DIR, "data", "scholarships.csv");

const settings = {
  DATA_FILE,
  GEMINI_API_KEY: (process.env.GEMINI_API_KEY || "").trim(),
  GEMINI_MODEL:
    (process.env.GEMINI_MODEL || "gemini-3.8-flash").trim() || "gemini-3.8-flash",
  GEMINI_TIMEOUT_SECONDS: parseFloat(process.env.GEMINI_TIMEOUT_SECONDS || "4"),
};

// The organizer dataset's CGPA values (2.0-3.9 minimums) are on the
// Bangladeshi university 4.00 scale; the dataset clearly establishes it.
const CGPA_SCALE = 4.0;

const APP_NAME = "ScholarSync AI";

module.exports = { settings, CGPA_SCALE, APP_NAME, ROOT_DIR };

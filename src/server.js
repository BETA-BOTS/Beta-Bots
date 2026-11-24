"use strict";
/* ScholarSync AI -- Express application.
 *
 * Loads the organizer scholarship CSV at startup, exposes the matching
 * API, and serves the static single-page frontend.
 * (Port of backend/app/main.py.)
 */
const path = require("path");
const express = require("express");

const { settings, APP_NAME } = require("./config");
const { loadScholarships } = require("./data/csvLoader");
const healthRouter = require("./routes/health");
const metaRouter = require("./routes/meta");
const matchRouter = require("./routes/match");
const scholarshipsRouter = require("./routes/scholarships");
const exportRouter = require("./routes/export");
const { ValidationError } = require("./models/student");

const app = express();
app.locals.title = APP_NAME;
app.locals.dataset = loadScholarships(settings.DATA_FILE);

app.use(express.json());

app.use(healthRouter);
app.use(metaRouter);
app.use(matchRouter);
app.use(scholarshipsRouter);
app.use(exportRouter);

const STATIC_DIR = path.join(__dirname, "..", "public");
app.use(express.static(STATIC_DIR));

// Validation errors mirror FastAPI's 422 responses.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(422).json({ detail: err.message });
  }
  if (err && err.type === "entity.parse.failed") {
    return res.status(422).json({ detail: "Request body is not valid JSON." });
  }
  console.error(err);
  return res.status(500).json({ detail: "Internal server error." });
});

if (require.main === module) {
  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    console.info(`${APP_NAME} listening on http://localhost:${port}`);
  });
}

module.exports = app;

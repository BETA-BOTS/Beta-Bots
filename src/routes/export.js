"use strict";
const { Router } = require("express");
const { buildCsv } = require("../services/exportService");
const { ValidationError } = require("../models/student");

const router = Router();

router.post("/api/export", (req, res, next) => {
  try {
    if (!req.body || !Array.isArray(req.body.results)) {
      throw new ValidationError("results: Input should be a valid list.");
    }
    const content = buildCsv(req.body.results);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=scholarsync-results.csv"
    );
    res.send(content);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

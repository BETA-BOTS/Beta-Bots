"use strict";
const { Router } = require("express");

const router = Router();

router.get("/api/health", (req, res) => {
  const dataset = req.app.locals.dataset;
  res.json({
    status: "ok",
    service: "ScholarSync AI",
    records_loaded: dataset.length,
  });
});

module.exports = router;

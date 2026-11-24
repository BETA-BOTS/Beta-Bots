"use strict";
const path = require("path");
const { Router } = require("express");
const { CGPA_SCALE, settings } = require("../config");

const router = Router();

router.get("/api/meta", (req, res) => {
  const dataset = req.app.locals.dataset;
  const departments = [
    ...new Set(
      dataset.flatMap((s) =>
        (s.eligible_departments || []).filter((d) => d.toLowerCase() !== "all")
      )
    ),
  ].sort();
  res.json({
    departments,
    cgpa_scale: CGPA_SCALE,
    cgpa_guidance:
      `Enter your CGPA on the ${CGPA_SCALE.toFixed(2)} scale used by the ` +
      "scholarship dataset.",
    genders: ["female", "male", "unspecified"],
    dataset: {
      filename: path.basename(settings.DATA_FILE),
      records: dataset.length,
      status: "loaded",
    },
  });
});

module.exports = router;

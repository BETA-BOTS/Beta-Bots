"use strict";
const { Router } = require("express");
const { publicDict } = require("../models/scholarship");
const { checkToDict } = require("../models/matchResult");
const {
  ValidationError,
  GENDERS,
  coerceBool,
  coerceFloat,
} = require("../models/student");
const { evaluate } = require("../services/eligibilityEngine");
const explanationService = require("../services/explanationService");

const router = Router();

router.get("/api/scholarships/:id", async (req, res, next) => {
  try {
    const dataset = req.app.locals.dataset;
    const scholarship = dataset.find((s) => s.id === req.params.id);
    if (!scholarship) {
      return res.status(404).json({
        detail: "Scholarship not found in the provided data.",
      });
    }

    const payload = publicDict(scholarship);
    payload.dataset_note =
      "Fields show 'Not provided in the scholarship data' when the " +
      "organizer dataset does not contain them.";
    // Application checklist: the organizer CSV has no application-steps
    // or documents columns, so only a clearly labelled generic checklist
    // is offered -- never invented official instructions.
    if (scholarship.application_steps || scholarship.required_documents) {
      payload.application_checklist = {
        type: "official",
        steps: scholarship.application_steps,
        documents: scholarship.required_documents,
      };
    } else {
      payload.application_checklist = {
        type: "generic",
        label:
          "General preparation checklist — the scholarship data " +
          "does not include official application steps or " +
          "required documents.",
        steps: [
          "Prepare your latest academic transcript showing your CGPA.",
          "Prepare a student ID / enrollment proof from your university.",
          "If the scholarship is need-based, prepare income or financial-need supporting documents.",
          "Write a short statement explaining why you are applying.",
          "Verify the official application process and deadline with the provider before applying.",
        ],
        documents: null,
      };
    }

    const q = req.query;
    if (
      q.cgpa !== undefined &&
      q.department !== undefined &&
      q.financial_support_needed !== undefined
    ) {
      // Same server-side validation as the match endpoint (422 on bad input).
      const cgpa = coerceFloat(q.cgpa);
      if (cgpa === undefined || cgpa < 0.0 || cgpa > 4.0) {
        throw new ValidationError("cgpa: Input should be a valid number between 0 and 4.");
      }
      if (typeof q.department !== "string" || q.department.length < 1) {
        throw new ValidationError("department: String should have at least 1 character.");
      }
      const need = coerceBool(q.financial_support_needed);
      if (need === undefined) {
        throw new ValidationError("financial_support_needed: Input should be a valid boolean.");
      }
      const gender = q.gender === undefined ? "unspecified" : q.gender;
      if (!GENDERS.includes(gender)) {
        throw new ValidationError("gender: Input should be 'female', 'male' or 'unspecified'.");
      }
      const lang = q.lang === "bn" ? "bn" : "en";
      const profile = {
        cgpa,
        department: q.department,
        financial_support_needed: need,
        gender,
        lang,
      };
      const result = evaluate(profile, scholarship);
      payload.checks = result.checks.map(checkToDict);
      payload.status = result.status;
      payload.ai_explanation = await explanationService.explain(
        profile,
        scholarship,
        result.checks,
        result.status,
        [],
        profile.lang
      );
    }
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

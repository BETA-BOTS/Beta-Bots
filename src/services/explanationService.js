"use strict";
/* Grounded explanation service (blueprint section 6).
 *
 * The eligibility engine has already decided the status before this
 * service runs. The AI (Gemini, when GEMINI_API_KEY is configured)
 * only rephrases the verified facts it is given; it must not invent
 * facts or change the status. Any failure -- no key, timeout, bad
 * response -- falls back to a deterministic template built from the
 * criterion checks, so the product works fully without the AI API.
 * (Port of backend/app/services/explanation_service.py.)
 */
const crypto = require("crypto");
const { settings } = require("../config");
const { publicDict } = require("../models/scholarship");

const DISCLAIMER_EN =
  "Based on the supplied scholarship data. Please verify official details with the provider.";
const DISCLAIMER_BN =
  "সরবরাহকৃত স্কলারশিপ ডেটার উপর ভিত্তি করে তৈরি। অনুগ্রহ করে প্রদানকারীর কাছ থেকে অফিসিয়াল বিবরণ যাচাই করুন।";

const cache = new Map();

function profileKey(profile, scholarship, status, lang) {
  const payload = {
    cgpa: profile.cgpa,
    department: profile.department,
    gender: profile.gender,
    lang,
    need: profile.financial_support_needed,
    scholarship: scholarship.id,
    status,
  };
  const sorted = {};
  for (const k of Object.keys(payload).sort()) sorted[k] = payload[k];
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(sorted))
    .digest("hex");
}

function fmt2(n) {
  return n.toFixed(2); // Python f"{n:.2f}"
}

/* ------------------------- template fallback ------------------------- */

function templateExplanation(profile, scholarship, checks, status, missing, lang = "en") {
  const passed = checks.filter((c) => c.status === "PASS").map((c) => c.detail);
  const failed = checks.filter((c) => c.status === "FAIL").map((c) => c.detail);
  const unknown = checks.filter((c) => c.status === "UNKNOWN").map((c) => c.detail);
  if (lang === "bn") {
    let summary;
    if (status === "ELIGIBLE") {
      summary =
        `আপনি '${scholarship.name}'-এর জন্য ঘোষিত মানদণ্ড পূরণ করেছেন: ` +
        `আপনার সিজিপিএ ${fmt2(profile.cgpa)} এবং বিভাগ ${profile.department}।`;
    } else if (status === "NEAR_MATCH") {
      summary =
        `আপনি '${scholarship.name}'-এর প্রায় যোগ্য। যা ঘাটতি আছে: ` +
        missing.join(" ");
    } else if (status === "NEEDS_REVIEW") {
      summary =
        `'${scholarship.name}'-এর একটি মানদণ্ড সরবরাহকৃত ডেটা দিয়ে ` +
        "যাচাই করা যায়নি, তাই এটি আলাদাভাবে পর্যালোচনার জন্য রাখা হয়েছে।";
    } else {
      summary = `আপনি '${scholarship.name}'-এর সব ঘোষিত মানদণ্ড পূরণ করেননি।`;
    }
    return {
      summary,
      passed_reasons: passed,
      missing_or_failed: [...failed, ...unknown],
      disclaimer: DISCLAIMER_BN,
      source: "template",
    };
  }
  let summary;
  if (status === "ELIGIBLE") {
    summary =
      `You meet the stated criteria for '${scholarship.name}': ` +
      `your CGPA is ${fmt2(profile.cgpa)} and your department is ` +
      `${profile.department}.`;
  } else if (status === "NEAR_MATCH") {
    summary =
      `You almost qualify for '${scholarship.name}'. ` +
      `What is missing: ` +
      missing.join(" ");
  } else if (status === "NEEDS_REVIEW") {
    summary =
      `One or more criteria for '${scholarship.name}' cannot be ` +
      "verified from the supplied scholarship data, so it is " +
      "listed separately for review.";
  } else {
    summary = `You do not meet all stated criteria for '${scholarship.name}'.`;
  }
  return {
    summary,
    passed_reasons: passed,
    missing_or_failed: [...failed, ...unknown],
    disclaimer: DISCLAIMER_EN,
    source: "template",
  };
}

/* ----------------------------- Gemini -------------------------------- */

const SYSTEM_PROMPT = `You are a scholarship information assistant.
Use only the supplied student profile, scholarship record, and verified eligibility checks.
Do not invent facts. Do not change the eligibility status.
If a field is absent, say "Not provided in the scholarship data".
Keep the explanation concise and understandable.
Return structured JSON only with keys: summary (1-3 sentences), passed_reasons (list of short strings), missing_or_failed (list of short strings), disclaimer (one sentence).`;

async function geminiExplanation(profile, scholarship, checks, status, lang) {
  const checksPayload = checks.map((c) => ({
    criterion: c.criterion,
    status: c.status,
    detail: c.detail,
  }));
  const userPayload = {
    student_profile: {
      cgpa: profile.cgpa,
      department: profile.department,
      financial_support_needed: profile.financial_support_needed,
      gender: profile.gender,
    },
    scholarship_record: publicDict(scholarship),
    verified_checks: checksPayload,
    eligibility_status_decided_by_code: status,
    language: lang === "bn" ? "Bangla (bn)" : "English (en)",
    task:
      "Write a 1-3 sentence explanation of why the student matches, " +
      "or what is missing for a near match; list passed criteria and " +
      "failed/unknown criteria.",
  };
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ parts: [{ text: JSON.stringify(userPayload) }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
      maxOutputTokens: 512,
    },
  };
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${settings.GEMINI_MODEL}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "x-goog-api-key": settings.GEMINI_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(settings.GEMINI_TIMEOUT_SECONDS * 1000),
  });
  if (!response.ok) {
    throw new Error(`Gemini request failed with HTTP ${response.status}`);
  }
  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  const parsed = JSON.parse(text);
  return {
    summary: String(parsed.summary),
    passed_reasons: (parsed.passed_reasons || []).map((x) => String(x)),
    missing_or_failed: (parsed.missing_or_failed || []).map((x) => String(x)),
    disclaimer: String(
      parsed.disclaimer || (lang === "bn" ? DISCLAIMER_BN : DISCLAIMER_EN)
    ),
    source: "gemini",
  };
}

async function explain(profile, scholarship, checks, status, missing = [], lang = "en") {
  /* Return a grounded explanation dict; never throws. */
  const key = profileKey(profile, scholarship, status, lang);
  if (cache.has(key)) return cache.get(key);
  let result = null;
  if (settings.GEMINI_API_KEY) {
    try {
      result = await geminiExplanation(profile, scholarship, checks, status, lang);
    } catch (exc) {
      // timeout, HTTP error, malformed JSON...
      console.warn(`Gemini explanation failed, using template: ${exc.message}`);
    }
  }
  if (result === null) {
    result = templateExplanation(profile, scholarship, checks, status, missing, lang);
  }
  cache.set(key, result);
  return result;
}

module.exports = {
  explain,
  templateExplanation,
  DISCLAIMER_EN,
  DISCLAIMER_BN,
  _cache: cache,
};

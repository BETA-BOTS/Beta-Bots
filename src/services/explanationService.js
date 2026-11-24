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
  // Keep detail pages responsive: make one bounded request. If Gemini is
  // temporarily unavailable, return the grounded template immediately.
  let response;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "x-goog-api-key": settings.GEMINI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (response.ok) break;
    const detail = await response.text().catch(() => "");
    const retryable = [500, 502, 503, 504].includes(response.status);
    if (attempt === 0 && retryable) {
      await new Promise((resolve) => setTimeout(resolve, 900));
      continue;
    }
    throw new Error(
      `Gemini request failed with HTTP ${response.status}` +
      (detail ? `: ${detail.slice(0, 300)}` : "")
    );
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


/* --------------------------- OpenRouter ------------------------------ */
async function openRouterExplanation(profile, scholarship, checks, status, lang) {
  const checksPayload = checks.map((c) => ({
    criterion: c.criterion, status: c.status, detail: c.detail,
  }));
  const userPayload = {
    student_profile: {
      cgpa: profile.cgpa, department: profile.department,
      financial_support_needed: profile.financial_support_needed,
      gender: profile.gender,
    },
    scholarship_record: publicDict(scholarship),
    verified_checks: checksPayload,
    eligibility_status_decided_by_code: status,
    language: lang === "bn" ? "Bangla (bn)" : "English (en)",
    task: "Explain the verified scholarship match in 1-3 concise sentences. List passed and failed/unknown criteria.",
  };
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "X-Title": "ScholarSync AI",
    },
    body: JSON.stringify({
      model: settings.OPENROUTER_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(userPayload) },
      ],
      temperature: 0.2,
      max_tokens: 512,
    }),
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`OpenRouter request failed with HTTP ${response.status}` +
      (detail ? `: ${detail.slice(0, 250)}` : ""));
  }
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenRouter returned an empty response.");
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const parsed = JSON.parse(cleaned);
  return {
    summary: String(parsed.summary || ""),
    passed_reasons: (parsed.passed_reasons || []).map(String),
    missing_or_failed: (parsed.missing_or_failed || []).map(String),
    disclaimer: String(parsed.disclaimer || (lang === "bn" ? DISCLAIMER_BN : DISCLAIMER_EN)),
    source: "openrouter",
  };
}

async function explain(profile, scholarship, checks, status, missing = [], lang = "en") {
  /* Return a grounded explanation dict; never throws. */
  const key = profileKey(profile, scholarship, status, lang);
  if (cache.has(key)) return cache.get(key);
  let result = null;
  let fallbackReason = null;
  // OpenRouter is the primary provider. Gemini remains an optional backup.
  if (settings.OPENROUTER_API_KEY) {
    try {
      result = await openRouterExplanation(profile, scholarship, checks, status, lang);
    } catch (exc) {
      fallbackReason = exc.message;
      console.warn(`OpenRouter explanation failed: ${exc.message}`);
    }
  } else {
    fallbackReason = "OPENROUTER_API_KEY is missing in the local .env file.";
  }
  if (result === null && settings.GEMINI_API_KEY) {
    try {
      result = await geminiExplanation(profile, scholarship, checks, status, lang);
    } catch (exc) {
      fallbackReason = [fallbackReason, exc.message].filter(Boolean).join(" | ");
      console.warn(`Gemini backup failed: ${exc.message}`);
    }
  }
  if (result === null) {
    result = templateExplanation(profile, scholarship, checks, status, missing, lang);
  }
  if (result.source === "template" && fallbackReason) {
    result.fallback_reason = fallbackReason;
  }
  // Cache successful Gemini explanations only. A temporary API outage
  // must not permanently pin this profile to a template response.
  if (result.source === "gemini") cache.set(key, result);
  return result;
}

module.exports = {
  explain,
  templateExplanation,
  DISCLAIMER_EN,
  DISCLAIMER_BN,
  _cache: cache,
};

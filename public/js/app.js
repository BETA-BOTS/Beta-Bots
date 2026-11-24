"use strict";

/* ---------------- i18n ---------------- */
const I18N = {
  en: {
    tagline: "Find scholarships that match your profile",
    introTitle: "Stop missing scholarships",
    introText: "Enter your CGPA, department and whether you need financial support. We check every scholarship in the provided list with deterministic rules, and AI explains why each match fits you. Eligibility is always decided by code — never by AI.",
    cgpaLabel: "CGPA (out of 4.00)", deptLabel: "Department",
    deptPlaceholder: "Select your department",
    needLabel: "Do you need financial support?", yes: "Yes", no: "No",
    genderLabel: "Gender (some scholarships are gender-specific)",
    genderUnspec: "Prefer not to say", genderFemale: "Female", genderMale: "Male",
    findBtn: "Find Scholarships", newSearch: "New search",
    resultsTitle: "Your matches", countEligible: "Eligible", countNear: "Near matches",
    countReview: "Needs review", countChecked: "Records checked",
    sortLabel: "Sort by", sortDeadline: "Deadline (soonest first)",
    sortAmount: "Amount (highest first)", sortName: "Name (A–Z)",
    downloadBtn: "Download results (CSV)",
    eligibleTitle: "Eligible scholarships",
    emptyText: "No matching scholarships found in the provided list.",
    nearTitle: "Near matches — almost there",
    nearSub: "You meet every requirement except a measurable one listed on each card.",
    reviewTitle: "Needs review",
    reviewSub: "A requirement could not be verified from the supplied data, so these are neither confirmed nor rejected.",
    resultsNote: "Results are based on the provided scholarship list. Please verify official details with the provider before applying.",
    backResults: "Back to results", loading: "Checking every scholarship…",
    footer: "ScholarSync AI · Track 3 — Personalized Learning & Productivity · Dataset provided by the hackathon organizers.",
    errCgpa: "Enter a CGPA between 0.00 and 4.00.",
    errDept: "Please select your department.",
    errNeed: "Please answer whether you need financial support.",
    errGeneric: "Something went wrong. Please check your inputs and try again.",
    viewDetails: "View Details", aiWhy: "Why this matches you",
    missingLabel: "What is missing:",
    notProvided: "Not provided in the scholarship data",
    deadlineLabel: "Deadline", amountLabel: "Amount", minCgpaLabel: "Minimum CGPA",
    providerLabel: "Provider", descLabel: "Description",
    checksTitle: "Eligibility checks (decided by code)",
    colCriterion: "Criterion", colStatus: "Status", colYours: "Your value",
    colRequired: "Required", colDetail: "Detail",
    statusPASS: "Pass", statusFAIL: "Fail", statusUNKNOWN: "Not specified",
    critCgpa: "CGPA", critDepartment: "Department",
    critNeed: "Financial need", critGender: "Gender",
    checklistTitle: "Application checklist",
    profileLine: "CGPA {cgpa} · {dept} · Financial support needed: {need}",
    datasetLine: "Dataset: {file} ({n} records). Results are based on this provided list only.",
  },
  bn: {
    tagline: "আপনার প্রোফাইলের সাথে মেলে এমন স্কলারশিপ খুঁজুন",
    introTitle: "স্কলারশিপ মিস করা বন্ধ করুন",
    introText: "আপনার সিজিপিএ, বিভাগ এবং আর্থিক সহায়তা প্রয়োজন কিনা লিখুন। সরবরাহকৃত তালিকার প্রতিটি স্কলারশিপ আমরা নির্দিষ্ট নিয়মে যাচাই করি, এবং AI ব্যাখ্যা করে কেন প্রতিটি মিল আপনার জন্য উপযুক্ত। যোগ্যতা সবসময় কোড দ্বারা নির্ধারিত হয় — AI দ্বারা নয়।",
    cgpaLabel: "সিজিপিএ (৪.০০ এর মধ্যে)", deptLabel: "বিভাগ",
    deptPlaceholder: "আপনার বিভাগ নির্বাচন করুন",
    needLabel: "আপনার কি আর্থিক সহায়তা প্রয়োজন?", yes: "হ্যাঁ", no: "না",
    genderLabel: "লিঙ্গ (কিছু স্কলারশিপ লিঙ্গ-নির্দিষ্ট)",
    genderUnspec: "বলতে চাই না", genderFemale: "নারী", genderMale: "পুরুষ",
    findBtn: "স্কলারশিপ খুঁজুন", newSearch: "নতুন অনুসন্ধান",
    resultsTitle: "আপনার মিলসমূহ", countEligible: "যোগ্য", countNear: "প্রায় মিল",
    countReview: "পর্যালোচনা প্রয়োজন", countChecked: "যাচাইকৃত রেকর্ড",
    sortLabel: "সাজান", sortDeadline: "সময়সীমা (আগে যা আসছে)",
    sortAmount: "পরিমাণ (সর্বোচ্চ আগে)", sortName: "নাম (A–Z)",
    downloadBtn: "ফলাফল ডাউনলোড করুন (CSV)",
    eligibleTitle: "যোগ্য স্কলারশিপসমূহ",
    emptyText: "সরবরাহকৃত তালিকায় কোনো মিলে এমন স্কলারশিপ পাওয়া যায়নি।",
    nearTitle: "প্রায় মিল — প্রায় পৌঁছে গেছেন",
    nearSub: "প্রতিটি কার্ডে উল্লিখিত একটি পরিমাপযোগ্য শর্ত ছাড়া বাকি সব শর্ত আপনি পূরণ করেছেন।",
    reviewTitle: "পর্যালোচনা প্রয়োজন",
    reviewSub: "সরবরাহকৃত ডেটা থেকে একটি শর্ত যাচাই করা যায়নি, তাই এগুলো নিশ্চিতও নয়, বাতিলও নয়।",
    resultsNote: "ফলাফল সরবরাহকৃত স্কলারশিপ তালিকার উপর ভিত্তি করে তৈরি। আবেদনের আগে অনুগ্রহ করে প্রদানকারীর কাছ থেকে অফিসিয়াল বিবরণ যাচাই করুন।",
    backResults: "ফলাফলে ফিরে যান", loading: "প্রতিটি স্কলারশিপ যাচাই করা হচ্ছে…",
    footer: "ScholarSync AI · Track 3 — Personalized Learning & Productivity · ডেটাসেট হ্যাকাথন আয়োজকদের দ্বারা সরবরাহকৃত।",
    errCgpa: "০.০০ থেকে ৪.০০ এর মধ্যে একটি সিজিপিএ লিখুন।",
    errDept: "অনুগ্রহ করে আপনার বিভাগ নির্বাচন করুন।",
    errNeed: "অনুগ্রহ করে উত্তর দিন আপনার আর্থিক সহায়তা প্রয়োজন কিনা।",
    errGeneric: "কিছু ভুল হয়েছে। অনুগ্রহ করে আপনার তথ্য যাচাই করে আবার চেষ্টা করুন।",
    viewDetails: "বিস্তারিত দেখুন", aiWhy: "কেন এটি আপনার সাথে মিলেছে",
    missingLabel: "যা ঘাটতি আছে:",
    notProvided: "স্কলারশিপ ডেটায় দেওয়া নেই",
    deadlineLabel: "সময়সীমা", amountLabel: "পরিমাণ", minCgpaLabel: "ন্যূনতম সিজিপিএ",
    providerLabel: "প্রদানকারী", descLabel: "বিবরণ",
    checksTitle: "যোগ্যতা যাচাই (কোড দ্বারা নির্ধারিত)",
    colCriterion: "মানদণ্ড", colStatus: "অবস্থা", colYours: "আপনার মান",
    colRequired: "প্রয়োজনীয়", colDetail: "বিবরণ",
    statusPASS: "পাস", statusFAIL: "ফেল", statusUNKNOWN: "উল্লেখ নেই",
    critCgpa: "সিজিপিএ", critDepartment: "বিভাগ",
    critNeed: "আর্থিক প্রয়োজন", critGender: "লিঙ্গ",
    checklistTitle: "আবেদনের চেকলিস্ট",
    profileLine: "সিজিপিএ {cgpa} · {dept} · আর্থিক সহায়তা প্রয়োজন: {need}",
    datasetLine: "ডেটাসেট: {file} ({n}টি রেকর্ড)। ফলাফল শুধুমাত্র এই সরবরাহকৃত তালিকার উপর ভিত্তি করে।",
  },
};

let lang = "en";
let currentProfile = null;
let currentResults = null;

const $ = (id) => document.getElementById(id);
const t = (key) => (I18N[lang][key] || I18N.en[key] || key);

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  $("langToggle").textContent = lang === "en" ? "বাংলা" : "English";
  document.documentElement.lang = lang === "en" ? "en" : "bn";
}

/* ---------------- views ---------------- */
function showView(name) {
  $("finderView").hidden = name !== "finder";
  $("resultsView").hidden = name !== "results";
  $("detailView").hidden = name !== "detail";
  window.scrollTo(0, 0);
}

/* ---------------- meta ---------------- */
async function loadMeta() {
  try {
    const res = await fetch("/api/meta");
    const meta = await res.json();
    const select = $("department");
    meta.departments.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d; opt.textContent = d;
      select.appendChild(opt);
    });
    $("datasetNote").textContent = t("datasetLine")
      .replace("{file}", meta.dataset.filename)
      .replace("{n}", meta.dataset.records);
  } catch (e) { /* form still usable; backend error surfaces on submit */ }
}

async function showLoadingOverlay() {
  const overlay = $("loadingOverlay");
  overlay.hidden = false;
  // Let the browser paint the overlay before starting a network request.
  await new Promise((resolve) => requestAnimationFrame(() =>
    requestAnimationFrame(resolve)
  ));
}

/* ---------------- matching ---------------- */
function setError(id, message) {
  const el = $(id);
  el.hidden = !message;
  el.textContent = message || "";
}

async function runMatch(sortBy) {
  const body = {
    cgpa: currentProfile.cgpa,
    department: currentProfile.department,
    financial_support_needed: currentProfile.financial_support_needed,
    gender: currentProfile.gender,
    lang,
    sort_by: sortBy || $("sortBy").value,
  };
  await showLoadingOverlay();
  try {
    const res = await fetch("/api/match", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("match failed");
    currentResults = await res.json();
    renderResults();
    showView("results");
  } catch (e) {
    setError("formError", t("errGeneric"));
    showView("finder");
  } finally {
    $("loadingOverlay").hidden = true;
  }
}

function badgeClass(status) {
  return status === "ELIGIBLE" ? "badge-eligible"
    : status === "NEAR_MATCH" ? "badge-near" : "badge-review";
}
function badgeText(status) {
  return status === "ELIGIBLE" ? t("countEligible")
    : status === "NEAR_MATCH" ? t("countNear") : t("countReview");
}

function cardHtml(r) {
  const ex = r.ai_explanation || {};
  const passed = (ex.passed_reasons || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("");
  const missing = (r.missing || []).map((x) => `<li>${escapeHtml(x)}</li>`).join("");
  return `
  <article class="sch-card">
    <h4>${escapeHtml(r.name)}<span class="badge ${badgeClass(r.status)}">${escapeHtml(badgeText(r.status))}</span></h4>
    <p class="sch-meta">${escapeHtml(t("providerLabel"))}: ${escapeHtml(r.provider || t("notProvided"))}</p>
    <p class="sch-meta"><span class="sch-amount">${escapeHtml(r.amount_display || t("notProvided"))}</span>
      · ${escapeHtml(t("deadlineLabel"))}: ${escapeHtml(r.deadline || t("notProvided"))}
      · ${escapeHtml(t("minCgpaLabel"))}: ${r.minimum_cgpa != null ? r.minimum_cgpa.toFixed(2) : escapeHtml(t("notProvided"))}</p>
    ${missing ? `<p class="missing-list">${escapeHtml(t("missingLabel"))}</p><ul class="missing-list">${missing}</ul>` : ""}
    <div class="ai-box" id="cardAi-${escapeHtml(r.scholarship_id)}">
      <span class="ai-label">${escapeHtml(t("aiWhy"))} · ${escapeHtml(ex.source === "gemini" ? "AI" : "Template")}</span>
      <p>${escapeHtml(ex.summary || "")}</p>
      ${passed ? `<ul>${passed}</ul>` : ""}
    </div>
    <p class="card-actions"><button class="btn btn-secondary" type="button" data-detail="${escapeHtml(r.scholarship_id)}">${escapeHtml(t("viewDetails"))}</button><button class="btn btn-ai" type="button" data-ai-explain="${escapeHtml(r.scholarship_id)}">✦ Explain with AI</button><button class="btn btn-download-one" type="button" data-download-scholarship="${escapeHtml(r.scholarship_id)}">↓ Download</button></p>
  </article>`;
}

function renderResults() {
  const s = currentResults.summary;
  $("countEligible").textContent = s.eligible_count;
  $("countNear").textContent = s.near_match_count;
  $("countReview").textContent = s.needs_review_count;
  $("countChecked").textContent = s.records_checked;
  const p = currentResults.profile;
  $("profileSummary").textContent = t("profileLine")
    .replace("{cgpa}", p.cgpa.toFixed(2))
    .replace("{dept}", p.department)
    .replace("{need}", p.financial_support_needed ? t("yes") : t("no"));
  $("eligibleList").innerHTML = currentResults.eligible.map(cardHtml).join("");
  $("nearList").innerHTML = currentResults.near_matches.map(cardHtml).join("");
  $("reviewList").innerHTML = currentResults.needs_review.map(cardHtml).join("");
  $("emptyState").hidden = currentResults.eligible.length > 0;
  document.querySelectorAll("[data-detail]").forEach((btn) => {
    btn.addEventListener("click", () => openDetail(btn.dataset.detail));
  });
  document.querySelectorAll("[data-ai-explain]").forEach((btn) => {
    btn.addEventListener("click", () => explainCardWithAI(btn.dataset.aiExplain, btn));
  });
  document.querySelectorAll("[data-download-scholarship]").forEach((btn) => {
    btn.addEventListener("click", () => downloadOneScholarship(btn.dataset.downloadScholarship, btn));
  });
}


async function explainCardWithAI(id, button) {
  const box = $("cardAi-" + id);
  button.disabled = true;
  button.textContent = "✦ Asking Gemini…";
  box.innerHTML = '<span class="ai-label">AI EXPLANATION</span><p>Generating a grounded explanation from your verified eligibility checks…</p>';
  try {
    const p = currentProfile;
    const q = new URLSearchParams({cgpa:p.cgpa,department:p.department,financial_support_needed:p.financial_support_needed,gender:p.gender,lang,explain:"ai"});
    const res = await fetch("/api/scholarships/" + encodeURIComponent(id) + "?" + q);
    if (!res.ok) throw new Error("AI request failed");
    const data = await res.json();
    const ex = data.ai_explanation || {};
    const label = ex.source === "gemini" ? "✦ GEMINI AI" : "TEMPLATE FALLBACK";
    const reason = ex.fallback_reason ? '<p class="ai-fallback-note">' + escapeHtml(ex.fallback_reason) + '</p>' : "";
    box.innerHTML = '<span class="ai-label">' + label + '</span><p>' + escapeHtml(ex.summary || "") + '</p><p><em>' + escapeHtml(ex.disclaimer || "") + '</em></p>' + reason;
    button.textContent = ex.source === "gemini" ? "✓ AI explanation ready" : "↻ Try AI again";
  } catch (err) {
    box.innerHTML = '<span class="ai-label">AI UNAVAILABLE</span><p>Gemini could not generate an explanation right now. Please try again.</p>';
    button.textContent = "↻ Try AI again";
  } finally { button.disabled = false; }
}

/* ---------------- detail ---------------- */
async function openDetail(id) {
  const p = currentProfile;
  const q = new URLSearchParams({
    cgpa: p.cgpa, department: p.department,
    financial_support_needed: p.financial_support_needed,
    gender: p.gender, lang,
  });
  await showLoadingOverlay();
  try {
    const detailUrl = `/api/scholarships/${encodeURIComponent(id)}?${q}`;
    const res = await fetch(detailUrl);
    if (!res.ok) throw new Error("detail failed");
    renderDetail(await res.json());
    showView("detail");
    $("loadingOverlay").hidden = true;

    // Load AI after the details are visible; Gemini latency cannot block navigation.
    fetch(`${detailUrl}&explain=ai`)
      .then((aiRes) => { if (!aiRes.ok) throw new Error("AI unavailable"); return aiRes.json(); })
      .then((data) => updateDetailExplanation(data.ai_explanation))
      .catch(() => updateDetailExplanation(null));
  } catch (e) {
    alert(t("errGeneric"));
  } finally {
    $("loadingOverlay").hidden = true;
  }
}

function updateDetailExplanation(ex) {
  const box = $("detailAiBox");
  if (!box) return;
  if (!ex) {
    box.innerHTML = `<span class="ai-label">${escapeHtml(t("aiWhy"))} · Template fallback</span><p>Gemini is temporarily unavailable. The verified template explanation is shown.</p>`;
    return;
  }
  const reason = ex.fallback_reason ? `<p class="ai-fallback-note">${escapeHtml(ex.fallback_reason)}</p>` : "";
  box.innerHTML = `<span class="ai-label">${escapeHtml(t("aiWhy"))} · ${escapeHtml(ex.source === "gemini" ? "Gemini AI" : "Template fallback")}</span><p>${escapeHtml(ex.summary || "")}</p><p><em>${escapeHtml(ex.disclaimer || "")}</em></p>${reason}`;
}

function critName(c) {
  return t({cgpa: "critCgpa", department: "critDepartment",
            financial_need: "critNeed", gender: "critGender"}[c] || "critCgpa");
}

function renderDetail(d) {
  const val = (v) => (v === null || v === undefined || v === "" ? t("notProvided") : v);
  const depts = d.all_departments ? "All" : (d.eligible_departments || []).join(", ");
  const checks = (d.checks || []).map((c) => `
    <tr>
      <td>${escapeHtml(critName(c.criterion))}</td>
      <td class="status-${c.status.toLowerCase() === "pass" ? "pass" : c.status.toLowerCase() === "fail" ? "fail" : "unknown"}">${escapeHtml(t("status" + c.status) || c.status)}</td>
      <td>${escapeHtml(c.student_value)}</td>
      <td>${escapeHtml(c.required_value)}</td>
      <td>${escapeHtml(c.detail)}</td>
    </tr>`).join("");
  const ex = d.ai_explanation || {};
  const cl = d.application_checklist || {};
  const clSteps = (cl.steps || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("");
  const clDocs = (cl.documents || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("");
  $("detailContent").innerHTML = `
  <div class="card">
    <div class="detail-title-row"><h2 style="margin-top:0;color:var(--green-900)">${escapeHtml(d.name)}</h2><button class="btn btn-download-one" type="button" data-download-detail="${escapeHtml(d.scholarship_id || d.id || "")}">↓ Download this scholarship</button></div>
    <dl class="detail-fields">
      <dt>${escapeHtml(t("providerLabel"))}</dt><dd>${escapeHtml(val(d.provider))}</dd>
      <dt>${escapeHtml(t("amountLabel"))}</dt><dd>${escapeHtml(val(d.amount_display))}</dd>
      <dt>${escapeHtml(t("deadlineLabel"))}</dt><dd>${escapeHtml(val(d.deadline))}</dd>
      <dt>${escapeHtml(t("minCgpaLabel"))}</dt><dd>${d.minimum_cgpa != null ? d.minimum_cgpa.toFixed(2) : escapeHtml(t("notProvided"))}</dd>
      <dt>${escapeHtml(t("deptLabel"))}</dt><dd>${escapeHtml(val(depts))}</dd>
      <dt>${escapeHtml(t("descLabel"))}</dt><dd>${escapeHtml(val(d.description))}</dd>
    </dl>
    ${checks ? `<h3>${escapeHtml(t("checksTitle"))}</h3>
    <div style="overflow-x:auto"><table class="checks">
      <tr><th>${escapeHtml(t("colCriterion"))}</th><th>${escapeHtml(t("colStatus"))}</th><th>${escapeHtml(t("colYours"))}</th><th>${escapeHtml(t("colRequired"))}</th><th>${escapeHtml(t("colDetail"))}</th></tr>
      ${checks}
    </table></div>` : ""}
    <div class="ai-box" id="detailAiBox">
      <span class="ai-label">${escapeHtml(t("aiWhy"))} · Template · AI loading…</span>
      <p>${escapeHtml(ex.summary || "")}</p>
      <p><em>${escapeHtml(ex.disclaimer || "")}</em></p>
    </div>
    <h3>${escapeHtml(t("checklistTitle"))}</h3>
    ${cl.label ? `<p class="section-sub">${escapeHtml(cl.label)}</p>` : ""}
    ${clSteps ? `<ul class="checklist">${clSteps}</ul>` : ""}
    ${clDocs ? `<ul class="checklist">${clDocs}</ul>` : ""}
  </div>`;
}


async function downloadOneScholarship(id, button) {
  const original = button.textContent;
  button.disabled = true;
  button.textContent = "Preparing file…";
  try {
    const p = currentProfile;
    const q = new URLSearchParams({
      cgpa:p.cgpa, department:p.department,
      financial_support_needed:p.financial_support_needed,
      gender:p.gender, lang
    });
    const response = await fetch("/api/scholarships/" + encodeURIComponent(id) + "?" + q);
    if (!response.ok) throw new Error("Could not load scholarship details");
    const d = await response.json();
    const rows = [
      ["Scholarship", d.name],
      ["Scholarship ID", d.scholarship_id || d.id || id],
      ["Provider", d.provider],
      ["Amount", d.amount_display],
      ["Deadline", d.deadline],
      ["Minimum CGPA", d.minimum_cgpa],
      ["Eligible departments", d.all_departments ? "All" : (d.eligible_departments || []).join("; ")],
      ["Description", d.description],
      ["Your eligibility status", d.status],
      ["Dataset note", d.dataset_note],
      ["Eligibility checks", (d.checks || []).map(c => c.criterion + ": " + c.status + " — " + c.detail).join(" | ")],
      ["Application checklist", (d.application_checklist?.steps || []).join(" | ")],
      ["Suggested documents", (d.application_checklist?.documents || []).join(" | ")],
      ["AI explanation", d.ai_explanation?.summary || ""],
      ["AI source", d.ai_explanation?.source || "Not requested"]
    ];
    const csv = "\uFEFF" + ["Field,Value", ...rows.map(row => row.map(value => '"' + String(value ?? "").replace(/"/g,'""') + '"').join(","))].join("\r\n");
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (String(d.name || "scholarship").replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"").toLowerCase() || "scholarship") + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    button.textContent = "✓ Downloaded";
  } catch (error) {
    alert("Could not download this scholarship. Please try again.");
    button.textContent = original;
  } finally {
    button.disabled = false;
    setTimeout(() => { if (button.isConnected) button.textContent = original; }, 1800);
  }
}

/* ---------------- download ---------------- */
async function downloadResults() {
  const all = [
    ...currentResults.eligible, ...currentResults.near_matches,
    ...currentResults.needs_review,
  ];
  const res = await fetch("/api/export", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({results: all}),
  });
  if (!res.ok) { alert(t("errGeneric")); return; }
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "scholarsync-results.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ---------------- events ---------------- */
$("profileForm").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const cgpa = parseFloat($("cgpa").value);
  const department = $("department").value;
  const need = document.querySelector("input[name=need]:checked");
  let ok = true;
  if (isNaN(cgpa) || cgpa < 0 || cgpa > 4.0) { setError("cgpaError", t("errCgpa")); ok = false; } else setError("cgpaError", "");
  if (!department) { setError("deptError", t("errDept")); ok = false; } else setError("deptError", "");
  if (!need) { setError("needError", t("errNeed")); ok = false; } else setError("needError", "");
  setError("formError", "");
  if (!ok) return;
  currentProfile = {
    cgpa, department,
    financial_support_needed: need.value === "yes",
    gender: $("gender").value,
  };
  $("submitBtn").disabled = true;
  runMatch().finally(() => { $("submitBtn").disabled = false; });
});

$("sortBy").addEventListener("change", () => { if (currentProfile) runMatch(); });
$("downloadBtn").addEventListener("click", downloadResults);
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-download-detail]");
  if (button) downloadOneScholarship(button.dataset.downloadDetail, button);
});
$("backToFinder").addEventListener("click", () => showView("finder"));
$("backToResults").addEventListener("click", () => showView("results"));
$("langToggle").addEventListener("click", () => {
  lang = lang === "en" ? "bn" : "en";
  applyI18n();
  loadMeta();
  if (currentResults && currentProfile) runMatch($("sortBy").value);
});

// Small live interactions on the landing page.
function updateProfileProgress() {
  const filled = [
    Boolean($("cgpa").value),
    Boolean($("department").value),
    Boolean(document.querySelector('input[name="need"]:checked')),
    $("gender").value !== "unspecified",
  ].filter(Boolean).length;
  const percent = Math.round((filled / 4) * 100);
  $("profileProgressText").textContent = percent + "%";
  $("profileProgressBar").style.width = percent + "%";
}
["cgpa", "department", "gender"].forEach((id) => {
  $(id).addEventListener("input", updateProfileProgress);
  $(id).addEventListener("change", updateProfileProgress);
});
document.querySelectorAll('input[name="need"]').forEach((el) =>
  el.addEventListener("change", updateProfileProgress)
);
document.querySelectorAll("[data-cgpa]").forEach((button) => {
  button.addEventListener("click", () => {
    $("cgpa").value = button.dataset.cgpa;
    updateProfileProgress();
    $("cgpa").focus();
  });
});


/* ---------------- in-app tutorial ---------------- */
const tutorialCopy = {
  en: {
    kicker:"QUICK START GUIDE", title:"How to use ScholarSync AI",
    steps:[
      ["Enter your CGPA","Type your CGPA out of 4.00. You can also use one of the quick-select buttons."],
      ["Select your department","Choose the department that matches your current study program."],
      ["Answer the profile questions","Tell us whether you need financial support. Gender is optional and can be left unspecified."],
      ["Explore your matches","We check every record in the supplied dataset. Open details to review eligibility checks, deadlines and application guidance."]
    ],
    note:"Eligibility is decided by verified rules—not by AI. AI only helps explain your results.",
    done:"Got it — let's start", close:"Close tutorial"
  },
  bn: {
    kicker:"দ্রুত ব্যবহার নির্দেশিকা", title:"ScholarSync AI কীভাবে ব্যবহার করবেন",
    steps:[
      ["CGPA লিখুন","৪.০০-এর মধ্যে আপনার CGPA লিখুন। চাইলে নিচের quick-select বাটনও ব্যবহার করতে পারেন।"],
      ["বিভাগ নির্বাচন করুন","আপনার বর্তমান পড়াশোনার বিভাগের সাথে মেলে এমন বিভাগ বেছে নিন।"],
      ["প্রোফাইলের প্রশ্নগুলোর উত্তর দিন","আপনার আর্থিক সহায়তা প্রয়োজন কি না জানান। Gender-এর তথ্য ঐচ্ছিক।"],
      ["ম্যাচগুলো দেখুন","আমরা দেওয়া ডেটাসেটের প্রতিটি রেকর্ড যাচাই করি। বিস্তারিত খুলে যোগ্যতার শর্ত, deadline ও আবেদনের নির্দেশনা দেখুন।"]
    ],
    note:"যোগ্যতা নির্ধারণ করে নির্দিষ্ট নিয়ম—AI নয়। AI শুধু ফলাফল বুঝতে সাহায্য করে।",
    done:"বুঝেছি — শুরু করি", close:"টিউটোরিয়াল বন্ধ করুন"
  }
};
function updateTutorialLanguage(){
  const c=tutorialCopy[lang];
  $("tutorialTitle").textContent=c.title;
  document.querySelector(".tutorial-kicker").textContent=c.kicker;
  document.querySelectorAll(".tutorial-step").forEach((step,i)=>{
    step.querySelector("h3").textContent=c.steps[i][0];
    step.querySelector("p").textContent=c.steps[i][1];
  });
  $("tutorialOverlay").querySelector(".tutorial-note").textContent=c.note;
  $("tutorialGotIt").textContent=c.done;
  $("tutorialClose").setAttribute("aria-label",c.close);
}
function closeTutorial(){ $("tutorialOverlay").hidden=true; $("tutorialBtn").focus(); }
$("tutorialBtn").addEventListener("click",()=>{
  updateTutorialLanguage();
  $("tutorialOverlay").hidden=false;
  $("tutorialClose").focus();
});
$("tutorialClose").addEventListener("click",closeTutorial);
$("tutorialGotIt").addEventListener("click",closeTutorial);
$("tutorialOverlay").addEventListener("click",(event)=>{
  if(event.target===$("tutorialOverlay")) closeTutorial();
});
document.addEventListener("keydown",(event)=>{
  if(event.key==="Escape" && !$("tutorialOverlay").hidden) closeTutorial();
});

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const light = theme === "light";
  $("themeToggle").textContent = light ? "🌙 Dark" : "☀️ Light";
  $("themeToggle").setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
  localStorage.setItem("scholarsync-theme", theme);
}
applyTheme(localStorage.getItem("scholarsync-theme") || "dark");
$("themeToggle").addEventListener("click", () => {
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});
applyI18n();
loadMeta();
updateProfileProgress();

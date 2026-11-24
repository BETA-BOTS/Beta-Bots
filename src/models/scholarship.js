"use strict";
/* Normalized scholarship record (internal schema, blueprint section 4.2).
 *
 * Only fields that exist in the organizer CSV are populated; anything
 * the dataset does not provide stays null and is displayed to the user
 * as "Not provided in the scholarship data" -- never guessed.
 * (Port of backend/app/models/scholarship.py.)
 */

function publicDict(s) {
  return {
    id: s.id,
    name: s.name,
    provider: s.provider,
    minimum_cgpa: s.minimum_cgpa,
    cgpa_scale: s.cgpa_scale,
    eligible_departments: s.eligible_departments,
    all_departments: s.all_departments,
    financial_need_rule: s.financial_need_rule,
    gender_rule: s.gender_rule,
    amount_bdt: s.amount_bdt,
    amount_display: s.amount_display,
    deadline: s.deadline, // ISO date string or null
    deadline_raw: s.deadline_raw,
    description: s.description,
    application_steps: s.application_steps,
    required_documents: s.required_documents,
    source_row: s.source_row,
  };
}

module.exports = { publicDict };

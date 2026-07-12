// Resolves a bilingual { en, pt } field to a plain string for the current
// language, with two safety nets:
// 1. Falls back to English if the active language's translation is missing
// 2. Falls back to treating the field as a plain string if it's still the
//    OLD pre-migration shape (a string, not an object) — this matters
//    during rollout since not every product will be migrated instantly.
export const getLocalizedText = (field, lang) => {
  if (!field) return "";
  if (typeof field === "string") return field; // legacy/unmigrated data
  return field[lang] || field.en || "";
};
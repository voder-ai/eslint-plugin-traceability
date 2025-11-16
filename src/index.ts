/**
 * ESLint Traceability Plugin
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Provide foundational plugin export and registration
 */

export const rules: Record<string, unknown> = {};

export const configs = {
  recommended: [
    {
      rules: {},
    },
  ],
  strict: [
    {
      rules: {},
    },
  ],
};

export default { rules, configs };

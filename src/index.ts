/**
 * ESLint Traceability Plugin
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Provide foundational plugin export and registration
 */

import requireStoryAnnotation from "./rules/require-story-annotation";
import requireReqAnnotation from "./rules/require-req-annotation";

export const rules = {
  "require-story-annotation": requireStoryAnnotation,
  "require-req-annotation": requireReqAnnotation,
};

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

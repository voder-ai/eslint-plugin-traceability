/**
 * ESLint Traceability Plugin
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Provide foundational plugin export and registration
 */

import requireStoryAnnotation from "./rules/require-story-annotation";
import requireReqAnnotation from "./rules/require-req-annotation";
import requireBranchAnnotation from "./rules/require-branch-annotation";
import validAnnotationFormat from "./rules/valid-annotation-format";
import validStoryReference from "./rules/valid-story-reference";
import validReqReference from "./rules/valid-req-reference";

export const rules = {
  "require-story-annotation": requireStoryAnnotation,
  "require-req-annotation": requireReqAnnotation,
  "require-branch-annotation": requireBranchAnnotation,
  "valid-annotation-format": validAnnotationFormat,
  "valid-story-reference": validStoryReference,
  "valid-req-reference": validReqReference,
};

export const configs = {
  recommended: [
    {
      plugins: {
        traceability: {},
      },
      rules: {
        "traceability/require-story-annotation": "error",
        "traceability/require-req-annotation": "error",
        "traceability/require-branch-annotation": "error",
        "traceability/valid-annotation-format": "error",
        "traceability/valid-story-reference": "error",
        "traceability/valid-req-reference": "error",
      },
    },
  ],
  strict: [
    {
      plugins: {
        traceability: {},
      },
      rules: {
        "traceability/require-story-annotation": "error",
        "traceability/require-req-annotation": "error",
        "traceability/require-branch-annotation": "error",
        "traceability/valid-annotation-format": "error",
        "traceability/valid-story-reference": "error",
        "traceability/valid-req-reference": "error",
      },
    },
  ],
};

export default { rules, configs };

import type { Rule } from "eslint";
import type {
  RedundancyRuleOptions,
  Strictness,
} from "../utils/annotation-scope-analyzer";
import {
  collectScopePairs,
  debugScopePairs,
  reportRedundantAnnotationsInBlock,
} from "../utils/redundancy-detector";

/**
 * ESLint rule to detect redundant traceability annotations on statements
 * that are already covered by their containing scope.
 *
 * This rule focuses on simple, statement-level patterns that the
 * existing branch and function rules already treat as covered by
 * surrounding annotations. It treats redundant annotations as
 * maintainability concerns rather than correctness issues, and is
 * therefore exposed as a warning-level rule by default.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS REQ-DUPLICATION-DETECTION REQ-STATEMENT-SIGNIFICANCE REQ-SAFE-REMOVAL REQ-DIFFERENT-REQUIREMENTS REQ-CONFIGURABLE-STRICTNESS REQ-SCOPE-INHERITANCE
 */

const DEFAULT_ALWAYS_COVERED_STATEMENTS = [
  "ReturnStatement",
  "VariableDeclaration",
] as const;

const DEFAULT_STRICTNESS: Strictness = "moderate";
const DEFAULT_ALLOW_EMPHASIS_DUPLICATION = false;
const DEFAULT_MAX_SCOPE_DEPTH = 3;

/**
 * Normalize and apply defaults to rule options for the redundancy detector.
 *
 * @story docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md
 * @req REQ-REDUNDANT-OPTIONS
 */
function normalizeOptions(raw: any | undefined): RedundancyRuleOptions {
  const strictness: Strictness =
    raw && typeof raw.strictness === "string"
      ? (raw.strictness as Strictness)
      : DEFAULT_STRICTNESS;

  const allowEmphasisDuplication =
    typeof raw?.allowEmphasisDuplication === "boolean"
      ? raw.allowEmphasisDuplication
      : DEFAULT_ALLOW_EMPHASIS_DUPLICATION;

  const maxScopeDepth =
    typeof raw?.maxScopeDepth === "number" && raw.maxScopeDepth > 0
      ? raw.maxScopeDepth
      : DEFAULT_MAX_SCOPE_DEPTH;

  const alwaysCovered: string[] = Array.isArray(raw?.alwaysCovered)
    ? raw.alwaysCovered
    : Array.from(DEFAULT_ALWAYS_COVERED_STATEMENTS);

  return {
    strictness,
    allowEmphasisDuplication,
    maxScopeDepth,
    alwaysCovered,
  };
}

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Detect and remove redundant traceability annotations already covered by containing scope",
      recommended: false,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          strictness: {
            enum: ["strict", "moderate", "permissive"],
          },
          allowEmphasisDuplication: {
            type: "boolean",
          },
          maxScopeDepth: {
            type: "number",
            minimum: 1,
          },
          alwaysCovered: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      /**
       * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-CLEAR-MESSAGES REQ-SAFE-REMOVAL
       */
      redundantAnnotation:
        "Annotation on this statement is redundant; it is already covered by its containing scope.",
    },
  },

  /**
   * Wire up the ESLint visitors that detect and fix redundant annotations.
   *
   * @story docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md
   * @req REQ-REDUNDANT-DETECTION
   */
  create(context) {
    const options = normalizeOptions(context.options[0]);

    return {
      // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-REDUNDANCY-PATTERNS REQ-SAFE-REMOVAL
      BlockStatement(node: any) {
        const parent = (node as any).parent;

        if (process.env.TRACEABILITY_DEBUG === "1") {
          console.log(
            "[no-redundant-annotation] BlockStatement parent=%s statements=%d",
            parent && parent.type,
            Array.isArray(node.body) ? node.body.length : 0,
          );
        }

        // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-CATCH-BLOCK-HANDLING
        if (parent && parent.type === "CatchClause") {
          return;
        }

        const scopePairs = collectScopePairs(
          context,
          parent,
          options.maxScopeDepth,
        );
        debugScopePairs(parent, scopePairs);
        if (scopePairs.size === 0) return;

        reportRedundantAnnotationsInBlock(context, node, scopePairs, options);
      },
    };
  },
};

export default rule;

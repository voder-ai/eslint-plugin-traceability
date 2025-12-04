import type { Rule } from "eslint";

/**
 * Determine if a file should be treated as a test file based on patterns.
 *
 * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-PATTERN-DETECT
 */
function determineIsTestFile(
  filename: string,
  rawPatterns: string[] = [
    "/tests/",
    "/test/",
    "/__tests__/",
    ".test.",
    ".spec.",
  ],
): boolean {
  return rawPatterns.some((pattern: string) =>
    filename.includes(pattern.replace("**", "")),
  );
}

/**
 * Ensure the file has a @supports annotation listing tested requirements.
 *
 * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-FILE-SUPPORTS REQ-TEST-SUPPORTS-VALID
 */
function ensureFileSupportsAnnotation(context: any, sourceCode: any): void {
  const fileComments = sourceCode.getAllComments() || [];

  const fileHasSupports = fileComments.some((comment: any) =>
    /@supports\b/.test(comment.value || ""),
  );

  if (!fileHasSupports) {
    const node =
      (fileComments[0] as any) || (sourceCode.ast && (sourceCode.ast as any));
    context.report({
      node: node as any,
      messageId: "missingFileSupports",
    });
  }
}

/**
 * Check if a callee name corresponds to a test framework function.
 *
 * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-FRAMEWORK-COMPAT
 */
function isTestCallName(name: string): boolean {
  return ["describe", "it", "test", "context"].includes(name);
}

function getCalleeName(node: any): string | null {
  if (node.callee.type === "Identifier") {
    return node.callee.name;
  }
  if (
    node.callee.type === "MemberExpression" &&
    node.callee.object.type === "Identifier"
  ) {
    return node.callee.object.name;
  }
  return null;
}

function getFirstArgumentLiteral(node: any): string | null {
  const arg = node.arguments && node.arguments[0];
  if (!arg) return null;
  if (arg.type === "Literal" && typeof arg.value === "string") {
    return arg.value;
  }
  return null;
}

/**
 * Enforce traceability conventions in test files.
 *
 * This rule validates that:
 * - Test files have a file-level @supports annotation listing tested requirements.
 * - describe()/it()/test()/context() blocks include story and requirement references
 *   following project conventions.
 *
 * @story docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md
 * @req REQ-TEST-FILE-SUPPORTS
 * @req REQ-TEST-DESCRIBE-STORY
 * @req REQ-TEST-IT-REQ-PREFIX
 * @req REQ-TEST-SUPPORTS-VALID
 * @req REQ-TEST-PATTERN-DETECT
 * @req REQ-TEST-FRAMEWORK-COMPAT
 * @req REQ-TEST-NESTED-DESCRIBE
 * @req REQ-TEST-ERROR-CONTEXT
 */
const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce traceability annotations and naming conventions in test files",
      recommended: "error",
    },
    schema: [
      {
        type: "object",
        properties: {
          testFilePatterns: {
            type: "array",
            items: { type: "string" },
            default: [
              "**/tests/**/*.test.{js,ts}",
              "**/tests/**/*.spec.{js,ts}",
              "**/__tests__/**/*.{js,ts}",
              "**/*.{test,spec}.{js,ts}",
            ],
          },
          requireDescribeStory: {
            type: "boolean",
            default: true,
          },
          requireTestReqPrefix: {
            type: "boolean",
            default: true,
          },
          describePattern: {
            type: "string",
            default: "Story [0-9]+\\.[0-9]+-",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingFileSupports:
        "Test file must have @supports annotation listing tested requirements.",
      missingDescribeStory:
        "describe() block should reference story (e.g., 'Story 009.0-DEV-...').",
      missingReqPrefix:
        "Test name should start with requirement ID (e.g., '[REQ-MAINT-DETECT] ...').",
    },
  },
  create(context) {
    const filename = context.getFilename();
    const options = (context.options && context.options[0]) || {};
    const {
      testFilePatterns = [
        "/tests/",
        "/test/",
        "/__tests__/",
        ".test.",
        ".spec.",
      ],
      requireDescribeStory = true,
      requireTestReqPrefix = true,
      describePattern = "Story [0-9]+\\.[0-9]+-",
    } = options;

    const isTestFile = determineIsTestFile(filename, testFilePatterns);

    if (!isTestFile) {
      return {};
    }

    const sourceCode = context.getSourceCode();

    ensureFileSupportsAnnotation(context, sourceCode);

    const describeRegex = new RegExp(describePattern);

    return {
      // @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-DESCRIBE-STORY REQ-TEST-IT-REQ-PREFIX REQ-TEST-NESTED-DESCRIBE REQ-TEST-ERROR-CONTEXT
      CallExpression(node: any) {
        const calleeName = getCalleeName(node);
        if (!calleeName || !isTestCallName(calleeName)) {
          return;
        }

        const description = getFirstArgumentLiteral(node);
        if (!description) return;

        if (requireDescribeStory && calleeName === "describe") {
          if (!describeRegex.test(description)) {
            context.report({
              node: node as any,
              messageId: "missingDescribeStory",
            });
          }
        }

        if (
          requireTestReqPrefix &&
          (calleeName === "it" || calleeName === "test")
        ) {
          if (!/^\[REQ-[^\]]+]/.test(description)) {
            context.report({
              node: node as any,
              messageId: "missingReqPrefix",
            });
          }
        }
      },
    };
  },
};

export default rule;

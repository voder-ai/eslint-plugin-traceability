import type { Rule } from "eslint";
import {
  determineIsTestFile,
  ensureFileSupportsAnnotation,
  handleCallExpression,
} from "./helpers/require-test-traceability-helpers";

/**
 * Configuration options for require-test-traceability rule.
 *
 * The testFilePatterns option is interpreted as a list of simple substring
 * patterns, not glob patterns. The rule checks context.getFilename() (a
 * normalized path string) and considers a file a test file when any configured
 * pattern string appears anywhere in that path.
 *
 * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-PATTERN-DETECT REQ-TEST-FRAMEWORK-COMPAT
 * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-TEMPLATE REQ-TEST-FIX-PREFIX-FORMAT
 */
type TestTraceabilityOptions = {
  testFilePatterns?: string[];
  requireDescribeStory?: boolean;
  requireTestReqPrefix?: boolean;
  describePattern?: string;
  autoFixTestTemplate?: boolean;
  autoFixTestPrefixFormat?: boolean;
  testSupportsTemplate?: string;
};

/**
 * Enforce traceability conventions in test files.
 *
 * This rule validates that:
 * - Test files have a file-level @supports annotation listing tested requirements.
 * - describe()/it()/test()/context() blocks include story and requirement references
 *   following project conventions.
 * - When ESLint runs with --fix, safe, non-semantic auto-fixes are applied for
 *   missing file-level @supports and malformed [REQ-XXX] prefixes in test names.
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
 * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-TEMPLATE REQ-TEST-FIX-PREFIX-FORMAT REQ-TEST-FIX-SAFE REQ-TEST-FIX-PRESERVE REQ-TEST-FIX-PLACEHOLDER REQ-TEST-FIX-NO-INFERENCE
 */
const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce traceability annotations and naming conventions in test files",
      recommended: "error",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          testFilePatterns: {
            type: "array",
            items: { type: "string" },
            default: ["/tests/", "/test/", "/__tests__", ".test.", ".spec."],
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
          autoFixTestTemplate: {
            type: "boolean",
            default: true,
          },
          autoFixTestPrefixFormat: {
            type: "boolean",
            default: true,
          },
          testSupportsTemplate: {
            type: "string",
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
    const rawOptions = (context.options && context.options[0]) || {};
    const {
      testFilePatterns = [
        "/tests/",
        "/test/",
        "/__tests__",
        ".test.",
        ".spec.",
      ],
      requireDescribeStory = true,
      requireTestReqPrefix = true,
      describePattern = "Story [0-9]+\\.[0-9]+-",
      autoFixTestTemplate = true,
      autoFixTestPrefixFormat = true,
      testSupportsTemplate,
    } = rawOptions as TestTraceabilityOptions;

    const isTestFile = determineIsTestFile(filename, testFilePatterns);
    if (!isTestFile) return {};

    const sourceCode = context.getSourceCode();
    ensureFileSupportsAnnotation(context, sourceCode, {
      autoFixTestTemplate,
      testSupportsTemplate,
    });

    const describeRegex = new RegExp(describePattern);

    return {
      // @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-DESCRIBE-STORY REQ-TEST-IT-REQ-PREFIX REQ-TEST-NESTED-DESCRIBE REQ-TEST-ERROR-CONTEXT
      // @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-PREFIX-FORMAT REQ-TEST-FIX-SAFE REQ-TEST-FIX-PRESERVE REQ-TEST-FIX-NO-INFERENCE
      CallExpression: handleCallExpression(context, {
        sourceCode,
        describeRegex,
        requireDescribeStory,
        requireTestReqPrefix,
        autoFixTestPrefixFormat,
      }),
    };
  },
};

export default rule;

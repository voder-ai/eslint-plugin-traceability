/**
 * Tests for: docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md, docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @req REQ-BRANCH-DETECTION - Verify require-branch-annotation rule enforces branch annotations
 * @req REQ-ERROR-SPECIFIC - Branch-level missing-annotation error messages are specific and informative
 * @req REQ-ERROR-CONSISTENCY - Branch-level missing-annotation error messages follow shared conventions
 * @req REQ-ERROR-SUGGESTION - Branch-level missing-annotation errors include suggestions when applicable
 * @req REQ-NESTED-HANDLING - Nested branch annotations are correctly enforced without duplicative reporting
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-BRANCH-DETECTION REQ-NESTED-HANDLING
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC REQ-ERROR-CONSISTENCY REQ-ERROR-SUGGESTION
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/require-branch-annotation";

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { ecmaVersion: 2020 } },
} as any);

const makeMissingAnnotationErrors = (...missing: Array<"@story" | "@req">) =>
  missing.map((item) => ({
    messageId: "missingAnnotation" as const,
    data: { missing: item },
  }));

const runRule = (tests: Parameters<typeof ruleTester.run>[2]) =>
  ruleTester.run("require-branch-annotation", rule, tests);

describe("Require Branch Annotation Rule (Story 004.0-DEV-BRANCH-ANNOTATIONS)", () => {
  runRule({
    valid: [
      {
        name: "[REQ-BRANCH-DETECTION] valid fallback scanning comment detection",
        code: `switch (value) {

  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-BRANCH-DETECTION
  case 'z':
    break;
}`,
      },
      {
        name: "[REQ-BRANCH-DETECTION] valid if-statement with annotations",
        code: `// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-BRANCH-DETECTION
if (condition) {}`,
      },
      {
        name: "[REQ-BRANCH-DETECTION] valid for loop with block comment annotations",
        code: `/* @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md */
/* @req REQ-BRANCH-DETECTION */
for (let i = 0; i < 10; i++) {}`,
      },
      {
        name: "[REQ-BRANCH-DETECTION] valid switch-case with annotations",
        code: `switch (value) {
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-BRANCH-DETECTION
  case 'a':
    break;
  default:
    break;
}`,
      },
      {
        name: "[REQ-BRANCH-DETECTION] valid try-finally with annotations",
        code: `/* @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md */
/* @req REQ-BRANCH-DETECTION */
try {
  doSomething();
} finally {
  cleanUp();
}`,
      },
      {
        name: "[REQ-BRANCH-DETECTION] valid catch with annotations",
        code: `/* @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md */
/* @req REQ-BRANCH-DETECTION */
try {
  doSomething();
}
/* @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md */
/* @req REQ-BRANCH-DETECTION */
catch (error) {
  handleError(error);
}`,
      },
      {
        name: "[REQ-BRANCH-DETECTION] valid do-while loop with annotations",
        code: `/* @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md */
/* @req REQ-BRANCH-DETECTION */
do {
  process();
} while (condition);`,
      },
      {
        name: "[REQ-BRANCH-DETECTION] valid for-of loop with annotations",
        code: `/* @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md */
/* @req REQ-BRANCH-DETECTION */
for (const item of items) {
  process(item);
}`,
      },
      {
        name: "[REQ-BRANCH-DETECTION] valid for-in loop with annotations",
        code: `/* @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md */
/* @req REQ-BRANCH-DETECTION */
for (const key in object) {
  console.log(key);
}`,
      },
      {
        name: "[REQ-BRANCH-DETECTION] valid while loop with annotations",
        code: `/* @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md */
/* @req REQ-BRANCH-DETECTION */
while (condition) {
  iterate();
}`,
      },
      {
        name: "[REQ-BRANCH-DETECTION] valid switch-case with inline annotation",
        code: `switch (value) {
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-BRANCH-DETECTION
  case 'a':
    break;
}`,
      },
      {
        name: "[REQ-NESTED-HANDLING] nested if-statements with annotations on outer and inner branches",
        code: `// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-BRANCH-DETECTION
if (outer) {
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-NESTED-HANDLING
  if (inner) {
    doWork();
  }
}`,
      },
      {
        name: "[REQ-BRANCH-DETECTION] valid default case without annotations",
        code: `switch (value) {
  default:
    doSomething();
}`,
      },
      {
        name: "[REQ-CONFIGURABLE-SCOPE] custom branchTypes ignores unlisted branch types",
        code: `switch (value) { case 'a': break; }`,
        options: [{ branchTypes: ["IfStatement"] }],
      },
      {
        name: "[REQ-CONFIGURABLE-SCOPE] custom branchTypes only enforce listed types",
        code: `// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-BRANCH-DETECTION
if (condition) {}`,
        options: [{ branchTypes: ["IfStatement", "SwitchCase"] }],
      },
    ],
    invalid: [
      {
        name: "[REQ-BRANCH-DETECTION] missing annotations on if-statement",
        code: `if (condition) {}`,
        output: `// @story <story-file>.story.md
if (condition) {}`,
        errors: makeMissingAnnotationErrors("@story", "@req"),
      },
      {
        name: "[REQ-BRANCH-DETECTION] missing @req on for loop when only story present",
        code: `// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
for (let i = 0; i < 5; i++) {}`,
        output: `// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req <REQ-ID>
for (let i = 0; i < 5; i++) {}`,
        errors: makeMissingAnnotationErrors("@req"),
      },
      {
        name: "[REQ-BRANCH-DETECTION] missing @story on while loop when only req present",
        code: `// @req REQ-BRANCH-DETECTION
while (true) {}`,
        output: `// @req REQ-BRANCH-DETECTION
// @story <story-file>.story.md
while (true) {}`,
        errors: makeMissingAnnotationErrors("@story"),
      },
      {
        name: "[REQ-BRANCH-DETECTION] missing annotations on switch-case",
        code: `switch (value) {
  case 'a':
    break;
}`,
        output: `switch (value) {
  // @story <story-file>.story.md
  case 'a':
    break;
}`,
        errors: makeMissingAnnotationErrors("@story", "@req"),
      },
      {
        name: "[REQ-BRANCH-DETECTION] missing annotations on do-while loop",
        code: `do {
  action();
} while (condition);`,
        output: `// @story <story-file>.story.md
do {
  action();
} while (condition);`,
        errors: makeMissingAnnotationErrors("@story", "@req"),
      },
      {
        name: "[REQ-BRANCH-DETECTION] missing annotations on for-of loop",
        code: `for (const item of items) {
  process(item);
}`,
        output: `// @story <story-file>.story.md
for (const item of items) {
  process(item);
}`,
        errors: makeMissingAnnotationErrors("@story", "@req"),
      },
      {
        name: "[REQ-BRANCH-DETECTION] missing annotations on for-in loop",
        code: `for (const key in object) {
  console.log(key);
}`,
        output: `// @story <story-file>.story.md
for (const key in object) {
  console.log(key);
}`,
        errors: makeMissingAnnotationErrors("@story", "@req"),
      },
      {
        name: "[REQ-BRANCH-DETECTION] missing annotations on try-catch blocks",
        code: `try {
  doSomething();
} catch (error) {
  handleError(error);
}`,
        output: `// @story <story-file>.story.md
try {
  doSomething();
} catch (error) {
  handleError(error);
}`,
        errors: [
          ...makeMissingAnnotationErrors("@story", "@req"),
          ...makeMissingAnnotationErrors("@story", "@req"),
        ],
      },
      {
        name: "[REQ-BRANCH-DETECTION] missing annotations on switch-case with blank line",
        code: `switch (value) {

  case 'a':
    break;
}`,
        output: `switch (value) {

  // @story <story-file>.story.md
  case 'a':
    break;
}`,
        errors: makeMissingAnnotationErrors("@story", "@req"),
      },
      {
        name: "[REQ-NESTED-HANDLING] missing annotations on nested if-statement inside annotated outer branch",
        code: `// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-BRANCH-DETECTION
if (outer) {
  if (inner) {
    doWork();
  }
}`,
        output: `// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-BRANCH-DETECTION
if (outer) {
  // @story <story-file>.story.md
  if (inner) {
    doWork();
  }
}`,
        errors: makeMissingAnnotationErrors("@story", "@req"),
      },
      {
        name: "[REQ-CONFIGURABLE-SCOPE] missing annotations on configured branch type ForStatement",
        code: `for (let i = 0; i < 3; i++) {}`,
        options: [{ branchTypes: ["ForStatement"] }],
        output: `// @story <story-file>.story.md
for (let i = 0; i < 3; i++) {}`,
        errors: makeMissingAnnotationErrors("@story", "@req"),
      },
    ],
  });

  runRule({
    valid: [],
    invalid: [
      {
        name: "[REQ-CONFIGURABLE-SCOPE] invalid branchTypes option should error schema",
        code: "if (condition) {}",
        options: [{ branchTypes: ["UnknownType"] }],
        errors: [
          {
            message: /should be equal to one of the allowed values/,
          },
        ],
      },
    ],
  });
});

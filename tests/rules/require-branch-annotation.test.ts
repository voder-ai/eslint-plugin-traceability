/* eslint-disable traceability/require-traceability */

/**
 * Tests for:
 * - docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * - docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * - docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * - docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
 * - prompts/004.1-branch-annotation-anonymous-arrows.md
 * - prompts/004.2-async-catch-annotation-handling.md
 * - docs/decisions/2026-01-19-branch-annotations-inside-anonymous-arrows.md
 * - docs/decisions/2026-01-19-async-catch-annotation-handling.md
 *
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-BRANCH-DETECTION REQ-NESTED-HANDLING REQ-SUPPORTS-ALTERNATIVE REQ-ASYNC-CATCH-INCLUDED
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC REQ-ERROR-CONSISTENCY REQ-ERROR-SUGGESTION
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF REQ-FALLBACK-LOGIC-ELSE-IF REQ-POSITION-PRIORITY-ELSE-IF REQ-PRETTIER-AUTOFIX-ELSE-IF
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT REQ-BEFORE-BRACE-ERROR REQ-ALL-BLOCK-TYPES REQ-PLACEMENT-CONFIG REQ-DEFAULT-INSIDE REQ-OPT-IN-LEGACY-BEFORE
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/require-branch-annotation";

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { ecmaVersion: 2020 } },
} as any);

/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
const makeMissingAnnotationErrors = (...missing: Array<"@story" | "@req">) =>
  missing.map((item) => ({
    messageId: "missingAnnotation" as const,
    data: { missing: item },
  }));

/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
const runRule = (tests: Parameters<typeof ruleTester.run>[2]) => {
  // Many tests were authored against legacy (before-brace) placement.
  // Keep those stable by defaulting unspecified tests to the legacy mode.
  // Use `options: []` in a test case to explicitly exercise rule defaults.
  /** @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-DEFAULT-INSIDE REQ-OPT-IN-LEGACY-BEFORE */
  function applyLegacyDefault(test: any) {
    // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-DEFAULT-INSIDE REQ-OPT-IN-LEGACY-BEFORE
    if (!test) {
      return test;
    }

    if (test.options === undefined) {
      return { ...test, options: [{ annotationPlacement: "before" }] };
    }

    if (Array.isArray(test.options) && test.options.length > 0) {
      const first = test.options[0];
      if (
        first &&
        typeof first === "object" &&
        (first as any).annotationPlacement === undefined
      ) {
        return {
          ...test,
          options: [
            { ...first, annotationPlacement: "before" },
            ...test.options.slice(1),
          ],
        };
      }
    }

    return test;
  }

  const mapped = {
    ...tests,
    valid: Array.isArray((tests as any).valid)
      ? (tests as any).valid.map(applyLegacyDefault)
      : (tests as any).valid,
    invalid: Array.isArray((tests as any).invalid)
      ? (tests as any).invalid.map(applyLegacyDefault)
      : (tests as any).invalid,
  };

  return ruleTester.run("require-branch-annotation", rule, mapped);
};

describe("Require Branch Annotation Rule (Story 004.0-DEV-BRANCH-ANNOTATIONS)" /** @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md */, () => {
  runRule({
    valid: [
      {
        name: "[REQ-DEFAULT-INSIDE] default inside placement accepts inside-if annotations (Story 028.0)",
        code: `if (condition) {
  // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
  // @req REQ-DEFAULT-INSIDE
  doSomething();
}`,
        options: [],
      },
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
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-SWITCH-DEFAULT-REQUIRED
  default:
    break;
}`,
      },
      {
        name: "[REQ-SWITCH-FALLTHROUGH] valid fall-through group only requires annotation on last case before body",
        code: `switch (status) {
  case "pending":
  case "processing":
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-SWITCH-FALLTHROUGH
  case "validating":
    handleInProgress();
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
        name: "[REQ-ASYNC-CATCH-INCLUDED] async try/catch with await includes catch annotations",
        code: `async function load() {
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-ASYNC-CATCH-INCLUDED
  try {
    await fetchData();
  }
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-ASYNC-CATCH-INCLUDED
  catch (error) {
    handleError(error);
  }
}`,
      },
      {
        name: "[REQ-INSIDE-BRACE-PLACEMENT][REQ-PLACEMENT-CONFIG] try block annotated inside body under annotationPlacement: 'inside' (Story 028.0)",
        code: `try {
  // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
  // @req REQ-INSIDE-BRACE-PLACEMENT
  doWork();
} finally {
  cleanup();
}`,
        options: [{ annotationPlacement: "inside" }],
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
        name: "[REQ-LOOP-PLACEMENT-FLEXIBLE] for-of loop annotated via comment inside body",
        code: `for (const item of items) {
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-LOOP-ANNOTATION
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
        name: "[REQ-LOOP-PLACEMENT-FLEXIBLE] while loop annotated via comment inside body",
        code: `while (condition) {
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-LOOP-ANNOTATION
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
        name: "[REQ-ARROW-FUNCTION-BRANCH-INCLUDED] anonymous arrow callback with annotated if-statement branch",
        code: `items.map(() => {
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-BRANCH-DETECTION
  if (ready) {
    doWork();
  }
});`,
      },
      {
        name: "[REQ-ARROW-FUNCTION-BRANCH-INCLUDED] anonymous arrow callback with annotated switch-case branch",
        code: `items.forEach(() => {
  switch (state) {
    // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
    // @req REQ-BRANCH-DETECTION
    case "ready":
      handleReady();
      break;
  }
});`,
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
      {
        name: "[REQ-PLACEMENT-CONFIG][REQ-OPT-IN-LEGACY-BEFORE] if-statement with before-brace annotations using annotationPlacement: 'before'",
        code: `// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-PLACEMENT-CONFIG
if (condition) {}`,
        options: [{ annotationPlacement: "before" }],
      },
      {
        name: "[REQ-INSIDE-BRACE-PLACEMENT][REQ-PLACEMENT-CONFIG] if-statement annotated inside block under annotationPlacement: 'inside' (Story 028.0)",
        code: `if (condition) {
  // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
  // @req REQ-INSIDE-BRACE-PLACEMENT
  doSomething();
}`,
        options: [{ annotationPlacement: "inside" }],
      },
      {
        name: "[REQ-INSIDE-BRACE-PLACEMENT][REQ-PLACEMENT-CONFIG] for-of loop annotated inside block under annotationPlacement: 'inside' (Story 028.0)",
        code: `for (const item of items) {
  // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
  // @req REQ-INSIDE-BRACE-PLACEMENT
  process(item);
}`,
        options: [{ annotationPlacement: "inside" }],
      },
      {
        name: "[REQ-INSIDE-BRACE-PLACEMENT][REQ-PLACEMENT-CONFIG] switch cases annotated inside block under annotationPlacement: 'inside' (Story 028.0)",
        code: `switch (value) {
  case 'a': {
    // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
    // @req REQ-INSIDE-BRACE-PLACEMENT
    doSomething();
  }
  default: {
    // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
    // @req REQ-INSIDE-BRACE-PLACEMENT
    doDefault();
  }
}`,
        options: [{ annotationPlacement: "inside" }],
      },
      {
        name: "[REQ-SUPPORTS-ALTERNATIVE] if-statement with only @supports annotation is treated as fully annotated",
        code: `// @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-SUPPORTS-ALTERNATIVE
if (shouldHandleAlternative) {
  handleAlternative();
}`,
      },
      {
        name: "[REQ-SUPPORTS-ALTERNATIVE] try/catch where both branches are annotated only with @supports",
        code: `// @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-SUPPORTS-ALTERNATIVE
try {
  mightThrow();
}
// @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-SUPPORTS-ALTERNATIVE
catch (error) {
  recoverFrom(error);
}`,
      },
      {
        name: "[REQ-SUPPORTS-ALTERNATIVE] else-if branch with @supports inside the block body",
        code: `// @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-SUPPORTS-ALTERNATIVE
if (mode === 'primary') {
  handlePrimary();
} else if (mode === 'alternative') {
  // @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-SUPPORTS-ALTERNATIVE
  handleAlternativeMode();
}`,
      },
      {
        name: "[REQ-DUAL-POSITION-DETECTION-ELSE-IF][REQ-INSIDE-BRACE-PLACEMENT][REQ-PLACEMENT-CONFIG] before-else annotations remain valid for else-if under annotationPlacement: 'inside'",
        code: `if (a) {
  // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
  // @req REQ-INSIDE-BRACE-PLACEMENT
  doA();
}
// @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
// @req REQ-BEFORE-BRACE-ERROR
else if (b) {
  doB();
}`,
        options: [{ annotationPlacement: "inside" }],
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
        name: "[REQ-LOOP-ANNOTATION] missing annotations when loop body contains only non-comment code",
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
        name: "[REQ-SWITCH-FALLTHROUGH] intermediate fall-through case should not be the only annotated case",
        code: `switch (status) {
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-SWITCH-FALLTHROUGH
  case "pending":
  case "processing":
  case "validating":
    handleInProgress();
    break;
}`,
        output: `switch (status) {
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-SWITCH-FALLTHROUGH
  case "pending":
  case "processing":
  // @story <story-file>.story.md
  case "validating":
    handleInProgress();
    break;
}`,
        errors: makeMissingAnnotationErrors("@story", "@req"),
      },
      {
        name: "[REQ-SWITCH-DEFAULT-REQUIRED] missing annotations on default case",
        code: `switch (value) {
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-BRANCH-DETECTION
  case 'a':
    doSomething();
  default:
    doDefault();
}`,
        output: `switch (value) {
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-BRANCH-DETECTION
  case 'a':
    doSomething();
  // @story <story-file>.story.md
  default:
    doDefault();
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
        name: "[REQ-ASYNC-CATCH-INCLUDED] non-async try/catch missing catch annotations",
        code: `function load() {
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-ASYNC-CATCH-INCLUDED
  try {
    doWork();
  }
  catch (error) {
    handleError(error);
  }
}`,
        output: `function load() {
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-ASYNC-CATCH-INCLUDED
  try {
    doWork();
  }
  catch (error) {
    // @story <story-file>.story.md
    handleError(error);
  }
}`,
        errors: makeMissingAnnotationErrors("@story", "@req"),
      },
      {
        name: "[REQ-ASYNC-CATCH-INCLUDED] async try/catch missing catch annotations",
        code: `async function load() {
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-ASYNC-CATCH-INCLUDED
  try {
    await fetchData();
  }
  catch (error) {
    handleError(error);
  }
}`,
        output: `async function load() {
  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
  // @req REQ-ASYNC-CATCH-INCLUDED
  try {
    await fetchData();
  }
  catch (error) {
    // @story <story-file>.story.md
    handleError(error);
  }
}`,
        errors: makeMissingAnnotationErrors("@story", "@req"),
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
        name: "[REQ-ARROW-FUNCTION-BRANCH-INCLUDED] missing annotations on if-statement inside anonymous arrow callback",
        code: `items.map(() => {
  if (ready) {
    doWork();
  }
});`,
        output: `items.map(() => {
  // @story <story-file>.story.md
  if (ready) {
    doWork();
  }
});`,
        errors: makeMissingAnnotationErrors("@story", "@req"),
      },
      {
        name: "[REQ-ARROW-FUNCTION-BRANCH-INCLUDED] missing annotations on switch-case inside anonymous arrow callback",
        code: `items.forEach(() => {
  switch (state) {
    case "ready":
      handleReady();
      break;
  }
});`,
        output: `items.forEach(() => {
  switch (state) {
    // @story <story-file>.story.md
    case "ready":
      handleReady();
      break;
  }
});`,
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
      {
        name: "[REQ-PRETTIER-AUTOFIX-ELSE-IF] missing annotations on else-if branch with Prettier-style autofix insertion",
        code: `if (a) {
  doA();
} else if (b) {
  doB();
}`,
        output: `// @story <story-file>.story.md
if (a) {
  doA();
} else if (b) {
  doB();
}`,
        errors: makeMissingAnnotationErrors("@story", "@req", "@story", "@req"),
      },
      {
        // Current behavior: inside-only catch annotations do NOT satisfy try branch in inside-placement mode.
        name: "TODO-FUTURE-BEHAVIOR: [REQ-INSIDE-BRACE-PLACEMENT][REQ-PLACEMENT-CONFIG] catch clause annotated inside block under annotationPlacement: 'inside' (Story 028.0)",
        code: `// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-BRANCH-DETECTION
try {
  doSomething();
} catch (error) {
  // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
  // @req REQ-INSIDE-BRACE-PLACEMENT
  handleError(error);
}`,
        options: [{ annotationPlacement: "inside" }],
        output:
          "\n\ntry {\n  // @story <story-file>.story.md\n  doSomething();\n} catch (error) {\n  // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md\n  // @req REQ-INSIDE-BRACE-PLACEMENT\n  handleError(error);\n}",
        errors: makeMissingAnnotationErrors("@story", "@req"),
      },
      {
        name: "[REQ-INSIDE-BRACE-PLACEMENT][REQ-BEFORE-BRACE-ERROR][REQ-PLACEMENT-CONFIG] before-brace annotations ignored when annotationPlacement: 'inside'",
        code: `// @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
// @req REQ-BEFORE-BRACE-ERROR
if (condition) {
  doSomething();
}`,
        options: [{ annotationPlacement: "inside" }],
        output:
          "\n\nif (condition) {\n  // @story <story-file>.story.md\n  doSomething();\n}",
        errors: makeMissingAnnotationErrors("@story", "@req"),
      },
      {
        name: "[REQ-INSIDE-BRACE-PLACEMENT][REQ-BEFORE-BRACE-ERROR][REQ-PLACEMENT-CONFIG] before-loop annotations ignored when annotationPlacement: 'inside' for loops",
        code: `// @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
// @req REQ-BEFORE-BRACE-ERROR
for (const item of items) {
  process(item);
}`,
        options: [{ annotationPlacement: "inside" }],
        output:
          "\n\nfor (const item of items) {\n  // @story <story-file>.story.md\n  process(item);\n}",
        errors: makeMissingAnnotationErrors("@story", "@req"),
      },
      {
        name: "[REQ-INSIDE-BRACE-PLACEMENT][REQ-BEFORE-BRACE-ERROR][REQ-PLACEMENT-CONFIG] before-catch annotations ignored when annotationPlacement: 'inside' for CatchClause",
        code: `// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-BRANCH-DETECTION
try {
  doSomething();
}
// @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
// @req REQ-BEFORE-BRACE-ERROR
catch (error) {
  handleError(error);
}`,
        options: [{ annotationPlacement: "inside" }],
        output:
          "\n\ntry {\n  // @story <story-file>.story.md\n  doSomething();\n}\n// @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md\n// @req REQ-BEFORE-BRACE-ERROR\ncatch (error) {\n  handleError(error);\n}",
        errors: makeMissingAnnotationErrors("@story", "@req"),
      },
      {
        name: "[REQ-INSIDE-BRACE-PLACEMENT][REQ-BEFORE-BRACE-ERROR][REQ-PLACEMENT-CONFIG] before-try annotations ignored when annotationPlacement: 'inside' for TryStatement (Story 028.0)",
        code: `// @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
// @req REQ-BEFORE-BRACE-ERROR
try {
  doWork();
} finally {
  cleanup();
}`,
        options: [{ annotationPlacement: "inside" }],
        output:
          "\n\ntry {\n  // @story <story-file>.story.md\n  doWork();\n} finally {\n  cleanup();\n}",
        errors: makeMissingAnnotationErrors("@story", "@req"),
      },
      {
        name: "[REQ-INSIDE-BRACE-PLACEMENT][REQ-PLACEMENT-CONFIG] else-if branch annotated inside block but initial if branch missing annotation under annotationPlacement: 'inside' (Story 028.0)",
        code: `// @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
// @req REQ-INSIDE-BRACE-PLACEMENT
if (a) {
  doA();
} else if (b) {
  // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
  // @req REQ-INSIDE-BRACE-PLACEMENT
  doB();
} else {
  doC();
}`,
        options: [{ annotationPlacement: "inside" }],
        output:
          "\n\nif (a) {\n  // @story <story-file>.story.md\n  doA();\n} else if (b) {\n  // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md\n  // @req REQ-INSIDE-BRACE-PLACEMENT\n  doB();\n} else {\n  doC();\n}",
        errors: makeMissingAnnotationErrors("@story", "@req"),
      },
      {
        name: "[REQ-INSIDE-BRACE-PLACEMENT][REQ-BEFORE-BRACE-ERROR][REQ-PLACEMENT-CONFIG] before-case annotations ignored when annotationPlacement: 'inside' for SwitchCase",
        code: `switch (value) {
  // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
  // @req REQ-BEFORE-BRACE-ERROR
  case 'a': {
    doSomething();
  }
}`,
        options: [{ annotationPlacement: "inside" }],
        output:
          "switch (value) {\n  \n  \n  // @story <story-file>.story.md\n  case 'a': {\n    doSomething();\n  }\n}",
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

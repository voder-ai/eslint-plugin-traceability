/**
 * Performance tests for valid-annotation-format on large annotated files.
 *
 * @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-MULTILINE-SUPPORT REQ-FLEXIBLE-PARSING REQ-SYNTAX-VALIDATION
 */
import { Linter } from "eslint";
import { performance } from "perf_hooks";
import rule from "../../src/rules/valid-annotation-format";

/**
 * Build a large source file containing many functions with traceability
 * annotations in both line and block comments.
 *
 * The generated code mixes valid and invalid annotation formats to exercise
 * parsing, multi-line handling, and error-reporting paths at scale without
 * relying on auto-fix.
 */
function buildLargeAnnotatedSource(
  functionCount: number,
  annotationsPerFunction: number,
): string {
  const lines: string[] = [];

  for (let i = 0; i < functionCount; i += 1) {
    // JSDoc-style block comment with multi-line `@story`/`@req` values.
    lines.push("/**");
    lines.push(
      " * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md",
    );
    lines.push(" * @req REQ-FORMAT-SPECIFICATION");
    lines.push(" */");

    // Additional line comments with a mix of valid and intentionally
    // invalid formats (missing extensions, traversal, malformed IDs).
    for (let j = 0; j < annotationsPerFunction; j += 1) {
      const selector = (i + j) % 4;
      if (selector === 0) {
        lines.push(
          "// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story", // missing .md (auto-fix candidate)
        );
      } else if (selector === 1) {
        lines.push("// @req REQ-EXAMPLE-" + i.toString(10));
      } else if (selector === 2) {
        lines.push("// @story ../outside-project.story.md");
      } else {
        lines.push("// @req invalid-format-id");
      }
    }

    lines.push(`function annotated_fn_${i}() {`);
    lines.push('  return "ok";\n}');
  }

  return lines.join("\n");
}

describe("valid-annotation-format performance on large annotated files (Story 005.0-DEV-ANNOTATION-VALIDATION)", () => {
  const ruleName = "traceability/valid-annotation-format";

  it("[REQ-MULTILINE-SUPPORT][REQ-FLEXIBLE-PARSING] analyzes a large annotated file within a generous time budget", () => {
    const linter = new Linter({ configType: "eslintrc" } as any);
    linter.defineRule(ruleName, rule as any);

    // 150 functions each with several annotations provides a substantial
    // volume of comments and annotation patterns without being extreme.
    const source = buildLargeAnnotatedSource(150, 3);

    const start = performance.now();
    const messages = linter.verify(source, {
      parserOptions: { ecmaVersion: 2020, sourceType: "module" },
      rules: {
        [ruleName]: "error",
      },
    } as any);
    const durationMs = performance.now() - start;

    // Sanity check: we expect diagnostics for some invalid annotations so the
    // rule is definitely executing its validation logic.
    expect(messages.length).toBeGreaterThan(0);

    // Guardrail: keep analysis comfortably under ~5 seconds on CI hardware.
    expect(durationMs).toBeLessThan(5000);
  });
});

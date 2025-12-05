/**
 * Performance tests for require-branch-annotation on large nested-branch files.
 *
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-PERFORMANCE-OPTIMIZATION REQ-NESTED-HANDLING
 */
import { Linter } from "eslint";
import { performance } from "perf_hooks";
import rule from "../../src/rules/require-branch-annotation";

/**
 * Build a large source file containing many nested branch structures
 * (if-statements within if-statements) to exercise the rule at scale.
 *
 * The generated code intentionally omits annotations so that the rule
 * produces diagnostics for both outer and inner branches.
 */
function buildLargeNestedBranchSource(
  functionCount: number,
  nestingDepth: number,
): string {
  const lines: string[] = [];

  for (let i = 0; i < functionCount; i += 1) {
    lines.push(`function fn_${i}() {`);
    lines.push("  let x = 0;");

    // Create a staircase of nested if-statements.
    for (let depth = 0; depth < nestingDepth; depth += 1) {
      const indent = "  ".repeat(depth + 1);
      lines.push(`${indent}if (x > ${depth}) {`);
    }

    const innerIndent = "  ".repeat(nestingDepth + 1);
    lines.push(`${innerIndent}if (x % 2 === 0) {`);
    lines.push(`${innerIndent}  x++;`);
    lines.push(`${innerIndent}} else {`);
    lines.push(`${innerIndent}  x--;`);
    lines.push(`${innerIndent}}`);

    // Close all nested if blocks.
    for (let depth = nestingDepth - 1; depth >= 0; depth -= 1) {
      const indent = "  ".repeat(depth + 1);
      lines.push(`${indent}}`);
    }

    lines.push("}");
  }

  return lines.join("\n");
}

describe("require-branch-annotation performance on large nested-branch files (Story 004.0-DEV-BRANCH-ANNOTATIONS)", () => {
  const ruleName = "traceability/require-branch-annotation";

  it("[REQ-PERFORMANCE-OPTIMIZATION] analyzes a large nested-branch file within a generous time budget", () => {
    const linter = new Linter({ configType: "eslintrc" } as any);
    linter.defineRule(ruleName, rule as any);

    // 200 functions each with several nested branches gives us
    // a substantial number of branch nodes without being extreme.
    const source = buildLargeNestedBranchSource(200, 3);

    const start = performance.now();
    const messages = linter.verify(source, {
      parserOptions: { ecmaVersion: 2020, sourceType: "module" },
      rules: {
        [ruleName]: "error",
      },
    } as any);
    const durationMs = performance.now() - start;

    // Sanity check: we expect diagnostics for many branches.
    expect(messages.length).toBeGreaterThan(0);

    // Guardrail: keep analysis comfortably under ~5 seconds on CI hardware.
    expect(durationMs).toBeLessThan(5000);
  });
});

/**
 * Shared helpers for Prettier-based integration tests.
 * @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
 * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-FALLBACK-LOGIC
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-FALLBACK-LOGIC-ELSE-IF
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PRETTIER-STABLE
 */
import path from "path";
import { spawnSync } from "child_process";

interface FormatOptions {
  parser?: "babel" | "typescript" | "babel-ts" | "espree" | string;
}

/**
 * Format arbitrary source with Prettier using the installed CLI binary.
 * Defaults to the TypeScript parser when none is provided.
 */
export function formatWithPrettier(
  source: string,
  options: FormatOptions = {},
): string {
  const prettierPackageJson = require.resolve("prettier/package.json");
  const prettierCliPath = path.join(
    path.dirname(prettierPackageJson),
    "bin",
    "prettier.cjs",
  );

  const parser = options.parser || "typescript";

  const result = spawnSync(
    process.execPath,
    [prettierCliPath, "--parser", parser],
    {
      encoding: "utf-8",
      input: source,
    },
  );

  if (result.status !== 0) {
    throw new Error(
      `Prettier formatting failed: ${result.stderr || result.stdout}`,
    );
  }

  return result.stdout;
}

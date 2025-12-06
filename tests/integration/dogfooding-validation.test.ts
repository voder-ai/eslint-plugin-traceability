/**
 * Dogfooding validation integration tests
 * @supports docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md REQ-DOGFOODING-TEST REQ-DOGFOODING-CI
 */
import * as path from "path";
import { spawnSync } from "child_process";

/**
 * @supports docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md REQ-DOGFOODING-TEST
 */
function getTsConfigFromEslintConfig(eslintConfig: unknown): any | undefined {
  const configs = Array.isArray(eslintConfig) ? eslintConfig : [eslintConfig];

  return configs.find((config: any) => {
    if (!config || !config.files) return false;
    const files = config.files as string[];
    return files.includes("**/*.ts") && files.includes("**/*.tsx");
  });
}

describe("Dogfooding Validation (Story 023.0-MAINT-DOGFOODING-VALIDATION)", () => {
  it("[REQ-DOGFOODING-TEST] should have traceability/require-story-annotation enabled for TS sources", () => {
    /**
     * @supports docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md REQ-DOGFOODING-TEST
     */
    // Require the project's eslint.config.js and find the TS-specific config
    // that applies to *.ts and *.tsx files.
    const eslintConfig = require("../../eslint.config.js");

    const tsConfig = getTsConfigFromEslintConfig(eslintConfig);

    expect(tsConfig).toBeDefined();

    const rules = (tsConfig as any).rules || {};
    const ruleEntry = rules["traceability/require-story-annotation"];

    expect(ruleEntry).toBeDefined();

    const severity =
      Array.isArray(ruleEntry) && ruleEntry.length > 0
        ? ruleEntry[0]
        : ruleEntry;

    expect(severity).toBe("error");
  });

  it("[REQ-DOGFOODING-CI] should run traceability/require-story-annotation via ESLint CLI on TS sources", () => {
    /**
     * @supports docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md REQ-DOGFOODING-CI
     */
    const eslintBin = path.resolve(__dirname, "../../node_modules/.bin/eslint");
    const configPath = path.resolve(__dirname, "../../eslint.config.js");

    const tsSnippet = `
      const x: number = 42;
      export function foo() {
        return x;
      }
    `;

    const result = spawnSync(
      process.platform === "win32" ? `${eslintBin}.cmd` : eslintBin,
      ["--config", configPath, "--stdin", "--stdin-filename", "src/dogfood.ts"],
      {
        encoding: "utf8",
        input: tsSnippet,
      },
    );

    // The snippet intentionally lacks @story annotations, so the rule should
    // report an error for the generated `src/dogfood.ts` virtual file.
    expect(result.status).not.toBe(0);
    expect(result.stdout).toContain("error");
    expect(result.stdout).toContain("src/dogfood.ts");
  });
});

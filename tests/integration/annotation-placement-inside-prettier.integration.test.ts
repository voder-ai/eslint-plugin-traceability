/**
 * Prettier integration tests for annotationPlacement: "inside" across multiple branch types.
 * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PRETTIER-STABLE REQ-INSIDE-BRACE-PLACEMENT REQ-PLACEMENT-CONFIG
 */
import path from "path";
import { spawnSync } from "child_process";
import { formatWithPrettier as sharedFormatWithPrettier } from "./prettier-test-helpers";

describe("annotationPlacement: 'inside' with Prettier (Story 028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION)", () => {
  const eslintPkgDir = path.dirname(require.resolve("eslint/package.json"));
  const eslintCliPath = path.join(eslintPkgDir, "bin", "eslint.js");
  const configPath = path.resolve(__dirname, "../../eslint.config.js");

  function buildInsidePlacementArgs(stdinFilename: string): string[] {
    return [
      "--no-config-lookup",
      "--config",
      configPath,
      "--stdin",
      "--stdin-filename",
      stdinFilename,
      "--rule",
      "no-unused-vars:off",
      "--rule",
      "no-magic-numbers:off",
      "--rule",
      "no-undef:off",
      "--rule",
      "no-console:off",
      "--rule",
      'traceability/require-branch-annotation:["error",{"annotationPlacement":"inside"}]',
    ];
  }

  function runEslintWithInsidePlacement(code: string, _filename: string) {
    // Pin stdin filename to a tsconfig-included path to satisfy @typescript-eslint/parser's project lookup in these integration tests.
    const args = buildInsidePlacementArgs("src/annotation-placement-inside.ts");

    return spawnSync(process.execPath, [eslintCliPath, ...args], {
      encoding: "utf-8",
      input: code,
    });
  }

  function formatWithPrettier(source: string): string {
    return sharedFormatWithPrettier(source, { parser: "typescript" });
  }

  it("[REQ-PRETTIER-STABLE][REQ-INSIDE-BRACE-PLACEMENT] accepts formatted code with inside-brace annotations for if/else and loops", () => {
    const original = `
function demo(value: number) {
  if (value > 0) {
    // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
    // @req REQ-IF-INSIDE
    console.log('positive');
  } else if (value < 0) {
    // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
    // @req REQ-ELSE-IF-INSIDE
    console.log('negative');
  } else {
    // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
    // @req REQ-ELSE-INSIDE
    console.log('zero');
  }

  for (const item of [1, 2, 3]) {
    // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
    // @req REQ-LOOP-INSIDE
    console.log(item);
  }
}
`;

    const formatted = formatWithPrettier(original);
    const result = runEslintWithInsidePlacement(
      formatted,
      "annotation-placement-inside-if-loop.ts",
    );

    expect(result.stdout).not.toContain(
      "traceability/require-branch-annotation",
    );
    expect([0, 1]).toContain(result.status);
  });

  it("[REQ-PRETTIER-STABLE][REQ-INSIDE-BRACE-PLACEMENT] accepts formatted code with inside-brace annotations for try/finally and catch", () => {
    const original = `
function demoTry(flag: boolean) {
  try {
    // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
    // @req REQ-TRY-INSIDE
    if (flag) {
      throw new Error('boom');
    }
  } catch (error) {
    // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
    // @req REQ-CATCH-INSIDE
    console.error(error);
  } finally {
    // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
    // @req REQ-FINALLY-INSIDE
    console.log('cleanup');
  }
}
`;

    const formatted = formatWithPrettier(original);
    const result = runEslintWithInsidePlacement(
      formatted,
      "annotation-placement-inside-try.ts",
    );

    expect(result.stdout).not.toContain(
      "traceability/require-branch-annotation",
    );
    expect([0, 1]).toContain(result.status);
  });

  it("[REQ-PRETTIER-STABLE][REQ-INSIDE-BRACE-PLACEMENT] accepts formatted code with inside-brace annotations for switch cases", () => {
    const original = `
function demoSwitch(status: 'pending' | 'done' | 'other') {
  switch (status) {
    case 'pending': {
      // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
      // @req REQ-SWITCH-PENDING-INSIDE
      console.log('pending');
      break;
    }
    case 'done': {
      // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
      // @req REQ-SWITCH-DONE-INSIDE
      console.log('done');
      break;
    }
    default: {
      // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
      // @req REQ-SWITCH-DEFAULT-INSIDE
      console.log('other');
    }
  }
}
`;

    const formatted = formatWithPrettier(original);
    const result = runEslintWithInsidePlacement(
      formatted,
      "annotation-placement-inside-switch.ts",
    );

    expect(result.stdout).not.toContain(
      "traceability/require-branch-annotation",
    );
    expect([0, 1]).toContain(result.status);
  });
});

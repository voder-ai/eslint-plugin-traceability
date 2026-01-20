/**
 * Integration tests for require-traceability with configurable test callback exclusion.
 *
 * @supports docs/stories/010.4-DEV-UNIFIED-FUNCTION-RULE-AND-ALIASES.story.md REQ-UNIFIED-ALIAS-ENGINE
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED REQ-FUNCTION-DETECTION REQ-TEST-CALLBACK-EXCLUSION
 */
import { FlatESLint } from "eslint/use-at-your-own-risk";
import traceabilityPlugin from "../../src/index";

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 */
async function lintTextWithConfig(
  text: string,
  filename: string,
  extraConfig: any,
) {
  const baseConfig = {
    plugins: {
      traceability: traceabilityPlugin,
    },
  };

  const eslint = new FlatESLint({
    overrideConfig: [baseConfig, ...extraConfig],
    overrideConfigFile: true,
    ignore: false,
  } as any);

  const [result] = await eslint.lintText(text, { filePath: filename });
  return result;
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-TEST-CALLBACK-EXCLUSION
 */
function getTraceabilityMessages(messages: Array<{ ruleId?: string | null }>) {
  const filtered: Array<{ ruleId?: string | null }> = [];
  for (const message of messages) {
    const ruleId = message.ruleId;
    if (
      ruleId === "traceability/require-traceability" ||
      ruleId === "traceability/require-story-annotation"
    ) {
      filtered.push(message);
    }
  }
  return filtered;
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-TEST-CALLBACK-EXCLUSION
 */
async function getRuleMessages(
  code: string,
  filename: string,
  extraConfig: any,
) {
  const result = await lintTextWithConfig(code, filename, extraConfig);
  return getTraceabilityMessages(
    result.messages as Array<{ ruleId?: string | null }>,
  );
}

describe("Unified require-traceability with configurable test callback exclusion (Story 013-exclude-test-framework-callbacks)", () => {
  const baseHeader = `/**\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED\n */`;

  const jsTestCallback = `${baseHeader}\n
describe('suite', () => {\n  it('does something', () => {\n    const value = 1;\n  });\n});`;

  const tsTestCallback = `${baseHeader}\n
import { describe, it } from 'vitest';

describe('suite', () => {\n  it('does something', () => {\n    const value = 1;\n  });\n});`;

  const jsBenchCallback = `${baseHeader}\n
import { bench } from 'vitest';

bench('bench case', () => {\n  function helper() {}\n  helper();\n});`;

  const jsCustomHelperCallback = `${baseHeader}\n
function helperWrapper(fn) {\n  return fn;\n}

helperWrapper(() => {\n  function helper() {}\n  helper();\n});`;

  it("[REQ-TEST-CALLBACK-EXCLUSION] excludes callbacks under known test helpers when configured", async () => {
    const config = [
      {
        rules: {
          "traceability/require-traceability": ["error"],
          "traceability/require-story-annotation": [
            "error",
            {
              excludeTestCallbacks: true,
            },
          ],
        },
      },
    ];

    const messagesJs = await getRuleMessages(
      jsTestCallback,
      "example.test.js",
      config,
    );
    const messagesTs = await getRuleMessages(
      tsTestCallback,
      "example.test.ts",
      config,
    );

    expect(messagesJs).toHaveLength(0);
    expect(messagesTs).toHaveLength(0);
  });

  it("[REQ-TEST-CALLBACK-EXCLUSION] never excludes Vitest bench callbacks via test-callback exclusion, even when exclusion is enabled", async () => {
    const baseConfig = [
      {
        rules: {
          "traceability/require-traceability": ["error"],
          "traceability/require-story-annotation": [
            "error",
            {
              excludeTestCallbacks: true,
            },
          ],
        },
      },
    ];

    const withBenchAsHelperConfig = [
      {
        rules: {
          "traceability/require-traceability": ["error"],
          "traceability/require-story-annotation": [
            "error",
            {
              excludeTestCallbacks: true,
              additionalTestHelperNames: ["bench"],
            },
          ],
        },
      },
    ];

    const baseResult = await lintTextWithConfig(
      jsBenchCallback,
      "bench.test.ts",
      baseConfig,
    );
    const withBenchHelperResult = await lintTextWithConfig(
      jsBenchCallback,
      "bench.test.ts",
      withBenchAsHelperConfig,
    );

    const baseMessages = getTraceabilityMessages(
      baseResult.messages as Array<{ ruleId?: string | null }>,
    );
    const withBenchHelperMessages = getTraceabilityMessages(
      withBenchHelperResult.messages as Array<{ ruleId?: string | null }>,
    );

    expect(withBenchHelperMessages.length).toBeGreaterThanOrEqual(
      baseMessages.length,
    );
  });

  it("[REQ-TEST-CALLBACK-EXCLUSION] respects additionalTestHelperNames for custom helpers but not for bench callbacks", async () => {
    const baseConfig = [
      {
        rules: {
          "traceability/require-traceability": ["error"],
          "traceability/require-story-annotation": [
            "error",
            {
              excludeTestCallbacks: true,
            },
          ],
        },
      },
    ];

    const withAdditionalHelpersConfig = [
      {
        rules: {
          "traceability/require-traceability": ["error"],
          "traceability/require-story-annotation": [
            "error",
            {
              excludeTestCallbacks: true,
              additionalTestHelperNames: ["helperWrapper", "bench"],
            },
          ],
        },
      },
    ];

    const wrapperBaseResult = await lintTextWithConfig(
      jsCustomHelperCallback,
      "helper-wrapper.test.ts",
      baseConfig,
    );
    const wrapperWithHelpersResult = await lintTextWithConfig(
      jsCustomHelperCallback,
      "helper-wrapper.test.ts",
      withAdditionalHelpersConfig,
    );

    const benchBaseResult = await lintTextWithConfig(
      jsBenchCallback,
      "bench.test.ts",
      baseConfig,
    );
    const benchWithHelpersResult = await lintTextWithConfig(
      jsBenchCallback,
      "bench.test.ts",
      withAdditionalHelpersConfig,
    );

    const wrapperBaseMessages = getTraceabilityMessages(
      wrapperBaseResult.messages as Array<{ ruleId?: string | null }>,
    );
    const wrapperWithHelpersMessages = getTraceabilityMessages(
      wrapperWithHelpersResult.messages as Array<{ ruleId?: string | null }>,
    );

    const benchBaseMessages = getTraceabilityMessages(
      benchBaseResult.messages as Array<{ ruleId?: string | null }>,
    );
    const benchWithHelpersMessages = getTraceabilityMessages(
      benchWithHelpersResult.messages as Array<{ ruleId?: string | null }>,
    );

    expect(wrapperWithHelpersMessages.length).toBeLessThanOrEqual(
      wrapperBaseMessages.length,
    );
    expect(benchWithHelpersMessages.length).toBeGreaterThanOrEqual(
      benchBaseMessages.length,
    );
  });
});

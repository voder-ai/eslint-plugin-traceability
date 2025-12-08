/**
 * Integration tests for no-redundant-annotation rule across multiple files
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-REDUNDANCY-PATTERNS REQ-SAFE-REMOVAL REQ-SCOPE-INHERITANCE
 */
import { FlatESLint } from "eslint/use-at-your-own-risk";
import traceabilityPlugin from "../../src/index";

async function lintTextWithConfig(
  text: string,
  filename: string,
  extraConfig: any = {},
) {
  const baseConfig = {
    plugins: {
      traceability: traceabilityPlugin,
    },
    rules: {},
  };

  const eslint = new FlatESLint({
    overrideConfig: [baseConfig, extraConfig],
    overrideConfigFile: true,
    ignore: false,
  } as any);

  const [result] = await eslint.lintText(text, { filePath: filename });
  return result;
}

describe("no-redundant-annotation integration (Story 027.0-DEV-REDUNDANT-ANNOTATION-DETECTION)", () => {
  it("[REQ-REDUNDANCY-PATTERNS] cleans up redundant annotations in multiple files while preserving required ones", async () => {
    const codeA = `// @story docs/stories/003.0-EXAMPLE.story.md
// @req REQ-INIT
function init() {
  // @story docs/stories/003.0-EXAMPLE.story.md
  // @req REQ-INIT
  const config = loadConfig();
  const validator = new Validator(config);
}`;

    const codeB = `/**
 * @story docs/stories/004.0-EXAMPLE.story.md
 * @req REQ-PROCESS
 */
function process(value) {
  if (value) {
    /* @story docs/stories/004.0-EXAMPLE.story.md
     * @req REQ-PROCESS
     */
    return handle(value);
  }
}`;

    const config = {
      rules: {
        "traceability/no-redundant-annotation": ["warn"],
      },
    };

    const [resultA, resultB] = await Promise.all([
      lintTextWithConfig(codeA, "file-a.js", config),
      lintTextWithConfig(codeB, "file-b.js", config),
    ]);

    expect(resultA.messages.map((m) => m.ruleId)).toContain(
      "traceability/no-redundant-annotation",
    );
    expect(resultB.messages.map((m) => m.ruleId)).toContain(
      "traceability/no-redundant-annotation",
    );

    const fixerConfig = {
      rules: {
        "traceability/no-redundant-annotation": ["warn"],
      },
      fix: true,
    } as any;

    const eslintFix = new FlatESLint({
      overrideConfig: [
        {
          plugins: { traceability: traceabilityPlugin },
          rules: fixerConfig.rules,
        },
      ],
      overrideConfigFile: true,
      ignore: false,
      fix: true,
    } as any);

    const [fixedA, fixedB] = await Promise.all([
      (async () => {
        const [result] = await eslintFix.lintText(codeA, {
          filePath: "file-a.js",
        });
        return result;
      })(),
      (async () => {
        const [result] = await eslintFix.lintText(codeB, {
          filePath: "file-b.js",
        });
        return result;
      })(),
    ]);

    expect(fixedA.output).toContain(
      "// @story docs/stories/003.0-EXAMPLE.story.md",
    );
    expect(fixedA.output).toContain("// @req REQ-INIT");
    expect(fixedA.output).not.toContain("// @req REQ-INIT\n  const config");

    expect(fixedB.output).toContain(
      "@story docs/stories/004.0-EXAMPLE.story.md",
    );
    expect(fixedB.output).toContain("@req REQ-PROCESS");
    expect(fixedB.output).not.toContain(
      "@req REQ-PROCESS\n     */\n    return",
    );
  });
});

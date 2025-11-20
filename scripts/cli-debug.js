const { spawnSync } = require("child_process");
const path = require("path");

const eslintPkgDir = path.dirname(require.resolve("eslint/package.json"));
const eslintCliPath = path.join(eslintPkgDir, "bin", "eslint.js");
const configPath = path.resolve(__dirname, "../eslint.config.js");

function run(code, rule) {
  const args = [
    "--no-config-lookup",
    "--config",
    configPath,
    "--stdin",
    "--stdin-filename",
    "foo.js",
    "--rule",
    "no-unused-vars:off",
    "--rule",
    rule,
  ];
  const result = spawnSync(process.execPath, [eslintCliPath, ...args], {
    encoding: "utf-8",
    input: code,
  });
  console.log("status:", result.status);
  console.log("stdout:\n", result.stdout);
  console.log("stderr:\n", result.stderr);
  return result;
}

console.log("=== RUN 1: missing story ===");
run("function foo() {}", "traceability/require-story-annotation:error");

console.log("\n=== RUN 2: present story ===");
run(
  "/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nfunction foo() {}",
  "traceability/require-story-annotation:error",
);

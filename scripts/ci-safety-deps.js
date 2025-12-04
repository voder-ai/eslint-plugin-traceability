/**
 * CI helper that runs dry-aged-deps (safety-like check) and writes ci/dry-aged-deps.json
 * @story docs/stories/012.0-DEV-CI-AUDIT-INTEGRATION.story.md
 * @req REQ-CI-SAFETY - Produce dry-aged-deps JSON output for CI artifacts non-failing
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Use the locally installed dry-aged-deps via npm script for reproducible checks.
// On failure or missing output, emit a structured JSON error object instead of
// silently pretending there are zero packages.
let res = spawnSync("npm", ["run", "deps:maturity", "--", "--format=json"], {
  encoding: "utf8",
});

let output = res.stdout;
let hadError = false;

if (res.status !== 0 || !res.stdout) {
  hadError = true;
  const errorPayload = {
    status: "error",
    message: "dry-aged-deps failed",
    exitCode: typeof res.status === "number" ? res.status : null,
    stdout: res.stdout || null,
    stderr: res.stderr || null,
  };
  output = JSON.stringify(errorPayload, null, 2);
  console.error(
    "dry-aged-deps check failed; writing structured error object to CI artifact",
  );
}

const outDir = path.join("ci");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "dry-aged-deps.json");

try {
  fs.writeFileSync(outPath, output || "", {
    encoding: "utf8",
  });
} catch (e) {
  console.error("Failed to write dry-aged-deps output", e);
}

// Ensure the output file is non-empty; if empty, write stdout/stderr or a fallback and warn.
// Prefer not to overwrite a structured error object that was just written.
try {
  const exists = fs.existsSync(outPath);
  const stats = exists ? fs.statSync(outPath) : null;
  const isEmpty = !exists || (stats && stats.size === 0);
  if (isEmpty) {
    const fallback =
      res.stdout ||
      res.stderr ||
      JSON.stringify({
        status: "error",
        message: "No output from dry-aged-deps and no stderr available",
      });
    try {
      fs.writeFileSync(outPath, fallback, { encoding: "utf8" });
      console.warn(
        "dry-aged-deps produced empty output; wrote fallback content to",
        outPath,
      );
    } catch (e) {
      console.error("Failed to write fallback dry-aged-deps output", e);
    }
  }
} catch (e) {
  console.error("Error while validating dry-aged-deps output file", e);
}

// Always exit 0 so CI does not fail on this auxiliary check.
process.exit(0);

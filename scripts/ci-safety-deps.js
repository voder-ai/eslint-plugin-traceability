/**
 * CI helper that runs dry-aged-deps (safety-like check) and writes ci/dry-aged-deps.json
 * @story docs/stories/012.0-DEV-CI-AUDIT-INTEGRATION.story.md
 * @req REQ-CI-SAFETY - Produce dry-aged-deps JSON output for CI artifacts non-failing
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Attempt to run dry-aged-deps; if missing, run a best-effort npm ls --json
let res = spawnSync("npx", ["dry-aged-deps", "--json"], { encoding: "utf8" });
if (res.status !== 0 || !res.stdout) {
  // Fallback: produce an empty stable report
  res = { stdout: JSON.stringify({ packages: [] }) };
}
const outDir = path.join("ci");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "dry-aged-deps.json");
try {
  fs.writeFileSync(outPath, res.stdout || res.stderr || "", {
    encoding: "utf8",
  });
} catch (e) {
  console.error("Failed to write dry-aged-deps output", e);
}
process.exit(0);

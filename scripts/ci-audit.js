/**
 * CI helper to run npm audit in JSON mode and write output to ci/npm-audit.json
 * @story docs/stories/012.0-DEV-CI-AUDIT-INTEGRATION.story.md
 * @req REQ-CI-AUDIT - Produce machine-readable npm audit reports for CI artifacts
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const res = spawnSync("npm", ["audit", "--json"], { encoding: "utf8" });
const outDir = path.join("ci");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "npm-audit.json");
try {
  fs.writeFileSync(outPath, res.stdout || res.stderr || "", {
    encoding: "utf8",
  });
} catch (e) {
  console.error("Failed to write audit output", e);
}
process.exit(0);

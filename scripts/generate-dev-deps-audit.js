#!/usr/bin/env node
/**
 * Script to generate a JSON report of high-severity vulnerabilities in development dependencies.
 * @dev
 * @story Generate a machine-readable npm audit report focused on development dependencies for CI.
 * @req Run `npm audit --omit=prod --audit-level=high --json`, capture UTF-8 output, write to ci/npm-audit.json,
 *      ensure output directory exists, and always exit with code 0 (do not block CI).
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Run npm audit for dev dependencies with high threshold (omit production deps)
// Do not use shell: true
const result = spawnSync(
  "npm",
  ["audit", "--omit=prod", "--audit-level=high", "--json"],
  {
    encoding: "utf8",
  },
);

// Ensure the output directory exists
const outputDir = path.join("ci");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Determine content to write (prefer stdout, fall back to stderr)
const outputPath = path.join(outputDir, "npm-audit.json");
const content = result.stdout || result.stderr || "";

// Write the audit JSON to file, even if npm exits with non-zero status
try {
  fs.writeFileSync(outputPath, content, { encoding: "utf8" });
} catch (err) {
  // If writing fails, log the error but still exit 0 per requirement
  // eslint-disable-next-line no-console
  console.error("Failed to write npm audit output:", err);
}

// Exit zero regardless of vulnerabilities or errors to not block CI
process.exit(0);

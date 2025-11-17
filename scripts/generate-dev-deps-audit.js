#!/usr/bin/env node
// Script to generate a JSON report of high-severity vulnerabilities in development dependencies
// @dev
const { spawnSync } = require("child_process");
const fs = require("fs");

// Run npm audit for dev dependencies with high threshold
const result = spawnSync(
  "npm",
  ["audit", "--include=dev", "--audit-level=high", "--json"],
  { shell: true, encoding: "utf8" },
);

// Ensure the output directory exists
const outputDir = "docs/security-incidents";
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the audit JSON to file, even if exit code is non-zero
fs.writeFileSync(
  `${outputDir}/dev-deps-high.json`,
  result.stdout || result.stderr,
);

// Exit zero regardless of vulnerabilities to not block script execution
process.exit(0);

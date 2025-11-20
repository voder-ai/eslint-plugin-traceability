#!/usr/bin/env node
// Extract uncovered branch ranges from jest-coverage.json for files under src/rules/helpers
// @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
// @req REQ-COVERAGE-INSPECT - Produce checklist of uncovered branch locations to target with tests
const fs = require("fs");
const path = require("path");
const dataPath = path.join(process.cwd(), "jest-coverage.json");
if (!fs.existsSync(dataPath)) {
  console.error(
    "jest-coverage.json not found. Run npm test -- --coverage first.",
  );
  process.exit(2);
}
const raw = fs.readFileSync(dataPath, "utf8");
const json = JSON.parse(raw);
const cov = json.coverageMap || json.coverageMap || json.coverageMap;
const files = Object.keys(json.coverageMap || {});
const targetDir = path.join("src", "rules", "helpers");
const results = [];
for (const f of files) {
  if (!f.includes(targetDir)) continue;
  const entry = json.coverageMap[f];
  if (!entry) continue;
  const b = entry.b || {};
  const branchMap = entry.branchMap || {};
  const misses = [];
  for (const [k, arr] of Object.entries(b)) {
    const counts = arr;
    // counts might be array
    const anyZero = counts.some((c) => c === 0);
    if (anyZero) {
      const m = branchMap[k];
      if (m) {
        misses.push({ branchId: k, loc: m.loc, counts });
      } else {
        misses.push({ branchId: k, loc: null, counts });
      }
    }
  }
  results.push({ file: f, misses });
}
if (results.length === 0) {
  console.log("No helper files found in coverage map.");
  process.exit(0);
}
for (const r of results) {
  console.log("\nFile:", r.file);
  if (r.misses.length === 0) {
    console.log("  All branches covered. No misses.");
    continue;
  }
  for (const m of r.misses) {
    const loc = m.loc
      ? `${m.loc.start.line}:${m.loc.start.column}-${m.loc.end.line}:${m.loc.end.column}`
      : "unknown";
    console.log(
      `  Branch ${m.branchId} missed at ${loc} - counts: [${m.counts.join(",")}]`,
    );
  }
}
console.log("\nSummary:");
for (const r of results) {
  console.log(
    `- ${r.file} -> ${r.misses.length} branches with at least one missed path`,
  );
}

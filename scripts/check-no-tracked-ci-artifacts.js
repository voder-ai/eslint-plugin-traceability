#!/usr/bin/env node
/**
 * Check for tracked CI artifacts in the repository.
 *
 * This script lists tracked files that live under any "ci/" directory
 * (matching a path segment of "ci/") but excludes any paths that
 * include ".voder/ci/".
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req 009.0
 */

"use strict";

const { execFileSync } = require("child_process");

function getTrackedFiles() {
  try {
    const out = execFileSync("git", ["ls-files"], { encoding: "utf8" });
    return out.split(/\r?\n/).filter(Boolean);
  } catch (err) {
    // If git is not available or the command fails, surface the error.
    console.error(
      "Failed to list tracked files with git ls-files:",
      err.message || err,
    );
    process.exit(1);
  }
}

function main() {
  const files = getTrackedFiles();

  // Match any path segment "ci/" (root or deeper), e.g. "ci/foo", "some/ci/bar"
  const ciPattern = /(^|\/)ci\//;
  const excludedSegment = ".voder/ci/";

  const matches = files.filter(
    (p) => ciPattern.test(p) && !p.includes(excludedSegment),
  );

  if (matches.length === 0) {
    // Nothing to report
    process.exit(0);
  }

  // Print report and fail with exit code 2
  console.error(
    'ERROR: Found tracked files under "ci/" (these should not be committed):',
  );
  for (const m of matches) {
    console.error("  -", m);
  }
  process.exit(2);
}

main();

#!/usr/bin/env node
/**
 * Scan the repository for ESLint/TypeScript suppression comments and generate a
 * parseable markdown report at scripts/eslint-suppressions-report.md.
 *
 * This script excludes node_modules, .git, lib, dist, out, .voder directories.
 * It searches source files with extensions: .js, .cjs, .mjs, .ts, .tsx, .jsx
 *
 * Exit codes:
 *  0 - no suppressions found
 *  2 - suppressions found (report written)
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-REPORT-ESLINT-SUPPRESSIONS - Provide a machine-readable report of suppression comments
 */

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const outPath = path.join("scripts", "eslint-suppressions-report.md");

const exts = new Set([".js", ".cjs", ".mjs", ".ts", ".tsx", ".jsx"]);
const excludedDirs = new Set([
  "node_modules",
  ".git",
  "lib",
  "dist",
  "out",
  ".voder",
  "coverage",
]);

const patterns = [
  {
    name: "eslint-disable",
    regex: /\/\*\s*eslint-disable(?:\s|\*|$)/,
    type: "block",
  },
  {
    name: "eslint-disable-line",
    regex: /\/\/\s*eslint-disable-line/,
    type: "line",
  },
  {
    name: "eslint-disable-next-line",
    regex: /\/\/\s*eslint-disable-next-line/,
    type: "line",
  },
  { name: "ts-nocheck", regex: /\/\/\s*@ts-nocheck/, type: "line" },
  { name: "ts-ignore", regex: /\/\/\s*@ts-ignore/, type: "line" },
  {
    name: "eslint-disable-file",
    regex: /\/\*\s*eslint-disable\s*$/,
    type: "block",
  },
];

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (excludedDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, cb);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (exts.has(ext)) cb(full);
    }
  }
}

function hasJustification(text) {
  if (!text) return false;
  if (text.indexOf(" -- ") !== -1) return true;
  if (/justification/i.test(text)) return true;
  if (/ADR/i.test(text)) return true;
  if (text.indexOf("docs/decisions/") !== -1) return true;
  return false;
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const p of patterns) {
      if (p.regex.test(line)) {
        if (hasJustification(line)) continue;
        hits.push({
          filePath,
          line: i + 1,
          text: line.trim(),
          pattern: p.name,
        });
      }
    }
  }

  // Also search for block comments that may span multiple lines (/* eslint-disable */)
  // We'll search the full file for the exact token
  const blockRegex = /\/\*[\s\S]*?\*\//g;
  let m;
  while ((m = blockRegex.exec(content)) !== null) {
    const block = m[0];
    const idx = m.index;
    if (/eslint-disable/.test(block)) {
      // compute line number
      const prefix = content.slice(0, idx);
      const lineNumber = prefix.split(/\r?\n/).length;
      const firstLine = block.split(/\r?\n/)[0].trim();
      if (hasJustification(firstLine)) continue;
      hits.push({
        filePath,
        line: lineNumber,
        text: firstLine,
        pattern: "eslint-disable-block",
      });
    }
  }

  return hits;
}

const results = [];
walk(root, (file) => {
  try {
    const rel = path.relative(root, file);
    // skip files under scripts/eslint-suppressions-report.md output
    if (rel === outPath) return;
    // skip this script itself
    if (rel === path.join("scripts", "report-eslint-suppressions.js")) return;
    const fileHits = scanFile(file);
    if (fileHits.length) results.push(...fileHits);
  } catch (err) {
    // ignore unreadable files
  }
});

function remediationSuggestion(hit) {
  switch (hit.pattern) {
    case "eslint-disable":
    case "eslint-disable-block":
      return 'Avoid broad block-level "eslint-disable". Narrow to the specific rule(s) and add a one-line justification comment referencing an issue or ADR, or refactor code to satisfy the rule.';
    case "eslint-disable-line":
    case "eslint-disable-next-line":
      return "Prefer refactoring to avoid the rule violation or narrow the disable to the specific rule. Add a one-line justification comment referencing an issue/ADR if suppression is unavoidable.";
    case "ts-nocheck":
      return "Remove @ts-nocheck and fix TypeScript errors. If temporary, replace with targeted @ts-expect-error with justification and comment pointing to an issue.";
    case "ts-ignore":
      return "Replace @ts-ignore with a targeted @ts-expect-error and a one-line justification comment referencing an issue/ADR. Fix underlying types when possible.";
    default:
      return "Review this suppression and either remove it, narrow its scope, or add a justification comment referencing an issue or ADR.";
  }
}

const outLines = [];
outLines.push("# ESLint / TypeScript Suppressions Report");
outLines.push(`Generated: ${new Date().toISOString()}`);
outLines.push("");
if (results.length === 0) {
  outLines.push("No suppressions found.");
  fs.writeFileSync(outPath, outLines.join("\n"), "utf8");
  console.log("No suppressions found. Report written to", outPath);
  process.exit(0);
}

outLines.push(`Total suppressions found: ${results.length}`);
outLines.push("");
outLines.push("## Suppressions");
for (const r of results) {
  outLines.push("- **" + r.filePath + ":" + r.line + "**");
  outLines.push("  - Suppression: `" + r.text.replace(/`/g, "\\`") + "`");
  outLines.push("  - Pattern: " + r.pattern);
  outLines.push("  - Suggested remediation: " + remediationSuggestion(r));
  outLines.push("");
}

fs.writeFileSync(outPath, outLines.join("\n"), "utf8");
console.log(
  `${results.length} suppressions found. Report written to ${outPath}`,
);
process.exit(2);

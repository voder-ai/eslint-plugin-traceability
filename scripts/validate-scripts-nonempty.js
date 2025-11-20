#!/usr/bin/env node
/**
 * Validate that scripts/ directory files are not empty or placeholder-only.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-VALIDATE-SCRIPTS-NONEMPTY - Prevent zero-byte or comment-only placeholder scripts in scripts/ directory
 *
 * Exits with a non-zero exit code when any problematic files are found.
 */

const fs = require("fs");
const path = require("path");

function isCommentOrWhitespaceOnly(content) {
  // Remove shebang if present
  if (content.startsWith("#!")) {
    const idx = content.indexOf("\n");
    if (idx === -1) content = "";
    else content = content.slice(idx + 1);
  }

  // Remove block comments
  content = content.replace(/\/\*[\s\S]*?\*\//g, "");
  // Remove line comments
  content = content.replace(/\/\/.*$/gm, "");
  // Remove whitespace
  content = content.replace(/\s+/g, "");
  return content.length === 0;
}

function main() {
  const scriptsDir = path.join(process.cwd(), "scripts");
  if (!fs.existsSync(scriptsDir) || !fs.statSync(scriptsDir).isDirectory()) {
    console.error("ERROR: scripts/ directory does not exist");
    process.exit(2);
  }

  const files = fs.readdirSync(scriptsDir);
  const problems = [];

  for (const f of files) {
    const fp = path.join(scriptsDir, f);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) continue;

    const raw = fs.readFileSync(fp, "utf8");
    if (stat.size === 0) {
      problems.push({ file: fp, reason: "zero-length file" });
      continue;
    }

    if (isCommentOrWhitespaceOnly(raw)) {
      problems.push({
        file: fp,
        reason: "comment-or-whitespace-only (likely placeholder)",
      });
      continue;
    }

    // Detect obviously placeholder text
    const placeholderPatterns = [/\bTODO\b/i, /\bPLACEHOLDER\b/i, /\bSTUB\b/i];
    for (const pat of placeholderPatterns) {
      if (pat.test(raw) && raw.trim().length < 200) {
        problems.push({
          file: fp,
          reason: `contains placeholder token (${pat})`,
        });
        break;
      }
    }
  }

  if (problems.length > 0) {
    console.error("Found placeholder or empty scripts in scripts/:");
    for (const p of problems) {
      console.error(` - ${p.file}: ${p.reason}`);
    }
    console.error(
      "\nPlease replace these with functional scripts or remove them.",
    );
    process.exit(1);
  }

  console.log("OK: scripts/ files appear non-empty and non-placeholder.");
  process.exit(0);
}

main();

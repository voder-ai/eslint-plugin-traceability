#!/usr/bin/env node
/**
 * Add eslint-disable comment to top of files
 * @supports docs/stories/010.1-DEV-DOGFOODING-PLAN.story.md REQ-SYSTEMATIC-CLEANUP
 */

const fs = require("fs");
const path = require("path");

const filesListPath = process.argv[2];
const ruleName = process.argv[3] || "traceability/valid-req-reference";

if (!filesListPath) {
  console.error("Usage: node add-suppressions.js <files-list> [rule-name]");
  process.exit(1);
}

const files = fs
  .readFileSync(filesListPath, "utf8")
  .split("\n")
  .filter(Boolean);

console.log(`Adding suppressions for ${ruleName} to ${files.length} files...`);

let addedCount = 0;
let skippedCount = 0;

for (const filePath of files) {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping non-existent file: ${filePath}`);
    skippedCount++;
    continue;
  }

  const content = fs.readFileSync(filePath, "utf8");
  
  // Check if suppression already exists
  if (content.includes(`eslint-disable ${ruleName}`)) {
    console.log(`Skipping ${path.relative(process.cwd(), filePath)} (already has suppression)`);
    skippedCount++;
    continue;
  }

  // Check if there's already an eslint-disable comment
  const existingDisable = content.match(/^\/\* eslint-disable ([^*]+) \*\//);
  
  let newContent;
  if (existingDisable) {
    // Add to existing disable comment
    const existingRules = existingDisable[1];
    newContent = content.replace(
      /^\/\* eslint-disable ([^*]+) \*\//,
      `/* eslint-disable ${existingRules}, ${ruleName} */`
    );
  } else {
    // Add new disable comment at top
    newContent = `/* eslint-disable ${ruleName} */\n${content}`;
  }

  fs.writeFileSync(filePath, newContent, "utf8");
  console.log(`✓ Added suppression to ${path.relative(process.cwd(), filePath)}`);
  addedCount++;
}

console.log(`\nSummary: Added ${addedCount}, Skipped ${skippedCount}`);

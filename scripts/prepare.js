#!/usr/bin/env node
/**
 * Prepare script that runs husky install only in git directories
 * This prevents "fatal: not in a git directory" errors during npm ci
 * in non-git environments (e.g., temp directories, CI artifacts).
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Check if we're in a git directory
const isGitRepo = fs.existsSync(path.join(__dirname, "..", ".git"));

if (isGitRepo) {
  try {
    execSync("husky", { stdio: "inherit" });
    process.exit(0);
  } catch (error) {
    console.error("Failed to run husky:", error.message);
    process.exit(error.status || 1);
  }
} else {
  console.log("Not in a git directory, skipping husky installation");
  process.exit(0);
}

#!/usr/bin/env node
/**
 * @story As part of the build validation, we must ensure the built ESLint plugin
 *        actually exports a 'rules' object so downstream consumers (ESLint)
 *        can load and use the plugin rules.
 *
 * @req The built plugin artifact (as referenced by package.json "main" or
 *      commonly used output directories like dist/ or lib/) must be require()-able
 *      and must export an object with a 'rules' property whose value is an object.
 *
 * This script is non-interactive and will exit with a non-zero status code when
 * any check fails.
 */

const fs = require("fs");
const path = require("path");

function logError(...args) {
  console.error(...args);
}

function exitFailure(message, err) {
  if (message) logError("ERROR:", message);
  if (err) {
    if (err && err.stack) logError(err.stack);
    else logError(err);
  }
  process.exit(1);
}

function exitSuccess(message) {
  if (message) console.log(message);
  process.exit(0);
}

(function main() {
  const cwd = process.cwd();
  const pkgPath = path.join(cwd, "package.json");
  const tried = [];
  let candidates = [];

  // Try package.json main first if present
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      if (pkg && pkg.main) {
        candidates.push(path.join(cwd, pkg.main));
      }
    } catch (err) {
      // ignore parse errors; will try other common paths
    }
  }

  // Common build output locations
  candidates = candidates.concat([
    path.join(cwd, "dist", "index.js"),
    path.join(cwd, "dist"),
    path.join(cwd, "lib", "index.js"),
    path.join(cwd, "lib"),
    path.join(cwd, "index.js"),
    path.join(cwd, "build", "index.js"),
    path.join(cwd, "build"),
  ]);

  let lastError = null;
  let plugin;
  let usedPath;

  for (const candidate of candidates) {
    tried.push(candidate);
    if (!fs.existsSync(candidate)) {
      lastError = new Error(`Path does not exist: ${candidate}`);
      continue;
    }
    try {
      // Use require with resolved path to ensure Node module resolution works
      const resolved = require.resolve(candidate);
      usedPath = resolved;
      // eslint-disable-next-line import/no-dynamic-require, global-require -- See ADR: docs/decisions/0001-allow-dynamic-require-for-built-plugins.md
      plugin = require(resolved);
      break;
    } catch (err) {
      lastError = err;
      // continue trying other candidates
    }
  }

  if (!plugin) {
    exitFailure(
      "Failed to require built plugin. Tried the following locations:\n" +
        tried.join("\n"),
      lastError,
    );
  }

  // Support ES module transpiles that export via default
  if (
    plugin &&
    plugin.__esModule &&
    Object.prototype.hasOwnProperty.call(plugin, "default")
  ) {
    plugin = plugin.default;
  }

  if (!plugin || typeof plugin !== "object") {
    exitFailure(
      `Plugin did not export an object. Found type: ${plugin === null ? "null" : typeof plugin}`,
    );
  }

  if (!Object.prototype.hasOwnProperty.call(plugin, "rules")) {
    exitFailure("Plugin does not export a 'rules' property.");
  }

  const rules = plugin.rules;
  if (!rules || typeof rules !== "object" || Array.isArray(rules)) {
    const type =
      rules === null ? "null" : Array.isArray(rules) ? "array" : typeof rules;
    exitFailure(`Plugin 'rules' is not an object. Found type: ${type}`);
  }

  // All checks passed
  exitSuccess(
    `OK: Plugin exports 'rules' object. (${usedPath || "resolved module"})`,
  );
})();

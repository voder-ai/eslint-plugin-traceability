"use strict";
/**
 * ESLint Traceability Plugin
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Provide foundational plugin export and registration
 */
const plugin = require("./src/index.js");

module.exports = plugin;
module.exports.rules = plugin.rules;
module.exports.configs = plugin.configs;
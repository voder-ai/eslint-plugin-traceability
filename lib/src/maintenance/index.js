"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMaintenanceReport = exports.verifyAnnotations = exports.batchUpdateAnnotations = exports.updateAnnotationReferences = exports.detectStaleAnnotations = void 0;
/**
 * Maintenance Tools Module
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT
 * @req REQ-MAINT-UPDATE
 * @req REQ-MAINT-BATCH
 * @req REQ-MAINT-VERIFY
 * @req REQ-MAINT-REPORT
 * @req REQ-MAINT-SAFE
 */
var detect_1 = require("./detect");
Object.defineProperty(exports, "detectStaleAnnotations", { enumerable: true, get: function () { return detect_1.detectStaleAnnotations; } });
var update_1 = require("./update");
Object.defineProperty(exports, "updateAnnotationReferences", { enumerable: true, get: function () { return update_1.updateAnnotationReferences; } });
var batch_1 = require("./batch");
Object.defineProperty(exports, "batchUpdateAnnotations", { enumerable: true, get: function () { return batch_1.batchUpdateAnnotations; } });
Object.defineProperty(exports, "verifyAnnotations", { enumerable: true, get: function () { return batch_1.verifyAnnotations; } });
var report_1 = require("./report");
Object.defineProperty(exports, "generateMaintenanceReport", { enumerable: true, get: function () { return report_1.generateMaintenanceReport; } });

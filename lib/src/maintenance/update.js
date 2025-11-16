"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAnnotationReferences = updateAnnotationReferences;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Update annotation references when story files are moved or renamed
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE - Update annotation references
 */
function updateAnnotationReferences(codebasePath, oldPath, newPath) {
    if (!fs.existsSync(codebasePath) || !fs.statSync(codebasePath).isDirectory()) {
        return 0;
    }
    let replacementCount = 0;
    const escapedOldPath = oldPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(@story\\s*)${escapedOldPath}`, "g");
    function traverse(dir) {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
            const fullPath = path.join(dir, entry);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                traverse(fullPath);
            }
            else if (stat.isFile()) {
                const content = fs.readFileSync(fullPath, "utf8");
                const newContent = content.replace(regex, (match, p1) => {
                    replacementCount++;
                    return `${p1}${newPath}`;
                });
                if (newContent !== content) {
                    fs.writeFileSync(fullPath, newContent, "utf8");
                }
            }
        }
    }
    traverse(codebasePath);
    return replacementCount;
}

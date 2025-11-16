"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Rule to validate @story annotation references refer to existing story files
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 * @req REQ-PATH-RESOLUTION - Resolve relative paths correctly and enforce configuration
 * @req REQ-SECURITY-VALIDATION - Prevent path traversal and absolute path usage
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const defaultStoryDirs = ["docs/stories", "stories"];
exports.default = {
    meta: {
        type: "problem",
        docs: {
            description: "Validate that @story annotations reference existing .story.md files",
            recommended: "error",
        },
        messages: {
            fileMissing: "Story file '{{path}}' not found",
            invalidExtension: "Invalid story file extension for '{{path}}', expected '.story.md'",
            invalidPath: "Invalid story path '{{path}}'",
        },
        schema: [
            {
                type: "object",
                properties: {
                    storyDirectories: {
                        type: "array",
                        items: { type: "string" },
                    },
                    allowAbsolutePaths: { type: "boolean" },
                    requireStoryExtension: { type: "boolean" },
                },
                additionalProperties: false,
            },
        ],
    },
    create(context) {
        const sourceCode = context.getSourceCode();
        const cwd = process.cwd();
        const opts = context.options[0];
        const storyDirs = opts?.storyDirectories || defaultStoryDirs;
        const allowAbsolute = opts?.allowAbsolutePaths || false;
        const requireExt = opts?.requireStoryExtension !== false;
        // Cache for file existence checks
        const fileExistCache = new Map();
        return {
            Program() {
                const comments = sourceCode.getAllComments() || [];
                comments.forEach((comment) => {
                    const lines = comment.value.split(/\r?\n/).map((l) => l.trim());
                    lines.forEach((line) => {
                        if (line.startsWith("@story")) {
                            const parts = line.split(/\s+/);
                            const storyPath = parts[1];
                            if (!storyPath) {
                                return;
                            }
                            // Absolute path check
                            if (path_1.default.isAbsolute(storyPath)) {
                                if (!allowAbsolute) {
                                    context.report({
                                        node: comment,
                                        messageId: "invalidPath",
                                        data: { path: storyPath },
                                    });
                                    return;
                                }
                            }
                            // Path traversal prevention
                            if (!path_1.default.isAbsolute(storyPath) && storyPath.includes("..")) {
                                const normalized = path_1.default.normalize(storyPath);
                                const full = path_1.default.resolve(cwd, normalized);
                                if (!full.startsWith(cwd + path_1.default.sep)) {
                                    context.report({
                                        node: comment,
                                        messageId: "invalidPath",
                                        data: { path: storyPath },
                                    });
                                    return;
                                }
                            }
                            // Extension check
                            if (requireExt && !storyPath.endsWith(".story.md")) {
                                context.report({
                                    node: comment,
                                    messageId: "invalidExtension",
                                    data: { path: storyPath },
                                });
                                return;
                            }
                            // Build candidate file paths
                            const candidates = [];
                            if (storyPath.startsWith("./") || storyPath.startsWith("../")) {
                                candidates.push(path_1.default.resolve(cwd, storyPath));
                            }
                            else {
                                // direct relative to cwd
                                candidates.push(path_1.default.resolve(cwd, storyPath));
                                storyDirs.forEach((dir) => {
                                    const base = path_1.default.basename(storyPath);
                                    candidates.push(path_1.default.resolve(cwd, dir, base));
                                });
                            }
                            // Check existence
                            let exists = false;
                            for (const candidate of candidates) {
                                let ok = fileExistCache.get(candidate);
                                if (ok === undefined) {
                                    ok =
                                        fs_1.default.existsSync(candidate) && fs_1.default.statSync(candidate).isFile();
                                    fileExistCache.set(candidate, ok);
                                }
                                if (ok) {
                                    exists = true;
                                    break;
                                }
                            }
                            if (!exists) {
                                context.report({
                                    node: comment,
                                    messageId: "fileMissing",
                                    data: { path: storyPath },
                                });
                            }
                        }
                    });
                });
            },
        };
    },
};

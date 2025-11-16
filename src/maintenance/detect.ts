import * as fs from "fs";
import * as path from "path";
import { getAllFiles } from "./utils";

/**
 * Detect stale annotation references that point to moved or deleted story files
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT - Detect stale annotation references
 */
export function detectStaleAnnotations(codebasePath: string): string[] {
  if (
    !fs.existsSync(codebasePath) ||
    !fs.statSync(codebasePath).isDirectory()
  ) {
    return [];
  }

  const cwd = process.cwd();
  const baseDir = path.resolve(cwd, codebasePath);

  const stale = new Set<string>();

  const files = getAllFiles(codebasePath);
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const regex = /@story\s+([^\s]+)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      const storyPath = match[1];
      const storyProjectPath = path.resolve(cwd, storyPath);
      const storyCodebasePath = path.resolve(baseDir, storyPath);
      if (
        !fs.existsSync(storyProjectPath) &&
        !fs.existsSync(storyCodebasePath)
      ) {
        stale.add(storyPath);
      }
    }
  }

  return Array.from(stale);
}

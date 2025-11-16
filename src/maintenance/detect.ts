import * as fs from "fs";
import * as path from "path";

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

  function traverse(dir: string) {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (stat.isFile()) {
        const content = fs.readFileSync(fullPath, "utf8");
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
    }
  }

  traverse(codebasePath);
  return Array.from(stale);
}
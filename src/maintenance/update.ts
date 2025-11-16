import * as fs from "fs";
import { getAllFiles } from "./utils";

/**
 * Update annotation references when story files are moved or renamed
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE - Update annotation references
 */
export function updateAnnotationReferences(
  codebasePath: string,
  oldPath: string,
  newPath: string,
): number {
  if (
    !fs.existsSync(codebasePath) ||
    !fs.statSync(codebasePath).isDirectory()
  ) {
    return 0;
  }

  let replacementCount = 0;
  const escapedOldPath = oldPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(@story\\s*)${escapedOldPath}`, "g");

  const files = getAllFiles(codebasePath);
  for (const fullPath of files) {
    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) continue;
    const content = fs.readFileSync(fullPath, "utf8");
    const newContent = content.replace(regex, (match, p1) => {
      replacementCount++;
      return `${p1}${newPath}`;
    });
    if (newContent !== content) {
      fs.writeFileSync(fullPath, newContent, "utf8");
    }
  }

  return replacementCount;
}
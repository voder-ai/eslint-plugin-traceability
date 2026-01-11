import * as fs from "fs";
import { getAllFiles, GetAllFilesOptions } from "./utils";

/**
 * Detect malformed annotations in file content
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE - Detect and report malformed annotations
 */
function detectMalformedAnnotations(
  content: string,
  filePath: string,
): string[] {
  const warnings: string[] = [];
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    /* eslint-disable traceability/valid-annotation-format */
    // Detect @story without a path
    if (/@story\s*$/.test(line.trim()) || /@story\s*\*\//.test(line)) {
      warnings.push(`${filePath}:${lineNum}: @story annotation without path`);
    }

    // Detect @supports without a path or requirements
    if (/@supports\s*$/.test(line.trim()) || /@supports\s*\*\//.test(line)) {
      warnings.push(
        `${filePath}:${lineNum}: @supports annotation without path/requirements`,
      );
    }

    // Detect @req without a requirement ID
    if (
      /@req\s*$/.test(line.trim()) ||
      /@req\s*\*\//.test(line) ||
      /@req\s+-\s/.test(line)
    ) {
      warnings.push(
        `${filePath}:${lineNum}: @req annotation without requirement ID`,
      );
    }
    /* eslint-enable traceability/valid-annotation-format */
  });

  return warnings;
}

/**
 * Helper to process a single file for annotation reference updates
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-UPDATE
 */
function processFileForAnnotationUpdates(
  fullPath: string,
  regexes: { story: RegExp; supports: RegExp },
  newPath: string,
  refs: { count: number; warnings: string[] },
): void {
  const content = fs.readFileSync(fullPath, "utf8");

  // Detect malformed annotations before processing
  const malformedWarnings = detectMalformedAnnotations(content, fullPath);
  refs.warnings.push(...malformedWarnings);

  let newContent = content;

  /* eslint-disable traceability/valid-annotation-format */
  // Update @story references
  newContent = newContent.replace(regexes.story, (match, p1) => {
    refs.count++;
    return `${p1}${newPath}`;
  });

  // Update @supports references
  newContent = newContent.replace(regexes.supports, (match, prefix, suffix) => {
    refs.count++;
    return `${prefix}${newPath}${suffix}`;
  });
  /* eslint-enable traceability/valid-annotation-format */

  // Write file only if content changed
  if (newContent !== content) {
    fs.writeFileSync(fullPath, newContent, "utf8");
  }
}

/**
 * Update annotation references when story files are moved or renamed
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-UPDATE
 * @param codebasePath Absolute or workspace-root path whose files will be updated in-place.
 * @param oldPath The original path to search for in annotations.
 * @param newPath The replacement path.
 * @param options Optional configuration including ESLint ignore patterns
 * @returns Object with count of annotations updated and array of warnings
 */
export function updateAnnotationReferences(
  codebasePath: string,
  oldPath: string,
  newPath: string,
  options?: GetAllFilesOptions,
): { count: number; warnings: string[] } {
  // Check that the provided codebase path exists and is a directory.
  // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-UPDATE
  if (
    !fs.existsSync(codebasePath) ||
    !fs.statSync(codebasePath).isDirectory()
  ) {
    return { count: 0, warnings: [] };
  }

  const refs = { count: 0, warnings: [] as string[] };
  const escapedOldPath = oldPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Create regex patterns for both story and supports references
  const storyRegex = new RegExp(`(@story\\s*)${escapedOldPath}`, "g");
  // Match supports with old path, capturing prefix and suffix requirements
  const supportsRegex = new RegExp(
    `(@supports\\s+)${escapedOldPath}(\\s+[A-Z][A-Z0-9_-]*(?:#\\d+)?(?:\\s+[A-Z][A-Z0-9_-]*(?:#\\d+)?)*)`,
    "g",
  );

  const files = getAllFiles(codebasePath, options);

  // Loop over each discovered file path
  // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-UPDATE
  for (const fullPath of files) {
    processFileForAnnotationUpdates(
      fullPath,
      { story: storyRegex, supports: supportsRegex },
      newPath,
      refs,
    );
  }

  return { count: refs.count, warnings: refs.warnings };
}

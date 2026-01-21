/* eslint-disable traceability/require-branch-annotation */

import { detectStaleAnnotations } from "./detect";
import { GetAllFilesOptions } from "./utils";
import * as fs from "fs";
import * as path from "path";

/**
 * Detect circular references in story annotations
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-CLI - CLI command exists for historical reasons
 * @param codebasePath The workspace root to scan for circular references
 * @returns Array of circular reference chains detected
 */
function detectCircularReferences(codebasePath: string): string[] {
  const circularChains: string[] = [];
  const storyGraph = new Map<string, Set<string>>();

  // Build a graph of story file references
  try {
    buildStoryGraph(codebasePath, storyGraph);

    // Detect cycles using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const storyPath of storyGraph.keys()) {
      if (!visited.has(storyPath)) {
        detectCycles(storyPath, {
          graph: storyGraph,
          visited,
          recursionStack,
          path: [],
          circularChains,
        });
      }
    }
  } catch {
    // Silently handle errors during circular reference detection
    // to avoid breaking the main report generation
  }

  return circularChains;
}

/**
 * Build a graph of story file cross-references
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-CLI - CLI command exists for historical reasons
 */
function buildStoryGraph(
  codebasePath: string,
  graph: Map<string, Set<string>>,
): void {
  const storyFiles = findStoryFiles(codebasePath);

  for (const storyFile of storyFiles) {
    const content = fs.readFileSync(storyFile, "utf8");
    const references = extractStoryReferences(content);

    const relativePath = path.relative(codebasePath, storyFile);
    if (!graph.has(relativePath)) {
      graph.set(relativePath, new Set());
    }

    for (const ref of references) {
      graph.get(relativePath)?.add(ref);
    }
  }
}

/**
 * Find all story files in the codebase
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-CLI - CLI command exists for historical reasons
 */
function findStoryFiles(dir: string): string[] {
  const storyFiles: string[] = [];

  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    return storyFiles;
  }

  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      storyFiles.push(...findStoryFiles(fullPath));
    } else if (stat.isFile() && entry.endsWith(".story.md")) {
      storyFiles.push(fullPath);
    }
  }

  return storyFiles;
}

/**
 * Extract story references from file content
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-CLI - CLI command exists for historical reasons
 */
function extractStoryReferences(content: string): string[] {
  const references: string[] = [];
  const storyPattern = /@story\s+([^\s]+\.story\.md)/g;
  let match;

  while ((match = storyPattern.exec(content)) !== null) {
    references.push(match[1]);
  }

  return references;
}

/**
 * Options for cycle detection
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-CLI - CLI command exists for historical reasons
 */
interface CycleDetectionOptions {
  graph: Map<string, Set<string>>;
  visited: Set<string>;
  recursionStack: Set<string>;
  path: string[];
  circularChains: string[];
}

/**
 * Detect cycles in the story dependency graph using DFS
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-CLI - CLI command exists for historical reasons
 */
function detectCycles(node: string, options: CycleDetectionOptions): void {
  const { graph, visited, recursionStack, path, circularChains } = options;

  visited.add(node);
  recursionStack.add(node);
  path.push(node);

  const neighbors = graph.get(node) || new Set();
  for (const neighbor of neighbors) {
    if (!visited.has(neighbor)) {
      detectCycles(neighbor, options);
    } else if (recursionStack.has(neighbor)) {
      // Found a cycle
      const cycleStart = path.indexOf(neighbor);
      const cycle = path.slice(cycleStart).concat(neighbor);
      circularChains.push(`Circular reference: ${cycle.join(" -> ")}`);
    }
  }

  path.pop();
  recursionStack.delete(node);
}

/**
 * Generate a report of maintenance operations performed
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-CLI - CLI command exists for historical reasons
 * @param codebasePath The workspace root to scan for stale maintenance annotations.
 * @param options Optional configuration including ESLint ignore patterns
 * @returns An empty string when no stale annotations are found, or a newline-separated list of stale `@story` paths.
 */
export function generateMaintenanceReport(
  codebasePath: string,
  options?: GetAllFilesOptions,
): string {
  const staleAnnotations = detectStaleAnnotations(codebasePath, options);
  const circularReferences = detectCircularReferences(codebasePath);

  const reportSections: string[] = [];

  // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
  if (staleAnnotations.length > 0) {
    reportSections.push("Stale Annotations:");
    reportSections.push(...staleAnnotations);
  }

  if (circularReferences.length > 0) {
    if (reportSections.length > 0) {
      reportSections.push("");
    }
    reportSections.push("Circular References:");
    reportSections.push(...circularReferences);
  }

  return reportSections.join("\n");
}

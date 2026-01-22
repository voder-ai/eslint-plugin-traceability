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
    // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
    // @req REQ-MAINT-CLI - Detect cycles using DFS traversal
    buildStoryGraph(codebasePath, storyGraph);

    // Detect cycles using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const storyPath of storyGraph.keys()) {
      // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
      // @req REQ-MAINT-CLI - Detect cycles for each story file
      if (!visited.has(storyPath)) {
        // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
        // @req REQ-MAINT-CLI - Perform DFS from unvisited nodes
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
    // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
    // @req REQ-MAINT-CLI - Handle errors gracefully in circular reference detection
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
    // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
    // @req REQ-MAINT-CLI - Build graph from story file references
    const content = fs.readFileSync(storyFile, "utf8");
    const references = extractStoryReferences(content);

    const relativePath = path.relative(codebasePath, storyFile);
    if (!graph.has(relativePath)) {
      // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
      // @req REQ-MAINT-CLI - Initialize graph entry for story file
      graph.set(relativePath, new Set());
    }

    for (const ref of references) {
      // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
      // @req REQ-MAINT-CLI - Add reference edges to graph
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
    // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
    // @req REQ-MAINT-CLI - Guard against invalid directories
    return storyFiles;
  }

  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
    // @req REQ-MAINT-CLI - Recursively search for story files
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
      // @req REQ-MAINT-CLI - Recurse into subdirectories
      storyFiles.push(...findStoryFiles(fullPath));
    } else if (stat.isFile() && entry.endsWith(".story.md")) {
      // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
      // @req REQ-MAINT-CLI - Collect story file paths
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
    // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
    // @req REQ-MAINT-CLI - Extract story references from annotations
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
    // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
    // @req REQ-MAINT-CLI - Check neighbors for cycles
    if (!visited.has(neighbor)) {
      // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
      // @req REQ-MAINT-CLI - Recurse into unvisited neighbors
      detectCycles(neighbor, options);
    } else if (recursionStack.has(neighbor)) {
      // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
      // @req REQ-MAINT-CLI - Record circular reference chains
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
    // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
    // @req REQ-MAINT-CLI - Include stale annotations section
    reportSections.push("Stale Annotations:");
    reportSections.push(...staleAnnotations);
  }

  if (circularReferences.length > 0) {
    // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
    // @req REQ-MAINT-CLI - Include circular references section
    if (reportSections.length > 0) {
      // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
      // @req REQ-MAINT-CLI - Add blank line separator between sections
      reportSections.push("");
    }
    reportSections.push("Circular References:");
    reportSections.push(...circularReferences);
  }

  return reportSections.join("\n");
}

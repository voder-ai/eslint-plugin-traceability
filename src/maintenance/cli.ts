#!/usr/bin/env node

import path from "path";
import { detectStaleAnnotations } from "./detect";
import { verifyAnnotations } from "./batch";
import { updateAnnotationReferences } from "./update";
import { generateMaintenanceReport } from "./report";

const EXIT_OK = 0;
const EXIT_STALE = 1;
const EXIT_USAGE = 2;

/**
 * Maintenance CLI entry point.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT - CLI support for detection of stale annotations
 * @req REQ-MAINT-VERIFY - CLI support for verification of annotations
 * @req REQ-MAINT-REPORT - CLI support for human-readable reports
 * @req REQ-MAINT-UPDATE - CLI support for updating annotation references
 * @req REQ-MAINT-BATCH - CLI support for batch maintenance operations
 * @req REQ-MAINT-SAFE - Provide clear exit codes and avoid unsafe defaults
 */
export function runMaintenanceCli(rawArgv: string[]): number {
  const argv = [...rawArgv];
  const [, , command, ...rest] = argv;

  if (!command || command === "-h" || command === "--help") {
    printHelp();
    return EXIT_OK;
  }

  try {
    switch (command) {
      case "detect":
        return handleDetect(rest);
      case "verify":
        return handleVerify(rest);
      case "report":
        return handleReport(rest);
      case "update":
        return handleUpdate(rest);
      default:
        console.error(`Unknown command: ${command}`);
        printHelp();
        return EXIT_USAGE;
    }
  } catch (error: unknown) {
    // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
    // @req REQ-MAINT-SAFE - Catch unexpected errors and emit concise diagnostics
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error in maintenance CLI";
    console.error(`traceability-maint failed: ${message}`);
    return EXIT_USAGE;
  }
}

interface ParsedFlags {
  root: string;
  json: boolean;
  format?: "text" | "json";
  from?: string;
  to?: string;
  dryRun?: boolean;
}

/**
 * Initialize default flags for the maintenance CLI.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
 */
function createDefaultFlags(): ParsedFlags {
  return {
    root: process.cwd(),
    json: false,
  };
}

/**
 * Handle a single CLI argument and update the flags accordingly.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
 */
function applyFlag(flags: ParsedFlags, args: string[], index: number): number {
  const arg = args[index];

  if (arg === "--root" && typeof args[index + 1] === "string") {
    flags.root = path.resolve(args[index + 1]);
    return index + 1;
  }

  if (arg === "--json") {
    flags.json = true;
    return index;
  }

  if (arg === "--format" && typeof args[index + 1] === "string") {
    const value = args[index + 1];
    if (value === "text" || value === "json") {
      flags.format = value;
    } else {
      throw new Error(`Invalid format: ${value}. Expected 'text' or 'json'.`);
    }
    return index + 1;
  }

  if (arg === "--from" && typeof args[index + 1] === "string") {
    flags.from = args[index + 1];
    return index + 1;
  }

  if (arg === "--to" && typeof args[index + 1] === "string") {
    flags.to = args[index + 1];
    return index + 1;
  }

  if (arg === "--dry-run") {
    flags.dryRun = true;
    return index;
  }

  return index;
}

/**
 * Basic flag parser for maintenance CLI subcommands.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
 */
function parseFlags(args: string[]): ParsedFlags {
  const flags: ParsedFlags = createDefaultFlags();

  for (let i = 0; i < args.length; i += 1) {
    i = applyFlag(flags, args, i);
  }

  return flags;
}

/**
 * Handle the `detect` subcommand for stale @story annotations.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT - CLI surface for detection of stale annotations
 * @req REQ-MAINT-SAFE - Return specific exit codes for stale vs clean states
 */
function handleDetect(args: string[]): number {
  const flags = parseFlags(args);
  const root = flags.root;
  const stale = detectStaleAnnotations(root);

  if (flags.json) {
    // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
    // @req REQ-MAINT-REPORT - JSON-friendly output for tooling integration
    console.log(JSON.stringify({ root, stale }));
  } else {
    if (stale.length === 0) {
      console.log("No stale @story annotations found.");
    } else {
      stale.forEach((story) => {
        console.log(story);
      });
      console.log(
        `Found ${stale.length} stale @story annotation${
          stale.length === 1 ? "" : "s"
        }.
Run 'traceability-maint report' for a structured summary.`,
      );
    }
  }

  return stale.length === 0 ? EXIT_OK : EXIT_STALE;
}

/**
 * Handle the `verify` subcommand to validate traceability annotations.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-VERIFY - CLI surface for verification of annotations
 * @req REQ-MAINT-SAFE - Return distinct exit codes for verification failures
 */
function handleVerify(args: string[]): number {
  const flags = parseFlags(args);
  const root = flags.root;
  const valid = verifyAnnotations(root);

  if (valid) {
    console.log(`All traceability annotations under ${root} are valid.`);
    return EXIT_OK;
  }

  console.log(
    `Stale or invalid traceability annotations detected under ${root}.\nRun 'traceability-maint detect' or 'traceability-maint report' for details.`,
  );
  return EXIT_STALE;
}

/**
 * Handle the `report` subcommand to generate a maintenance report.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-REPORT - CLI surface for human-readable maintenance reports
 * @req REQ-MAINT-SAFE - Support machine-readable formats for safe automation
 */
function handleReport(args: string[]): number {
  const flags = parseFlags(args);
  const root = flags.root;
  const format = flags.format ?? "text";

  const report = generateMaintenanceReport(root);

  if (format === "json") {
    console.log(JSON.stringify({ root, report }));
  } else {
    if (!report) {
      console.log("No stale @story annotations found. Nothing to report.");
    } else {
      console.log(`# Traceability Maintenance Report for ${root}`);
      console.log("");
      console.log("Stale story references:");
      console.log(report);
    }
  }

  return EXIT_OK;
}

/**
 * Handle the `update` subcommand to rewrite @story annotation references.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE - CLI surface for updating annotation references
 * @req REQ-MAINT-SAFE - Provide dry-run mode and explicit parameter checks
 */
function handleUpdate(args: string[]): number {
  const flags = parseFlags(args);
  const root = flags.root;

  if (!flags.from || !flags.to) {
    console.error("'update' requires --from <oldPath> and --to <newPath>.");
    printHelp();
    return EXIT_USAGE;
  }

  const from = flags.from;
  const to = flags.to;

  if (flags.dryRun) {
    // For now, we cannot get a per-file diff without changing the maintenance API.
    // We conservatively reuse generateMaintenanceReport to indicate potential impact.
    const beforeReport = generateMaintenanceReport(root);
    const potentialChanges = beforeReport ? beforeReport.split("\n").length : 0;
    const summary = {
      root,
      from,
      to,
      estimatedStaleCount: potentialChanges,
    };

    if (flags.json) {
      console.log(JSON.stringify({ mode: "dry-run", ...summary }));
    } else {
      console.log("Dry run: no files were modified.");
      console.log(
        `Would update @story annotations from '${from}' to '${to}' under ${root}.`,
      );
      console.log(
        `Estimated stale annotations before update: ${summary.estimatedStaleCount}.`,
      );
    }

    return EXIT_OK;
  }

  const count = updateAnnotationReferences(root, from, to);

  if (flags.json) {
    console.log(JSON.stringify({ root, from, to, updated: count }));
  } else {
    console.log(
      `Updated ${count} @story annotation${count === 1 ? "" : "s"} from '${from}' to '${to}' under ${root}.`,
    );
  }

  return EXIT_OK;
}

/**
 * Print CLI usage help for the maintenance tools.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE - Provide discoverable CLI usage information
 */
function printHelp(): void {
  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-SAFE - Provide discoverable CLI usage information
  console.log(`traceability-maint - Traceability annotation maintenance tools

Usage:
  traceability-maint <command> [options]

Commands:
  detect   Detect stale @story annotations
  verify   Verify that traceability annotations are valid
  report   Generate a maintenance report
  update   Update @story annotation references

Options:
  --root <dir>        Workspace root to scan (defaults to current directory)
  --json              Output JSON where supported
  --format <text|json>  Output format for 'report' (default: text)
  --from <oldPath>    Old story path for 'update'
  --to <newPath>      New story path for 'update'
  --dry-run           Plan changes for 'update' without modifying files
  -h, --help          Show this help message
`);
}

if (require.main === module) {
  process.exit(runMaintenanceCli(process.argv));
}

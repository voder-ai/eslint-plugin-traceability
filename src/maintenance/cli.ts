#!/usr/bin/env node

import {
  EXIT_OK,
  EXIT_USAGE,
  handleDetect,
  handleVerify,
  handleReport,
  handleUpdate,
} from "./commands";
import { normalizeCliArgs, NormalizedCliArgs } from "./flags";

/**
 * Maintenance CLI entry point.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-CLI - CLI support for maintenance commands
 * @req REQ-MAINT-UPDATE - CLI support for updating annotation references
 * @req REQ-MAINT-BATCH - CLI support for batch maintenance operations
 * @req REQ-MAINT-MANUAL-TRIGGER - Maintenance tools run only when manually executed
 */
export function runMaintenanceCli(rawArgv: string[]): number {
  const initialNormalized: NormalizedCliArgs = normalizeCliArgs(rawArgv);
  const { subcommand: command } = initialNormalized;

  if (!command || command === "-h" || command === "--help") {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-MANUAL-TRIGGER
    printHelp();
    return EXIT_OK;
  }

  // Re-use the normalized arguments object for handlers so that they
  // receive the subcommand name and its raw argument vector unchanged.
  const normalized: NormalizedCliArgs = initialNormalized;

  try {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    switch (command) {
      case "detect":
        // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
        return handleDetect(normalized);
      case "verify":
        // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
        return handleVerify(normalized);
      case "report":
        // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
        return handleReport(normalized);
      case "update": {
        // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-UPDATE
        const result = handleUpdate(normalized);
        if (result === EXIT_USAGE) {
          // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-MANUAL-TRIGGER
          printHelp();
        }
        return result;
      }
      default:
        // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-MANUAL-TRIGGER
        console.error(`Unknown command: ${command}`);
        printHelp();
        return EXIT_USAGE;
    }
  } catch (error: unknown) {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-MANUAL-TRIGGER
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error in maintenance CLI";
    console.error(`traceability-maint failed: ${message}`);
    return EXIT_USAGE;
  }
}

/**
 * Print CLI usage help for the maintenance tools.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-MANUAL-TRIGGER - Provide discoverable CLI usage information
 */
function printHelp(): void {
  // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-MANUAL-TRIGGER
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
  // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-MANUAL-TRIGGER
  process.exit(runMaintenanceCli(process.argv));
}

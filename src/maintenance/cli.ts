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
 * @req REQ-MAINT-DETECT - CLI support for detection of stale annotations
 * @req REQ-MAINT-VERIFY - CLI support for verification of annotations
 * @req REQ-MAINT-REPORT - CLI support for human-readable reports
 * @req REQ-MAINT-UPDATE - CLI support for updating annotation references
 * @req REQ-MAINT-BATCH - CLI support for batch maintenance operations
 * @req REQ-MAINT-SAFE - Provide clear exit codes and avoid unsafe defaults
 */
export function runMaintenanceCli(rawArgv: string[]): number {
  const initialNormalized: NormalizedCliArgs = normalizeCliArgs(rawArgv);
  const { subcommand: command } = initialNormalized;

  if (!command || command === "-h" || command === "--help") {
    /**
     * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
     * @req REQ-MAINT-SAFE - Handle help requests safely and provide discoverable usage output
     */
    printHelp();
    return EXIT_OK;
  }

  // Re-use the normalized arguments object for handlers so that they
  // receive the subcommand name and its raw argument vector unchanged.
  const normalized: NormalizedCliArgs = initialNormalized;

  try {
    switch (command) {
      case "detect":
        // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md @req REQ-MAINT-DETECT - Dispatch to detection handler
        return handleDetect(normalized);
      case "verify":
        // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md @req REQ-MAINT-VERIFY - Dispatch to verification handler
        return handleVerify(normalized);
      case "report":
        // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md @req REQ-MAINT-REPORT - Dispatch to reporting handler
        return handleReport(normalized);
      case "update": {
        // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md @req REQ-MAINT-UPDATE - Dispatch to update handler
        const result = handleUpdate(normalized);
        // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md @req REQ-MAINT-SAFE - Print help on usage errors from update
        if (result === EXIT_USAGE) {
          printHelp();
        }
        return result;
      }
      default:
        // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md @req REQ-MAINT-SAFE - Handle unknown commands safely with diagnostics
        console.error(`Unknown command: ${command}`);
        printHelp();
        return EXIT_USAGE;
    }
  } catch (error: unknown) {
    /**
     * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
     * @req REQ-MAINT-SAFE - Catch unexpected errors and surface concise diagnostics without crashing
     */
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

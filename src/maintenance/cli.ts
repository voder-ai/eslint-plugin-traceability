#!/usr/bin/env node

import {
  EXIT_OK,
  EXIT_USAGE,
  handleDetect,
  handleVerify,
  handleReport,
  handleUpdate,
} from "./commands";
import { parseCliInput } from "./flags";

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
  const parsed = parseCliInput(rawArgv);
  const { subcommand: command } = parsed;

  if (!command || command === "-h" || command === "--help") {
    printHelp();
    return EXIT_OK;
  }

  const cmdIndex = parsed.argv.indexOf(command as string);
  const args = cmdIndex >= 0 ? parsed.argv.slice(cmdIndex + 1) : [];

  try {
    switch (command) {
      case "detect":
        return handleDetect(args);
      case "verify":
        return handleVerify(args);
      case "report":
        return handleReport(args);
      case "update": {
        const result = handleUpdate(args);
        if (result === EXIT_USAGE) {
          printHelp();
        }
        return result;
      }
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

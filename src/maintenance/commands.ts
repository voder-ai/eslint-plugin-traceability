/**
 * Subcommand handlers for the traceability-maint CLI.
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT - CLI support for detection of stale annotations
 * @req REQ-MAINT-VERIFY - CLI support for verification of annotations
 * @req REQ-MAINT-REPORT - CLI support for human-readable reports
 * @req REQ-MAINT-UPDATE - CLI support for updating annotation references
 * @req REQ-MAINT-SAFE - Provide clear exit codes and avoid unsafe defaults
 */
import { detectStaleAnnotations } from "./detect";
import { verifyAnnotations } from "./batch";
import { updateAnnotationReferences } from "./update";
import { generateMaintenanceReport } from "./report";
import { parseFlags } from "./flags";

export const EXIT_OK = 0;
export const EXIT_STALE = 1;
export const EXIT_USAGE = 2;

/**
 * Handle the `detect` subcommand for stale @story annotations.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT - CLI surface for detection of stale annotations
 * @req REQ-MAINT-SAFE - Return specific exit codes for stale vs clean states
 */
export function handleDetect(args: string[]): number {
  const flags = parseFlags(args, [
    "node",
    "traceability-maint",
    "detect",
    ...args,
  ]);
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
export function handleVerify(args: string[]): number {
  const flags = parseFlags(args, [
    "node",
    "traceability-maint",
    "verify",
    ...args,
  ]);
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
export function handleReport(args: string[]): number {
  const flags = parseFlags(args, [
    "node",
    "traceability-maint",
    "report",
    ...args,
  ]);
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
export function handleUpdate(args: string[]): number {
  const flags = parseFlags(args, [
    "node",
    "traceability-maint",
    "update",
    ...args,
  ]);
  const root = flags.root;

  if (!flags.from || !flags.to) {
    console.error("'update' requires --from <oldPath> and --to <newPath>.");
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

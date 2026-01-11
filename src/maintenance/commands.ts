/**
 * Subcommand handlers for the traceability-maint CLI.
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT - CLI support for detection of stale annotations.
 * @req REQ-MAINT-VERIFY - CLI support for verification of annotations
 * @req REQ-MAINT-REPORT - CLI support for human-readable reports
 * @req REQ-MAINT-UPDATE - CLI support for updating annotation references
 * @req REQ-MAINT-SAFE - Provide clear exit codes and avoid unsafe defaults
 */
import { detectStaleAnnotations } from "./detect";
import { verifyAnnotations } from "./batch";
import { updateAnnotationReferences } from "./update";
import { generateMaintenanceReport } from "./report";
import { parseFlags, NormalizedCliArgs } from "./flags";

export const EXIT_OK = 0;
export const EXIT_STALE = 1;
export const EXIT_USAGE = 2;

/**
 * Handle the `detect` subcommand for stale story annotations.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT - CLI surface for detection of stale annotations
 * @req REQ-MAINT-SAFE - Return specific exit codes for stale vs clean states
 * @req REQ-MAINT-UPDATE - Integrate with ESLint configuration
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT REQ-MAINT-SAFE
 */
export function handleDetect(normalized: NormalizedCliArgs): number {
  const flags = parseFlags(normalized);
  const root = flags.root;
  const options = flags.ignorePatterns
    ? { ignorePatterns: flags.ignorePatterns }
    : undefined;
  const stale = detectStaleAnnotations(root, options);

  if (flags.json) {
    // Emit JSON output to support consumption by external tools and scripts.
    console.log(JSON.stringify({ root, stale }));
  } else if (stale.length === 0) {
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

  return stale.length === 0 ? EXIT_OK : EXIT_STALE;
}

/**
 * Handle the `verify` subcommand to validate traceability annotations.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-VERIFY - CLI surface for verification of annotations
 * @req REQ-MAINT-SAFE - Return distinct exit codes for verification failures
 * @req REQ-MAINT-UPDATE - Integrate with ESLint configuration
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-VERIFY REQ-MAINT-SAFE
 */
export function handleVerify(normalized: NormalizedCliArgs): number {
  const flags = parseFlags(normalized);
  const root = flags.root;
  const options = flags.ignorePatterns
    ? { ignorePatterns: flags.ignorePatterns }
    : undefined;
  const valid = verifyAnnotations(root, options);

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
 * @req REQ-MAINT-UPDATE - Integrate with ESLint configuration
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-REPORT REQ-MAINT-SAFE
 */
export function handleReport(normalized: NormalizedCliArgs): number {
  const flags = parseFlags(normalized);
  const root = flags.root;
  const format = flags.format ?? "text";
  const options = flags.ignorePatterns
    ? { ignorePatterns: flags.ignorePatterns }
    : undefined;

  const report = generateMaintenanceReport(root, options);

  if (format === "json") {
    console.log(JSON.stringify({ root, report }));
  } else if (!report) {
    console.log("No stale @story annotations found. Nothing to report.");
  } else {
    console.log(`# Traceability Maintenance Report for ${root}`);
    console.log("");
    console.log("Stale story references:");
    console.log(report);
  }

  return EXIT_OK;
}

/**
 * Handle dry-run mode for update command
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE
 */
function handleUpdateDryRun(
  root: string,
  from: string,
  to: string,
  flags: { ignorePatterns?: string[]; json?: boolean },
): number {
  const options = flags.ignorePatterns
    ? { ignorePatterns: flags.ignorePatterns }
    : undefined;
  const beforeReport = generateMaintenanceReport(root, options);
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
      `Would update @story and @supports annotations from '${from}' to '${to}' under ${root}.`,
    );
    console.log(
      `Estimated stale annotations before update: ${summary.estimatedStaleCount}.`,
    );
  }

  return EXIT_OK;
}

/**
 * Handle the `update` subcommand to rewrite story annotation references.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE - CLI surface for updating annotation references
 * @req REQ-MAINT-SAFE - Provide dry-run mode and explicit parameter checks
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-UPDATE REQ-MAINT-SAFE
 */
export function handleUpdate(normalized: NormalizedCliArgs): number {
  const flags = parseFlags(normalized);
  const root = flags.root;
  const options = flags.ignorePatterns
    ? { ignorePatterns: flags.ignorePatterns }
    : undefined;

  if (!flags.from || !flags.to) {
    console.error("'update' requires --from <oldPath> and --to <newPath>.");
    return EXIT_USAGE;
  }

  const from = flags.from;
  const to = flags.to;

  if (flags.dryRun) {
    return handleUpdateDryRun(root, from, to, {
      ignorePatterns: flags.ignorePatterns,
      json: flags.json,
    });
  }

  const result = updateAnnotationReferences(root, from, to, options);

  // Report malformed annotations if any were found
  if (result.warnings.length > 0) {
    console.error("\nWarnings - malformed annotations detected:");
    result.warnings.forEach((warning) => console.error(`  ${warning}`));
  }

  if (flags.json) {
    console.log(
      JSON.stringify({
        root,
        from,
        to,
        updated: result.count,
        warnings: result.warnings,
      }),
    );
  } else {
    console.log(
      `Updated ${result.count} annotation${result.count === 1 ? "" : "s"} (@story and @supports) from '${from}' to '${to}' under ${root}.`,
    );
  }

  return EXIT_OK;
}

/**
 * Flag parsing and normalization logic for the traceability-maint CLI.
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
 */
import path from "path";

/**
 * Parsed representation of raw CLI input (argv) for the maintenance tools.
 *
 * Separates Node/V8 internals from the actual subcommand and its arguments.
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
 */
export interface ParsedCliInput {
  /**
   * The raw argv as passed to the Node.js process (e.g., process.argv).
   */
  readonly argv: string[];

  /**
   * The Node.js executable path (argv[0]).
   */
  readonly node: string;

  /**
   * The executed script path (argv[1]).
   */
  readonly script: string;

  /**
   * The maintenance subcommand being invoked (first argument after script).
   */
  readonly subcommand: string | undefined;

  /**
   * Remaining arguments after the subcommand, to be interpreted as flags
   * or positional arguments for that subcommand.
   */
  readonly args: string[];
}

/**
 * Parse raw Node.js argv into a structured CLI input for the maintenance tools.
 *
 * This performs only minimal, predictable splitting to support higher-level
 * flag parsing in a safe and testable way.
 *
 * @param argv - Raw argv array, usually process.argv.
 * @returns ParsedCliInput with node, script, subcommand, and remaining args.
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
 */
export function parseCliInput(argv: string[]): ParsedCliInput {
  const [node = "", script = "", ...rest] = argv;
  const [subcommand, ...args] = rest;
  return { argv, node, script, subcommand, args };
}

/**
 * Normalized view of CLI arguments relevant to a maintenance subcommand.
 *
 * This strips away Node/V8 internals and script paths, exposing only the
 * subcommand name and its raw arguments for further flag parsing.
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
 */
export interface NormalizedCliArgs {
  /**
   * The maintenance subcommand being invoked (first argument after script).
   */
  readonly subcommand: string | undefined;

  /**
   * Remaining arguments after the subcommand, to be interpreted as flags
   * or positional arguments for that subcommand.
   */
  readonly args: string[];
}

/**
 * Normalize raw argv into a subcommand-centric view for flag parsing.
 *
 * Uses parseCliInput to safely separate Node/V8 internals from the
 * subcommand and its arguments, then exposes only the pieces relevant
 * to subcommand-specific flag parsing.
 *
 * @param rawArgv - Raw argv array, usually process.argv.
 * @returns NormalizedCliArgs with subcommand and remaining args.
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
 */
export function normalizeCliArgs(rawArgv: string[]): NormalizedCliArgs {
  const { subcommand, args } = parseCliInput(rawArgv);
  return { subcommand, args };
}

export interface ParsedFlags {
  root: string;
  json: boolean;
  format?: "text" | "json";
  from?: string;
  to?: string;
  dryRun?: boolean;
}

/**
 * Initialize default flags for the maintenance CLI.
 *
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
 *
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
 *
 * Consumes already-normalized CLI arguments (subcommand and its raw args)
 * and produces a ParsedFlags structure with minimal, predictable behavior.
 *
 * @param normalized - Normalized CLI arguments for a maintenance subcommand.
 * @returns ParsedFlags with defaults applied and any recognized flags set.
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
 */
export function parseFlags(normalized: NormalizedCliArgs): ParsedFlags {
  const flags: ParsedFlags = createDefaultFlags();
  const { args } = normalized;

  for (let i = 0; i < args.length; i += 1) {
    i = applyFlag(flags, args, i);
  }

  return flags;
}

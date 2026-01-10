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
  ignorePatterns?: string[];
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
 * Safely check if the next argument value exists and is a string.
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
 */
function isNextValueString(args: string[], index: number): boolean {
  return typeof args[index + 1] === "string";
}

/**
 * Handle the --root flag, updating the root path if present.
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
 */
function handleRootFlag(
  flags: ParsedFlags,
  args: string[],
  index: number,
): number {
  if (args[index] !== "--root" || !isNextValueString(args, index)) {
    return index;
  }

  flags.root = path.resolve(args[index + 1]);
  return index + 1;
}

/**
 * Handle the --json flag, toggling JSON output when present.
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
 */
function handleJsonFlag(
  flags: ParsedFlags,
  args: string[],
  index: number,
): number {
  if (args[index] !== "--json") {
    return index;
  }

  flags.json = true;
  return index;
}

/**
 * Handle the --format flag, validating and setting the output format.
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
 */
function handleFormatFlag(
  flags: ParsedFlags,
  args: string[],
  index: number,
): number {
  if (args[index] !== "--format" || !isNextValueString(args, index)) {
    return index;
  }

  const value = args[index + 1];
  if (value === "text" || value === "json") {
    flags.format = value;
  } else {
    throw new Error(`Invalid format: ${value}. Expected 'text' or 'json'.`);
  }

  return index + 1;
}

/**
 * Handle the --from flag, capturing the starting reference if present.
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
 */
function handleFromFlag(
  flags: ParsedFlags,
  args: string[],
  index: number,
): number {
  if (args[index] !== "--from" || !isNextValueString(args, index)) {
    return index;
  }

  flags.from = args[index + 1];
  return index + 1;
}

/**
 * Handle the --to flag, capturing the ending reference if present.
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
 */
function handleToFlag(
  flags: ParsedFlags,
  args: string[],
  index: number,
): number {
  if (args[index] !== "--to" || !isNextValueString(args, index)) {
    return index;
  }

  flags.to = args[index + 1];
  return index + 1;
}

/**
 * Handle the --dry-run flag, enabling dry-run mode when present.
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
 */
function handleDryRunFlag(
  flags: ParsedFlags,
  args: string[],
  index: number,
): number {
  if (args[index] !== "--dry-run") {
    return index;
  }

  flags.dryRun = true;
  return index;
}

/**
 * Handle the --ignore-pattern flag, collecting ignore patterns for ESLint integration
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE - Support ESLint configuration integration
 */
function handleIgnorePatternFlag(
  flags: ParsedFlags,
  args: string[],
  index: number,
): number {
  if (args[index] !== "--ignore-pattern" || !isNextValueString(args, index)) {
    return index;
  }

  if (!flags.ignorePatterns) {
    flags.ignorePatterns = [];
  }
  flags.ignorePatterns.push(args[index + 1]);
  return index + 1;
}

/**
 * Handle a single CLI argument and update the flags accordingly.
 *
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-SAFE - Provide predictable, minimal argument parsing
 */
function applyFlag(flags: ParsedFlags, args: string[], index: number): number {
  const afterRoot = handleRootFlag(flags, args, index);
  if (afterRoot !== index) {
    return afterRoot;
  }

  const afterJson = handleJsonFlag(flags, args, index);
  if (afterJson !== index) {
    return afterJson;
  }

  const afterFormat = handleFormatFlag(flags, args, index);
  if (afterFormat !== index) {
    return afterFormat;
  }

  const afterFrom = handleFromFlag(flags, args, index);
  if (afterFrom !== index) {
    return afterFrom;
  }

  const afterTo = handleToFlag(flags, args, index);
  if (afterTo !== index) {
    return afterTo;
  }

  const afterDryRun = handleDryRunFlag(flags, args, index);
  if (afterDryRun !== index) {
    return afterDryRun;
  }

  const afterIgnorePattern = handleIgnorePatternFlag(flags, args, index);
  if (afterIgnorePattern !== index) {
    return afterIgnorePattern;
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

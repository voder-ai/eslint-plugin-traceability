/**
 * Helpers for @implements annotation validation used by valid-annotation-format.
 *
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-IMPLEMENTS-PARSE - Parse @implements annotations without affecting @story/@req
 * @req REQ-FORMAT-VALIDATION - Validate @implements story path and requirement IDs
 * @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments
 */
import type { ResolvedAnnotationOptions } from "./valid-annotation-options";
import { buildReqErrorMessage } from "./valid-annotation-utils";

/**
 * Minimum number of tokens required for a valid @implements value:
 *   - one story path
 *   - at least one requirement ID
 *
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-IMPLEMENTS-PARSE
 */
export const MIN_IMPLEMENTS_TOKENS = 2;

/**
 * Report a completely missing @implements value (no story path or req IDs).
 *
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-FORMAT-VALIDATION
 */
export function reportMissingImplementsValue(
  context: any,
  comment: any,
  options: ResolvedAnnotationOptions,
): void {
  const { storyExample, reqExample } = options;
  context.report({
    node: comment as any,
    messageId: "invalidImplementsFormat",
    data: {
      details: `Missing story path and requirement IDs for @implements annotation. Expected a value like "${storyExample} ${reqExample}".`,
    },
  });
}

/**
 * Report a value that has only a story path and no requirement IDs.
 *
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-FORMAT-VALIDATION
 */
export function reportMissingImplementsReqIds(
  context: any,
  comment: any,
  options: ResolvedAnnotationOptions,
): void {
  const { storyExample, reqExample } = options;
  context.report({
    node: comment as any,
    messageId: "invalidImplementsFormat",
    data: {
      details: `Missing requirement IDs for @implements annotation. Expected a value like "${storyExample} ${reqExample}".`,
    },
  });
}

/**
 * Report an invalid story path inside @implements.
 *
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-FORMAT-VALIDATION
 */
export function reportInvalidImplementsStoryPath(
  context: any,
  comment: any,
  storyPath: string,
  options: ResolvedAnnotationOptions,
): void {
  const { storyExample } = options;
  context.report({
    node: comment as any,
    messageId: "invalidImplementsFormat",
    data: {
      details: `Invalid story path "${storyPath}" for @implements annotation. Expected a path like "${storyExample}".`,
    },
  });
}

/**
 * Report an invalid requirement ID token inside @implements.
 *
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-FORMAT-VALIDATION
 * @req REQ-MIXED-SUPPORT
 */
export function reportInvalidImplementsReqId(
  context: any,
  comment: any,
  reqId: string,
  options: ResolvedAnnotationOptions,
): void {
  context.report({
    node: comment as any,
    messageId: "invalidReqFormat",
    data: {
      details: buildReqErrorMessage("invalid", reqId, options),
    },
  });
}

type ImplementsDeps = {
  MIN_IMPLEMENTS_TOKENS: number;
  reportMissingImplementsValue: typeof reportMissingImplementsValue;
  reportMissingImplementsReqIds: typeof reportMissingImplementsReqIds;
  reportInvalidImplementsStoryPath: typeof reportInvalidImplementsStoryPath;
  reportInvalidImplementsReqId: typeof reportInvalidImplementsReqId;
};

type ParsedImplementsTokens = {
  storyPath: string;
  reqIds: string[];
};

/**
 * Prepare and validate the token array for an @implements value.
 *
 * Returns { storyPath, reqIds } when tokens are present and structurally valid,
 * or null when a missing-value condition has been reported.
 */
function parseImplementsTokens(
  deps: ImplementsDeps,
  context: any,
  comment: any,
  rest: {
    rawValue: string | null | undefined;
    options: ResolvedAnnotationOptions;
  },
): ParsedImplementsTokens | null {
  const {
    MIN_IMPLEMENTS_TOKENS,
    reportMissingImplementsValue,
    reportMissingImplementsReqIds,
  } = deps;

  const { rawValue, options } = rest;
  const value = rawValue?.trim() ?? "";

  if (!value) {
    reportMissingImplementsValue(context, comment, options);
    return null;
  }

  const tokens = value.split(/\s+/);

  if (tokens.length < MIN_IMPLEMENTS_TOKENS) {
    reportMissingImplementsReqIds(context, comment, options);
    return null;
  }

  const [storyPath, ...reqIds] = tokens;
  return { storyPath, reqIds };
}

/**
 * Validate the parsed storyPath and reqIds against the provided patterns and
 * delegate reporting of any invalid tokens.
 */
function validateImplementsTokens(
  deps: ImplementsDeps,
  context: any,
  comment: any,
  rest: { parsed: ParsedImplementsTokens; options: ResolvedAnnotationOptions },
): void {
  const { reportInvalidImplementsStoryPath, reportInvalidImplementsReqId } =
    deps;
  const { parsed, options } = rest;
  const { storyPath, reqIds } = parsed;

  if (!options.storyPattern.test(storyPath)) {
    reportInvalidImplementsStoryPath(context, comment, storyPath, options);
    return;
  }

  for (const reqId of reqIds) {
    if (!options.reqPattern.test(reqId)) {
      reportInvalidImplementsReqId(context, comment, reqId, options);
    }
  }
}

/**
 * Validate an @implements annotation value.
 *
 * This helper encapsulates the logic previously in valid-annotation-format.ts:
 *   - trims the raw value
 *   - splits into tokens
 *   - enforces MIN_IMPLEMENTS_TOKENS
 *   - validates the story path using options.storyPattern
 *   - validates each requirement ID using options.reqPattern
 *   - delegates reporting to the provided helpers
 *
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-IMPLEMENTS-PARSE
 * @req REQ-FORMAT-VALIDATION
 * @req REQ-MIXED-SUPPORT
 */
export function validateImplementsAnnotationHelper(
  deps: ImplementsDeps,
  context: any,
  comment: any,
  args: {
    rawValue: string | null | undefined;
    options: ResolvedAnnotationOptions;
  },
): void {
  const { rawValue, options } = args;
  const parsed = parseImplementsTokens(deps, context, comment, {
    rawValue,
    options,
  });

  if (!parsed) {
    return;
  }

  validateImplementsTokens(deps, context, comment, { parsed, options });
}

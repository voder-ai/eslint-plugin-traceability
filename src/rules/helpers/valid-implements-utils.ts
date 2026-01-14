/* eslint-disable traceability/valid-req-reference */
/**
 * Helpers for `@supports` annotation validation used by valid-annotation-format.
 *
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-SUPPORTS-PARSE - Parse `@supports` annotations without affecting `@story`/`@req`
 * @req REQ-FORMAT-VALIDATION - Validate `@supports` story path and requirement IDs
 * @req REQ-MIXED-SUPPORT - Support mixed `@story`/`@req`/`@supports` usage in comments
 */
import type { ResolvedAnnotationOptions } from "./valid-annotation-options";
import { buildReqErrorMessage } from "./valid-annotation-utils";

/**
 * Minimum number of tokens required for a valid `@supports` value:
 *   - one story path
 *   - at least one requirement ID
 *
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-SUPPORTS-PARSE
 */
export const MIN_IMPLEMENTS_TOKENS = 2;

/**
 * Report a completely missing `@supports` value (no story path or req IDs).
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
      details: `Missing story path and requirement IDs for @supports annotation. Expected a value like "${storyExample} ${reqExample}".`,
    },
  });
}

/**
 * Report a `@supports` value that has only a story path and no requirement IDs.
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
      details: `Missing requirement IDs for @supports annotation. Expected a value like "${storyExample} ${reqExample}".`,
    },
  });
}

/**
 * Report an invalid story path inside `@supports`.
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
      details: `Invalid story path "${storyPath}" for @supports annotation. Expected a path like "${storyExample}".`,
    },
  });
}

/**
 * Report an invalid requirement ID token inside `@supports`.
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
 * Parse the raw token stream for an @implements annotation into a structured
 * representation with a single storyPath and an array of requirement IDs.
 *
 * Handles trimming, token splitting, and basic structural checks, and reports
 * missing-value conditions via the provided dependency helpers.
 *
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-IMPLEMENTS-TOKENS
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
 * Validate a previously parsed @implements token structure against configured
 * story and requirement patterns, reporting any configuration or format errors
 * via the supplied dependency helpers.
 *
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-IMPLEMENTS-TOKENS
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
 * Validate a `@supports` annotation value.
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
 * @req REQ-SUPPORTS-PARSE
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

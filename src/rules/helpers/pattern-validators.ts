/**
 * Pattern validation helpers for valid-annotation-format options.
 *
 * @story docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md
 * @req REQ-REGEX-VALIDATION - Validate that configured patterns are valid regular expressions
 */

/**
 * Build an error message for an invalid regex pattern.
 *
 * @supports docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md REQ-REGEX-VALIDATION
 */
export function buildInvalidRegexError(field: string, pattern: string): string {
  return `Invalid regular expression for option "${field}": "${pattern}"`;
}

/**
 * Arguments for the resolvePattern helper.
 */
export interface ResolvePatternArgs {
  nestedPattern: string | undefined;
  nestedFieldName: string;
  flatPattern: string | undefined;
  flatFieldName: string;
  defaultPattern: RegExp;
  errors?: string[];
}

/**
 * Resolve a user-configured regex pattern, handling both nested and flat
 * configuration shapes and accumulating validation errors.
 *
 * @story docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md
 * @req REQ-PATTERN-CONFIG
 * @req REQ-REGEX-VALIDATION
 * @req REQ-BACKWARD-COMPAT
 */
export function resolvePattern({
  nestedPattern,
  nestedFieldName,
  flatPattern,
  flatFieldName,
  defaultPattern,
  errors,
}: ResolvePatternArgs): RegExp {
  const effective =
    typeof nestedPattern === "string"
      ? { value: nestedPattern, field: nestedFieldName }
      : typeof flatPattern === "string"
        ? { value: flatPattern, field: flatFieldName }
        : null;

  if (!effective) {
    // @supports docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md REQ-PATTERN-CONFIG
    return defaultPattern;
  }

  try {
    // @supports docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md REQ-REGEX-VALIDATION
    return new RegExp(effective.value);
  } catch {
    // @supports docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md REQ-REGEX-VALIDATION
    const error = buildInvalidRegexError(effective.field, effective.value);
    if (errors) {
      // @supports docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md REQ-REGEX-VALIDATION
      errors.push(error);
    }
    return defaultPattern;
  }
}

/**
 * Resolve an example string, preferring nested over flat configuration,
 * and falling back to the provided default when necessary.
 *
 * @story docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md
 * @req REQ-EXAMPLE-MESSAGES
 * @req REQ-BACKWARD-COMPAT
 */
export function resolveExample(
  nestedExample: string | undefined,
  flatExample: string | undefined,
  defaultExample: string,
): string {
  if (typeof nestedExample === "string" && nestedExample.trim()) {
    // @supports docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md REQ-EXAMPLE-MESSAGES
    return nestedExample;
  }

  if (typeof flatExample === "string" && flatExample.trim()) {
    // @supports docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md REQ-EXAMPLE-MESSAGES
    return flatExample;
  }

  return defaultExample;
}

/**
 * Shared option handling for the valid-annotation-format rule.
 *
 * @story docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md
 * @req REQ-PATTERN-CONFIG - Support configuration of custom story path and requirement ID patterns
 * @req REQ-REGEX-VALIDATION - Validate that configured patterns are valid regular expressions
 * @req REQ-BACKWARD-COMPAT - Maintain current behavior when no custom patterns configured
 * @req REQ-EXAMPLE-MESSAGES - Support optional example strings in error messages
 * @req REQ-SCHEMA-VALIDATION - Use JSON Schema to validate configuration options
 */
export interface AnnotationRuleOptions {
  story?: {
    /**
     * Regex (string) the collapsed story path must match.
     * Default: /^docs\/stories\/[0-9]+\.[0-9]+-DEV-[\w-]+\.story\.md$/
     */
    pattern?: string;
    /**
     * Human-readable example path used in error messages.
     * Default: "docs/stories/005.0-DEV-EXAMPLE.story.md"
     */
    example?: string;
  };
  req?: {
    /**
     * Regex (string) the collapsed requirement ID must match.
     * Default: /^REQ-[A-Z0-9-]+$/
     */
    pattern?: string;
    /**
     * Human-readable example requirement ID used in error messages.
     * Default: "REQ-EXAMPLE"
     */
    example?: string;
  };

  /**
   * Shorthand for story.pattern.
   * Regex (string) the collapsed story path must match.
   */
  storyPathPattern?: string;
  /**
   * Shorthand for story.example.
   * Human-readable example story path used in error messages.
   */
  storyPathExample?: string;

  /**
   * Shorthand for req.pattern.
   * Regex (string) the collapsed requirement ID must match.
   */
  requirementIdPattern?: string;
  /**
   * Shorthand for req.example.
   * Human-readable example requirement ID used in error messages.
   */
  requirementIdExample?: string;
}

/**
 * Resolved, runtime-ready options for the rule.
 */
export interface ResolvedAnnotationOptions {
  storyPattern: RegExp;
  storyExample: string;
  reqPattern: RegExp;
  reqExample: string;
}

function getDefaultStoryPattern(): RegExp {
  return /^docs\/stories\/[0-9]+\.[0-9]+-DEV-[\w-]+\.story\.md$/;
}

function getDefaultStoryExample(): string {
  return "docs/stories/005.0-DEV-EXAMPLE.story.md";
}

function getDefaultReqPattern(): RegExp {
  return /^REQ-[A-Z0-9-]+$/;
}

export function getDefaultReqExample(): string {
  return "REQ-EXAMPLE";
}

/**
 * Global cache of the last resolved options for helpers that need access
 * without having options explicitly passed in.
 */
let resolvedDefaults: ResolvedAnnotationOptions = {
  storyPattern: getDefaultStoryPattern(),
  storyExample: getDefaultStoryExample(),
  reqPattern: getDefaultReqPattern(),
  reqExample: getDefaultReqExample(),
};

/**
 * Collected configuration errors encountered while resolving options.
 */
let optionErrors: string[] = [];

export function getResolvedDefaults(): ResolvedAnnotationOptions {
  return resolvedDefaults;
}

export function getOptionErrors(): string[] {
  return optionErrors;
}

/**
 * Build a stable, engine-independent configuration error message
 * for invalid regex options.
 */
function buildInvalidRegexError(field: string, pattern: string): string {
  return `Invalid regular expression for option "${field}": "${pattern}"`;
}

/**
 * Normalize raw rule options into a single AnnotationRuleOptions object.
 *
 * @story docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md
 * @req REQ-PATTERN-CONFIG
 * @req REQ-BACKWARD-COMPAT
 */
function normalizeUserOptions(
  rawOptions: unknown[],
): AnnotationRuleOptions | undefined {
  if (!rawOptions || rawOptions.length === 0) {
    return undefined;
  }

  const first = rawOptions[0];
  if (!first || typeof first !== "object") {
    return undefined;
  }

  return first as AnnotationRuleOptions;
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
// eslint-disable-next-line max-params -- Small, centralized helper; keeping parameters explicit is clearer than introducing an options object here.
function resolvePattern(
  nestedPattern: string | undefined,
  nestedFieldName: string,
  flatPattern: string | undefined,
  flatFieldName: string,
  defaultPattern: RegExp,
): RegExp {
  const effective =
    typeof nestedPattern === "string"
      ? { value: nestedPattern, field: nestedFieldName }
      : typeof flatPattern === "string"
        ? { value: flatPattern, field: flatFieldName }
        : null;

  if (!effective) {
    return defaultPattern;
  }

  try {
    return new RegExp(effective.value);
  } catch {
    optionErrors.push(buildInvalidRegexError(effective.field, effective.value));
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
function resolveExample(
  nestedExample: string | undefined,
  flatExample: string | undefined,
  defaultExample: string,
): string {
  if (typeof nestedExample === "string" && nestedExample.trim()) {
    return nestedExample;
  }

  if (typeof flatExample === "string" && flatExample.trim()) {
    return flatExample;
  }

  return defaultExample;
}

/**
 * Resolve user options into concrete, validated configuration.
 * Falls back to existing defaults when options are not provided or invalid.
 */
export function resolveOptions(
  rawOptions: unknown[],
): ResolvedAnnotationOptions {
  optionErrors = [];

  const user = normalizeUserOptions(rawOptions);

  const nestedStoryPattern = user?.story?.pattern;
  const flatStoryPattern = user?.storyPathPattern;
  const nestedStoryExample = user?.story?.example;
  const flatStoryExample = user?.storyPathExample;

  const nestedReqPattern = user?.req?.pattern;
  const flatReqPattern = user?.requirementIdPattern;
  const nestedReqExample = user?.req?.example;
  const flatReqExample = user?.requirementIdExample;

  const storyPattern = resolvePattern(
    nestedStoryPattern,
    "story.pattern",
    flatStoryPattern,
    "storyPathPattern",
    getDefaultStoryPattern(),
  );

  const reqPattern = resolvePattern(
    nestedReqPattern,
    "req.pattern",
    flatReqPattern,
    "requirementIdPattern",
    getDefaultReqPattern(),
  );

  const storyExample = resolveExample(
    nestedStoryExample,
    flatStoryExample,
    getDefaultStoryExample(),
  );

  const reqExample = resolveExample(
    nestedReqExample,
    flatReqExample,
    getDefaultReqExample(),
  );

  resolvedDefaults = {
    storyPattern,
    storyExample,
    reqPattern,
    reqExample,
  };

  return resolvedDefaults;
}

/**
 * Build the JSON schema for rule options.
 */
export function getRuleSchema() {
  return [
    {
      type: "object",
      properties: {
        story: {
          type: "object",
          properties: {
            pattern: { type: "string" },
            example: { type: "string" },
          },
          additionalProperties: false,
        },
        req: {
          type: "object",
          properties: {
            pattern: { type: "string" },
            example: { type: "string" },
          },
          additionalProperties: false,
        },
        storyPathPattern: { type: "string" },
        storyPathExample: { type: "string" },
        requirementIdPattern: { type: "string" },
        requirementIdExample: { type: "string" },
      },
      additionalProperties: false,
    },
  ];
}

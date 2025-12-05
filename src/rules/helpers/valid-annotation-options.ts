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

  /**
   * Global toggle for auto-fix behavior in valid-annotation-format.
   * When false, no automatic suffix-normalization fixes are applied.
   */
  autoFix?: boolean;
}

/**
 * Resolved, runtime-ready options for the rule.
 */
export interface ResolvedAnnotationOptions {
  storyPattern: RegExp;
  storyExample: string;
  reqPattern: RegExp;
  reqExample: string;
  autoFix: boolean;
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
  autoFix: true,
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

interface ResolvePatternArgs {
  nestedPattern: string | undefined;
  nestedFieldName: string;
  flatPattern: string | undefined;
  flatFieldName: string;
  defaultPattern: RegExp;
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
function resolvePattern({
  nestedPattern,
  nestedFieldName,
  flatPattern,
  flatFieldName,
  defaultPattern,
}: ResolvePatternArgs): RegExp {
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

function getUserOptions(
  rawOptions: unknown[],
): AnnotationRuleOptions | undefined {
  return normalizeUserOptions(rawOptions);
}

function resolveAutoFixFlag(user: AnnotationRuleOptions | undefined): boolean {
  const autoFixFlag = user?.autoFix;
  return typeof autoFixFlag === "boolean" ? autoFixFlag : true;
}

function resolveStoryPattern(
  nestedStoryPattern: string | undefined,
  flatStoryPattern: string | undefined,
): RegExp {
  return resolvePattern({
    nestedPattern: nestedStoryPattern,
    nestedFieldName: "story.pattern",
    flatPattern: flatStoryPattern,
    flatFieldName: "storyPathPattern",
    defaultPattern: getDefaultStoryPattern(),
  });
}

function resolveReqPattern(
  nestedReqPattern: string | undefined,
  flatReqPattern: string | undefined,
): RegExp {
  return resolvePattern({
    nestedPattern: nestedReqPattern,
    nestedFieldName: "req.pattern",
    flatPattern: flatReqPattern,
    flatFieldName: "requirementIdPattern",
    defaultPattern: getDefaultReqPattern(),
  });
}

function resolveStoryExample(
  nestedStoryExample: string | undefined,
  flatStoryExample: string | undefined,
): string {
  return resolveExample(
    nestedStoryExample,
    flatStoryExample,
    getDefaultStoryExample(),
  );
}

function resolveReqExample(
  nestedReqExample: string | undefined,
  flatReqExample: string | undefined,
): string {
  return resolveExample(
    nestedReqExample,
    flatReqExample,
    getDefaultReqExample(),
  );
}

function getStoryPatternInputs(user: AnnotationRuleOptions | undefined): {
  nestedStoryPattern: string | undefined;
  flatStoryPattern: string | undefined;
} {
  return {
    nestedStoryPattern: user?.story?.pattern,
    flatStoryPattern: user?.storyPathPattern,
  };
}

function getStoryExampleInputs(user: AnnotationRuleOptions | undefined): {
  nestedStoryExample: string | undefined;
  flatStoryExample: string | undefined;
} {
  return {
    nestedStoryExample: user?.story?.example,
    flatStoryExample: user?.storyPathExample,
  };
}

function getReqPatternInputs(user: AnnotationRuleOptions | undefined): {
  nestedReqPattern: string | undefined;
  flatReqPattern: string | undefined;
} {
  return {
    nestedReqPattern: user?.req?.pattern,
    flatReqPattern: user?.requirementIdPattern,
  };
}

function getReqExampleInputs(user: AnnotationRuleOptions | undefined): {
  nestedReqExample: string | undefined;
  flatReqExample: string | undefined;
} {
  return {
    nestedReqExample: user?.req?.example,
    flatReqExample: user?.requirementIdExample,
  };
}

function resolveOptionsInternal(
  user: AnnotationRuleOptions | undefined,
): ResolvedAnnotationOptions {
  const { nestedStoryPattern, flatStoryPattern } = getStoryPatternInputs(user);
  const { nestedStoryExample, flatStoryExample } = getStoryExampleInputs(user);
  const { nestedReqPattern, flatReqPattern } = getReqPatternInputs(user);
  const { nestedReqExample, flatReqExample } = getReqExampleInputs(user);

  const autoFix = resolveAutoFixFlag(user);

  const storyPattern = resolveStoryPattern(
    nestedStoryPattern,
    flatStoryPattern,
  );
  const reqPattern = resolveReqPattern(nestedReqPattern, flatReqPattern);
  const storyExample = resolveStoryExample(
    nestedStoryExample,
    flatStoryExample,
  );
  const reqExample = resolveReqExample(nestedReqExample, flatReqExample);

  return {
    storyPattern,
    storyExample,
    reqPattern,
    reqExample,
    autoFix,
  };
}

/**
 * Resolve user options into concrete, validated configuration.
 * Falls back to existing defaults when options are not provided or invalid.
 */
export function resolveOptions(
  rawOptions: unknown[],
): ResolvedAnnotationOptions {
  optionErrors = [];

  const user = getUserOptions(rawOptions);
  const resolved = resolveOptionsInternal(user);

  resolvedDefaults = resolved;
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

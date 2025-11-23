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
     * Default: /^docs\/_stories\/[0-9]+\.[0-9]+-DEV-[\w-]+\.story\.md$/
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
 * Resolve user options into concrete, validated configuration.
 * Falls back to existing defaults when options are not provided or invalid.
 */
export function resolveOptions(
  rawOptions: unknown[],
): ResolvedAnnotationOptions {
  const user: AnnotationRuleOptions | undefined =
    rawOptions && rawOptions.length > 0 && typeof rawOptions[0] === "object"
      ? (rawOptions[0] as AnnotationRuleOptions)
      : undefined;

  let storyPattern = getDefaultStoryPattern();
  let storyExample = getDefaultStoryExample();
  let reqPattern = getDefaultReqPattern();
  let reqExample = getDefaultReqExample();

  if (user?.story) {
    if (typeof user.story.pattern === "string") {
      try {
        storyPattern = new RegExp(user.story.pattern);
      } catch {
        // ignore invalid pattern and keep default
      }
    }
    if (typeof user.story.example === "string" && user.story.example.trim()) {
      storyExample = user.story.example;
    }
  }

  if (user?.req) {
    if (typeof user.req.pattern === "string") {
      try {
        reqPattern = new RegExp(user.req.pattern);
      } catch {
        // ignore invalid pattern and keep default
      }
    }
    if (typeof user.req.example === "string" && user.req.example.trim()) {
      reqExample = user.req.example;
    }
  }

  resolvedDefaults = {
    storyPattern,
    storyExample,
    reqPattern,
    reqExample,
  };

  return resolvedDefaults;
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

export function getResolvedDefaults(): ResolvedAnnotationOptions {
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
      },
      additionalProperties: false,
    },
  ];
}

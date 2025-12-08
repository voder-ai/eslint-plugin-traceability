/**
 * Helper utilities for the require-test-traceability rule.
 *
 * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-PATTERN-DETECT REQ-TEST-FRAMEWORK-COMPAT
 * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-TEMPLATE REQ-TEST-FIX-PREFIX-FORMAT REQ-TEST-FIX-SAFE REQ-TEST-FIX-PRESERVE REQ-TEST-FIX-PLACEHOLDER REQ-TEST-FIX-NO-INFERENCE
 */
const NOT_FOUND = -1;
const REQ_PREFIX_LENGTH = 3;
const QUOTES = ["'", '"', "`"] as const;

export type TestTraceabilityAutoFixOptions = {
  autoFixTestTemplate: boolean;
  testSupportsTemplate?: string;
};

export type CallExpressionOptions = {
  sourceCode: any;
  describeRegex: RegExp;
  requireDescribeStory: boolean;
  requireTestReqPrefix: boolean;
  autoFixTestPrefixFormat: boolean;
};

/**
 * Determine if a file should be treated as a test file based on patterns.
 *
 * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-PATTERN-DETECT
 */
export function determineIsTestFile(
  filename: string,
  rawPatterns: string[] = [
    "/tests/",
    "/test/",
    "/__tests__",
    ".test.",
    ".spec.",
  ],
): boolean {
  return rawPatterns.some((pattern: string) =>
    filename.includes(pattern.replace("**", "")),
  );
}

/**
 * Build the placeholder @supports template comment for a test file.
 *
 * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-TEMPLATE REQ-TEST-FIX-PLACEHOLDER
 */
function buildSupportsTemplateComment(customTemplate?: string): string {
  const baseTemplate =
    (customTemplate && customTemplate.trim()) ||
    "@supports docs/stories/XXX.X-STORY-NAME.story.md REQ-XXX-YYY REQ-XXX-ZZZ";

  const lines = [
    "/**",
    ` * ${baseTemplate}`,
    " * TODO: Replace the placeholder story path and REQ-IDs with real values for this test file.",
    " */",
    "",
  ];

  return lines.join("\n");
}

/**
 * Insert the file-level @supports template comment at a safe location.
 *
 * The template is inserted after a shebang line if present, otherwise at the
 * very start of the file. This preserves executable semantics while adding
 * only comment text.
 *
 * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-TEMPLATE REQ-TEST-FIX-SAFE REQ-TEST-FIX-PRESERVE REQ-TEST-FIX-NO-INFERENCE
 */
function insertSupportsTemplate(
  fixer: any,
  sourceCode: any,
  customTemplate?: string,
) {
  const text: string = sourceCode.text || "";
  let insertIndex = 0;

  // Preserve shebang: it must remain the very first characters in the file.
  if (text.startsWith("#!")) {
    const firstNewline = text.indexOf("\n");
    insertIndex = firstNewline === NOT_FOUND ? text.length : firstNewline + 1;
  }

  const templateComment = buildSupportsTemplateComment(customTemplate);
  return fixer.insertTextBeforeRange(
    [insertIndex, insertIndex],
    templateComment,
  );
}

/**
 * Ensure the file has a @supports annotation listing tested requirements.
 *
 * When auto-fix is enabled, a placeholder @supports JSDoc is inserted at the
 * top of the file (after any shebang) using a safe, non-semantic template.
 *
 * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-FILE-SUPPORTS REQ-TEST-SUPPORTS-VALID
 * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-TEMPLATE REQ-TEST-FIX-PLACEHOLDER REQ-TEST-FIX-SAFE REQ-TEST-FIX-PRESERVE REQ-TEST-FIX-NO-INFERENCE
 */
export function ensureFileSupportsAnnotation(
  context: any,
  sourceCode: any,
  autoFixOptions: TestTraceabilityAutoFixOptions,
): void {
  const fileComments = sourceCode.getAllComments() || [];

  const fileHasSupports = fileComments.some((comment: any) =>
    /@supports\b/.test(comment.value || ""),
  );

  if (!fileHasSupports) {
    const node =
      (fileComments[0] as any) || (sourceCode.ast && (sourceCode.ast as any));

    context.report({
      node: node as any,
      messageId: "missingFileSupports",
      fix:
        autoFixOptions.autoFixTestTemplate === false
          ? undefined
          : (fixer: any) =>
              insertSupportsTemplate(
                fixer,
                sourceCode,
                autoFixOptions.testSupportsTemplate,
              ),
    });
  }
}

/**
 * Check if a callee name corresponds to a test framework function.
 *
 * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-FRAMEWORK-COMPAT
 */
function isTestCallName(name: string): boolean {
  return ["describe", "it", "test", "context"].includes(name);
}

/**
 * Extract the test framework call name from a CallExpression callee.
 *
 * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-FRAMEWORK-COMPAT
 */
function getCalleeName(node: any): string | null {
  if (node.callee.type === "Identifier") {
    return node.callee.name;
  }
  if (
    node.callee.type === "MemberExpression" &&
    node.callee.object.type === "Identifier"
  ) {
    return node.callee.object.name;
  }
  return null;
}

/**
 * Extract the first string literal argument from a CallExpression, if present.
 *
 * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-DESCRIBE-STORY REQ-TEST-IT-REQ-PREFIX
 */
function getFirstArgumentLiteral(node: any): string | null {
  const arg = node.arguments && node.arguments[0];
  if (!arg) return null;
  if (arg.type === "Literal" && typeof arg.value === "string") {
    return arg.value;
  }
  return null;
}

/**
 * Normalize a raw REQ identifier string to canonical REQ-XXX format.
 *
 * This helper performs only local, format-level normalization without
 * inferring new requirement IDs.
 *
 * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-PREFIX-FORMAT REQ-TEST-FIX-NO-INFERENCE
 */
function normalizeReqId(raw: string): string {
  let id = raw.trim().toUpperCase();

  if (!id.startsWith("REQ")) {
    return id;
  }

  let rest = id.slice(REQ_PREFIX_LENGTH);

  // Drop leading separators after "REQ"
  rest = rest.replace(/^[-_\s:]+/, "");
  // Convert internal whitespace/underscores to hyphens
  rest = rest.replace(/[\s_]+/g, "-");
  // Collapse multiple hyphens
  rest = rest.replace(/-+/g, "-");

  return rest ? `REQ-${rest}` : "REQ-";
}

/**
 * Normalize malformed [REQ-XXX] prefixes in test names.
 *
 * Handles cases such as:
 * - "[ REQ-XXX ] ..."  -> "[REQ-XXX] ..."
 * - "[REQ_XXX] ..."    -> "[REQ-XXX] ..."
 * - "(REQ-XXX) ..."    -> "[REQ-XXX] ..."
 * - "[req-xxx] ..."    -> "[REQ-XXX] ..."
 *
 * Only operates when a REQ identifier is already present at the start of the
 * string; it never invents new IDs.
 *
 * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-PREFIX-FORMAT REQ-TEST-FIX-SAFE REQ-TEST-FIX-PRESERVE REQ-TEST-FIX-NO-INFERENCE
 */
function normalizeReqPrefixInDescription(description: string): string | null {
  const canonicalPattern = /^\[REQ-[^\]]+]/;
  if (canonicalPattern.test(description)) {
    return null;
  }

  // Leading square brackets with optional spacing.
  const squareMatch = description.match(/^\[\s*(REQ[^\]]*?)\s*](.*)$/i);
  if (squareMatch) {
    const normalizedId = normalizeReqId(squareMatch[1]);
    return `[${normalizedId}]${squareMatch[2] ?? ""}`;
  }

  // Leading parentheses with optional spacing.
  const parenMatch = description.match(/^\(\s*(REQ[^)]*?)\s*\)(.*)$/i);
  if (parenMatch) {
    const normalizedId = normalizeReqId(parenMatch[1]);
    return `[${normalizedId}]${parenMatch[2] ?? ""}`;
  }

  return null;
}

/**
 * Create a string literal with the same quote style as the original node.
 *
 * This helper rewrites only the literal value while preserving the original
 * quoting character (`'`, `"`, or `` ` ``) and escaping rules.
 *
 * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-PRESERVE
 */
function createUpdatedStringLiteralRaw(
  originalNode: any,
  newValue: string,
  sourceCode: any,
): string {
  const raw = sourceCode.getText(originalNode);
  const firstChar = raw[0];

  if (QUOTES.includes(firstChar as (typeof QUOTES)[number])) {
    const quote = firstChar;
    const escaped = newValue
      .replace(/\\/g, "\\\\")
      .replace(new RegExp(`\\${quote}`, "g"), `\\${quote}`);
    return `${quote}${escaped}${quote}`;
  }

  // Fallback: let JSON.stringify choose a safe representation.
  return JSON.stringify(newValue);
}

/**
 * Validate describe() calls to ensure they include a story reference
 * matching the configured describeRegex when required.
 *
 * @story docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md
 * @req REQ-TEST-DESCRIBE-STORY
 */
function handleDescribeCall(
  context: any,
  node: any,
  description: string,
  options: { describeRegex: RegExp; requireDescribeStory: boolean },
): void {
  const { describeRegex, requireDescribeStory } = options;
  if (!requireDescribeStory) return;
  if (!describeRegex.test(description)) {
    context.report({
      node: node as any,
      messageId: "missingDescribeStory",
    });
  }
}

/**
 * Validate it() and test() calls to ensure their descriptions start with a
 * [REQ-XXX] prefix, optionally normalizing malformed prefixes when enabled.
 *
 * @story docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md
 * @req REQ-TEST-IT-REQ-PREFIX
 */
function handleItOrTestCall(
  context: any,
  node: any,
  description: string,
  options: CallExpressionOptions,
): void {
  const { sourceCode, requireTestReqPrefix, autoFixTestPrefixFormat } = options;

  if (!requireTestReqPrefix) return;

  if (!/^\[REQ-[^\]]+]/.test(description)) {
    const normalizedDescription =
      autoFixTestPrefixFormat !== false
        ? normalizeReqPrefixInDescription(description)
        : null;

    context.report({
      node: node as any,
      messageId: "missingReqPrefix",
      ...(autoFixTestPrefixFormat !== false &&
      normalizedDescription !== null &&
      node.arguments &&
      node.arguments[0] &&
      node.arguments[0].type === "Literal" &&
      typeof node.arguments[0].value === "string"
        ? {
            fix(fixer: any) {
              const literalNode = node.arguments[0];
              const newRaw = createUpdatedStringLiteralRaw(
                literalNode,
                normalizedDescription,
                sourceCode,
              );
              return fixer.replaceText(literalNode, newRaw);
            },
          }
        : {}),
    });
  }
}

/**
 * Build a CallExpression visitor for the main rule create() function.
 *
 * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-DESCRIBE-STORY REQ-TEST-IT-REQ-PREFIX REQ-TEST-NESTED-DESCRIBE REQ-TEST-ERROR-CONTEXT
 * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-PREFIX-FORMAT REQ-TEST-FIX-SAFE REQ-TEST-FIX-PRESERVE REQ-TEST-FIX-NO-INFERENCE
 */
export function handleCallExpression(
  context: any,
  options: CallExpressionOptions,
) {
  const { describeRegex, requireDescribeStory } = options;

  return (node: any) => {
    const calleeName = getCalleeName(node);
    if (!calleeName || !isTestCallName(calleeName)) {
      return;
    }

    const description = getFirstArgumentLiteral(node);
    if (!description) return;

    if (calleeName === "describe") {
      handleDescribeCall(context, node, description, {
        describeRegex,
        requireDescribeStory,
      });
      return;
    }

    if (calleeName === "it" || calleeName === "test") {
      handleItOrTestCall(context, node, description, options);
    }
  };
}

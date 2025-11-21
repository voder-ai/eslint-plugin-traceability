# Last Action Executed (Resumed)

**Timestamp:** 2025-11-21T04:15:55.438Z

**Mode:** Resumed - Completing interrupted cycle

**Action:** Used tool: read_file with input: {"filePath":"user-docs/api-reference.md"}
Used tool: read_file with input: {"filePath":"docs/rules/require-story-annotation.md"}
Used tool: read_file with input: {"filePath":"docs/rules/require-branch-annotation.md"}
Used tool: read_file with input: {"filePath":"docs/rules/valid-story-reference.md"}
Used tool: read_file with input: {"filePath":"src/rules/require-story-annotation.ts"}
Used tool: read_file with input: {"filePath":"src/rules/require-branch-annotation.ts"}
Used tool: read_file with input: {"filePath":"src/rules/valid-story-reference.ts"}
Used tool: read_file with input: {"filePath":"docs/config-presets.md"}
Used tool: read_file with input: {"filePath":"src/index.ts"}
Used tool: read_file with input: {"filePath":"src/rules/valid-req-reference.ts"}
Used tool: read_file with input: {"filePath":"README.md"}
Used tool: read_file with input: {"filePath":"package.json"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-helpers.ts"}
Used tool: read_file with input: {"filePath":"docs/rules/valid-annotation-format.md"}
Used tool: read_file with input: {"filePath":"docs/rules/require-req-annotation.md"}
Used tool: read_file with input: {"filePath":"docs/rules/valid-req-reference.md"}
Used tool: read_file with input: {"filePath":"src/rules/valid-annotation-format.ts"}
Used tool: read_file with input: {"filePath":"src/rules/require-req-annotation.ts"}
Used tool: read_file with input: {"filePath":"src/utils/branch-annotation-helpers.ts"}
Used tool: read_file with input: {"filePath":"docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md"}
Used tool: modify_file with input: {"filePath":"user-docs/api-reference.md","instruction":"1) In the `traceability/require-story-annotation` section, keep the existing option descriptions but move `Default Severity: `error`` out of the bullet list so it appears as its own paragraph line directly under the Options list (remove the leading two spaces so it is no longer part of the last bullet).\n\n2) In the `traceability/require-branch-annotation` section, keep the existing description and `Options:` label, but expand the `branchTypes` option description to make the type and defaults explicit. Replace the current single bullet under `Options:` with:\n\n- `branchTypes` (string[], optional) – AST node types that are treated as significant branches for annotation enforcement. Allowed values: \"IfStatement\", \"SwitchCase\", \"TryStatement\", \"CatchClause\", \"ForStatement\", \"ForOfStatement\", \"ForInStatement\", \"WhileStatement\", \"DoWhileStatement\". Default: [\"IfStatement\", \"SwitchCase\", \"TryStatement\", \"CatchClause\", \"ForStatement\", \"ForOfStatement\", \"ForInStatement\", \"WhileStatement\", \"DoWhileStatement\"]. If an invalid branch type is provided, the rule reports a configuration error for each invalid value.\n\n3) In the `traceability/valid-story-reference` section under `Options`, replace the current JSON-only description with a short introductory sentence plus a bullet list describing each option, followed by the JSON example. Specifically:\n   - Add a sentence: `Configure rule behavior using an options object with these properties:` right after `Options:`.\n   - Then add bullets:\n     - `storyDirectories` (string[], optional) – One or more directories (relative to the project root) to search for story files. Defaults to `[\"docs/stories\", \"stories\"]`.\n     - `allowAbsolutePaths` (boolean, optional) – When `true`, allows absolute story paths (e.g., `/absolute/path/to/story.story.md`). Defaults to `false`.\n     - `requireStoryExtension` (boolean, optional) – When `true` (default), requires the story path to end with `.story.md`. Set to `false` to allow other extensions.\n   - Then keep the existing JSON snippet, but precede it with a label like `Example configuration:`.\n\n4) In the `Configuration Presets` section at the bottom of this file, keep the rule list and severities as-is, but adjust the introductory sentence for the **recommended** preset from `Enables the core traceability rules with their default severities (most at `error`, one at `warn`):` to instead read `Enables the core traceability rules with severities tuned for common usage (most at `error`, with \n`traceability/valid-annotation-format` at `warn` to reduce noise):` so that it clearly calls out the `warn` severity for `traceability/valid-annotation-format` without implying it is the rule's intrinsic default."}
Used tool: modify_file with input: {"filePath":"docs/config-presets.md","instruction":"In the `Recommended Preset` section, keep the code example and the rule list unchanged, but update the descriptive sentence above the list so it no longer claims to use each rule's \"default\" severity.\n\nReplace the sentence:\n\n`This preset enables the following rules with their default severities (most at `error`, one at `warn`):`\n\nwith:\n\n`This preset enables the following rules with severities tuned for common usage (most at `error`, with `traceability/valid-annotation-format` at `warn` to reduce noise):`\n\nDo not change anything else in this file."}
Used tool: modify_file with input: {"filePath":"README.md","instruction":"In the `For advanced configuration` paragraph under `Available Rules`, append a short note that points readers to the rule docs and API reference for detailed options. Replace the final sentence of that paragraph:\n\n`For advanced configuration (per-rule options such as scopes, branch types, and story directory settings), see the individual rule docs in `docs/rules/` and the [API Reference](user-docs/api-reference.md).`\n\nwith:\n\n`For advanced configuration (per-rule options such as scopes, branch types, and story directory settings), see the individual rule docs in \n`docs/rules/` and the [API Reference](user-docs/api-reference.md) for a consolidated view of all rules and their options.`"}
Used tool: search_file_content with input: {"filePath":"src/rules/valid-req-reference.ts","pattern":"@story","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/valid-req-reference.ts","pattern":"@req","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/require-branch-annotation.ts","pattern":"@story","isRegex":false}
Used tool: search_file_content with input: {"filePath":"src/rules/require-branch-annotation.ts","pattern":"@req","isRegex":false}
Used tool: modify_file with input: {"filePath":"src/rules/require-branch-annotation.ts","instruction":"Normalize the leading file-level JSDoc and any inline `@story`/`@req` tags to the documented traceability format:\n\n1. Replace the very first comment block beginning with `/****` with a proper JSDoc block starting with `/**` and each line prefixed by ` * `. Keep the existing description and `@story`/`@req` tags, but ensure there is a blank ` *` separator line between the description and the tags, and remove the trailing inline descriptions after the `@req` IDs so they are just identifiers. The resulting header should look like:\n\n```ts\n/**\n * Rule to enforce @story and @req annotations on significant code branches.\n *\n * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\n * @req REQ-BRANCH-DETECTION\n * @req REQ-CONFIGURABLE-SCOPE\n */\n```\n\n2. In the `create` JSDoc comment above the `create(context)` method, normalize the `@req` tags by stripping the long prose after the IDs so they are just `@req REQ-...` lines, and ensure there is a blank ` *` line before the `@story` tag section. Keep the same `@story` reference.\n\n3. In the inline branch comment above the `if (!Array.isArray(branchTypesOrListener)) {` guard, convert it into a JSDoc-style block comment attached to the `if` statement body rather than using `//` line comments. Specifically, replace:\n\n```ts\n    // Branch configuration guard: if validation returns a listener, use it directly instead of branch-type iteration.\n    // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\n    // @req REQ-CONFIGURABLE-SCOPE - Allow the rule to short-circuit when configuration is invalid or specialized\n    if (!Array.isArray(branchTypesOrListener)) {\n      return branchTypesOrListener;\n    }\n```\n\nwith:\n\n```ts\n    /**\n     * Branch configuration guard: if validation returns a listener, use it directly\n     * instead of branch-type iteration.\n     *\n     * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\n     * @req REQ-CONFIGURABLE-SCOPE\n     */\n    if (!Array.isArray(branchTypesOrListener)) {\n      return branchTypesOrListener;\n    }\n```\n\n4. In the inner `branchHandler` function JSDoc, strip the prose after each `@req` ID so they are just bare identifiers.\n\nDo not alter any TypeScript logic or exports."}
Used tool: modify_file with input: {"filePath":"src/rules/valid-req-reference.ts","instruction":"Normalize traceability annotations to match the documented `@story` / `@req` format and add missing annotations for named inner helpers and significant branches:\n\n1. In the top-of-file rule description JSDoc, keep the existing description, `@story`, and `@req` tags but strip the explanatory prose after each `@req` so they are just `@req REQ-...` lines. Ensure there is a blank ` *` line between the description and the tags.\n\n2. In the `extractStoryPath` JSDoc, keep the `@story` and `@req` tags but strip the explanatory prose after `REQ-DEEP-PARSE` so it is just:\n\n```ts\n * @req REQ-DEEP-PARSE\n```\n\n3. In the `validateReqLine` JSDoc, keep the `@story` and all existing `@req` IDs, but strip the explanatory prose after each requirement so they are just plain IDs (e.g. `* @req REQ-DEEP-PATH`).\n\n4. In the `handleAnnotationLine` JSDoc, keep the `@story` and both `@req` IDs, but strip the prose after them so they are just identifiers.\n\n5. In the `handleComment` JSDoc, keep the `@story` and all `@req` IDs, but strip the prose after them so they are just identifiers.\n\n6. In the inner `comments.forEach` block inside `programListener`, convert the block comment containing `@story`/`@req` tags into a single JSDoc-style comment directly above the `comments.forEach` call (maintaining the same story and requirement IDs) and strip the prose after the IDs so each is just `@req REQ-...`. The comment body can still describe the loop behavior in a sentence or two above the tags.\n\n7. Do not change any TypeScript code or exported structures; only adjust comment formatting and `@story`/`@req` lines as described."}
Used tool: get_git_status with input: {}
Used tool: run_command with input: {"command":"npm","args":["test","--","--passWithNoTests"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","src/rules/require-branch-annotation.ts","src/rules/valid-req-reference.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"docs: align rule options and preset documentation with implementation"}
Used tool: get_git_status with input: {}
Used tool: git_push with input: {}
Used tool: read_file with input: {"filePath":"src/rules/valid-req-reference.ts"}
Used tool: get_github_pipeline_status with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/require-story-core.ts","pattern":"DEFAULT_SCOPE","isRegex":false}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-core.ts","startLine":69,"endLine":120}

**Response:**

```
Here’s what I implemented for the **##NOW** and **##NEXT** sections, plus the updated checklist.

---

## What I changed

### 1) Inspect and align `user-docs/api-reference.md` (NOW + NEXT)

**What I read**

- `user-docs/api-reference.md`
- Rule docs:  
  - `docs/rules/require-story-annotation.md`  
  - `docs/rules/require-branch-annotation.md`  
  - `docs/rules/valid-story-reference.md`
- Rule implementations:  
  - `src/rules/require-story-annotation.ts`  
  - `src/rules/require-branch-annotation.ts`  
  - `src/rules/valid-story-reference.ts`  
  - `src/rules/require-req-annotation.ts`  
  - `src/rules/valid-annotation-format.ts`  
  - `src/rules/valid-req-reference.ts`

**API reference updates**

I updated `user-docs/api-reference.md` so the Options sections accurately reflect the implemented schemas and config behavior:

- **`traceability/require-story-annotation`**
  - Kept the existing option bullets:
    - `scope` (string[], optional) with the correct enum values and default.
    - `exportPriority` ("all" | "exported" | "non-exported", optional) default `"all"`.
  - Moved `Default Severity: \`error\`` out of the bullets to its own paragraph line immediately after the options list, avoiding any ambiguity in the markdown structure.

- **`traceability/require-req-annotation`**
  - Left as-is: `Options: None` and default severity `error` (matches `schema: []` and meta).

- **`traceability/require-branch-annotation`**
  - Replaced the single options bullet with a more explicit description that matches `src/utils/branch-annotation-helpers.ts`:
    - `branchTypes` (string[], optional) – lists all allowed values (`IfStatement`, `SwitchCase`, `TryStatement`, `CatchClause`, `ForStatement`, `ForOfStatement`, `ForInStatement`, `WhileStatement`, `DoWhileStatement`).
    - States the default as the full array.
    - Notes that invalid values cause configuration errors for each invalid type.

- **`traceability/valid-annotation-format`**
  - Left `Options: None` and `Default Severity: error` untouched; implementation has `schema: []` and `docs.recommended: "error"`.

- **`traceability/valid-story-reference`**
  - Replaced the generic JSON-only description with:
    - A short intro: “Configure rule behavior using an options object with these properties:”
    - Bullets:
      - `storyDirectories` (string[], optional) – defaults to `["docs/stories", "stories"]` (matches `defaultStoryDirs` in the rule).
      - `allowAbsolutePaths` (boolean, optional) – default `false` (matches `opts?.allowAbsolutePaths || false`).
      - `requireStoryExtension` (boolean, optional) – default `true` (matches `opts?.requireStoryExtension !== false`).
    - An “Example configuration” JSON snippet showing the rule configuration under `"rules"`.

- **`traceability/valid-req-reference`**
  - Left as `Options: None` with default severity `error` (matches `schema: []` and meta).

- **Configuration presets section (at bottom of API reference)**
  - Wording change only; rule list and severities unchanged:
    - Old: “with their default severities (most at `error`, one at `warn`)"
    - New:  
      `Enables the core traceability rules with severities tuned for common usage (most at \`error\`, with`  
      ``traceability/valid-annotation-format` at `warn` to reduce noise):`
    - This keeps `valid-annotation-format`’s **rule default** as `error` (meta) while explaining the preset’s choice of `warn`.

---

### 2) Compare and align config presets docs with implementation

**What I read**

- `docs/config-presets.md`
- `src/index.ts`

**What I confirmed**

From `src/index.ts`, both `configs.recommended` and `configs.strict` are arrays containing a single config item with:

```ts
rules: {
  "traceability/require-story-annotation": "error",
  "traceability/require-req-annotation": "error",
  "traceability/require-branch-annotation": "error",
  "traceability/valid-annotation-format": "warn",
  "traceability/valid-story-reference": "error",
  "traceability/valid-req-reference": "error",
}
```

Both presets are identical at the moment.

**Docs update**

In `docs/config-presets.md` I updated just the description line for the **Recommended Preset**:

- Old:

  > This preset enables the following rules with their default severities (most at `error`, one at `warn`):

- New:

  > This preset enables the following rules with severities tuned for common usage (most at `error`, with `traceability/valid-annotation-format` at `warn` to reduce noise):

The bullet list of rules and severities, and the **Strict Preset** description remain unchanged and now match `src/index.ts`.

---

### 3) Normalize traceability annotations in rule implementations

**What I read**

- `src/rules/require-branch-annotation.ts`
- `src/rules/valid-req-reference.ts`
- Supporting helper:
  - `src/utils/branch-annotation-helpers.ts` (to understand how branches are handled and where comments matter)

#### `src/rules/require-branch-annotation.ts`

**Issues addressed**

- File-level JSDoc was using `/****` instead of a standard JSDoc `/**`.
- Several `@req` lines had long descriptions appended after the IDs, which we want to avoid for machine-parseable traceability.
- One significant configuration guard (`if (!Array.isArray(branchTypesOrListener))`) used inline `//` comments for the `@story`/`@req` tags instead of a consistent JSDoc-style block.
- Inner handler JSDoc lines also contained prose after requirement IDs.

**Changes**

- **File header**

  Replaced the top-level comment with a normalized JSDoc:

  ```ts
  /**
   * Rule to enforce @story and @req annotations on significant code branches.
   *
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   * @req REQ-BRANCH-DETECTION
   * @req REQ-CONFIGURABLE-SCOPE
   */
  ```

- **`create(context)` JSDoc**

  Kept the description and story reference, but normalized the `@req` lines to bare IDs:

  ```ts
  /**
   * Create visitor for require-branch-annotation rule.
   *
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   * @req REQ-BRANCH-DETECTION
   * @req REQ-CONFIGURABLE-SCOPE
   */
  create(context) { ... }
  ```

- **Configuration guard branch**

  Replaced the three `//` comments above the `if (!Array.isArray(branchTypesOrListener))` guard with a single JSDoc block:

  ```ts
  /**
   * Branch configuration guard: if validation returns a listener, use it directly
   * instead of branch-type iteration.
   *
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   * @req REQ-CONFIGURABLE-SCOPE
   */
  if (!Array.isArray(branchTypesOrListener)) {
    return branchTypesOrListener;
  }
  ```

  This gives the configuration branch a consistent, parseable traceability annotation.

- **Inner `branchHandler` JSDoc**

  Normalized the `@req` lines to bare IDs as well:

  ```ts
  /**
   * Handler for a specific branch node type.
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   * @req REQ-BRANCH-DETECTION
   * @req REQ-CONFIGURABLE-SCOPE
   */
  handlers[type] = function branchHandler(node) { ... };
  ```

No TypeScript logic or exports were changed; only comments were updated.

#### `src/rules/valid-req-reference.ts`

**Issues addressed**

- Many JSDoc blocks had `@req` lines with narrative text after the IDs.
- The block above the `comments.forEach` loop inside `programListener` was an inline block with tags inside that could be better attached directly to the loop as a JSDoc with normalized IDs.

**Changes**

- **File-level header**

  Normalized to:

  ```ts
  /**
   * Rule to validate @req annotation references refer to existing requirements in story files
   *
   * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
   * @req REQ-DEEP-PARSE
   * @req REQ-DEEP-MATCH
   * @req REQ-DEEP-CACHE
   * @req REQ-DEEP-PATH
   */
  ```

- **`extractStoryPath` JSDoc**

  Kept behavior description, and normalized the requirement tag:

  ```ts
  * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
  * @req REQ-DEEP-PARSE
  ```

- **`validateReqLine` JSDoc**

  Kept the description and option details, normalized all requirement tags:

  ```ts
  * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
  * @req REQ-DEEP-PATH
  * @req REQ-DEEP-CACHE
  * @req REQ-DEEP-MATCH
  * @req REQ-DEEP-PARSE
  ```

- **`handleAnnotationLine` JSDoc**

  Now:

  ```ts
  * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
  * @req REQ-DEEP-PARSE
  * @req REQ-DEEP-MATCH
  ```

- **`handleComment` JSDoc**

  Now:

  ```ts
  * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
  * @req REQ-DEEP-PARSE
  * @req REQ-DEEP-MATCH
  * @req REQ-DEEP-CACHE
  ```

- **Inner `comments.forEach` loop in `programListener`**

  Attached a JSDoc directly above the loop and normalized requirement IDs:

  ```ts
  return function Program() {
    const comments = sourceCode.getAllComments() || [];
    /**
     * Process each comment to handle story and requirement annotations.
     *
     * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
     * @req REQ-DEEP-PARSE
     * @req REQ-DEEP-MATCH
     * @req REQ-DEEP-CACHE
     * @req REQ-DEEP-PATH
     */
    comments.forEach((comment: any) => {
      rawStoryPath = handleComment({
        comment,
        context,
        cwd,
        reqCache,
        rawStoryPath,
      });
    });
  };
  ```

- **`create` JSDoc**

  Also normalized to bare IDs:

  ```ts
  * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
  * @req REQ-DEEP-MATCH
  * @req REQ-DEEP-PARSE
  * @req REQ-DEEP-CACHE
  * @req REQ-DEEP-PATH
  ```

Again, no runtime logic changed—only comment formatting and traceability tags.

---

### 4) README configuration options pointer

In `README.md`, under **Available Rules**, I updated the advanced configuration note to be more explicit and point to both rule docs and the API reference:

- Replaced the existing sentence with:

  > For advanced configuration (per-rule options such as scopes, branch types, and story directory settings), see the individual rule docs in  
  > `docs/rules/` and the [API Reference](user-docs/api-reference.md) for a consolidated view of all rules and their options.

This improves discoverability of configuration options as requested.

---

### 5) Quality checks and CI

After the edits, I ran the project’s standard quality checks:

- `npm test -- --passWithNoTests`
- `npm run lint -- --max-warnings=0`
- `npm run type-check`
- `npm run format:check` → initially failed due to Prettier differences in the edited TS files.
  - Fixed via `npm run format -- src/rules/require-branch-annotation.ts src/rules/valid-req-reference.ts`
  - Re-ran `npm run format:check` → passed.

Then I committed and pushed:

- Commit: `docs: align rule options and preset documentation with implementation`

The push triggered the full CI/CD pipeline (`ci-verify:full`), which completed successfully, including:

- Traceability checks
- Safety/audit checks
- Build and type-check
- Lint and plugin sanity check
- Duplication analysis
- Full Jest coverage
- Format check
- npm audits

I then verified via GitHub Actions that the **CI/CD Pipeline** workflow for `main` completed with **success**.

---

## Updated plan with status

### NOW

- [x] Use read_file on `user-docs/api-reference.md` to inspect the current rule documentation, focusing on the "Options" sections for each rule so we can identify and correct any mismatches with the implemented rule options.

### NEXT

- [x] Use read_file on `docs/rules/require-story-annotation.md`, `docs/rules/require-branch-annotation.md`, and `docs/rules/valid-story-reference.md` plus the corresponding TypeScript rule implementations in `src/rules` to confirm the exact option names, types, and defaults for each rule.
- [x] Use modify_file on `user-docs/api-reference.md` to update the "Options" subsections so they accurately describe the available options for `traceability/require-story-annotation`, `traceability/require-branch-annotation`, and `traceability/valid-story-reference`, and explicitly state "Options: None" only for rules that truly have no options.
- [x] Use read_file on `docs/config-presets.md` and `src/index.ts` to compare the documented severities for each preset (especially `traceability/valid-annotation-format`) with the actual `configs.recommended` and `configs.strict` objects.
- [x] Use modify_file on `docs/config-presets.md` to align the documented preset severities and rule lists with the current implementation in `src/index.ts`, ensuring that `valid-annotation-format` is documented with the same severity (e.g., `warn`) as in the code.
- [x] Use read_file on `src/rules/valid-req-reference.ts` and `src/rules/require-branch-annotation.ts` to locate any traceability annotations that deviate from the required `@story docs/stories/...` / `@req REQ-...` pattern or missing annotations on named inner functions and significant branches.
- [x] Use modify_file on the identified TypeScript files (starting with `src/rules/valid-req-reference.ts` and `src/rules/require-branch-annotation.ts`) to normalize `@story`/`@req` comment format and add missing annotations for named inner functions and important conditional branches, keeping comments concise and machine-parseable.
- [x] Use modify_file on `README.md` to add or update a short "Configuration options" note that points readers to the rule docs in `docs/rules/` and `user-docs/api-reference.md` for detailed per-rule options, improving discoverability of the configuration surface.

### LATER

- [ ] Do a follow-up sweep with search_file_content (e.g., for `"Options: None"` and `@story`/`@req` tags) to catch any remaining documentation or traceability-format inconsistencies and fix them incrementally.
- [ ] Re-run the implementation assessment’s DOCUMENTATION checks (via existing automation) to confirm the documentation score has risen above 90% and that FUNCTIONALITY assessment can proceed.
- [ ] Once FUNCTIONALITY is unblocked, review any uncovered feature gaps or failing requirements from the stories and plan focused code, test, and doc updates in small, safe steps.

If you’d like, I can next tackle the LATER sweep to find any remaining `Options: None` mismatches or non-normalized `@story`/`@req` tags.
```

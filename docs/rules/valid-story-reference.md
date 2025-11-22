# valid-story-reference

Validates that `@story` annotation references refer to existing `.story.md` files within the project and prevents invalid path usage.

@story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
@req REQ-FILE-EXISTENCE - Verify that `@story` file paths reference existing files
@req REQ-PATH-RESOLUTION - Resolve relative paths correctly and enforce configuration
@req REQ-SECURITY-VALIDATION - Prevent path traversal and absolute path usage

## Rule Details

This rule inspects all comment nodes for lines starting with `@story`. It then:

- Prevents absolute paths unless explicitly allowed
- Prevents path traversal outside the project directory
- Ensures `.story.md` extension when required
- Resolves candidate file locations in configured story directories
- Reports a `fileMissing`, `invalidExtension`, or `invalidPath` error for violations

### Boundary & Configuration

The rule enforces a strict “project boundary” for story references in line with story `006.0-DEV-FILE-VALIDATION`:

- All candidate filesystem paths are built (from `@story` text, `storyDirectories`, and allowed absolute paths) and then checked against the project root using a `ProjectBoundaryCheckResult`.
- A candidate that the boundary checker classifies as outside the project root is treated as out-of-bounds and is not used for existence/access decisions.
- If **all** resolved candidates are out-of-bounds, the rule reports `invalidPath` even if filesystem queries (were they to be run) would indicate that a file exists at one or more of those locations.
- When **at least one** candidate path is within the project boundary:
  - Normal extension rules are applied first (e.g. `.story.md` when `requireStoryExtension` is `true`), and mismatches are reported as `invalidExtension`.
  - For in-bounds candidates with acceptable extensions, the rule performs filesystem checks and distinguishes between:
    - `fileMissing` – the candidate is within the boundary and has a valid extension, but no file exists at that path.
    - `fileAccessError` – the candidate is within the boundary, but the filesystem check fails for reasons other than “file not found” (e.g. permission errors).
    - Success – the file exists and is accessible within the project boundary.
- By default, absolute paths are considered outside the project boundary and are rejected as `invalidPath` by the boundary checker unless explicitly allowed by configuration; when allowed, they are still subject to the same boundary classification and existence/access logic as relative candidates.
- Resolution is constrained to candidates that remain within the project root according to `ProjectBoundaryCheckResult`; candidates that would escape the project (e.g. via `..` traversal) are classified as out-of-bounds and contribute to `invalidPath` when no in-bounds alternatives exist.

These constraints ensure that story references are deterministic, prevent accidental coupling to files outside the intended documentation area, and avoid security issues from arbitrary filesystem traversal.

### Options

Configure rule behavior using an options object that controls how paths are resolved and validated against the project boundary:

```json
{
  "storyDirectories": ["docs/stories", "stories"],
  "allowAbsolutePaths": false,
  "requireStoryExtension": true
}
```

#### `storyDirectories`

- Type: `string[]`
- Default: `["docs/stories", "stories"]` (may vary by project)

Defines the set of directories (relative to the project root) that are considered valid locations for `.story.md` files.

Behavior and interaction with boundaries:

- All relative `@story` paths are first normalized and then resolved **within** these directories.
- The rule will only look for matching files under these directories; files with the same name outside them are ignored.
- A path that cannot be mapped into any configured `storyDirectories` without leaving the project boundary is reported as `invalidPath`.
- If a normalized path is inside a `storyDirectories` entry but the target file does not exist, the rule reports `fileMissing`.

Use this to centrally control where story files are allowed to live (e.g. `docs/stories`, `stories/api`).

#### `allowAbsolutePaths`

- Type: `boolean`
- Default: `false`

Controls whether `@story` can use absolute filesystem paths (e.g. `/full/path/to/story.story.md`).

Boundary and security implications:

- When `false`:
  - Any absolute path is reported as `invalidPath`.
  - All `@story` references must be relative to the project and are resolved only within `storyDirectories`.
  - This is the recommended setting to prevent references to files outside the repository or project boundary.
- When `true`:
  - Absolute paths are permitted and resolved directly on the filesystem.
  - Other checks still apply:
    - Path traversal checks still apply (e.g. disallowing obvious escape patterns if the project sets such constraints).
    - `requireStoryExtension` still controls which extensions are accepted.
  - Use with caution, as it weakens project-boundary guarantees and may introduce portability issues across machines.

#### `requireStoryExtension`

- Type: `boolean`
- Default: `true`

Controls whether `@story` references must end with the `.story.md` extension.

Extension and boundary interaction:

- When `true`:
  - Only files with a `.story.md` suffix are considered valid story files.
  - If a referenced path resolves to a file with the wrong extension (e.g. `.md` without `.story`), the rule reports `invalidExtension`.
  - This applies regardless of whether the file exists within the project boundary; a mismatched extension is always flagged as `invalidExtension` (even if the underlying file exists).
- When `false`:
  - Other markdown extensions (e.g. `.md`, `.markdown`) may be allowed, subject to the rule’s implementation.
  - Path and boundary checks still apply: the file must still be within `storyDirectories` (or be a permitted absolute path), and traversal outside the project boundary is still rejected as `invalidPath`.

Use `requireStoryExtension: true` to enforce a clear, consistent naming convention for story files and to make it unambiguous which markdown files are intended to be executable stories.

### Examples

#### Correct

```js
// @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
```

#### Incorrect

```js
// @story docs/stories/nonexistent.story.md        // @story fileMissing
// @story docs/stories/001.0-DEV-PLUGIN-SETUP.md   // @story invalidExtension
// @story ../outside.story.md                      // @story invalidPath
// @story /etc/passwd.story.md                     // @story invalidPath
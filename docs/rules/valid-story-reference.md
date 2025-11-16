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

### Options

Configure rule behavior using an options object:

```json
{
  "storyDirectories": ["docs/stories", "stories"],
  "allowAbsolutePaths": false,
  "requireStoryExtension": true
}
```

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
```
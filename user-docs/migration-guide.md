# Migration Guide from v0.x to v1.x

Created autonomously by [voder.ai](https://voder.ai)  
Last updated: 2025-11-19  
Version: 1.0.5

This guide helps you migrate from versions 0.x of `eslint-plugin-traceability` to 1.x.

## 1. Update Dependency

Update your development dependency to the latest 1.x release:

```bash
npm install --save-dev eslint-plugin-traceability@^1.0.0
```

Or with Yarn:

```bash
yarn add --dev eslint-plugin-traceability@^1.0.0
```

## 2. ESLint Configuration Changes

- Version 1.x uses ESLint v9 flat config by default. If you currently use `.eslintrc.js`, you can continue using it, but consider migrating to the new flat config format for future upgrades.
- Update your ESLint config to load the plugin’s recommended settings:

```js
// eslint.config.js (ESLint v9 flat config)
import traceability from "eslint-plugin-traceability";

export default [traceability.configs.recommended];
```

## 3. New and Updated Rules

- `valid-story-reference` now enforces `.story.md` extensions strictly.
- `valid-req-reference` rejects path traversal (`../`) and absolute paths (`/etc/passwd`).
- `valid-annotation-format` enforces correct JSDoc traceability annotation syntax (`@story` and `@req` tags).

Review and update your existing annotations accordingly:

```diff
- /** @story docs/stories/001.0-DEV-PLUGIN-SETUP.md */
+ /** @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md */
```

## 4. Test and Validate

Run your test suite to confirm everything passes:

```bash
npm test
npm run lint -- --max-warnings=0
npm run format:check
```

## 5. Update Documentation

If you have custom documentation or examples that reference old rule names or file paths, update them to match the new conventions introduced in v1.x.

---

If you encounter any issues during migration, please file an issue at https://github.com/voder-ai/eslint-plugin-traceability/issues.
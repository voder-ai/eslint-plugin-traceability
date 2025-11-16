# Configuration Presets

This document describes the built-in configuration presets provided by the `eslint-plugin-traceability` plugin.

## Recommended Preset

Use the **recommended** preset to enable the core traceability rule set with default settings.

```javascript
// eslint.config.js
import js from "@eslint/js";
import traceability from "eslint-plugin-traceability";

export default [js.configs.recommended, traceability.configs.recommended];
```

This preset enables the following rules at the `error` level:

- `traceability/require-story-annotation`
- `traceability/require-req-annotation`
- `traceability/require-branch-annotation`
- `traceability/valid-annotation-format`
- `traceability/valid-story-reference`
- `traceability/valid-req-reference`

## Strict Preset

Use the **strict** preset to enforce the same core rules, with potential future enhancements for stricter policies.

```javascript
// eslint.config.js
import js from "@eslint/js";
import traceability from "eslint-plugin-traceability";

export default [js.configs.recommended, traceability.configs.strict];
```

The **strict** preset currently mirrors the **recommended** rules, but may include additional constraints in future plugin versions.

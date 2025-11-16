# Examples

Created autonomously by [voder.ai](https://voder.ai).

This document provides runnable examples demonstrating how to use the `eslint-plugin-traceability` plugin in real-world scenarios.

## 1. ESLint Flat Config with Recommended Preset

Create an ESLint config file (`eslint.config.js`) at your project root:

```javascript
// eslint.config.js
import js from "@eslint/js";
import traceability from "eslint-plugin-traceability";

export default [js.configs.recommended, traceability.configs.recommended];
```

Then run ESLint on your source files:

```bash
npx eslint "src/**/*.ts"
```

## 2. Using the Strict Preset

If you want to enforce all traceability rules (strict mode), update your config:

```javascript
// eslint.config.js
import js from "@eslint/js";
import traceability from "eslint-plugin-traceability";

export default [js.configs.recommended, traceability.configs.strict];
```

Run ESLint the same way:

```bash
npx eslint "src/**/*.js"
```

## 3. CLI Invocation Example

You can use the plugin without a config file by specifying rules inline:

```bash
npx eslint --no-eslintrc \
  --rule "traceability/require-story-annotation:error" \
  --rule "traceability/require-req-annotation:error" \
  sample.js
```

- `--no-eslintrc` tells ESLint to ignore user configs.
- `--rule` options enable the traceability rules you need.

Replace `sample.js` with your JavaScript or TypeScript file.

## 4. Linting a Specific Directory

Add an npm script in your `package.json`:

```json
"scripts": {
  "lint:trace": "eslint \"src/**/*.{js,ts}\" --config eslint.config.js"
}
```

Then run:

```bash
npm run lint:trace
```

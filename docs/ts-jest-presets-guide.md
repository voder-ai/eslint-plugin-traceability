# ts-jest Presets Guide

## Overview

In Jest, presets are pre-defined configurations that help streamline and standardize the process of setting up testing environments. They allow developers to quickly configure Jest with specific transformers, file extensions, and other options.

`ts-jest` provides very opinionated presets based on what has been found to be useful in practice.

> **IMPORTANT**: The current best practice for using presets is to call one of the utility functions below to create (and optionally extend) presets. Legacy presets are listed at the bottom of this page.

## Available Preset Functions

`ts-jest` provides the following utility functions to create presets:

- `createDefaultPreset(options)`
- `createDefaultLegacyPreset(options)`
- `createDefaultEsmPreset(options)`
- `createDefaultLegacyEsmPreset(options)`
- `createJsWithTsPreset(options)`
- `createJsWithTsLegacyPreset(options)`
- `createJsWithTsEsmPreset(options)`
- `createJsWithTsEsmLegacyPreset(options)`
- `createJsWithBabelPreset(options)`
- `createJsWithBabelLegacyPreset(options)`
- `createJsWithBabelEsmPreset(options)`
- `createJsWithBabelEsmLegacyPreset(options)`

## Preset Functions Reference

### `createDefaultPreset(options)`

Create a configuration to process TypeScript files (`.ts`/`.tsx`).

#### Parameters

- `options` (OPTIONAL)
  - `tsconfig`: see [tsconfig options page](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/tsconfig)
  - `isolatedModules`: see [isolatedModules options page](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/isolatedModules)
  - `compiler`: see [compiler options page](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/compiler)
  - `astTransformers`: see [astTransformers options page](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/astTransformers)
  - `diagnostics`: see [diagnostics options page](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/diagnostics)
  - `stringifyContentPathRegex`: see [stringifyContentPathRegex options page](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/stringifyContentPathRegex)

#### Returns

An object containing Jest's `transform` property:

```typescript
export type DefaultPreset = {
  transform: {
    "^.+.tsx?$": ["ts-jest", TsJestTransformerOptions];
  };
};
```

#### Example

```typescript
// jest.config.ts
import { createDefaultPreset, type JestConfigWithTsJest } from "ts-jest";

const presetConfig = createDefaultPreset({
  //...options
});

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
};

export default jestConfig;
```

### `createDefaultLegacyPreset(options)`

Create a LEGACY configuration to process TypeScript files (`.ts`, `.tsx`).

#### Parameters

Same as `createDefaultPreset(options)`.

#### Returns

```typescript
export type DefaultPreset = {
  transform: {
    "^.+\\.tsx?$": ["ts-jest/legacy", TsJestTransformerOptions];
  };
};
```

#### Example

```typescript
// jest.config.ts
import { createDefaultLegacyPreset, type JestConfigWithTsJest } from "ts-jest";

const presetConfig = createDefaultLegacyPreset({
  //...options
});

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
};

export default jestConfig;
```

### `createDefaultEsmPreset(options)`

Create an ESM configuration to process TypeScript files (`.ts`/`.mts`/`.tsx`/`.mtsx`).

#### Parameters

Same as `createDefaultPreset(options)`.

#### Returns

```typescript
export type DefaultEsmPreset = {
  extensionsToTreatAsEsm: string[];
  transform: {
    "^.+\\.m?tsx?$": ["ts-jest", TsJestTransformerOptions];
  };
};
```

#### Example

```typescript
// jest.config.ts
import { createDefaultEsmPreset, type JestConfigWithTsJest } from "ts-jest";

const presetConfig = createDefaultEsmPreset({
  //...options
});

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
};

export default jestConfig;
```

### `createDefaultLegacyEsmPreset(options)`

Create a LEGACY ESM configuration to process TypeScript files (`.ts`/`.mts`/`.tsx`/`.mtsx`).

#### Parameters

Same as `createDefaultPreset(options)`.

#### Returns

```typescript
export type DefaultEsmPreset = {
  extensionsToTreatAsEsm: string[];
  transform: {
    "^.+\\.m?tsx?$": ["ts-jest/legacy", TsJestTransformerOptions];
  };
};
```

#### Example

```typescript
// jest.config.ts
import {
  createDefaultLegacyEsmPreset,
  type JestConfigWithTsJest,
} from "ts-jest";

const presetConfig = createDefaultLegacyEsmPreset({
  //...options
});

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
};

export default jestConfig;
```

### `createJsWithTsPreset(options)`

Create a configuration to process JavaScript/TypeScript files (`.js`/`.jsx`/`.ts`/`.tsx`).

**Note**: You'll need to set `allowJs` to `true` in your `tsconfig.json` file.

#### Parameters

Same as `createDefaultPreset(options)`.

#### Returns

```typescript
export type JsWithTsPreset = {
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", TsJestTransformerOptions];
  };
};
```

#### Example

```typescript
// jest.config.ts
import { createJsWithTsPreset, type JestConfigWithTsJest } from "ts-jest";

const presetConfig = createJsWithTsPreset({
  //...options
});

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
};

export default jestConfig;
```

### `createJsWithTsLegacyPreset(options)`

Create a LEGACY configuration to process JavaScript/TypeScript files (`.js`/`.jsx`/`.ts`/`.tsx`).

**Note**: You'll need to set `allowJs` to `true` in your `tsconfig.json` file.

#### Parameters

Same as `createDefaultPreset(options)`.

#### Returns

```typescript
export type JsWithTsPreset = {
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest/legacy", TsJestTransformerOptions];
  };
};
```

#### Example

```typescript
// jest.config.ts
import { createJsWithTsLegacyPreset, type JestConfigWithTsJest } from "ts-jest";

const presetConfig = createJsWithTsLegacyPreset({
  //...options
});

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
};

export default jestConfig;
```

### `createJsWithTsEsmPreset(options)`

Create an ESM configuration to process JavaScript/TypeScript files (`.js`/`.mjs`/`.jsx`/`.mjsx`/`.ts`/`.mts`/`.tsx`/`.mtsx`).

**Note**: You'll need to set `allowJs` to `true` in your `tsconfig.json` file.

#### Parameters

Same as `createDefaultPreset(options)`.

#### Returns

```typescript
export type JsWithTsPreset = {
  transform: {
    "^.+\\.m?[tj]sx?$": ["ts-jest", TsJestTransformerOptions];
  };
};
```

#### Example

```typescript
// jest.config.ts
import { createJsWithTsEsmPreset, type JestConfigWithTsJest } from "ts-jest";

const presetConfig = createJsWithTsEsmPreset({
  //...options
});

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
};

export default jestConfig;
```

### `createJsWithTsEsmLegacyPreset(options)`

Create a LEGACY ESM configuration to process JavaScript/TypeScript files (`.js`/`.mjs`/`.jsx`/`.mjsx`/`.ts`/`.mts`/`.tsx`/`.mtsx`).

**Note**: You'll need to set `allowJs` to `true` in your `tsconfig.json` file.

#### Parameters

Same as `createDefaultPreset(options)`.

#### Returns

```typescript
export type JsWithTsPreset = {
  transform: {
    "^.+\\.m?[tj]sx?$": ["ts-jest/legacy", TsJestTransformerOptions];
  };
};
```

#### Example

```typescript
// jest.config.ts
import {
  createJsWithTsEsmLegacyPreset,
  type JestConfigWithTsJest,
} from "ts-jest";

const presetConfig = createJsWithTsEsmLegacyPreset({
  //...options
});

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
};

export default jestConfig;
```

### `createJsWithBabelPreset(options)`

Create a configuration to process JavaScript/TypeScript files (`.js`/`.jsx`/`.ts`/`.tsx`) which uses `babel-jest` to perform additional transformation.

#### Parameters

- `options` (OPTIONAL)
  - `tsconfig`: see [tsconfig options page](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/tsconfig)
  - `isolatedModules`: see [isolatedModules options page](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/isolatedModules)
  - `compiler`: see [compiler options page](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/compiler)
  - `astTransformers`: see [astTransformers options page](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/astTransformers)
  - `diagnostics`: see [diagnostics options page](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/diagnostics)
  - `babelConfig`: see [babelConfig options page](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/babelConfig)
  - `stringifyContentPathRegex`: see [stringifyContentPathRegex options page](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/stringifyContentPathRegex)

#### Returns

```typescript
export type JsWithBabelPreset = {
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", TsJestTransformerOptions];
  };
};
```

#### Example

```typescript
// jest.config.ts
import { createJsWithBabelPreset, type JestConfigWithTsJest } from "ts-jest";

const presetConfig = createJsWithBabelPreset({
  //...options
});

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
};

export default jestConfig;
```

### `createJsWithBabelLegacyPreset(options)`

Create a LEGACY configuration to process JavaScript/TypeScript files (`.js`/`.jsx`/`.ts`/`.tsx`) which uses `babel-jest` to perform additional transformation.

#### Parameters

Same as `createJsWithBabelPreset(options)`.

#### Returns

```typescript
export type JsWithBabelPreset = {
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest/legacy", TsJestTransformerOptions];
  };
};
```

#### Example

```typescript
// jest.config.ts
import {
  createJsWithBabelLegacyPreset,
  type JestConfigWithTsJest,
} from "ts-jest";

const presetConfig = createJsWithBabelLegacyPreset({
  //...options
});

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
};

export default jestConfig;
```

### `createJsWithBabelEsmPreset(options)`

Create an ESM configuration to process JavaScript/TypeScript files (`.js`/`.mjs`/`.jsx`/`.mjsx`/`.ts`/`.mts`/`.tsx`/`.mtsx`) which uses `babel-jest` to perform additional transformation.

#### Parameters

Same as `createJsWithBabelPreset(options)`.

#### Returns

```typescript
export type JsWithBabelPreset = {
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", TsJestTransformerOptions];
  };
};
```

#### Example

```typescript
// jest.config.ts
import { createJsWithBabelEsmPreset, type JestConfigWithTsJest } from "ts-jest";

const presetConfig = createJsWithBabelEsmPreset({
  //...options
});

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
};

export default jestConfig;
```

### `createJsWithBabelEsmLegacyPreset(options)`

Create a LEGACY ESM configuration to process JavaScript/TypeScript files (`.js`/`.mjs`/`.jsx`/`.mjsx`/`.ts`/`.mts`/`.tsx`/`.mtsx`) which uses `babel-jest` to perform additional transformation.

#### Parameters

Same as `createJsWithBabelPreset(options)`.

#### Returns

```typescript
export type JsWithBabelPreset = {
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest/legacy", TsJestTransformerOptions];
  };
};
```

#### Example

```typescript
// jest.config.ts
import {
  createJsWithBabelEsmLegacyPreset,
  type JestConfigWithTsJest,
} from "ts-jest";

const presetConfig = createJsWithBabelEsmLegacyPreset({
  //...options
});

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
};

export default jestConfig;
```

## Transformer Options Interface

All preset functions accept an optional `options` parameter with the following interface:

```typescript
import type { TsConfigJson } from "type-fest";

interface TsJestTransformerOptions {
  tsconfig?: boolean | string | TsConfigJson.CompilerOptions;
  isolatedModules?: boolean;
  astTransformers?: ConfigCustomTransformer;
  diagnostics?:
    | boolean
    | {
        pretty?: boolean;
        ignoreCodes?: number | string | Array<number | string>;
        exclude?: string[];
        warnOnly?: boolean;
      };
  babelConfig?: boolean | string | BabelConfig; // Only for Babel presets
  stringifyContentPathRegex?: string | RegExp;
}
```

## Legacy Presets (Deprecated)

> **WARNING**: `ts-jest` DOES NOT RECOMMEND using legacy presets because this approach is not flexible to configure Jest configuration. These legacy presets will be removed in the next major release and users are HIGHLY RECOMMENDED to migrate to use the utility functions above.

| Preset                                                        | Description                                                                                                                                                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ts-jest/presets/default` or `ts-jest`                        | TypeScript files (`.ts`, `.tsx`) will be transformed by `ts-jest` to CommonJS syntax, leaving JavaScript files (`.js`, `.jsx`) as-is.                                                       |
| `ts-jest/presets/default-legacy` or `ts-jest/legacy` (LEGACY) | TypeScript files (`.ts`, `.tsx`) will be transformed by `ts-jest` to CommonJS syntax, leaving JavaScript files (`.js`, `.jsx`) as-is.                                                       |
| `ts-jest/presets/default-esm`                                 | TypeScript files (`.ts`, `.tsx`) will be transformed by `ts-jest` to ESM syntax, leaving JavaScript files (`.js`, `.jsx`) as-is.                                                            |
| `ts-jest/presets/default-esm-legacy` (LEGACY)                 | TypeScript files (`.ts`, `.tsx`) will be transformed by `ts-jest` to ESM syntax, leaving JavaScript files (`.js`, `.jsx`) as-is.                                                            |
| `ts-jest/presets/js-with-ts`                                  | TypeScript and JavaScript files (`.ts`, `.tsx`, `.js`, `.jsx`) will be transformed by `ts-jest` to CommonJS syntax. You'll need to set `allowJs` to `true` in your `tsconfig.json` file.    |
| `ts-jest/presets/js-with-ts-legacy` (LEGACY)                  | TypeScript and JavaScript files (`.ts`, `.tsx`, `.js`, `.jsx`) will be transformed by `ts-jest` to CommonJS syntax. You'll need to set `allowJs` to `true` in your `tsconfig.json` file.    |
| `ts-jest/presets/js-with-ts-esm`                              | TypeScript and JavaScript files (`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`) will be transformed by `ts-jest` to ESM syntax. You'll need to set `allowJs` to `true` in your `tsconfig.json` file. |
| `ts-jest/presets/js-with-ts-esm-legacy` (LEGACY)              | TypeScript and JavaScript files (`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`) will be transformed by `ts-jest` to ESM syntax. You'll need to set `allowJs` to `true` in your `tsconfig.json` file. |
| `ts-jest/presets/js-with-babel`                               | TypeScript files (`.ts`, `.tsx`) will be transformed by `ts-jest` to CommonJS syntax, and JavaScript files (`.js`, `.jsx`) will be transformed by `babel-jest`.                             |
| `ts-jest/presets/js-with-babel-legacy` (LEGACY)               | TypeScript files (`.ts`, `.tsx`) will be transformed by `ts-jest` to CommonJS syntax, and JavaScript files (`.js`, `.jsx`) will be transformed by `babel-jest`.                             |
| `ts-jest/presets/js-with-babel-esm`                           | TypeScript files (`.ts`, `.tsx`) will be transformed by `ts-jest` to ESM syntax, and JavaScript files (`.js`, `.jsx`, `.mjs`) will be transformed by `babel-jest`.                          |
| `ts-jest/presets/js-with-babel-esm-legacy` (LEGACY)           | TypeScript files (`.ts`, `.tsx`) will be transformed by `ts-jest` to ESM syntax, and JavaScript files (`.js`, `.jsx`, `.mjs`) will be transformed by `babel-jest`.                          |

### Legacy Preset Example

```typescript
// jest.config.ts
import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
  // Replace `<preset_name>` with one of the preset names from the table above
  preset: "<preset_name>",
};

export default jestConfig;
```

## References

- [Official ts-jest Presets Documentation](https://kulshekhar.github.io/ts-jest/docs/getting-started/presets)
- [ts-jest Installation Guide](https://kulshekhar.github.io/ts-jest/docs/getting-started/installation)
- [ts-jest Options](https://kulshekhar.github.io/ts-jest/docs/getting-started/options)

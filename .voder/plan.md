## NOW

Run `npm init -y` in the project root to generate a package.json with default metadata.

## NEXT

- Install core devDependencies:  
  `npm install --save-dev typescript eslint @typescript-eslint/parser @typescript-eslint/utils jest ts-jest @types/jest`
- Create a tsconfig.json at project root with CommonJS module, strict settings, `outDir: "lib"`, and include `"src/**/*"`.
- Scaffold an `eslint.config.js` using ESLint v9 flat config that loads your plugin and defines `recommended` and `strict` presets.
- Add a `jest.config.js` configured for `ts-jest` and set testMatch patterns pointing at a `tests/` directory.
- Update package.json “scripts” section to include:
  - `"build": "tsc"`
  - `"type-check": "tsc --noEmit"`
  - `"lint": "eslint ."`
  - `"test": "jest"`
  - `"format": "prettier --write ."`
- Commit all changes and verify that `npm run build`, `npm run type-check`, `npm run lint`, and `npm test` all succeed.

## LATER

- Add a GitHub Actions workflow (`.github/workflows/ci.yml`) to run build, type-check, lint, test, format, and `npm audit` on every push.
- Configure Husky pre-commit hooks to auto-format, lint, and type-check, and pre-push hooks to run tests.
- Create a `.env.example` file and initialize `docs/security-incidents/` for tracking vulnerabilities and incidents.
- Commit the lockfile (package-lock.json or yarn.lock) and integrate `npm audit` into CI.
- Flesh out `README.md` with installation, configuration, and usage instructions reflecting the new setup.

## NOW
Refactor `src/rules/require-req-annotation.ts` by extracting the duplicated logic for handling `TSDeclareFunction` and `TSMethodSignature` nodes into a new shared helper module under `src/utils/annotation-checker.ts`.

## NEXT
- Update `require-req-annotation.ts` to import and invoke the new helper for both node types.
- Add unit tests for the helper in `tests/utils/annotation-checker.test.ts` to ensure its behavior.
- Adjust the jscpd configuration (e.g. in `.jscpd.json` or `package.json`) to ignore the legitimate duplication now centralized in the helper or raise the per-file duplication threshold.

## LATER
- Scan other rule files for similar duplication and consolidate shared logic into utilities.
- Integrate a duplication check step (`npm run duplication`) into the CI workflow to fail on new code clones.
- Review overall code complexity and, if needed, introduce additional small refactorings to meet the 90% code-quality threshold.
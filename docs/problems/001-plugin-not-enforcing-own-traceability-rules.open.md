# PLUGIN-NOT-ENFORCING-RULES: Plugin Not Enforcing Own Traceability Rules

**Date**: 2025-12-06  
**Updated**: 2025-12-06  
**Status**: 🔴 OPEN  
**Severity**: High  
**Impact**: High (3) - All developers working on the plugin are affected; 100% of plugin codebase lacks validation  
**Likelihood**: High (3) - Occurs consistently on every lint run  
**Priority**: 9 (3×3) - Critical, immediate workaround required  
**Component**: ESLint configuration, Plugin self-validation

## Problem Description

The eslint-plugin-traceability is not configured to enforce its own traceability rules on its codebase. While the plugin is registered in `eslint.config.js`, none of the traceability-specific rules are enabled or configured. This means the 1,737+ existing `@story` and `@req` annotations in the codebase are never validated during linting.

**Symptoms**:

- Running `npm run lint` does not report any traceability violations
- Grepping the `eslint.config.js` file shows no traceability rule configurations (e.g., `traceability/require-story-annotation`, `traceability/valid-annotation-format`)
- The plugin registers conditionally with `...(plugin.rules ? { traceability: plugin } : {})` but never applies any rule configurations
- Plugin has recommended/strict presets but doesn't use them on itself

**Conditions**:

- Affects all developers running linting locally
- Affects all CI/CD pipeline lint checks
- Occurs every time ESLint is invoked on the project

## User Experience Impact

- **Plugin Developers**: Cannot rely on automated validation to catch annotation errors; must manually verify all traceability annotations
- **Code Review**: Reviewers must manually check annotation validity and formatting, increasing review time and error risk
- **CI/CD Pipeline**: Lint stage passes even with invalid or malformed annotations, allowing defects into main branch
- **Business Impact**: Defeats the purpose of dogfooding; plugin credibility is reduced if it doesn't use its own features

## Analytics-Based Impact Assessment

**Affected User Percentage**: 100% of developers working on the plugin  
**Data Source**: Code analysis - all lint runs affected  
**Device Breakdown**: N/A (Development tooling issue)

**Impact Calculation**: All lint operations on the codebase are affected (100%)

## Technical Analysis

### Investigation Tasks

#### High Priority

- [x] **Verify current ESLint configuration**: Confirm that no traceability rules are enabled in `eslint.config.js`
- [x] **Count existing annotations**: Determine how many annotations exist that should be validated
- [x] **Review plugin exports**: Confirm that `configs.recommended` and `configs.strict` presets are properly exported
- [ ] **Test plugin presets**: Verify that the recommended/strict presets work correctly when applied

#### Medium Priority

- [ ] **Review user documentation alignment**: Check if user docs recommend patterns that the project itself doesn't follow
- [ ] **Analyze dogfooding gaps**: Identify other areas where the plugin should use its own features

#### Low Priority

- [ ] **Review historical context**: Determine why rules were never enabled (intentional vs oversight)

### Files Likely Affected

1. **`eslint.config.js`**: Primary configuration file that needs traceability rules enabled
2. **`src/index.ts`**: Exports the `configs.recommended` and `configs.strict` presets
3. **`src/**/\*.ts`\*\*: Contains 1,737+ annotations that should be validated
4. **`tests/**/\*.ts`\*\*: Contains annotations that should be validated

### Root Cause Hypothesis

The ESLint configuration was set up to load the plugin dynamically from source (development) or built output (CI/production), but the rule configuration step was never completed. The config registers the plugin with conditional spreading but never applies the rule severities from the recommended/strict presets or configures individual rules.

Possible reasons:

1. Development workflow evolved to load from source before build, but rule enablement was never added
2. Fear of breaking existing code with initially invalid annotations
3. Oversight during initial plugin setup

## Workaround Implementation

### Status

- [ ] **Workaround Identified**: Enable recommended preset
- [ ] **Test Management Planned**: N/A - no tests need skipping
- [ ] **Workaround Implemented**: {Implementation date}
- [ ] **Tests Skipped/Disabled**: N/A
- [ ] **Coverage Exclusions Applied**: N/A
- [ ] **Workaround Verified**: {Verification date}

### Workaround Details

**Type**: Configuration change with incremental suppression  
**Implementation**: Enable the plugin's recommended preset, suppress all violations, then fix incrementally

**Step-by-step implementation:**

1. Verify the plugin is built: `npm run build`

2. Update `eslint.config.js` to spread the recommended config after registering the plugin:

```javascript
module.exports = [
  js.configs.recommended,
  // ... existing config objects ...
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      ...(plugin.rules ? { traceability: plugin } : {}),
    },
    rules: {
      // ... existing rules ...
    },
  },
  // Add the traceability preset at the end
  ...(plugin.configs?.recommended || []),
  // ... test file overrides and ignores ...
];
```

3. Commit the configuration change: `git add eslint.config.js && git commit -m "chore(lint): enable traceability preset"`

4. Run lint to capture all violations: `npm run lint > /tmp/traceability-violations.txt 2>&1 || true`

5. Generate a list of files with violations: `cat /tmp/traceability-violations.txt | grep -E '^\s+/' | sed 's/:.*//' | sort -u > /tmp/files-with-violations.txt`

6. Add `/* eslint-disable traceability/require-story-annotation, traceability/require-req-annotation, traceability/valid-annotation-format, traceability/valid-story-reference, traceability/valid-req-reference, traceability/require-test-traceability */` at the top of each file with violations

7. Verify lint passes: `npm run lint`

8. Commit the suppressions: `git add . && git commit -m "chore(lint): suppress traceability violations for incremental fixing"`

9. **Incremental fixing process** (one file at a time):
   - Remove the eslint-disable comment from ONE file
   - Run lint on that file: `npm run lint -- path/to/file.ts`
   - Fix all violations in that file
   - Verify lint passes for that file
   - Commit the fix: `git add path/to/file.ts && git commit -m "fix(traceability): resolve violations in <filename>"`
   - Repeat for next file

10. Track progress using the suppression report: `npm run report:eslint-suppressions`

**Limitations**:

- Requires plugin to be built before linting (adds build step to workflow)
- Creates temporary technical debt through eslint-disable comments
- Requires discipline to actually remove suppressions incrementally
- Conditional spreading may hide configuration errors

**Side Effects**:

- Adds eslint-disable comments to many files (temporary technical debt)
- Each file fix requires a separate commit for safety
- Incremental process may take significant time depending on violation count
- CI will pass immediately after suppressions are added (violations hidden)

**Business Impact of Workaround**:

- Enables automated validation of 1,737+ existing annotations (once suppressions are removed)
- Provides safe, incremental path to full compliance
- Demonstrates dogfooding to users/contributors
- Allows work to continue while violations are being fixed
- Creates visibility into quality debt through suppression tracking

**Test Management**:

- **Tests Skipped**: N/A - workaround doesn't disable features
- **Coverage Exclusions**: N/A
- **Skip Reason**: N/A

**Monitoring Requirements**:

- Track eslint suppression count using `npm run report:eslint-suppressions`
- Monitor progress on incremental fixes (suppressions should trend down)
- Verify no new suppressions are added (only removed)
- Alert if suppression count increases

**Rollback Procedure**:

1. If issues arise during incremental fixing:
   - Revert the specific file commit: `git revert <commit-hash>`
   - Re-add the eslint-disable comment to that file
   - Investigate the issue before attempting to fix again

2. If entire workaround needs rollback:
   - Remove all eslint-disable comments added
   - Remove the `...(plugin.configs?.recommended || [])` line from `eslint.config.js`
   - Commit the rollback: `git add . && git commit -m "chore(lint): rollback traceability preset enablement"`
   - Re-run lint to verify it passes

## Root Cause Analysis

### Methodology Used

- [ ] **5 Whys Analysis**
- [ ] **Fishbone Diagram**
- [x] **Timeline Analysis**
- [ ] **Other**: {Specify methodology}

### Analysis Results

**Timeline Analysis**: The ESLint configuration was set up with dynamic plugin loading to support both development (loading from `src/`) and CI/production (loading from `lib/`) workflows. However, the configuration process was incomplete - the plugin was registered but no rules were configured.

**Evidence Supporting Root Cause**:

- `eslint.config.js` contains plugin registration: `plugins: { ...(plugin.rules ? { traceability: plugin } : {}) }`
- No traceability rules are configured in any of the config objects
- The `configs.recommended` preset exists in `src/index.ts` and exports rule severities
- User documentation in `user-docs/eslint-9-setup-guide.md` shows the correct pattern using `...traceability.configs.recommended`
- The pattern shown in user docs is not followed in the project's own configuration

**Contributing Factors**:

1. **Split between plugin development and configuration**: Focus on building the plugin features may have overshadowed configuring it properly
2. **Complex dynamic loading**: The conditional plugin loading logic may have made it unclear how to apply the presets
3. **Lack of dogfooding validation**: No automated check to ensure the plugin uses its own features
4. **Documentation-implementation gap**: User docs show the right pattern but the project doesn't follow it

**Prevention Strategy**:

1. Add a validation check to ensure traceability rules are enabled in the project's ESLint config
2. Include dogfooding validation in CI pipeline
3. Document the correct self-configuration pattern in developer docs
4. Consider adding a script that verifies the plugin is properly configured on itself

## Failing Test (Critical for Problem Validation)

### Test Details

**Test Type**: Integration Test  
**Test Location**: `tests/integration/dogfooding-validation.test.ts` (to be created)  
**Test Name**: `should enforce traceability rules on plugin codebase`  
**Test Status**: Not Created

### Test Implementation

```typescript
/**
 * Dogfooding validation test
 * @story docs/stories/XXX.0-DOGFOODING-VALIDATION.story.md
 * @req REQ-DOGFOODING - Ensure plugin enforces its own rules on its codebase
 */
import { ESLint } from "eslint";
import * as fs from "fs";
import * as path from "path";

describe("Dogfooding Validation", () => {
  it("should have traceability rules enabled in eslint config", async () => {
    const configPath = path.join(__dirname, "../../eslint.config.js");
    const configContent = fs.readFileSync(configPath, "utf-8");

    // Verify that traceability rules are configured
    expect(configContent).toMatch(
      /traceability\.configs\.(recommended|strict)/,
    );
  });

  it("should enforce traceability rules on plugin source code", async () => {
    const eslint = new ESLint();

    // Lint a file known to have annotations
    const results = await eslint.lintFiles(["src/index.ts"]);

    // Get the rules that were actually run
    const rulesRun = new Set<string>();
    results.forEach((result) => {
      result.messages.forEach((message) => {
        if (message.ruleId?.startsWith("traceability/")) {
          rulesRun.add(message.ruleId);
        }
      });
    });

    // At minimum, we should be running some traceability rules
    // (even if there are no violations, the rules should be active)
    const config = await eslint.calculateConfigForFile("src/index.ts");
    const traceabilityRules = Object.keys(config.rules || {}).filter((rule) =>
      rule.startsWith("traceability/"),
    );

    expect(traceabilityRules.length).toBeGreaterThan(0);
  });
});
```

### Test Description

**What it reproduces**: The test verifies that traceability rules are enabled in the ESLint configuration and actively running on the plugin's source code.

**Expected behavior**:

- The `eslint.config.js` should include the traceability preset
- Running ESLint on plugin source files should have traceability rules active
- Configuration for any source file should show traceability rules enabled

**Actual behavior**:

- The `eslint.config.js` registers the plugin but doesn't configure any rules
- No traceability rules are active when linting
- Configuration shows no traceability rules enabled

### Test Management During Workaround

- [ ] **Test skipped/disabled**: N/A - test doesn't exist yet
- [ ] **Code excluded from coverage**: N/A
- [ ] **Skip reason documented**: N/A

### Test Re-enablement for Fix Validation

- [ ] **Test re-enabled**: {Date} - When permanent fix is implemented
- [ ] **Test passes**: {Confirmation that test now passes with fix}
- [ ] **Coverage updated**: {Previously excluded code now included in coverage}

## Permanent Fix Story

**Story Reference**: `docs/stories/023.0-MAINT-DOGFOODING-VALIDATION.story.md`  
**Story Status**: Created - Ready for implementation

### Story Requirements

- [x] **Independent**: Can be developed independently
- [x] **Negotiable**: Implementation details can be refined (could use recommended or strict, could configure individual rules)
- [x] **Valuable**: Delivers clear business value by ensuring plugin validates its own annotations
- [x] **Estimable**: Scope is clear - enable preset and fix violations
- [x] **Small**: Can be completed within reasonable timeframe (may require fixing existing violations)
- [x] **Testable**: Success can be verified through lint runs and automated tests

## Resolution and Closure

### Resolution Steps

- [ ] **Permanent fix implemented**: {Implementation date}
- [ ] **Tests re-enabled**: N/A - new test will be created
- [ ] **Tests passing**: {Failing tests now pass, confirming fix effectiveness}
- [ ] **Coverage updated**: {Previously excluded code now included in coverage}
- [ ] **Fix verified in production**: N/A - affects development only
- [ ] **Problem no longer occurs**: {Confirmation date}
- [ ] **Monitoring period completed**: {End date}

### Confirmation Criteria

- Running `npm run lint` shows traceability rule violations if annotations are invalid
- The `eslint.config.js` includes the traceability preset or individual rule configurations
- Dogfooding validation test passes
- All existing annotation violations are resolved
- CI pipeline enforces traceability rules

### Post-Resolution Notes

{Any additional notes about the resolution, lessons learned, or preventive measures implemented}

## Related Issues and References

### Related Problems

- None identified

### Related Stories

- **023.0-MAINT-DOGFOODING-VALIDATION** - Permanent fix story for enabling plugin self-validation

### Related Decisions

- May need ADR about dogfooding requirements and self-validation

### External References

- User documentation: `user-docs/eslint-9-setup-guide.md` - shows correct pattern
- Plugin exports: `src/index.ts` - exports recommended/strict configs

## Timeline

| Date       | Event                 | Notes                                            |
| ---------- | --------------------- | ------------------------------------------------ |
| 2025-12-06 | Problem identified    | Discovered during review of ESLint configuration |
| 2025-12-06 | Investigation started | Verified no traceability rules are enabled       |
| 2025-12-06 | Impact assessed       | 1,737+ annotations not being validated           |
|            |                       |                                                  |
|            |                       |                                                  |
|            |                       |                                                  |

---

## Notes

This problem represents a significant gap in the project's quality assurance and dogfooding practices. The plugin provides comprehensive traceability validation features but doesn't use them on its own codebase, which undermines credibility and misses opportunities to catch annotation errors early.

The workaround (enabling the recommended preset) is straightforward but may reveal many existing violations that need to be addressed. The permanent fix should include:

1. Enabling the traceability preset in `eslint.config.js`
2. Resolving all existing annotation violations
3. Adding automated validation to prevent regression
4. Documenting the dogfooding approach for contributors

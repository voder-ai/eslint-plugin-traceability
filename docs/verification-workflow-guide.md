# Verification Workflow Guide

This guide explains how to use traceability annotations to systematically verify that your code correctly implements requirements.

## Table of Contents

- [Core Concepts](#core-concepts)
- [Basic Verification Workflow](#basic-verification-workflow)
- [Verifying Different Code Structures](#verifying-different-code-structures)
- [Team Workflows](#team-workflows)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Core Concepts

### What Are Verification Indices?

Traceability annotations are **verification indices** - searchable checkpoints that enable systematic validation of requirement-to-code mapping.

**Key characteristics:**

- **Searchable:** Find all implementation claims with simple grep/search
- **Local:** Each annotation is adjacent to the code it documents
- **Independent:** Verify each checkpoint without understanding broader context
- **Complete:** No code can exist without explaining its purpose

### The Tractability Transformation

**Without verification indices:**

- Question: "Does code exist somewhere that should support REQ-AUTH-VALIDATION?"
- Answer: Must read entire codebase hoping not to miss anything
- Result: **Impossible for large codebases**

**With verification indices:**

- Question: "Does this annotated code actually support the requirement it claims to?"
- Answer: Search for REQ-AUTH-VALIDATION, verify each result
- Result: **Tractable, systematic, parallelizable**

## Basic Verification Workflow

### Step 1: Search for the Requirement

Use grep or your IDE's search to find all claims about a requirement:

```bash
grep -r "REQ-AUTH-VALIDATION" src/
```

**Example results:**

```
src/auth.js:23:  // @supports docs/stories/auth.md REQ-AUTH-VALIDATION
src/auth.js:45:  // @supports docs/stories/auth.md REQ-AUTH-VALIDATION
src/middleware/validate.js:12:  // @supports docs/stories/auth.md REQ-AUTH-VALIDATION
test/auth.test.js:8:  // @supports docs/stories/auth.md REQ-AUTH-VALIDATION
```

### Step 2: Review Each Location

For each search result, open the file and review the annotated code:

**Location 1: `src/auth.js:23`**

```javascript
// @supports docs/stories/auth.md REQ-AUTH-VALIDATION
function validateCredentials(username, password) {
  if (!username || !password) {
    throw new Error('Missing credentials');
  }
  // ... validation logic
}
```

**Verification:** ✅ Function validates credentials as required

**Location 2: `src/auth.js:45`**

```javascript
// @supports docs/stories/auth.md REQ-AUTH-VALIDATION
if (session.expired) {
  throw new Error('Session expired');
}
```

**Verification:** ✅ Branch validates session state as required

### Step 3: Confirm Completeness

Because the plugin requires annotations at all key points (functions and branches), you can be confident that:

- ✅ All code supporting this requirement has been found
- ✅ No code can hide without an annotation
- ✅ The verification is complete

**Verification time:** ~30 seconds per location × 4 locations = **~2 minutes total**

## Verifying Different Code Structures

### Function-Level Verification

**Annotation:**

```javascript
/**
 * @supports docs/stories/logging.md REQ-STRUCTURED-LOGGING
 */
function formatLogEntry(level, message, metadata) {
  return {
    timestamp: Date.now(),
    level,
    message,
    ...metadata,
  };
}
```

**Verification questions:**

- Does this function implement structured logging as required?
- Are all required fields present (timestamp, level, message)?
- Does it handle metadata correctly?

**Verification time:** ~30 seconds

### Branch-Level Verification

**Annotation:**

```javascript
switch (logLevel) {
  // @supports docs/stories/logging.md REQ-LOG-LEVELS
  case 'debug':
    logger.debug(message);
    break;
  // @supports docs/stories/logging.md REQ-LOG-LEVELS
  case 'info':
    logger.info(message);
    break;
  // @supports docs/stories/logging.md REQ-LOG-LEVELS
  case 'warn':
    logger.warn(message);
    break;
  // @supports docs/stories/logging.md REQ-LOG-LEVELS
  case 'error':
    logger.error(message);
    break;
}
```

**Verification process:**

1. Search finds 4 annotations (one per case)
2. Verify each case handles its log level correctly
3. Confirm all required levels are present

**Verification time:** ~30 seconds per case × 4 cases = **~2 minutes total**

### Conditional Logic Verification

**Annotation:**

```javascript
// @supports docs/stories/security.md REQ-ACCESS-CONTROL
if (user.role === 'admin') {
  return fullAccess();
}
// @supports docs/stories/security.md REQ-ACCESS-CONTROL
else if (user.role === 'editor') {
  return editAccess();
}
// @supports docs/stories/security.md REQ-ACCESS-CONTROL
else {
  return readOnlyAccess();
}
```

**Verification questions:**

- Does each branch implement the correct access level?
- Are all roles handled?
- Is the fallback (else) appropriate?

**Verification time:** ~30 seconds per branch × 3 branches = **~90 seconds total**

### Error Handling Verification

**Annotation:**

```javascript
try {
  await processPayment(order);
} catch (error) {
  // @supports docs/stories/payments.md REQ-PAYMENT-ERROR-HANDLING
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return handleInsufficientFunds(order);
  }
  // @supports docs/stories/payments.md REQ-PAYMENT-ERROR-HANDLING
  else if (error.code === 'NETWORK_ERROR') {
    return retryPayment(order);
  }
  // @supports docs/stories/payments.md REQ-PAYMENT-ERROR-HANDLING
  else {
    return handleUnknownError(order, error);
  }
}
```

**Verification questions:**

- Are all required error cases handled?
- Do handlers implement correct recovery logic?
- Is the unknown error case handled safely?

**Verification time:** ~30 seconds per case × 3 cases = **~90 seconds total**

## Team Workflows

### Parallel Verification

Verification indices enable splitting work across team members:

**Requirement:** REQ-API-VALIDATION (12 implementation points)

**Team split:**

- **Alice:** Verifies locations 1-4 (input validation functions)
- **Bob:** Verifies locations 5-8 (API endpoint handlers)
- **Carol:** Verifies locations 9-12 (error handling branches)

**Total time:** ~6 minutes per person = **6 minutes total** (vs 18 minutes sequential)

### Code Review Workflow

**Reviewer checklist:**

1. **Search for affected requirements:**

   ```bash
   grep -r "REQ-NEW-FEATURE" src/
   ```

2. **Verify each implementation:**

   - Does the code match the annotation claim?
   - Is the implementation correct?
   - Are all required cases covered?

3. **Check completeness:**
   - Are all expected implementation points found?
   - Any missing branches or cases?

**Review time:** ~2-5 minutes per requirement

### Change Impact Analysis

When a requirement changes, find all affected code:

```bash
# Find all code claiming to implement this requirement
grep -r "REQ-AUTH-METHOD" src/

# Review each location for necessary updates
# The annotations tell you exactly what claims to verify
```

## Best Practices

### DO: Use Descriptive Requirement IDs

**Good:**

```javascript
// @supports docs/stories/auth.md REQ-PASSWORD-VALIDATION
```

**Why:** Clear requirement IDs make verification obvious

### DO: Annotate Every Branch

**Good:**

```javascript
// @supports docs/stories/payments.md REQ-PAYMENT-RETRY
if (error.code === 'NETWORK_ERROR') {
  return retryPayment();
}
// @supports docs/stories/payments.md REQ-PAYMENT-RETRY
else {
  return failPayment();
}
```

**Why:** Each branch is an independent verification checkpoint

### DO: Keep Annotations Adjacent to Code

**Good:**

```javascript
// @supports docs/stories/logging.md REQ-ERROR-LOGGING
function logError(error) {
  logger.error(error.message);
}
```

**Why:** Local verification - no need to look elsewhere

### DON'T: Try to "Optimize" Annotations

**Bad:**

```javascript
// @supports docs/stories/logging.md REQ-LOG-LEVELS
// (applies to all cases below)
switch (logLevel) {
  case 'debug':
    logger.debug(message);
    break;
  case 'info':
    logger.info(message);
    break;
}
```

**Why:** Breaks searchability - can't verify individual cases independently

### DON'T: Use Inheritance or References

**Bad:**

```javascript
// @supports docs/stories/auth.md REQ-AUTH-VALIDATION (see parent function)
function validateSession() {
  // ...
}
```

**Why:** Forces verifier to trace references instead of local verification

## Troubleshooting

### "Too Many Search Results"

**Problem:** Searching for a requirement returns too many results to review efficiently.

**Solution:**

- Break down the requirement into more specific sub-requirements
- Use more specific requirement IDs (REQ-AUTH-PASSWORD vs REQ-AUTH)
- Filter search by directory: `grep -r "REQ-AUTH" src/auth/`

### "Can't Find All Implementations"

**Problem:** Unsure if search found all code implementing a requirement.

**Solution:**

- The plugin requires annotations at all key points (functions/branches)
- If code isn't annotated, ESLint will report an error
- You can trust that search results are complete

### "Annotations Feel Redundant"

**Problem:** Same requirement appears in multiple places.

**Solution:**

- This is intentional - each annotation is a separate verification checkpoint
- "Redundancy" enables independent verification of each location
- Removing annotations would break verification workflow
- See [Common Misconceptions](../README.md#common-misconceptions)

### "Verification Takes Too Long"

**Problem:** Too many locations to verify in one session.

**Solution:**

- Split verification across team members (see [Parallel Verification](#parallel-verification))
- Verify incrementally as code changes rather than all at once
- Focus on high-risk requirements first
- Each checkpoint takes ~30 seconds; budget accordingly

## Summary

Verification indices transform requirement validation from an impossible task (reading entire codebase) into a tractable workflow:

1. **Search** - Find all implementation claims
2. **Verify** - Check each claim independently
3. **Complete** - Confirm all code is found

This systematic approach enables:

- ✅ **Fast verification** - ~30 seconds per checkpoint
- ✅ **Parallel work** - Split across team members
- ✅ **Complete coverage** - No hidden code
- ✅ **Local reasoning** - No complex tracing needed

For more examples and configuration details, see:

- [README](../README.md)
- [API Reference](../user-docs/api-reference.md)
- [Examples](../user-docs/examples.md)

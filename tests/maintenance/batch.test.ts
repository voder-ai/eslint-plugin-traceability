/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-BATCH - Perform batch updates
 * @req REQ-MAINT-VERIFY - Verify annotation references
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-BATCH REQ-MAINT-VERIFY
 */
import * as fs from "fs";
import * as path from "path";
import { createTempDir } from "../utils/temp-dir-helpers";
import {
  batchUpdateAnnotations,
  verifyAnnotations,
} from "../../src/maintenance/batch";

describe("batchUpdateAnnotations (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  let temp: ReturnType<typeof createTempDir>;

  beforeAll(() => {
    temp = createTempDir("batch-test-");
  });

  afterAll(() => {
    temp.cleanup();
  });

  it("[REQ-MAINT-BATCH] should return 0 count when no mappings applied", () => {
    const result = batchUpdateAnnotations(temp.dir, []);
    expect(result.count).toBe(0);
    expect(result.warnings).toEqual([]);
  });
});

describe("verifyAnnotations (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  let temp: ReturnType<typeof createTempDir>;

  beforeAll(() => {
    temp = createTempDir("verify-test-");
    const tsContent = `
/**
 * Tests for: my-story.story.md
 * @story my-story.story.md
 */
`;
    fs.writeFileSync(path.join(temp.dir, "test.ts"), tsContent);
    fs.writeFileSync(path.join(temp.dir, "my-story.story.md"), "# Dummy Story");
  });

  afterAll(() => {
    temp.cleanup();
  });

  it("[REQ-MAINT-VERIFY] should return true when annotations are valid", () => {
    const valid = verifyAnnotations(temp.dir);
    expect(valid).toBe(true);
  });
});

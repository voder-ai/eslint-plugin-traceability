/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-BATCH - Perform batch updates
 * @req REQ-MAINT-VERIFY - Verify annotation references
 */
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
  batchUpdateAnnotations,
  verifyAnnotations,
} from "../../src/maintenance/batch";

describe("batchUpdateAnnotations (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "batch-test-"));
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("[REQ-MAINT-BATCH] should return 0 when no mappings applied", () => {
    const count = batchUpdateAnnotations(tmpDir, []);
    expect(count).toBe(0);
  });
});

describe("verifyAnnotations (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "verify-test-"));
    const tsContent = `
/**
 * Tests for: my-story.story.md
 * @story my-story.story.md
 */
`;
    fs.writeFileSync(path.join(tmpDir, "test.ts"), tsContent);
    fs.writeFileSync(path.join(tmpDir, "my-story.story.md"), "# Dummy Story");
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("[REQ-MAINT-VERIFY] should return true when annotations are valid", () => {
    const valid = verifyAnnotations(tmpDir);
    expect(valid).toBe(true);
  });
});
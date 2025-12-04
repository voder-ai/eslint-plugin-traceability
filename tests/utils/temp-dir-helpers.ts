/**
 * Shared temp directory helpers for maintenance tests.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-TEMP-HELPERS - Provide reusable OS tempdir setup/cleanup utilities for tests
 */
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export interface TempDirHandle {
  /** The absolute path to the created temporary directory. */
  readonly dir: string;
  /** Remove the directory recursively; safe to call multiple times. */
  cleanup(): void;
}

/**
 * Create a temporary directory under the OS temp root with a common prefix.
 *
 * This helper centralizes the mkdtemp + rmSync pattern that appears in
 * multiple maintenance tests so those tests can focus on behavior instead
 * of filesystem plumbing.
 */
export function createTempDir(prefix: string): TempDirHandle {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));

  return {
    dir,
    cleanup() {
      // @implements docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}

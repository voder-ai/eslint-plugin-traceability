/**
 * Shared temp directory helpers for maintenance tests.
 *
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
 */
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export interface TempDirHandle {
  /** The absolute path to the created temporary directory. */
  readonly dir: string;
  /**
   * Remove the directory recursively; safe to call multiple times.
   * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
   */
  cleanup(): void;
}

/**
 * Create a temporary directory under the OS temp root with a common prefix.
 *
 * This helper centralizes the mkdtemp + rmSync pattern that appears in
 * multiple maintenance tests so those tests can focus on behavior instead
 * of filesystem plumbing.
 *
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
 */
export function createTempDir(prefix: string): TempDirHandle {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));

  return {
    dir,
    cleanup() {
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}
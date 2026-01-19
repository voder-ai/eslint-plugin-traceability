/* eslint-disable traceability/require-traceability */

/**
 * Shared filesystem mocking utilities for rule tests.
 *
 * @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-FILE-EXISTENCE REQ-ERROR-HANDLING
 */
export function mockFsForExistingFile(
  fs: typeof import("fs"),
  filePath: string,
): void {
  jest.spyOn(fs, "existsSync").mockImplementation((...args: any[]) => {
    const p = args[0] as string;
    return p === filePath;
  });

  jest.spyOn(fs, "statSync").mockImplementation((...args: any[]) => {
    const p = args[0] as string;
    if (p === filePath) {
      return {
        isFile: () => true,
      } as any;
    }
    const err: NodeJS.ErrnoException = new Error("ENOENT");
    err.code = "ENOENT";
    throw err;
  });
}

/**
 * Shared filesystem mocking utilities for rule tests.
 *
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-TEST-UTILS-FS - Provide helpers to reduce duplication in fs-related tests
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

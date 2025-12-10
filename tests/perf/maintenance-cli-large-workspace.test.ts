/**
 * CLI-level performance tests for maintenance tools on large workspaces.
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT REQ-MAINT-REPORT REQ-MAINT-SAFE
 */
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { performance } from "perf_hooks";
import { runMaintenanceCli } from "../../src/maintenance/cli";

// Performance budget documented in docs/maintenance-performance-tests.md
const CLI_LARGE_WORKSPACE_PERF_BUDGET_MS = 5000;

function createCliLargeWorkspace(): { root: string; cleanup: () => void } {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "traceability-cli-large-"),
  );

  // Create a modestly sized workspace reusing the same shape as the core perf tests,
  // but with fewer files to keep end-to-end CLI timing predictable.
  for (let moduleIndex = 0; moduleIndex < 5; moduleIndex += 1) {
    const moduleDir = path.join(
      root,
      `module-${moduleIndex.toString().padStart(3, "0")}`,
    );
    fs.mkdirSync(moduleDir);

    for (let fileIndex = 0; fileIndex < 20; fileIndex += 1) {
      const filePath = path.join(
        moduleDir,
        `file-${fileIndex.toString().padStart(3, "0")}.ts`,
      );
      const validStory = "cli-valid.story.md";
      const staleStory = "cli-stale.story.md";
      const content = `/**
 * @story ${validStory}
 * @story ${staleStory}
 */
export function cli_example_${moduleIndex}_${fileIndex}() {}
`;
      fs.writeFileSync(filePath, content, "utf8");
    }
  }

  // Create the valid story file so that only the stale entries are reported.
  fs.writeFileSync(
    path.join(root, "cli-valid.story.md"),
    "# cli valid",
    "utf8",
  );

  return {
    root,
    cleanup: () => {
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

function createDeepNestedCliWorkspace(): { root: string; cleanup: () => void } {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "traceability-cli-deep-nested-"),
  );

  // Create a deeply nested directory structure with a small number of files.
  for (let branchIndex = 0; branchIndex < 3; branchIndex += 1) {
    const level1 = path.join(
      root,
      `branch-${branchIndex.toString().padStart(3, "0")}`,
    );
    fs.mkdirSync(level1);

    const level2 = path.join(level1, "deep", "nested", "structure");
    fs.mkdirSync(path.join(level1, "deep"), { recursive: true });
    fs.mkdirSync(path.join(level1, "deep", "nested"), { recursive: true });
    fs.mkdirSync(level2, { recursive: true });

    for (let fileIndex = 0; fileIndex < 3; fileIndex += 1) {
      const filePath = path.join(
        level2,
        `deep-file-${fileIndex.toString().padStart(3, "0")}.ts`,
      );
      const validStory = "cli-valid.story.md";
      const staleStory = "cli-deep-stale.story.md";
      const content = `/**
 * @story ${validStory}
 * @story ${staleStory}
 */
export function cli_deep_example_${branchIndex}_${fileIndex}() {}
`;
      fs.writeFileSync(filePath, content, "utf8");
    }
  }

  // Create the valid story file so that only the stale entries are reported.
  fs.writeFileSync(
    path.join(root, "cli-valid.story.md"),
    "# cli valid",
    "utf8",
  );

  return {
    root,
    cleanup: () => {
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

describe("Maintenance CLI on large workspaces (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  it("[REQ-MAINT-DETECT] detect --json completes within a generous time budget and returns JSON payload", () => {
    const { root, cleanup } = createCliLargeWorkspace();
    const originalCwd = process.cwd();
    process.chdir(root);

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    try {
      const start = performance.now();
      const exitCode = runMaintenanceCli([
        "node",
        "traceability-maint",
        "detect",
        "--root",
        root,
        "--json",
      ]);
      const durationMs = performance.now() - start;

      expect(exitCode === 0 || exitCode === 1).toBe(true);
      expect(durationMs).toBeLessThan(CLI_LARGE_WORKSPACE_PERF_BUDGET_MS);

      expect(logSpy).toHaveBeenCalledTimes(1);
      const payloadRaw = String(logSpy.mock.calls[0][0]);
      const payload = JSON.parse(payloadRaw) as {
        root: string;
        stale: string[];
      };
      expect(payload.root).toBe(root);
      expect(Array.isArray(payload.stale)).toBe(true);
      expect(payload.stale.length).toBeGreaterThan(0);
    } finally {
      logSpy.mockRestore();
      process.chdir(originalCwd);
      cleanup();
    }
  });

  it("[REQ-MAINT-REPORT] report --format=json completes within a generous time budget", () => {
    const { root, cleanup } = createCliLargeWorkspace();
    const originalCwd = process.cwd();
    process.chdir(root);

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    try {
      const start = performance.now();
      const exitCode = runMaintenanceCli([
        "node",
        "traceability-maint",
        "report",
        "--root",
        root,
        "--format",
        "json",
      ]);
      const durationMs = performance.now() - start;

      expect(exitCode).toBe(0);
      expect(durationMs).toBeLessThan(CLI_LARGE_WORKSPACE_PERF_BUDGET_MS);

      expect(logSpy).toHaveBeenCalledTimes(1);
      const payloadRaw = String(logSpy.mock.calls[0][0]);
      const payload = JSON.parse(payloadRaw) as {
        root: string;
        report: string;
      };
      expect(payload.root).toBe(root);
      expect(typeof payload.report).toBe("string");
    } finally {
      logSpy.mockRestore();
      process.chdir(originalCwd);
      cleanup();
    }
  });

  it("[REQ-MAINT-VERIFY] verify completes within a generous time budget and reports stale annotations", () => {
    const { root, cleanup } = createCliLargeWorkspace();
    const originalCwd = process.cwd();
    process.chdir(root);

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    try {
      const start = performance.now();
      const exitCode = runMaintenanceCli([
        "node",
        "traceability-maint",
        "verify",
        "--root",
        root,
      ]);
      const durationMs = performance.now() - start;

      expect(exitCode).toBe(1);
      expect(durationMs).toBeLessThan(CLI_LARGE_WORKSPACE_PERF_BUDGET_MS);

      expect(logSpy).toHaveBeenCalledTimes(1);
      const message = String(logSpy.mock.calls[0][0]);
      expect(message).toContain(
        "Stale or invalid traceability annotations detected under",
      );
    } finally {
      logSpy.mockRestore();
      process.chdir(originalCwd);
      cleanup();
    }
  });

  it("[REQ-MAINT-DETECT] detect traverses deeply nested directories within a generous time budget", () => {
    const { root, cleanup } = createDeepNestedCliWorkspace();
    const originalCwd = process.cwd();
    process.chdir(root);

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    try {
      const start = performance.now();
      const exitCode = runMaintenanceCli([
        "node",
        "traceability-maint",
        "detect",
        "--root",
        root,
        "--json",
      ]);
      const durationMs = performance.now() - start;

      expect(exitCode === 0 || exitCode === 1).toBe(true);
      expect(durationMs).toBeLessThan(CLI_LARGE_WORKSPACE_PERF_BUDGET_MS);

      expect(logSpy).toHaveBeenCalledTimes(1);
      const payloadRaw = String(logSpy.mock.calls[0][0]);
      const payload = JSON.parse(payloadRaw) as {
        root: string;
        stale: string[];
      };
      expect(payload.root).toBe(root);
      expect(Array.isArray(payload.stale)).toBe(true);
      expect(payload.stale.length).toBeGreaterThan(0);
    } finally {
      logSpy.mockRestore();
      process.chdir(originalCwd);
      cleanup();
    }
  });
});

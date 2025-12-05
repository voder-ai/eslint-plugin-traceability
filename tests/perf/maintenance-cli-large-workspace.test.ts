/**
 * CLI-level performance tests for maintenance tools on large workspaces.
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT REQ-MAINT-REPORT REQ-MAINT-SAFE
 */
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { performance } from "perf_hooks";
import { runMaintenanceCli } from "../../src/maintenance/cli";

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

describe("Maintenance CLI on large workspaces (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  let workspace: { root: string; cleanup: () => void };
  let originalCwd: string;

  beforeAll(() => {
    originalCwd = process.cwd();
    workspace = createCliLargeWorkspace();
    process.chdir(workspace.root);
  });

  afterAll(() => {
    process.chdir(originalCwd);
    workspace.cleanup();
  });

  it("[REQ-MAINT-DETECT] detect --json completes within a generous time budget and returns JSON payload", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const start = performance.now();
    const exitCode = runMaintenanceCli([
      "node",
      "traceability-maint",
      "detect",
      "--root",
      workspace.root,
      "--json",
    ]);
    const durationMs = performance.now() - start;

    expect(exitCode === 0 || exitCode === 1).toBe(true);
    expect(durationMs).toBeLessThan(5000);

    expect(logSpy).toHaveBeenCalledTimes(1);
    const payloadRaw = String(logSpy.mock.calls[0][0]);
    const payload = JSON.parse(payloadRaw) as { root: string; stale: string[] };
    expect(payload.root).toBe(workspace.root);
    expect(Array.isArray(payload.stale)).toBe(true);
    expect(payload.stale.length).toBeGreaterThan(0);

    logSpy.mockRestore();
  });

  it("[REQ-MAINT-REPORT] report --format=json completes within a generous time budget", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const start = performance.now();
    const exitCode = runMaintenanceCli([
      "node",
      "traceability-maint",
      "report",
      "--root",
      workspace.root,
      "--format",
      "json",
    ]);
    const durationMs = performance.now() - start;

    expect(exitCode).toBe(0);
    expect(durationMs).toBeLessThan(5000);

    expect(logSpy).toHaveBeenCalledTimes(1);
    const payloadRaw = String(logSpy.mock.calls[0][0]);
    const payload = JSON.parse(payloadRaw) as { root: string; report: string };
    expect(payload.root).toBe(workspace.root);
    expect(typeof payload.report).toBe("string");

    logSpy.mockRestore();
  });
});

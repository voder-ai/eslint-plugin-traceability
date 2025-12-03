/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT - CLI detection of stale annotations
 * @req REQ-MAINT-VERIFY - CLI verification of annotations
 * @req REQ-MAINT-REPORT - CLI reporting of stale annotations
 * @req REQ-MAINT-UPDATE - CLI updating of annotation references
 * @req REQ-MAINT-SAFE - Clear exit codes and non-destructive dry-run
 */
import fs from "fs";
import os from "os";
import path from "path";
import { runMaintenanceCli } from "../../src/maintenance/cli";

function withTempDir(): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "maint-cli-"));
  return tmpDir;
}

describe("Maintenance CLI (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  let originalCwd: string;

  beforeAll(() => {
    originalCwd = process.cwd();
  });

  afterAll(() => {
    process.chdir(originalCwd);
  });

  it("[REQ-MAINT-DETECT] detect exits with code 0 and message when no stale annotations", () => {
    const dir = withTempDir();
    process.chdir(dir);
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const code = runMaintenanceCli(["node", "traceability-maint", "detect"]);
    try {
      expect(code).toBe(0);
      expect(logSpy).toHaveBeenCalledWith("No stale @story annotations found.");
    } finally {
      logSpy.mockRestore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("[REQ-MAINT-VERIFY] verify exits with code 0 when annotations valid", () => {
    const dir = withTempDir();
    process.chdir(dir);
    const tsContent = `/**\n * @story my-story.story.md\n */`;
    fs.writeFileSync(path.join(dir, "file.ts"), tsContent, "utf8");
    fs.writeFileSync(
      path.join(dir, "my-story.story.md"),
      "# Dummy Story",
      "utf8",
    );

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const code = runMaintenanceCli(["node", "traceability-maint", "verify"]);
    try {
      expect(code).toBe(0);
      expect(logSpy).toHaveBeenCalledTimes(1);
    } finally {
      logSpy.mockRestore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("[REQ-MAINT-REPORT] report prints human-readable summary and exits 0", () => {
    const dir = withTempDir();
    process.chdir(dir);
    const tsContent = `/**\n * @story missing.story.md\n */`;
    fs.writeFileSync(path.join(dir, "file.ts"), tsContent, "utf8");

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const code = runMaintenanceCli(["node", "traceability-maint", "report"]);
    try {
      expect(code).toBe(0);
      const allMessages = logSpy.mock.calls.flat().join("\n");
      expect(allMessages).toContain("Traceability Maintenance Report");
      expect(allMessages).toContain("missing.story.md");
    } finally {
      logSpy.mockRestore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("[REQ-MAINT-UPDATE] update performs replacements and exits 0", () => {
    const dir = withTempDir();
    process.chdir(dir);
    const tsContent = `/**\n * @story old.path.md\n */`;
    fs.writeFileSync(path.join(dir, "file.ts"), tsContent, "utf8");

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const code = runMaintenanceCli([
      "node",
      "traceability-maint",
      "update",
      "--from",
      "old.path.md",
      "--to",
      "new.path.md",
    ]);
    try {
      expect(code).toBe(0);
      const updated = fs.readFileSync(path.join(dir, "file.ts"), "utf8");
      expect(updated).toContain("@story new.path.md");
    } finally {
      logSpy.mockRestore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("[REQ-MAINT-SAFE] update requires --from and --to and exits 2 when missing", () => {
    const dir = withTempDir();
    process.chdir(dir);
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const code = runMaintenanceCli(["node", "traceability-maint", "update"]);

    try {
      expect(code).toBe(2);
      expect(errorSpy).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
      logSpy.mockRestore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("[REQ-MAINT-SAFE] dry-run does not modify files and exits 0", () => {
    const dir = withTempDir();
    process.chdir(dir);
    const tsContent = `/**\n * @story old.path.md\n */`;
    fs.writeFileSync(path.join(dir, "file.ts"), tsContent, "utf8");

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const code = runMaintenanceCli([
      "node",
      "traceability-maint",
      "update",
      "--from",
      "old.path.md",
      "--to",
      "new.path.md",
      "--dry-run",
    ]);
    try {
      expect(code).toBe(0);
      const contentAfter = fs.readFileSync(path.join(dir, "file.ts"), "utf8");
      expect(contentAfter).toBe(tsContent);
    } finally {
      logSpy.mockRestore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("[REQ-MAINT-SAFE] report exits 2 and prints error on invalid --format value", () => {
    const dir = withTempDir();
    process.chdir(dir);
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const code = runMaintenanceCli([
      "node",
      "traceability-maint",
      "report",
      "--format",
      "yaml",
    ]);

    try {
      expect(code).toBe(2);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      const message = String(errorSpy.mock.calls[0][0]);
      expect(message).toContain("Invalid format: yaml");
      expect(message).toContain("Expected 'text' or 'json'");
    } finally {
      errorSpy.mockRestore();
      logSpy.mockRestore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("[REQ-MAINT-DETECT] detect supports --json output", () => {
    const dir = withTempDir();
    process.chdir(dir);
    const tsContent = `/**\n * @story stale.story.md\n */`;
    fs.writeFileSync(path.join(dir, "file.ts"), tsContent, "utf8");

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const code = runMaintenanceCli([
      "node",
      "traceability-maint",
      "detect",
      "--json",
    ]);
    try {
      expect(code).toBe(1);
      expect(logSpy).toHaveBeenCalledTimes(1);
      const payload = JSON.parse(String(logSpy.mock.calls[0][0]));
      expect(Array.isArray(payload.stale)).toBe(true);
      expect(payload.stale).toContain("stale.story.md");
    } finally {
      logSpy.mockRestore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("[REQ-MAINT-DETECT] detect with non-existent --root exits 0 and reports no stale annotations", () => {
    const dir = withTempDir();
    process.chdir(dir);
    const missingRoot = path.join(dir, "missing-root");
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const code = runMaintenanceCli([
      "node",
      "traceability-maint",
      "detect",
      "--root",
      missingRoot,
    ]);

    try {
      expect(code).toBe(0);
      expect(logSpy).toHaveBeenCalledWith("No stale @story annotations found.");
    } finally {
      logSpy.mockRestore();
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

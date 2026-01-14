/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI REQ-MAINT-MANUAL-TRIGGER REQ-MAINT-UPDATE
 */
import fs from "fs";
import path from "path";
import { runMaintenanceCli } from "../../src/maintenance/cli";
import { createTempDir } from "../utils/temp-dir-helpers";

describe("Maintenance CLI (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  let originalCwd: string;

  beforeAll(() => {
    originalCwd = process.cwd();
  });

  afterAll(() => {
    process.chdir(originalCwd);
  });

  it("[REQ-MAINT-CLI] detect exits with code 0 and message when no stale annotations", () => {
    const temp = createTempDir("maint-cli-");
    const dir = temp.dir;
    process.chdir(dir);
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const code = runMaintenanceCli(["node", "traceability-maint", "detect"]);
    try {
      expect(code).toBe(0);
      expect(logSpy).toHaveBeenCalledWith("No stale @story annotations found.");
    } finally {
      logSpy.mockRestore();
      temp.cleanup();
    }
  });

  it("[REQ-MAINT-CLI] verify exits with code 0 when annotations valid", () => {
    const temp = createTempDir("maint-cli-");
    const dir = temp.dir;
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
      temp.cleanup();
    }
  });

  it("[REQ-MAINT-CLI] verify exits with code 1 and prints guidance when annotations are stale or invalid", () => {
    const temp = createTempDir("maint-cli-");
    const dir = temp.dir;
    process.chdir(dir);
    const tsContent = `/**\n * @story missing.story.md\n */`;
    fs.writeFileSync(path.join(dir, "file.ts"), tsContent, "utf8");

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const code = runMaintenanceCli(["node", "traceability-maint", "verify"]);

    try {
      expect(code).toBe(1);
      expect(logSpy).toHaveBeenCalledTimes(1);
      const message = String(logSpy.mock.calls[0][0]);
      expect(message).toContain(
        "Stale or invalid traceability annotations detected under",
      );
      expect(message).toContain(
        "Run 'traceability-maint detect' or 'traceability-maint report' for details.",
      );
    } finally {
      logSpy.mockRestore();
      temp.cleanup();
    }
  });

  it("[REQ-MAINT-CLI] report prints human-readable summary and exits 0", () => {
    const temp = createTempDir("maint-cli-");
    const dir = temp.dir;
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
      temp.cleanup();
    }
  });

  it("[REQ-MAINT-CLI] report prints 'nothing to report' when no stale annotations exist", () => {
    const temp = createTempDir("maint-cli-");
    const dir = temp.dir;
    process.chdir(dir);

    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const code = runMaintenanceCli(["node", "traceability-maint", "report"]);

    try {
      expect(code).toBe(0);
      expect(logSpy).toHaveBeenCalled();
      const allMessages = logSpy.mock.calls.flat().join("\n");
      expect(allMessages).toContain(
        "No stale @story annotations found. Nothing to report.",
      );
    } finally {
      logSpy.mockRestore();
      temp.cleanup();
    }
  });

  it("[REQ-MAINT-UPDATE] update performs replacements and exits 0", () => {
    const temp = createTempDir("maint-cli-");
    const dir = temp.dir;
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
      temp.cleanup();
    }
  });

  it("[REQ-MAINT-UPDATE] update requires --from and --to and exits 2 when missing", () => {
    const temp = createTempDir("maint-cli-");
    const dir = temp.dir;
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
      temp.cleanup();
    }
  });

  it("[REQ-MAINT-UPDATE] dry-run does not modify files and exits 0", () => {
    const temp = createTempDir("maint-cli-");
    const dir = temp.dir;
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
      temp.cleanup();
    }
  });

  it("[REQ-MAINT-CLI] report exits 2 and prints error on invalid --format value", () => {
    const temp = createTempDir("maint-cli-");
    const dir = temp.dir;
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
      temp.cleanup();
    }
  });

  it("[REQ-MAINT-CLI] detect supports --json output", () => {
    const temp = createTempDir("maint-cli-");
    const dir = temp.dir;
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
      temp.cleanup();
    }
  });

  it("[REQ-MAINT-CLI] detect with non-existent --root exits 0 and reports no stale annotations", () => {
    const temp = createTempDir("maint-cli-");
    const dir = temp.dir;
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
      temp.cleanup();
    }
  });

  it("[REQ-MAINT-CLI] prints help and exits 0 when no subcommand is provided", () => {
    const temp = createTempDir("maint-cli-");
    const dir = temp.dir;
    process.chdir(dir);
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const code = runMaintenanceCli(["node", "traceability-maint"]);

    try {
      expect(code).toBe(0);
      expect(logSpy).toHaveBeenCalled();
      const allMessages = logSpy.mock.calls.flat().join("\n");
      expect(allMessages).toContain(
        "traceability-maint - Traceability annotation maintenance tools",
      );
      expect(errorSpy).not.toHaveBeenCalled();
    } finally {
      logSpy.mockRestore();
      errorSpy.mockRestore();
      temp.cleanup();
    }
  });

  it("[REQ-MAINT-CLI] detect catches filesystem permission errors and exits 2 with prefixed error message", () => {
    const temp = createTempDir("maint-cli-");
    const dir = temp.dir;
    process.chdir(dir);
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const statSpy = jest.spyOn(fs, "statSync").mockImplementation(() => {
      const err: NodeJS.ErrnoException = new Error(
        "EACCES simulated",
      ) as NodeJS.ErrnoException;
      err.code = "EACCES";
      throw err;
    });

    const code = runMaintenanceCli(["node", "traceability-maint", "detect"]);

    try {
      expect(code).toBe(2);
      expect(errorSpy).toHaveBeenCalled();
      const message = String(errorSpy.mock.calls[0][0]);
      expect(message).toContain("traceability-maint failed:");
    } finally {
      statSpy.mockRestore();
      errorSpy.mockRestore();
      logSpy.mockRestore();
      temp.cleanup();
    }
  });
});

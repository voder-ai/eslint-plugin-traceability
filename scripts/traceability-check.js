#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

function walkDir(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip node_modules, .git, lib, dist
      if (["node_modules", ".git", "lib", "dist", "out"].includes(entry.name))
        continue;
      walkDir(full, fileList);
    } else if (entry.isFile() && full.endsWith(".ts")) {
      fileList.push(full);
    }
  }
  return fileList;
}

function getLeadingCommentText(sourceText, node) {
  const texts = [];
  // jsDoc nodes
  if (node.jsDoc && node.jsDoc.length) {
    for (const jd of node.jsDoc) {
      texts.push(sourceText.slice(jd.pos, jd.end));
    }
  }
  // leading comments
  const pos = node.getFullStart ? node.getFullStart() : node.pos;
  const ranges = ts.getLeadingCommentRanges(sourceText, pos) || [];
  for (const r of ranges) {
    texts.push(sourceText.slice(r.pos, r.end));
  }
  return texts.join("\n");
}

function checkFile(filePath) {
  const sourceText = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ true,
  );

  // compute file-level leading comments
  const fileLeadingRanges = ts.getLeadingCommentRanges(sourceText, 0) || [];
  let fileLeadingText = "";
  for (const r of fileLeadingRanges) {
    fileLeadingText += sourceText.slice(r.pos, r.end) + "\n";
  }
  const fileHasStory = /@story\b/.test(fileLeadingText);
  const fileHasReq = /@req\b/.test(fileLeadingText);

  const functions = [];
  const branches = [];

  function visit(node) {
    switch (node.kind) {
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.FunctionExpression:
      case ts.SyntaxKind.ArrowFunction:
      case ts.SyntaxKind.MethodDeclaration:
      case ts.SyntaxKind.MethodSignature:
      case ts.SyntaxKind.InterfaceDeclaration:
      case ts.SyntaxKind.VariableStatement:
        // We'll handle functions specifically
        break;
      default:
        break;
    }

    // Identify function-like nodes
    if (
      node.kind === ts.SyntaxKind.FunctionDeclaration ||
      node.kind === ts.SyntaxKind.FunctionExpression ||
      node.kind === ts.SyntaxKind.ArrowFunction ||
      node.kind === ts.SyntaxKind.MethodDeclaration ||
      node.kind === ts.SyntaxKind.MethodSignature
    ) {
      const leading = getLeadingCommentText(sourceText, node);
      let hasStory = /@story\b/.test(leading);
      let hasReq = /@req\b/.test(leading);

      // consider file-level annotations as satisfying node annotations
      hasStory = hasStory || fileHasStory;
      hasReq = hasReq || fileHasReq;

      let name = "<unknown>";
      try {
        if (node.name && node.name.escapedText) name = node.name.escapedText;
        else if (
          node.parent &&
          node.parent.kind === ts.SyntaxKind.VariableDeclaration &&
          node.parent.name &&
          node.parent.name.escapedText
        )
          name = node.parent.name.escapedText;
        else if (
          node.kind === ts.SyntaxKind.MethodDeclaration &&
          node.name &&
          node.name.getText
        )
          name = node.name.getText(sourceFile);
      } catch (e) {
        // ignore
      }

      const pos = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(sourceFile, false),
      );
      functions.push({
        filePath,
        line: pos.line + 1,
        name,
        kind: ts.SyntaxKind[node.kind],
        hasStory,
        hasReq,
      });
    }

    // Identify branches
    if (
      node.kind === ts.SyntaxKind.IfStatement ||
      node.kind === ts.SyntaxKind.SwitchStatement ||
      node.kind === ts.SyntaxKind.CaseClause ||
      node.kind === ts.SyntaxKind.TryStatement ||
      node.kind === ts.SyntaxKind.CatchClause ||
      node.kind === ts.SyntaxKind.ForStatement ||
      node.kind === ts.SyntaxKind.ForOfStatement ||
      node.kind === ts.SyntaxKind.ForInStatement ||
      node.kind === ts.SyntaxKind.WhileStatement ||
      node.kind === ts.SyntaxKind.DoStatement
    ) {
      const leading = getLeadingCommentText(sourceText, node);
      let hasStory = /@story\b/.test(leading);
      let hasReq = /@req\b/.test(leading);

      // consider file-level annotations as satisfying branch annotations
      hasStory = hasStory || fileHasStory;
      hasReq = hasReq || fileHasReq;

      const pos = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(sourceFile, false),
      );
      branches.push({
        filePath,
        line: pos.line + 1,
        kind: ts.SyntaxKind[node.kind],
        hasStory,
        hasReq,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  const missingFunctions = functions.filter((f) => !(f.hasStory && f.hasReq));
  const missingBranches = branches.filter((b) => !(b.hasStory && b.hasReq));

  return { missingFunctions, missingBranches };
}

function main() {
  const baseDir = path.resolve(process.cwd(), "src");
  if (!fs.existsSync(baseDir)) {
    console.error("src directory not found");
    process.exit(1);
  }

  const files = walkDir(baseDir);
  const report = [];
  const missingFunctionsAll = [];
  const missingBranchesAll = [];

  for (const f of files) {
    const res = checkFile(f);
    if (res.missingFunctions.length > 0)
      missingFunctionsAll.push(...res.missingFunctions);
    if (res.missingBranches.length > 0)
      missingBranchesAll.push(...res.missingBranches);
  }

  const outLines = [];
  outLines.push("# Traceability Report");
  outLines.push("Generated by scripts/traceability-check.js");
  outLines.push("");

  outLines.push("## Summary");
  outLines.push(`Files scanned: ${files.length}`);
  outLines.push(`Functions missing annotations: ${missingFunctionsAll.length}`);
  outLines.push(`Branches missing annotations: ${missingBranchesAll.length}`);
  outLines.push("");

  if (missingFunctionsAll.length > 0) {
    outLines.push("## Functions missing @story/@req");
    for (const f of missingFunctionsAll) {
      const missing = [];
      if (!f.hasStory) missing.push("@story");
      if (!f.hasReq) missing.push("@req");
      outLines.push(
        `- ${f.filePath}:${f.line} - ${f.kind} '${f.name}' - missing: ${missing.join(", ")}`,
      );
    }
    outLines.push("");
  }

  if (missingBranchesAll.length > 0) {
    outLines.push("## Branches missing @story/@req");
    for (const b of missingBranchesAll) {
      const missing = [];
      if (!b.hasStory) missing.push("@story");
      if (!b.hasReq) missing.push("@req");
      outLines.push(
        `- ${b.filePath}:${b.line} - ${b.kind} - missing: ${missing.join(", ")}`,
      );
    }
    outLines.push("");
  }

  const out = outLines.join("\n");
  fs.writeFileSync(path.join("scripts", "traceability-report.md"), out, "utf8");
  console.log("Traceability report written to scripts/traceability-report.md");
}

main();
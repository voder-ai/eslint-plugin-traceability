/**
 * Shared test helpers for require-story-core branch coverage.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Provide reusable helpers to exercise autofix branches
 */
/* global jest, expect */
 

const RANGE_ONE_START = 21;
const RANGE_ONE_END = 33;
const RANGE_TWO_START = 50;
const RANGE_TWO_END = 70;
const RANGE_PARENT_START = 5;
const RANGE_PARENT_END = 100;

interface ExerciseOptions {
  annotationText?: string;
}

const DEFAULT_ANNOTATION =
  "/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\n";

function baseFixer() {
  return {
    insertTextBeforeRange: jest.fn((r, t) => ({ r, t })),
  };
}

function exerciseBranch1(
  createAddStoryFix: any,
  annotation: string,
) {
  const fixer = baseFixer();
  const fixFn = createAddStoryFix(null as any);
  const res = fixFn(fixer);
  expect(fixer.insertTextBeforeRange).toHaveBeenCalledTimes(1);
  const args = (fixer.insertTextBeforeRange as jest.Mock).mock.calls[0];
  expect(args[0]).toEqual([0, 0]);
  expect(args[1]).toBe(annotation);
  expect(res).toEqual({
    r: [0, 0],
    t: annotation,
  });
}

function exerciseBranch2(
  createAddStoryFix: any,
  annotation: string,
) {
  const target: any = {
    type: "FunctionDeclaration",
    range: [RANGE_ONE_START, RANGE_ONE_END],
    parent: { type: "ClassBody" },
  };
  const fixer = baseFixer();
  const fixFn = createAddStoryFix(target);
  const res = fixFn(fixer);
  expect(
    (fixer.insertTextBeforeRange as jest.Mock).mock.calls[0][0],
  ).toEqual([RANGE_ONE_START, RANGE_ONE_START]);
  expect(
    (fixer.insertTextBeforeRange as jest.Mock).mock.calls[0][1],
  ).toBe(annotation);
  expect(res).toEqual({
    r: [RANGE_ONE_START, RANGE_ONE_START],
    t: annotation,
  });
}

function exerciseBranch3(
  createAddStoryFix: any,
  annotation: string,
) {
  const target: any = {
    type: "FunctionDeclaration",
    range: [RANGE_TWO_START, RANGE_TWO_END],
    parent: {
      type: "ExportDefaultDeclaration",
      range: [RANGE_PARENT_START, RANGE_PARENT_END],
    },
  };
  const fixer = baseFixer();
  const fixFn = createAddStoryFix(target);
  const res = fixFn(fixer);
  expect(
    (fixer.insertTextBeforeRange as jest.Mock).mock.calls[0][0],
  ).toEqual([RANGE_PARENT_START, RANGE_PARENT_START]);
  expect(
    (fixer.insertTextBeforeRange as jest.Mock).mock.calls[0][1],
  ).toBe(annotation);
  expect(res).toEqual({
    r: [RANGE_PARENT_START, RANGE_PARENT_START],
    t: annotation,
  });
}

export function exerciseCreateAddStoryFixBranches(
  createAddStoryFix: any,
  options: ExerciseOptions = {},
): void {
  const annotation = options.annotationText ?? DEFAULT_ANNOTATION;

  exerciseBranch1(createAddStoryFix, annotation);
  exerciseBranch2(createAddStoryFix, annotation);
  exerciseBranch3(createAddStoryFix, annotation);
}
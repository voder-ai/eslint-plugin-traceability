import type { Rule } from "eslint";
import type { AnnotationPlacement } from "./branch-annotation-helpers";

/**
 * Context object for building story-fixers used by require-branch-annotation.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG REQ-INSIDE-BRACE-PLACEMENT
 */
export interface StoryFixContext {
  annotationPlacement: AnnotationPlacement;
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>;
  node: any;
  insertPos: number;
  indent: string;
}

/**
 * Build the individual fixes needed when migrating existing before-branch
 * annotations into inside-brace placement. This helper is responsible for
 * removing redundant before-branch comments that already contain
 * traceability tags and inserting the canonical placeholder inside the
 * branch body at the computed insertion position.
 *
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-AUTO-FIX-MIGRATION REQ-INSIDE-BRACE-PLACEMENT
 */
function buildInsidePlacementStoryFixes(
  ctx: StoryFixContext,
  fixer: any,
): any[] {
  const { sourceCode, node, insertPos, indent } = ctx;
  const fixes: any[] = [];

  const beforeComments = (sourceCode as any).getCommentsBefore(node) || [];
  const removableComments = beforeComments.filter(
    (c: any) =>
      /@story\b/.test(c.value) ||
      /@req\b/.test(c.value) ||
      /@supports\b/.test(c.value),
  );

  removableComments.forEach((comment: any) => {
    fixes.push(fixer.remove(comment));
  });

  fixes.push(
    fixer.insertTextBeforeRange(
      [insertPos, insertPos],
      `${indent}// @story <story-file>.story.md\n`,
    ),
  );

  return fixes;
}

/**
 * Create a fixer function that inserts or migrates a `@story` comment for a
 * missing branch annotation, honoring the configured placement mode.
 * When annotationPlacement is "inside", this helper uses
 * buildInsidePlacementStoryFixes to migrate existing before-branch
 * annotations into the standardized inside-brace location. Otherwise, it
 * preserves the original "before" behavior of inserting directly above
 * the branch.
 *
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-AUTO-FIX-MIGRATION REQ-INDENTATION-CORRECT
 */
export function createStoryFixer(ctx: StoryFixContext) {
  const { annotationPlacement, insertPos, indent } = ctx;

  /**
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-AUTO-FIX-MIGRATION REQ-INDENTATION-CORRECT
   */
  function insertStoryFixer(fixer: any) {
    // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-AUTO-FIX-MIGRATION REQ-INSIDE-BRACE-PLACEMENT
    if (annotationPlacement === "inside") {
      // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-AUTO-FIX-MIGRATION REQ-INSIDE-BRACE-PLACEMENT
      return buildInsidePlacementStoryFixes(ctx, fixer);
    }

    return fixer.insertTextBeforeRange(
      [insertPos, insertPos],
      `${indent}// @story <story-file>.story.md\n`,
    );
  }

  return insertStoryFixer;
}

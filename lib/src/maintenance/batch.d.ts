/**
 * Batch update annotations and verify references
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-BATCH - Perform batch updates
 * @req REQ-MAINT-VERIFY - Verify annotation references
 */
export declare function batchUpdateAnnotations(codebasePath: string, mappings: {
    oldPath: string;
    newPath: string;
}[]): number;
/**
 * Verify annotation references in codebase after maintenance operations
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-VERIFY - Verify annotation references
 */
export declare function verifyAnnotations(codebasePath: string): boolean;

# Last Action Executed (Agentic)

**Action:** Used tool: read_file with input: {"filePath":"docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md"}
Used tool: find_files with input: {"pattern":"*MULTI-STORY*","directory":"docs/decisions"}
Used tool: search_file_content with input: {"filePath":"docs/decisions","pattern":"implements","isRegex":false}
Used tool: list_directory with input: {"dirPath":"docs/decisions"}
Used tool: read_file with input: {"filePath":"docs/decisions/010-implements-annotation-for-multi-story-requirements.proposed.md"}
Used tool: read_file with input: {"filePath":"docs/decisions/011-rename-implements-to-supports-annotation.accepted.md"}
Used tool: search_file_content with input: {"filePath":".","pattern":"@implements","isRegex":false}
Used tool: search_file_content with input: {"filePath":".","pattern":"@supports","isRegex":false}
Used tool: search_file_content with input: {"filePath":".","pattern":"010.2-DEV-MULTI-STORY-SUPPORT","isRegex":false}
Used tool: find_files with input: {"pattern":"*.ts","directory":"src"}
Used tool: search_file_content with input: {"filePath":"src/rules/helpers/valid-implements-utils.ts","pattern":"@implements","isRegex":false}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-implements-utils.ts"}
Used tool: read_file with input: {"filePath":"src/rules/valid-req-reference.ts"}
Used tool: find_files with input: {"pattern":"*implements*","directory":"."}
Used tool: read_file with input: {"filePath":"docs/rules/prefer-implements-annotation.md"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-annotation-format-internal.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-annotation-options.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/valid-annotation-utils.ts"}
Used tool: run_command with input: {"command":"rg","args":["@implements","src","tests","docs","user-docs"]}
Used tool: run_command with input: {"command":"rg","args":["@supports","src","tests","docs","user-docs"]}
Used tool: find_files with input: {"pattern":"*.ts","directory":"tests"}
Used tool: find_files with input: {"pattern":"*010.2*","directory":"docs/stories"}
Used tool: find_files with input: {"pattern":"*010.2*","directory":"tests"}
Used tool: find_files with input: {"pattern":"*valid-annotation-format*","directory":"tests/rules"}
Used tool: find_files with input: {"pattern":"*valid-req-reference*","directory":"tests/rules"}
Used tool: find_files with input: {"pattern":"*require-story-annotation*","directory":"tests/rules"}
Used tool: find_files with input: {"pattern":"*require-req-annotation*","directory":"tests/rules"}
Used tool: read_file with input: {"filePath":"tests/rules/valid-annotation-format.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/valid-req-reference.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-story-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"tests/rules/require-req-annotation.test.ts"}
Used tool: read_file with input: {"filePath":"src/rules/require-story-annotation.ts"}
Used tool: read_file with input: {"filePath":"src/rules/require-req-annotation.ts"}
Used tool: read_file with input: {"filePath":"src/utils/annotation-checker.ts"}
Used tool: read_file with input: {"filePath":"src/rules/valid-annotation-format.ts"}
Used tool: read_file with input: {"filePath":"docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md","startLine":40,"endLine":120}
Used tool: read_file with input: {"filePath":"src/utils/reqAnnotationDetection.ts"}
Used tool: read_file with input: {"filePath":"tests/utils/annotation-checker.test.ts"}
Used tool: read_file with input: {"filePath":"docs/stories/010.3-DEV-MIGRATE-TO-IMPLEMENTS.story.md"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-helpers.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-visitors.ts"}
Used tool: read_file with input: {"filePath":"src/rules/helpers/require-story-io.ts"}
Used tool: read_file with input: {"filePath":"src/rules/prefer-implements-annotation.ts"}
Used tool: run_command with input: {"command":"grep","args":["-R","\"@implements\"","src","tests","docs","user-docs"]}
Used tool: run_command with input: {"command":"grep","args":["-R","\"invalidImplementsFormat\"","src","tests","docs","user-docs"]}
Used tool: read_file with input: {"filePath":"src/index.ts"}
Used tool: search_file_content with input: {"filePath":"README.md","pattern":"@supports","isRegex":false}
Used tool: search_file_content with input: {"filePath":"README.md","pattern":"@implements","isRegex":false}
Used tool: search_file_content with input: {"filePath":"user-docs/api-reference.md","pattern":"@supports","isRegex":false}
Used tool: search_file_content with input: {"filePath":"user-docs/api-reference.md","pattern":"@implements","isRegex":false}
Used tool: get_git_status with input: {}
Used tool: list_directory with input: {"dirPath":"docs/stories"}
Used tool: read_file with input: {"filePath":"docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md"}
Used tool: run_command with input: {"command":"grep","args":["-R","REQ-IMPLEMENTS","src","tests","docs","user-docs"]}
Used tool: run_command with input: {"command":"grep","args":["-R","REQUIRE-ACCEPTS-IMPLEMENTS","src","tests","docs","user-docs"]}
Used tool: run_command with input: {"command":"grep","args":["-R","@implements","src","tests","docs","user-docs","README.md"]}
Used tool: read_file with input: {"filePath":"tests/rules/prefer-implements-annotation.test.ts"}
Used tool: modify_file with input: {"filePath":"docs/decisions/011-rename-implements-to-supports-annotation.accepted.md","instruction":"Add a new \"Implementation Status\" section near the end (before the final informational paragraphs) that explicitly states that `@supports` is the canonical multi-story annotation and that `@implements` is no longer recognised by the plugin for user code. Describe that the rename is implemented as a breaking change (v2.0.0), with no alias or deprecation period, and that multi-story semantics otherwise remain identical to the original `@implements` design: `@supports <story-path> <REQ-ID> [<REQ-ID> ...]` with requirement IDs scoped per story and full backward compatibility for existing `@story`/`@req` annotations. Also note that the optional migration rule keeps its historical name `prefer-implements-annotation` but now migrates from `@story`/`@req` to `@supports` instead of `@implements`."}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/valid-annotation-format-internal.ts","instruction":"In the top JSDoc, replace references to `@implements` with `@supports` and update requirement IDs to use the story's REQ-SUPPORTS-* naming: change `@req REQ-IMPLEMENTS-PARSE - Parse @implements annotations without affecting @story/@req` to `@req REQ-SUPPORTS-PARSE - Parse @supports annotations without affecting @story/@req`. Leave REQ-FORMAT-VALIDATION and REQ-MIXED-SUPPORT as-is.\n\nFurther down in the JSDoc for `MIN_IMPLEMENTS_TOKENS`, update the `@req` tag from `REQ-IMPLEMENTS-PARSE` to `REQ-SUPPORTS-PARSE`.\n\nIn the `normalizeCommentLine` function JSDoc, replace \"It detects @story, @req, and @implements tags\" with \"It detects @story, @req, and @supports tags\".\n\nIn the implementation of `normalizeCommentLine`, change the regex used for `annotationMatch` from `/@story\\b|@req\\b|@implements\\b/` to `/@story\\b|@req\\b|@supports\\b/`."}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/valid-implements-utils.ts","instruction":"Rename this helper module from `@implements` to `@supports` semantics while keeping the file name stable for now.\n\n- In the top JSDoc, change the first line to \"Helpers for @supports annotation validation used by valid-annotation-format.\" and update `@req REQ-IMPLEMENTS-PARSE` to `@req REQ-SUPPORTS-PARSE` and any text that says `@implements` to `@supports`.\n- In the JSDoc above `MIN_IMPLEMENTS_TOKENS`, update the description to \"Minimum number of tokens required for a valid @supports value\" and change the `@req` tag to `@req REQ-SUPPORTS-PARSE`.\n- In `reportMissingImplementsValue`, change the JSDoc to say \"@supports\" instead of \"@implements\", and in the error details string, replace `@implements` with `@supports`.\n- In `reportMissingImplementsReqIds`, similarly change `@implements` references in JSDoc and details string to `@supports`.\n- In `reportInvalidImplementsStoryPath`, change the JSDoc to refer to `@supports` and update the details string accordingly.\n- In `reportInvalidImplementsReqId`, update the JSDoc to refer to `@supports` instead of `@implements`.\n- In the final JSDoc for `validateImplementsAnnotationHelper`, update all references from `@implements` to `@supports` and change any `@req REQ-IMPLEMENTS-PARSE` tags to `@req REQ-SUPPORTS-PARSE`.\n\nDo not change function names or exported symbol names yet; only update comments and user-facing error message text to use `@supports`."}
Used tool: modify_file with input: {"filePath":"src/rules/valid-annotation-format.ts","instruction":"Update this rule implementation to treat `@supports` as the user-facing annotation while keeping internal helper names stable.\n\n- In the JSDoc for `validateImplementsAnnotation`, change references from `@implements` to `@supports` and update the Expected format section to use `@supports <storyPath> <REQ-ID> [<REQ-ID> ...]`. Update the `@req` tag to `@req REQ-SUPPORTS-PARSE - Parse @supports annotations without affecting @story/@req` while keeping REQ-FORMAT-VALIDATION and REQ-MIXED-SUPPORT.\n- In the JSDoc for `processCommentLine` and `processComment`, update any prose that mentions `@implements` to describe `@supports` instead (e.g., \"Handle @supports as an immediate, single-line annotation\", \"@supports annotations are validated immediately ...\"). Keep the requirement IDs but ensure the text matches `@supports`.\n- In the `processCommentLine` implementation, change the `isImplements` boolean detection from `/@implements\\b/` to `/@supports\\b/` and adjust the nearby comment to say `@supports` instead of `@implements`. Also change the `implementsValue` replacement to strip `@supports` (`normalized.replace(/^@supports\\b/, \"\")`).\n- In `processComment` JSDoc and the exported rule meta.docs.description and any other descriptions, update references so the rule is described as validating `@story`, `@req`, and `@supports` annotations, not `@implements`.\n- In the `meta.messages.invalidImplementsFormat` JSDoc, update the prose to refer to `@supports` instead of `@implements`, and in the human-facing description text, adjust only if needed once `valid-implements-utils` strings are updated (they already now say `@supports`).\n- In the `create` function JSDoc (Program handler), update prose that talks about `@implements` tags to say `@supports`.\n\nDo not yet rename function names like `validateImplementsAnnotation` or fields like `invalidImplementsFormat`; just align text, patterns, and user-visible semantics with `@supports`."}
Used tool: modify_file with input: {"filePath":"src/rules/valid-req-reference.ts","instruction":"Retarget deep-validation logic to the `@supports` annotation while keeping internal names stable.\n\n- In the JSDoc for `IMPLEMENTS_TOKENS`, update the description to \"Token index configuration for @supports annotations.\" and adjust any wording accordingly.\n- In the JSDoc for `parseImplementsLine`, update the description to \"Parse a @supports annotation line...\" and adjust the Expected format line to mention `@supports <storyPath> <REQ-ID-1> <REQ-ID-2> ...`. Change the `@req` description from \"Support validation of @implements annotations\" to \"Support validation of @supports annotations\".\n- In the JSDoc for `validateImplementsLine`, replace references to `@implements` with `@supports` in the summary and requirement descriptions.\n- In the JSDoc for `handleAnnotationLine`, change the `@req REQ-IMPLEMENTS-VALIDATE` description to \"Dispatch @supports lines for validation\".\n- In the `handleAnnotationLine` function body, change the condition `else if (line.startsWith(\"@implements\"))` to `else if (line.startsWith(\"@supports\"))` so that the deep-validation rule listens for `@supports` rather than `@implements`.\n\nDo not change function names, type names, or message IDs; only adjust the user-facing semantics and the annotation prefix that is recognized at runtime."}
Used tool: modify_file with input: {"filePath":"src/utils/reqAnnotationDetection.ts","instruction":"Update requirement-detection helpers so that `@supports` is treated as the multi-story requirement annotation rather than `@implements`.\n\n- In the file-level JSDoc and all `@req REQ-REQUIRE-ACCEPTS-IMPLEMENTS` comments, adjust the prose to say \"Accept @supports\" / \"detect @supports\" / \"Treat @supports annotations...\" instead of `@implements`, but keep the requirement ID name unchanged.\n- In `commentContainsReq`, change the predicate to accept `@req` or `@supports` (replace `c.value.includes(\"@implements\")` with `c.value.includes(\"@supports\")`).\n- In `linesBeforeHasReq`, update the comment text that mentions `@implements` to say `@supports`, and change the condition to look for `\"@supports\"` instead of `\"@implements\"`.\n- In `parentChainHasReq`, update inline comments to mention `@supports`, and ensure the calls to `commentContainsReq` still work now that it detects `@supports`.\n- In `fallbackTextBeforeHasReq`, update comments to mention `@supports` and change the `textBefore.includes(\"@implements\")` check to `textBefore.includes(\"@supports\")`.\n- In the final BRANCH comment for `hasReqAnnotation`, update prose to mention `@supports` rather than `@implements`.\n\nDo not change the helper function names or requirement IDs; only adjust detection to the new annotation name and update explanatory comments."}
Used tool: modify_file with input: {"filePath":"src/rules/helpers/require-story-io.ts","instruction":"Update story-detection helpers to treat `@supports` as the multi-story story/req conglomerate instead of `@implements`.\n\n- In the JSDoc for `commentContainsStory`, change the prose to \"Also treats @supports annotations as satisfying story presence checks.\" and update the `@req REQ-REQUIRE-ACCEPTS-IMPLEMENTS` description similarly.\n- In `commentContainsStory`, change the predicate from `comment.value.includes(\"@story\") || comment.value.includes(\"@implements\")` to `comment.value.includes(\"@story\") || comment.value.includes(\"@supports\")`.\n- In `scanLinesForMarker`, update inline comments to mention `@supports` instead of `@implements`, and change the condition to check for `\"@supports\"` rather than `\"@implements\"`.\n- In `fallbackTextBeforeHasStory`, update comments to mention `@supports` and replace `textBefore.includes(\"@implements\")` with `textBefore.includes(\"@supports\")`.\n\nAs with the other helpers, do not change function names or requirement IDs; only adjust annotation names and explanatory text."}
Used tool: modify_file with input: {"filePath":"tests/rules/valid-annotation-format.test.ts","instruction":"Update this test file so that it exercises the new `@supports` annotation instead of `@implements`, leaving the underlying messageId and helper names intact.\n\n- In the header JSDoc under `Tests for: docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md`, change the three `@req` lines to reference the new REQ-SUPPORTS-* requirement IDs and wording from the story:\n  - `@req REQ-SUPPORTS-PARSE - Rule parses @supports annotations with story and requirement references`\n  - `@req REQ-FORMAT-VALIDATION - Rule validates story and requirement formats inside @supports annotations`\n  - `@req REQ-MIXED-SUPPORT - Rule supports mixed @story/@req/@supports usage in the same comment`\n\n- In the `valid` cases for 010.2, update the names (the `[REQ-IMPLEMENTS-PARSE]` prefix can remain if desired for backwards traceability, but the code examples must use `@supports` instead of `@implements`):\n  - Replace `@implements` with `@supports` in all code snippets under those valid cases.\n\n- In the `invalid` cases that currently mention `@implements`, update the `name` strings to say `@supports` instead of `@implements`, and in the `code` snippets replace `@implements` with `@supports`.\n- In the expected `details` strings under those invalid cases, make sure the text now refers to `@supports annotation` and matches the updated messages in `valid-implements-utils.ts` (Missing story path and requirement IDs for @supports annotation..., Missing requirement IDs for @supports annotation..., Invalid story path \"...\" for @supports annotation...).\n\nDo not change the messageId (`invalidImplementsFormat`), only the test data and human-readable descriptions so they align with the new user-facing annotation name."}
Used tool: modify_file with input: {"filePath":"tests/rules/valid-req-reference.test.ts","instruction":"Update tests in this file that exercise multi-story deep validation so they use `@supports` instead of `@implements`.\n\n- In the `valid` array, update the two cases whose `name` strings currently start with `[REQ-DEEP-IMPLEMENTS]` to instead refer to `@supports` in the description text (you can keep the requirement ID label prefix unchanged), and in their `code` snippets replace `// @implements ...` with `// @supports ...`.\n- In the `invalid` array, update the two cases whose `name` strings contain \"implements\" to say \"supports\" instead (e.g., \"missing supports requirement\" / \"disallow path traversal in supports story path\"), and change their `code` to use `// @supports ...` instead of `// @implements ...`.\n\nDo not modify the expectations for `messageId` or `data` (they still refer to `reqMissing` and `invalidPath`), only the annotation prefix and descriptive text."}
Used tool: modify_file with input: {"filePath":"tests/rules/require-story-annotation.test.ts","instruction":"Align this rule test with the `@supports` story semantics.\n\n- In the file header JSDoc, change the `@req REQ-REQUIRE-ACCEPTS-IMPLEMENTS` description text from \"Verify @implements annotation is accepted as satisfying story requirements\" to \"Verify @supports annotation is accepted as satisfying story requirements\" (keep the REQ ID unchanged).\n- In the `valid` test case named `[REQ-REQUIRE-ACCEPTS-IMPLEMENTS] valid with only @implements annotation`, change the code snippet to use `@supports` instead of `@implements` on that JSDoc line.\n- In the single invalid-case name that currently mentions \"no @implements\" in its comment, update the description to talk about \"no @supports\" so the language reflects the new annotation.\n\nDo not change any expectations, message IDs, or requirement IDs; only the annotation keyword and descriptive text."}
Used tool: modify_file with input: {"filePath":"tests/rules/require-req-annotation.test.ts","instruction":"Align require-req-annotation tests with `@supports` semantics.\n\n- In the file header JSDoc, update the description for `@req REQ-REQUIRE-ACCEPTS-IMPLEMENTS` to say \"Verify @supports is accepted as satisfying requirement annotations\" instead of `@implements`.\n- In the `valid` test case named `[REQ-REQUIRE-ACCEPTS-IMPLEMENTS] valid with only @implements annotation`, change the code snippet to use `@supports` in the JSDoc instead of `@implements`.\n- In the `invalid` test case name that includes \"[REQ-ANNOTATION-REQUIRED][REQ-REQUIRE-ACCEPTS-IMPLEMENTS] missing @req on function without JSDoc remains invalid under multi-story support\", leave the name as-is (for traceability), but ensure that any comment in that block mentioning `@implements` in prose (if present) is updated to refer to `@supports`. There is currently no such prose, so no change may be needed here.\n\nAgain, do not change rule behavior expectations, message IDs, or requirement IDs; only the annotation keyword and descriptive text."}
Used tool: modify_file with input: {"filePath":"src/rules/prefer-implements-annotation.ts","instruction":"Retarget the optional migration rule to work with `@supports` as the destination annotation while keeping the rule name and file name unchanged.\n\n- In the top JSDoc, update text to say this rule prefers the consolidated `@supports` annotation over legacy combinations. Replace mentions of \"`@implements` format\" with \"`@supports` format\".\n- In the same JSDoc, update the `@story` reference path from `010.3-DEV-MIGRATE-TO-IMPLEMENTS.story.md` to `010.3-DEV-MIGRATE-TO-SUPPORTS.story.md`, and adjust the `@req` descriptions to refer to `@supports` where appropriate.\n- Update the constant `MULTI_STORY_THRESHOLD` JSDoc if it mentions `@implements` (replace with `@supports`).\n- In `collectStoryAndReqMetadata`, update the guard that currently ignores lines starting with `@implements` so that it instead ignores lines starting with `@supports` (mixed-usage detection still applies).\n- In `applyImplementsReplacement`, change the constructed annotation from `@implements ${storyPath} ...` to `@supports ${storyPath} ...` and update any nearby comments to say `@supports`.\n- In the large JSDoc before `buildImplementsAutoFix`, change all prose to describe converting to a single `@supports` annotation and update the `@implements` reference in the `@implements` tag to point to `docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md`.\n- In `analyzeComment`, update the detection of \"hasImplements\" to instead check `@supports` for the destination; rename the boolean for clarity is optional, but at minimum ensure it is set based on `@supports`. Be sure subsequent logic (`if (hasImplements) { ... }`) still correctly treats a block that already contains `@supports` as mixed legacy/modern usage.\n- In `processComment`, update diagnostics messages and comments to mention `@supports` instead of `@implements` where they describe the migration.\n- In the rule `meta` section, update `docs.description` and all message docs (`preferImplements`, `cannotAutoFix`, `multiStoryDetected`) to refer to `@supports` in their text and move the `@story` reference path to `010.3-DEV-MIGRATE-TO-SUPPORTS.story.md`.\n\nDo not rename the rule itself (`prefer-implements-annotation`), the file, or the message IDs; just retarget the behavior so that it rewrites to `@supports` instead of `@implements` and consistently documents that behavior."}
Used tool: modify_file with input: {"filePath":"tests/rules/prefer-implements-annotation.test.ts","instruction":"Update this test file to reflect that the migration rule now converts to `@supports` rather than `@implements`, and that it is associated with story 010.3-DEV-MIGRATE-TO-SUPPORTS.\n\n- In the header JSDoc, change the `Tests for:` and `@story` path from `010.3-DEV-MIGRATE-TO-IMPLEMENTS.story.md` to `010.3-DEV-MIGRATE-TO-SUPPORTS.story.md`. Keep the existing REQ IDs but adjust prose to mention `@supports` where appropriate.\n- In the `valid` case named `[REQ-BACKWARD-COMP-VALIDATION] comment with @implements only is ignored`, change the code to use `@supports` instead of `@implements` and adjust the name to say \"comment with @supports only is ignored\".\n- In each `invalid` case under this rule:\n  - Where the `name` string talks about \"@implements\" (e.g., \"mixed @story/@req and @implements\"), change it to mention `@supports` instead.\n  - Update every `code` snippet that currently uses `@implements` so it instead uses `@supports` in the JSDoc.\n  - Where expected error `data.reason` strings mention `@implements`, update them to say `@supports` to match the rule's new messaging.\n  - For the auto-fix expectations (`output` fields), update the JSDoc lines so they use `@supports` rather than `@implements`.\n- In the bottom \"configuration severity\" tests, no functional change is needed, but the narrative of the rule is now about `@supports`; you can leave those as-is since they refer only to the rule name.\n\nDo not alter the rule name, message IDs, or how configs are accessed; only update story path, annotation keyword, and descriptive text."}
Used tool: modify_file with input: {"filePath":"docs/rules/valid-annotation-format.md","instruction":"In this rule documentation, replace user-facing references to `@implements` with `@supports` to match the ADR and story 010.2, while keeping internal message IDs (`invalidImplementsFormat`) unchanged.\n\n- Update the short description at the top to say the rule validates `@story`, `@req`, and `@supports` annotations.\n- In the \"@implements format support\" bullet section, rename the heading to \"`@supports` format support\" and update the example to show `@supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-FOO REQ-BAR`. Change subsequent text to refer to `@supports`.\n- Everywhere the doc explains that the story path and requirement IDs in `@implements` are validated, rephrase to mention `@supports` instead, including in descriptions of story/requirement identifiers lists.\n- In the \"Migration to `@implements`\" section, update the section heading and body to talk about migration to `@supports` instead, adjusting narrative sentences and example snippets to use `@supports`.\n- In cross-references (e.g., to valid-req-reference), clarify that deep checking now applies to `@supports` rather than `@implements`, but keep the reference to story 010.2-DEV-MULTI-STORY-SUPPORT.story.md.\n\nDo not change any references that are about historical documentation of `@implements` in security/ADR files; only update this rule doc."}
Used tool: modify_file with input: {"filePath":"docs/rules/valid-req-reference.md","instruction":"Update this rule documentation so that multi-story deep validation is described in terms of `@supports` annotations rather than `@implements`.\n\n- In the opening description, replace any mention of \"`@req` and `@implements`\" with \"`@req` and `@supports`\".\n- In the requirement list (`@req REQ-MULTI-IMPLEMENTS`, etc.), adjust the prose so that it describes `@supports` instead of `@implements`, but leave the REQ IDs unchanged.\n- In the detailed behavior bullets, change phrasing like \"ensuring each `@req` and `@implements` requirement ID\" to mention `@supports` as the multi-story form.\n- In the \"Interaction of `@story`/`@req` and `@implements`\" section, rename the heading to reference `@supports`, and change all explanatory paragraphs and code examples to use `@supports` instead of `@implements`. Keep the overall semantics identical (per-story lines, scoped IDs, etc.).\n- In the \"Correct: Multiple Stories with `@implements`\" and \"Incorrect: Missing Requirement with `@implements`\" subsections, rename the headings and examples to use `@supports`.\n- In the final guidance paragraphs, say that projects can gradually adopt `@supports` where it adds clarity, and that this rule validates `@supports` IDs using the same machinery as before.\n\nAvoid changing any cross-story references or requirement IDs; only update the annotation keyword and narrative sentences in this doc."}
Used tool: modify_file with input: {"filePath":"docs/rules/prefer-implements-annotation.md","instruction":"Update this rule documentation to explain that the migration target is now `@supports` even though the rule retains the historical name `prefer-implements-annotation`.\n\n- In the title and first paragraph, clarify that the rule recommends converting legacy `@story` + `@req` annotations to the newer `@supports` format. Replace mentions of `@implements` in this descriptive text with `@supports`.\n- Wherever the document currently refers to `@implements` as the target annotation (e.g., \"standardize on the `@implements` annotation\"), change those to reference `@supports` instead.\n- In examples under \"Legacy @story + @req blocks\" and subsequent sections, update the \"After\" / auto-fix samples so the output lines use `@supports` instead of `@implements`.\n- In any narrative text describing what the rule detects (\"comments that already contain @implements\" etc.), change to \"@supports\" to match the updated rule behaviour.\n- Where the doc lists relationships to other rules (e.g. \"Use `valid-annotation-format` to enforce syntax and format for `@story`, `@req`, and `@implements`.\"), update it to mention `@supports` instead.\n\nDo not change the rule name or references to the story file ID; only the target annotation keyword in the rule's behavior and examples."}
Used tool: modify_file with input: {"filePath":"user-docs/api-reference.md","instruction":"Update user-facing API docs so they describe `@supports` as the multi-story annotation instead of `@implements`.\n\n- In the introductory section that currently says \"the plugin also understands `@implements` for code that fulfills requirements from multiple stories\", replace `@implements` with `@supports` and update the example path line and subsequent explanation to talk about `@supports`.\n- In the description of `traceability/require-story-annotation`, change wording like \"when you adopt multi-story `@implements` annotations\" to \"multi-story `@supports` annotations\", and update the description of what counts as satisfying story coverage accordingly.\n- Similarly, in the description of `traceability/require-req-annotation`, change the narrative about \"multi-story `@implements` annotations\" to refer to `@supports` and confirm the text explains that `@supports story-path REQ-ID...` satisfies requirement coverage.\n- In the migration-related sections, update any advice to \"introduce `@implements`\" or \"multi-story `@implements`\" to reference `@supports` instead, while keeping the story IDs and semantics.\n\nDo not change the rule names, story references, or behavior descriptions unrelated to the annotation keyword; only update `@implements` terminology to `@supports` for end users."}
Used tool: modify_file with input: {"filePath":"user-docs/migration-guide.md","instruction":"Update this migration guide so it reflects that multi-story support uses `@supports` instead of `@implements`.\n\n- Change the section heading \"3.1 Multi-story `@implements` annotations\" to \"3.1 Multi-story `@supports` annotations\" and update the surrounding narrative text accordingly.\n- In examples that currently show `@implements docs/stories/...`, change them to `@supports docs/stories/...` while preserving story IDs and REQ IDs.\n- Wherever the guide instructs users to \"introduce `@implements`\" or describes \"multi-story `@implements`\", update this to talk about `@supports`.\n- In the part discussing the `prefer-implements-annotation` rule, ensure it now says it migrates from `@story`/`@req` to `@supports` and that it is an optional migration aid for standardizing on `@supports`.\n- Ensure the final bullet points and narrative at the end talk about \"standardize on `@supports` for multi-story integration functions\" instead of `@implements`.\n\nAs before, do not alter story IDs or rule names; just update the annotation keyword and narrative phrasing."}
Used tool: modify_file with input: {"filePath":"README.md","instruction":"Update README references so they describe the multi-story annotation as `@supports` while preserving the existing rule name `prefer-implements-annotation`.\n\n- In the rules summary bullet where `traceability/prefer-implements-annotation` is described as recommending migration to `@implements`, change the wording to \"recommends migration ... to `@supports`\".\n- If there are any other mentions in README of `@implements` as the annotation name (for example, when explaining multi-story support), rephrase them to use `@supports` instead, keeping the surrounding examples and story IDs consistent.\n\nDo not change the rule name, package name, or examples unrelated to annotation names; only the human-facing text that describes what the rule recommends."}
Used tool: modify_file with input: {"filePath":"docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md","instruction":"Update this story to note that the originally-described `@supports` annotation has been confirmed as the canonical multi-story form and that earlier experimental `@implements` naming in ADR 010 is superseded.\n\n- Add a short note in the \"Implementation Notes\" or just after the \"Requirements\" section stating that ADR 011 renamed the experimental `@implements` design to `@supports`, and that this story should be interpreted in terms of `@supports` only.\n- Ensure the Definition of Done checkboxes remain unchanged; only augment the explanatory text to cross-reference ADR 011 and confirm that `@supports` is the final name.\n\nDo not change the requirement IDs or acceptance criteria in this story."}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["run","format","--","src/rules/helpers/require-story-io.ts","src/rules/helpers/valid-annotation-format-internal.ts","src/rules/helpers/valid-implements-utils.ts","src/rules/prefer-implements-annotation.ts","src/rules/valid-annotation-format.ts","src/rules/valid-req-reference.ts","src/utils/reqAnnotationDetection.ts","tests/rules/prefer-implements-annotation.test.ts","tests/rules/require-req-annotation.test.ts","tests/rules/require-story-annotation.test.ts","tests/rules/valid-annotation-format.test.ts","tests/rules/valid-req-reference.test.ts"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"fix: rename multi-story annotation from @implements to @supports"}
Used tool: git_push with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}
Used tool: get_github_run_details with input: {"runId":19939525420}
Used tool: get_github_workflow_logs with input: {"runId":19939525420}
Used tool: modify_file with input: {"filePath":"package.json","instruction":"Update the npm scripts to avoid running Husky when this plugin is installed as a dependency. Replace the existing \"postinstall\": \"husky\" script with a \"prepare\": \"husky\" script so that Husky hooks are only installed when developing this repository, not when users install the package.\n\nSpecifically:\n- Remove the \"postinstall\" field from the \"scripts\" section.\n- Add a new entry: \"prepare\": \"husky\".\n\nDo not change any other scripts or fields."}
Used tool: run_command with input: {"command":"npm","args":["run","build"]}
Used tool: run_command with input: {"command":"npm","args":["test","--","--runInBand"]}
Used tool: run_command with input: {"command":"npm","args":["run","lint","--","--max-warnings=0"]}
Used tool: run_command with input: {"command":"npm","args":["run","type-check"]}
Used tool: run_command with input: {"command":"npm","args":["run","format:check"]}
Used tool: git_add_all with input: {}
Used tool: git_commit with input: {"message":"fix: avoid running husky in consumers and repair smoke test"}
Used tool: git_push with input: {}
Used tool: wait_for_github_workflow with input: {"workflowName":"CI/CD Pipeline","timeout":600000}

**Response:**

```
- [x] **NOW: Re-read the multi-story support story and related ADRs**

I re-read:

- `docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md`
- `docs/decisions/010-implements-annotation-for-multi-story-requirements.proposed.md`
- `docs/decisions/011-rename-implements-to-supports-annotation.accepted.md`

Key conclusions:

- Story 010.2 defines `@supports story-path REQ-ID1 REQ-ID2 ...` with REQ-SUPPORTS-* requirements.
- ADR 010 described the same semantics but using `@implements`.
- ADR 011 **accepts** the rename from `@implements` to `@supports` and makes `@supports` the canonical multi-story annotation, with no deprecation period.
- The existing implementation and tests were still centered on `@implements`, so behavior and docs diverged from the story/ADR.



## NEXT

### 1) Decide canonical annotation and document the decision

- [x] **Decide canonical annotation (`@supports`, `@implements`, or both) and document it**

**Decision:**

- The canonical multi-story annotation is **`@supports`**.
- `@implements` is **no longer recognized** as a user-visible traceability annotation.
- There is **no aliasing** or dual support: new behavior is a breaking change aligned with ADR 011.

**Documentation updates:**

- **ADR 011** (`docs/decisions/011-rename-implements-to-supports-annotation.accepted.md`)
  - Added an **“Implementation Status”** section explicitly stating:
    - `@supports` is the only supported multi-story annotation in user code.
    - `@implements` is no longer recognized by the plugin for user code.
    - The rename is a breaking change in v2.0.0 semantics, but with effectively zero adoption.
    - Multi-story semantics remain the same:
      - `@supports <story-path> <REQ-ID> [<REQ-ID> ...]`
      - IDs scoped per story.
      - `@story`/`@req` remain fully backward compatible.
    - The **migration rule** keeps its historical name `prefer-implements-annotation` but now migrates to `@supports`.

- **Story 010.2** (`docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md`)
  - Added an **ADR alignment note** under Requirements and in Implementation Notes:
    - Clarifies that ADR 010’s `@implements` name is superseded by ADR 011.
    - Confirms implementations **must use** `@supports` and SHOULD NOT use `@implements`.

- **Story 010.3** already uses `@supports` in `010.3-DEV-MIGRATE-TO-SUPPORTS.story.md` and remains consistent.

- **User docs & README:**
  - `README.md` rule summary now describes `traceability/prefer-implements-annotation` as recommending migration from `@story`/`@req` to **`@supports`**.
  - `user-docs/api-reference.md`:
    - Intro now describes `@supports` as the multi-story annotation (example updated).
    - `require-story-annotation` and `require-req-annotation` sections refer to `@supports` instead of `@implements`.
  - `user-docs/migration-guide.md`:
    - Section renamed to **“3.1 Multi-story `@supports` annotations”**.
    - Examples and guidance updated from `@implements` → `@supports`.
    - `prefer-implements-annotation` is documented as a migration helper from `@story`/`@req` to `@supports`.

- **Rule docs:**
  - `docs/rules/valid-annotation-format.md`: now documents `@supports` support and “Migration to `@supports`”.
  - `docs/rules/valid-req-reference.md`: multi-story behavior described in terms of `@supports`.
  - `docs/rules/prefer-implements-annotation.md`: explains that the rule (name unchanged) migrates to `@supports` and all examples use `@supports`.


### 2) Update core annotation helpers to implement `@supports` semantics

- [x] **Update the core annotation parsing and validation helpers**

Changes to **format/syntax** handling:

- `src/rules/helpers/valid-annotation-format-internal.ts`
  - JSDoc updated to refer to **`@supports`** and `REQ-SUPPORTS-PARSE`.
  - `normalizeCommentLine` now detects `@story`, `@req`, and **`@supports`**:
    ```ts
    const annotationMatch = trimmed.match(/@story\b|@req\b|@supports\b/);
    ```

- `src/rules/helpers/valid-implements-utils.ts` (kept filename/identifiers for backward-compatible internals, but semantics are now `@supports`):
  - JSDoc and error messages updated from `@implements` to `@supports`.
  - `REQ-IMPLEMENTS-PARSE` references in this file changed to `REQ-SUPPORTS-PARSE` in comments.
  - Error messages now read:
    - `Missing story path and requirement IDs for @supports annotation. ...`
    - `Missing requirement IDs for @supports annotation. ...`
    - `Invalid story path "..." for @supports annotation. ...`

- `src/rules/valid-annotation-format.ts`
  - Documentation and behavior updated so the rule validates `@story`, `@req`, and **`@supports`**:
    - `meta.docs.description`: `"Validate format and syntax of @story, @req, and @supports annotations"`.
  - `validateImplementsAnnotation` now explicitly documents `@supports` format:
    ```ts
    // Expected: @supports <storyPath> <REQ-ID> [<REQ-ID> ...]
    ```
    but continues to use the existing helper and `invalidImplementsFormat` message id for internal wiring.
  - `processCommentLine`:
    - Detects `@supports` via `const isImplements = /@supports\b/.test(normalized);`.
    - For `@supports` lines:
      ```ts
      const implementsValue = normalized.replace(/^@supports\b/, "").trim();
      validateImplementsAnnotation(context, comment, implementsValue, options);
      ```
  - `processComment` JSDoc updated to describe `@supports` annotations being validated in-place (immediate, single-line).

Changes to **deep requirement validation**:

- `src/rules/valid-req-reference.ts`
  - `IMPLEMENTS_TOKENS` JSDoc now describes configuration for `@supports`.
  - `parseImplementsLine` and `validateImplementsLine` JSDocs updated to talk about `@supports`.
  - The runtime dispatch now listens for **`@supports`**:
    ```ts
    } else if (line.startsWith("@supports")) {
      validateImplementsLine({ comment, context, line, cwd, reqCache });
    }
    ```
  - Behavior:
    - For each `@supports storyPath REQ-1 REQ-2 ...`:
      - Validates `storyPath` (no traversal/absolute paths, project-bound).
      - Caches and loads requirements from that story file.
      - Ensures each REQ-ID exists in that file.
    - Maintains scoping semantics per story and mixed usage with `@story/@req`.

Support for **presence checks** in helpers:

- `src/utils/reqAnnotationDetection.ts`
  - Requirement-presence detection treats `@req` **or `@supports`** as satisfying `@req` presence:
    - In comments (`commentContainsReq`), lookback window, parent-chain, and fallback text scanning all updated from `@implements` → `@supports`.
  - JSDoc text updated accordingly but requirement IDs left as-is (`REQ-REQUIRE-ACCEPTS-IMPLEMENTS` is still the ID, now describing acceptance of `@supports`).

- `src/rules/helpers/require-story-io.ts`
  - Story-presence detection treats `@story` **or `@supports`** as satisfying story presence:
    - `commentContainsStory`, `scanLinesForMarker`, `fallbackTextBeforeHasStory` search for `"@story"` or `"@supports"`.
  - JSDoc text updated to talk about `@supports` as the multi-story indicator while keeping REQ IDs stable.

Summary: the **core helpers now interpret `@supports` as the multi-story annotation**, validating its format, linking it to story files, and accepting it for presence checks, while **`@implements` is no longer parsed or recognized at runtime**.


### 3) Adjust ESLint rules to treat `@supports` as first-class

- [x] **Adjust ESLint rules (`require-*`, `valid-*`)**

**Require-story / require-req rules:**

- `src/rules/require-story-annotation.ts`
  - Behavior did not require code changes; it uses `hasStoryAnnotation` from helpers, which now counts `@supports`.
  - Tests updated to demonstrate that a function with a `@supports` annotation alone satisfies the rule.

- `src/rules/require-req-annotation.ts`
  - Behavior already delegated to `checkReqAnnotation`, which now accepts `@supports`.
  - Tests updated accordingly.

**Tests for require rules:**

- `tests/rules/require-story-annotation.test.ts`
  - Header JSDoc description for `REQ-REQUIRE-ACCEPTS-IMPLEMENTS` updated (text) to mention `@supports`.
  - Valid case:
    ```ts
    {
      name: "[REQ-REQUIRE-ACCEPTS-IMPLEMENTS] valid with only @implements annotation",
      code: `/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function implOnly() {}`,
    }
    ```
  - A core invalid test explicitly mentions a function **with no `@supports`** to emphasize continued enforcement.

- `tests/rules/require-req-annotation.test.ts`
  - Header JSDoc description updated to “Verify `@supports` is accepted”.
  - Valid case:
    ```ts
    {
      name: "[REQ-REQUIRE-ACCEPTS-IMPLEMENTS] valid with only @implements annotation",
      code: `/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function implOnly() {}`,
    }
    ```
  - The invalid “no JSDoc remains invalid under multi-story support” case is unchanged in behavior.

**Migration rule `prefer-implements-annotation`:**

- `src/rules/prefer-implements-annotation.ts`
  - Semantics updated: **migrates to `@supports`**, not `@implements`.
  - JSDoc now references story `010.3-DEV-MIGRATE-TO-SUPPORTS.story.md`.
  - `collectStoryAndReqMetadata` now considers `@supports` as “already migrated” and skips those lines.
  - Auto-fix builder constructs:
    ```ts
    const implAnnotation = `@supports ${storyPath} ${reqIds.join(" ")}`;
    ```
  - `analyzeComment` uses `@supports` as the marker for “modern” annotations:
    - `hasImplements` is true when it finds `@supports` (name unchanged for internal continuity).
  - Behavior:
    - Single-story `@story` + one or more simple `@req` lines → auto-fix to a single `@supports` line.
    - Mixed `@story/@req` and `@supports` → `cannotAutoFix`, with reason “comment mixes @story/@req with existing @supports annotations”.
    - Multi-`@story` blocks → `multiStoryDetected` and no fix.

- `tests/rules/prefer-implements-annotation.test.ts`
  - Story reference updated to `010.3-DEV-MIGRATE-TO-SUPPORTS.story.md`.
  - Valid “already migrated” case uses `@supports`.
  - All invalid auto-fix outputs now show `@supports`.
  - Mixed-usage test expects the updated `reason` mentioning `@supports`.


### 4) Extend and update tests for multi-story behavior

- [x] **Extend and update the test suite**

**Format rule tests:**

- `tests/rules/valid-annotation-format.test.ts`
  - Header references for story 010.2 switched to REQ-SUPPORTS-PARSE in prose.
  - Valid cases:
    - Single `@supports` line with one requirement.
    - Multiple `@supports` lines across different stories.
    - Mixed `@story`/`@req`/`@supports` in one block.
  - Invalid cases:
    - `@supports` with no value.
    - `@supports` with only story path and no REQs.
    - `@supports` with an invalid story path.
    - `@supports` with invalid or partially invalid REQ IDs.
  - Expected error `details` strings now mention `@supports` and match updated helper messages.

**Deep validation tests:**

- `tests/rules/valid-req-reference.test.ts`
  - Valid cases use `@supports` for multi-story scenarios:
    - Single `@supports tests/fixtures/story_multi_a.md REQ-SHARED-ID REQ-ONLY-A`.
    - Two `@supports` lines pointing at `story_multi_a` and `story_multi_b` with shared IDs.
  - Invalid cases use `@supports`:
    - Missing requirement in multi-story fixture via `@supports`.
    - Path traversal with `@supports` story path.
  - These tests confirm `REQ-SCOPED-IDS` and `REQ-SUPPORTS-VALIDATE` behavior for `@supports`.

**Migration rule tests:**

- `tests/rules/prefer-implements-annotation.test.ts`
  - All examples and outputs use `@supports`.
  - The rule name remains `prefer-implements-annotation`; only behavior and text changed.
  - Config severity tests unchanged (still verify the rule is not enabled in presets).


### 5) Review and fix traceability annotations

- [x] **Review and fix traceability annotations in modified source & tests**

Traceability comments now align with story 010.2 / 010.3:

- Updated several JSDocs in:
  - `valid-annotation-format-internal.ts`
  - `valid-implements-utils.ts`
  - `valid-annotation-format.ts`
  - `valid-req-reference.ts`
  - `reqAnnotationDetection.ts`
  - `require-story-io.ts`
  - `prefer-implements-annotation.ts`
- Where appropriate, `REQ-IMPLEMENTS-PARSE` text was changed to `REQ-SUPPORTS-PARSE` to match 010.2’s requirement naming while keeping other IDs (e.g. `REQ-IMPLEMENTS-VALIDATE`) as-is where they still refer to validation behavior; the story explicitly defines REQ-SUPPORTS-* plus other requirements like `REQ-MIXED-SUPPORT`, which are already referenced.
- Test headers for 010.2 and 010.3 now correctly refer to the right story paths and updated requirement descriptions (e.g., “Rule parses `@supports` annotations...”, “Verify `@supports` is accepted ...”).

This ensures the traceability graph recognises that multi-story behavior is implemented under `@supports` in alignment with the updated stories.


### 6) Compare final behavior vs story 010.2 edge cases

- [x] **Compare behavior against story examples and edge cases**

From story 010.2:

- **REQ-SUPPORTS-PARSE**: `@supports` lines of the form `@supports story-path REQ1 REQ2 ...` are parsed:
  - Implemented by `valid-annotation-format` + helpers.
  - Confirmed via updated tests in `valid-annotation-format.test.ts`.

- **REQ-SUPPORTS-VALIDATE / REQ-SCOPED-IDS**:
  - `valid-req-reference` resolves the story path, reads the story file, caches IDs, and checks every ID listed after `@supports`.
  - Multiple `@supports` lines referencing different stories with shared IDs are handled correctly (`tests/fixtures/story_multi_a.md` / `story_multi_b.md` tests).

- **REQ-REQUIRE-ACCEPTS-SUPPORTS**:
  - Presence rules treat `@supports` as satisfying both story and requirement annotations via:
    - `require-story-annotation` + `require-story-io` (story presence).
    - `require-req-annotation` + `reqAnnotationDetection` (req presence).
  - Valid-only-`@supports` tests confirm this.

- **REQ-BACKWARD-COMPAT/REQ-MIXED-SUPPORT**:
  - Both styles work:
    - Legacy `@story` + `@req` behavior unchanged.
    - Mixed blocks with `@story`, `@req`, and `@supports` are accepted (format) and deeply validated (where configured).

- **REQ-ERROR-CONTEXT**:
  - Error messages now include story path and requirement ID context for `reqMissing` and `invalidImplementsFormat` (now used for `@supports` format errors).

- **Examples in story**:
  - The story’s annotation examples (`@supports prompts/...`) are consistent with the current code and tests (modulo the fact that tests use this repo’s `docs/stories/...` paths and fixtures).


## Final Plan Status

- [x] **NOW**: Re-read the multi-story support story and related ADRs.

- [x] **NEXT**:
  - [x] Decide, based on the story and relevant architectural decisions, whether the canonical multi-story annotation in the codebase should be `@supports`, `@implements`, or both, and document this decision.
  - [x] Update the core annotation parsing and validation helpers so they correctly implement the story’s specified multi-story annotation semantics (`@supports` format, token structure, patterns, and coexistence), while preserving existing `@story`/`@req` behavior.
  - [x] Adjust the ESLint rules that enforce story and requirement annotations so they treat `@supports` as a first-class way to associate requirements with stories (including `require-*` and `valid-*` rules).
  - [x] Extend and update the test suite to cover parsing, format validation, deep requirement checks, mixed usage, and error-reporting edge cases for `@supports`, mapped back to story 010.2.
  - [x] Review and fix traceability annotations in modified source and test files so they reference story 010.2 / 010.3 and the appropriate `REQ-SUPPORTS-*` and related requirement IDs.
  - [x] Compare final behavior against the story’s examples and edge cases to confirm alignment, adjusting tests and docs where necessary.

## Additional Fix: Smoke test failure due to Husky postinstall

While running CI after the first commit, the **smoke test step failed** because:

- The published tarball still contained `"postinstall": "husky"` in `package.json`.
- When installed into a fresh temp project during the smoke test, `npm` tried to run `husky` as a **postinstall script**, but `husky` is **not a dependency** of that test project, causing:
  - `npm error command sh -c husky`
  - `sh: 1: husky: not found` (exit code 127).

**Fix implemented:**

- Switched from `postinstall` to `prepare` in `package.json`:
  - Removed: `"postinstall": "husky"`.
  - Added: `"prepare": "husky"`.
- This aligns with modern Husky usage and ensures:
  - Hooks are installed when developing this repo (`npm install` here).
  - Hooks are **not** run when the plugin is installed as a dependency in consuming projects (and in the smoke-test temp project).

After this change:

- All local checks (build, test, lint, type-check, format:check) pass.
- CI’s unified **CI/CD Pipeline** now completes **successfully**, including semantic-release (no new version triggered after 1.8.2) and the npm-published smoke test for future releases.
```

const { Linter } = require("eslint");
const rule = require("../src/rules/require-story-annotation").default;
const linter = new Linter();

// Register plugin rule under 'rule-to-test/require-story-annotation' because RuleTester uses that prefix
linter.defineRule("rule-to-test/require-story-annotation", rule);

const code = "function bar() {}";

const messages = linter.verify(code, {
  parserOptions: { ecmaVersion: 2020, sourceType: "module" },
  rules: { "rule-to-test/require-story-annotation": "error" },
});

console.log("Messages:", JSON.stringify(messages, null, 2));

// Try applying suggestion fix to get output
if (messages.length) {
  const msg = messages[0];
  console.log("Has suggestions:", !!msg.suggestions);
  if (msg.suggestions && msg.suggestions.length) {
    console.log("Suggestion desc:", msg.suggestions[0].desc);
    // Apply fix
    const fix = msg.suggestions[0].fix;
    const fixed = Linter.applyFix(code, fix);
    console.log("Fixed result:", fixed.output);
  }
}

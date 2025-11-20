const { Linter } = require("eslint");
const rule = require("../src/rules/require-story-annotation").default;
const linter = new Linter();

linter.defineRule("require-story-annotation", rule);

const code = "function bar() {}";
const messages = linter.verify(code, {
  rules: { "require-story-annotation": "error" },
  parserOptions: { ecmaVersion: 2020, sourceType: "module" },
});

console.log(JSON.stringify(messages, null, 2));

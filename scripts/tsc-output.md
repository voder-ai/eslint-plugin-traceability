```
tests/rules/valid-story-reference.test.ts(99,23): error TS2769: No overload matches this call.
  Overload 1 of 2, '(node: Program & { parent: null; }): void', gave the following error.
    Argument of type '{ type: "Program"; body: never[]; sourceType: "module"; }' is not assignable to parameter of type 'Program & { parent: null; }'.
      Type '{ type: "Program"; body: never[]; sourceType: "module"; }' is missing the following properties from type 'Program': comments, tokens, loc, range
  Overload 2 of 2, '(node: Program): void', gave the following error.
    Argument of type '{ type: "Program"; body: never[]; sourceType: "module"; }' is not assignable to parameter of type 'Program'.
      Type '{ type: "Program"; body: never[]; sourceType: "module"; }' is missing the following properties from type 'Program': comments, tokens, loc, range
```

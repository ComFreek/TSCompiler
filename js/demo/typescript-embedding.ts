///<reference path="../src/ts-compiler.ts" />

// Support multiline strings!
// http://typescript.codeplex.com/workitem/293
var testString = 
  "class ABC {" +
    "public test() {" +
      "return 'Hello World!';" +
    "}" +
  "}";

alert(TSCompiler.compileStr(testString));
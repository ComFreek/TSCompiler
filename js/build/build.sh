#!/bin/bash
tsc ../src/ts-compiler-helpers.ts ../src/ts-compiler-types.ts ../src/ts-compiler.ts --out ts-compiler.js
tsc ../src/direct-run.ts --out direct-run.js
java -jar ClosureCompiler/compiler.jar --js ts-compiler.js --language_in ECMASCRIPT5 --js_output_file ts-compiler.min.js
java -jar ClosureCompiler/compiler.jar --compilation_level WHITESPACE_ONLY --formatting PRETTY_PRINT --language_in ECMASCRIPT5 --js typescript.js --js ts-compiler.js --js_output_file TSCompiler.js
java -jar ClosureCompiler/compiler.jar --language_in ECMASCRIPT5 --js typescript.js --js ts-compiler.js --js_output_file TSCompiler.min.js
java -jar ClosureCompiler/compiler.jar --js TSCompiler.js --js direct-run.js --js_output_file TSCompiler-Run.min.js --language_in ECMASCRIPT5

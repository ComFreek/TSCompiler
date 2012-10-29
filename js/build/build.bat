tsc ../src/ts-compiler.ts --out ts-compiler.js
java -jar ClosureCompiler/compiler.jar --compilation_level WHITESPACE_ONLY --formatting PRETTY_PRINT --language_in ECMASCRIPT5 --js typescript.js --js ts-compiler.js --js_output_file TSCompiler.js
java -jar ClosureCompiler/compiler.jar --language_in ECMASCRIPT5 --js typescript.js --js ts-compiler.js --js_output_file TSCompiler.min.js

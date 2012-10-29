#!/bin/bash
java -jar ClosureCompiler/compiler.jar --language_in ECMASCRIPT5 --js ../src/typescript.js --js ../src/ts-compiler.js --js_output_file TSCompiler.js

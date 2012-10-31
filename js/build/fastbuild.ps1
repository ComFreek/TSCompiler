# Run this script if you want to quickly test your scripts

Invoke-Expression "tsc ../src/ts-compiler.ts --out ts-compiler.js"
$TSCompiler = (Get-Content "typescript.js") + (Get-Content "ts-compiler.js");

$TSCompiler | Set-Content -path "TSCompiler.js";
$TSCompiler | Set-Content -path "TSCompiler.min.js";
param($clean);

if ($clean -eq "clean") {
	Remove-Item "ts-compiler.js";
	Remove-Item "ts-compiler.min.js";
	Remove-Item "TSCompiler.js";
	Remove-Item "TSCompiler.min.js";
	Remove-Item "TSCompiler-Run.min.js";
	Exit;
}

# Minfy JavaScript files using Google Closure Compiler
$jsFiles = @(
	"typescript.js",
	"ts-compiler.js"
);

$cmds = @("", "", "", "", "", "");
$cmds[0] = "tsc ../src/ts-compiler-helpers.ts ../src/ts-compiler-types.ts ../src/ts-compiler.ts --out ts-compiler.js";
$cmds[1] = "tsc ../src/direct-run.ts --out direct-run.js";
$cmds[2] = "java -jar ClosureCompiler/compiler.jar --js " + $jsFiles[1] + " --language_in ECMASCRIPT5 --js_output_file ts-compiler.min.js";
$cmds[3] = "java -jar ClosureCompiler/compiler.jar --compilation_level WHITESPACE_ONLY --formatting PRETTY_PRINT --language_in ECMASCRIPT5";
$cmds[4] = "java -jar ClosureCompiler/compiler.jar --language_in ECMASCRIPT5";
$cmds[5] = "java -jar ClosureCompiler/compiler.jar --js TSCompiler.js --js direct-run.js --js_output_file TSCompiler-Run.min.js --language_in ECMASCRIPT5";

$jsFiles | % {
	$cmds[3] += " --js $_";
	$cmds[4] += " --js $_";
}

$cmds[3] += " --js_output_file TSCompiler.js"
$cmds[4] += " --js_output_file TSCompiler.min.js"


$location = Get-Location;

# Generate batch script
$location = Get-Location;
[System.IO.File]::WriteAllText($location.ToString() + ".\build.bat", [string]::Join(" && ", $cmds));

# Generate bash script
$bashScript = "#!/bin/bash`n";
$bashScript += [string]::Join("`n", $cmds);
$bashScript += "`n";

[System.IO.File]::WriteAllText($location.ToString() + ".\build.sh", $bashScript);

# Invoke the commands!
$cmds | % {
	Invoke-Expression $_;
}
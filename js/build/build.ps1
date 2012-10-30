param($clean);

if ($clean -eq "clean") {
	Remove-Item "ts-compiler.js";
	Remove-Item "TSCompiler.js";
	Remove-Item "TSCompiler.min.js";
	Exit;
}

# Minfy JavaScript files using Google Closure Compiler
$jsFiles = @(
	"typescript.js",
	"ts-compiler.js"
);

$cmds = @("", "", "");
$cmds[0] = "tsc ../src/ts-compiler.ts --out ts-compiler.js";
$cmds[1] = "java -jar ClosureCompiler/compiler.jar --compilation_level WHITESPACE_ONLY --formatting PRETTY_PRINT --language_in ECMASCRIPT5";
$cmds[2] = "java -jar ClosureCompiler/compiler.jar --language_in ECMASCRIPT5";

$jsFiles | % {
	$cmds[1] += " --js $_";
	$cmds[2] += " --js $_";
}

$cmds[1] += " --js_output_file TSCompiler.js"
$cmds[2] += " --js_output_file TSCompiler.min.js"


$location = Get-Location;

# Generate batch script
$location = Get-Location;
[System.IO.File]::WriteAllLines($location.ToString() + ".\build.bat", [string]::Join("`r`n", $cmds));

# Generate bash script
$bashScript = "#!/bin/bash`n";
$bashScript += [string]::Join("`n", $cmds);
$bashScript += "`n";

[System.IO.File]::WriteAllText($location.ToString() + ".\build.sh", $bashScript);

# Invoke the commands!
$cmds | % {
	Invoke-Expression $_;
}
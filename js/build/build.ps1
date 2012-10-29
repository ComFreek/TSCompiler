# Minfy JavaScript files using Google Closure Compiler
$jsFiles = @(
	"../src/typescript.js",
	"../src/ts-compiler.js"
);

$cmds = @("", "");
$cmds[0] = "tsc ../src/ts-compiler.ts --out TSCompiler.js";
$cmds[1] = "java -jar ClosureCompiler/compiler.jar --language_in ECMASCRIPT5"

$jsFiles | % {
	$cmds[1] += " --js $_";
}

$cmds[1] += " --js_output_file TSCompiler.min.js"


$location = Get-Location;

# Generate batch script
$location = Get-Location;
[System.IO.File]::WriteAllLines($location.ToString() + ".\build.bat", [string]::Join("`r`n", $cmds));

# Generate bash script
$bashScript = "#!/bin/bash`r`n";
$bashScript += [string]::Join("`n", $cmds)

$location = Get-Location;
[System.IO.File]::WriteAllLines($location.ToString() + ".\build.sh", $bashScript);

# Invoke the commands!
Invoke-Expression $cmds[0];
Invoke-Expression $cmds[1];
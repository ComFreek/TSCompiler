# Minfy JavaScript files using Google Closure Compiler
$jsFiles = @(
	"../src/typescript.js",
	"../src/ts-compiler.js"
);

$cmd = "java -jar ClosureCompiler/compiler.jar --language_in ECMASCRIPT5"

$jsFiles | % {
	$cmd += " --js $_";
}

$cmd += " --js_output_file TSCompiler.js"
Write-Host $cmd
Invoke-Expression $cmd

$location = Get-Location;

# Generate batch script
$location = Get-Location;
[System.IO.File]::WriteAllLines($location.ToString() + ".\build.bat", $cmd)

# Generate bash script
$bashScript = "#!/bin/bash`r`n";
$bashScript += $cmd;

$location = Get-Location;
[System.IO.File]::WriteAllLines($location.ToString() + ".\build.sh", $bashScript)
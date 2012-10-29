$jsFiles = @(
	"../src/typescript.js",
	"../src/ts-compiler.js"
);

$cmd = "java -jar ClosureCompiler/compiler.jar"

$jsFiles | % {
	$cmd += " --js $_";
}

$cmd += " --js_output_file TSCompiler.js"
Write-Host $cmd
Invoke-Expression $cmd


# Can you help?
# Running the bash script outputs "cannot execute binary file".
# http://unix.stackexchange.com/questions/53241/calling-java-from-bash-cannot-execute-binary-file

<#
$bashScript = "#!/bin/bash`r`n";
$bashScript += $cmd;
$bashScript | Out-File build.sh
#>
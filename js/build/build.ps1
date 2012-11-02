<#
Build JS files and generate bash and batch script:
powershell .\build.ps1

Only generate bash and batch script:
powershell .\build.ps1 -gen true

Only clean up all built/generated JS files:
powershell .\build.ps1 -clean true
#>
param([string]$gen, [string]$clean);

# Indicates that all build commands should be really run
# instead of just generating the batch and bash scripts.
$doBuild = $TRUE;

# Indicates that we should only clean up all built/generated
# files.
$doClean = $FALSE;

if ($gen -and ($gen.ToLower() -eq "true") -or ($gen -eq "1")) {
  $doBuild = $FALSE;
}

if ($clean -and ($clean.ToLower() -eq "true") -or ($clean -eq "1")) {
	$doBuild = $FALSE;
	$doClean = $TRUE;
}


#Clean up all built/generated files!
if ($doClean) {
	Remove-Item "ts-compiler.js";
	Remove-Item "ts-compiler.min.js";
	Remove-Item "TSCompiler.js";
	Remove-Item "TSCompiler.min.js";
	Remove-Item "TSCompiler-Run.min.js";
	Remove-Item "direct-run.js";
	Exit;
}

<#
	Invokes each entry in the array via Invoke-Expression.
	@param $cmds Array of commands.
#>
function invokeExpArray($cmds) {
	$cmds | % {
		Invoke-Expression $_;
	};
}

<#
	Generates the TypeScript compile commands and optionally runs them.
	@param $exec Specifies whether the commands should be run.
	@return Returns all commands as an array.
#>
function compileTS($exec) {
	$cmds = @();
	$cmds += "tsc ../src/helpers.ts ../src/types.ts ../src/main.ts --out ts-compiler.js";
	$cmds += "tsc ../src/direct-run.ts --out direct-run.js";
	
	if ($exec) {
		invokeExpArray -cmds $cmds;
	}
	return $cmds;
}

<#
	Generates the JS minifying commands and optionally runs them.
	@param $exec Specifies whether the commands should be run.
	@return Returns all commands as an array.
#>
function minifyJS($exec) {
	$javaCmd = "java -jar ClosureCompiler/compiler.jar --language_in ECMASCRIPT5 ";

	$cmds = @();
	$cmds += $javaCmd + "--js ts-compiler.js --js_output_file ts-compiler.min.js";
	$cmds += $javaCmd + "--js typescript.js --js ts-compiler.min.js --js_output_file TSCompiler.js " +
                      "--compilation_level WHITESPACE_ONLY --formatting PRETTY_PRINT"
	$cmds += $javaCmd + "--js typescript.js --js ts-compiler.min.js --js_output_file TSCompiler.min.js";
	$cmds += $javaCmd + "--js TSCompiler.js --js direct-run.js --js_output_file TSCompiler-Run.min.js";
	
	if ($exec) {
		invokeExpArray -cmds $cmds;
	}
	return $cmds;
}

<#
	Generates a batch script containing the given commands.
	@param $cmds Commands as an array.
	@param $filename Filename.
#>
function genBatch($cmds, $filename) {
	[System.IO.File]::WriteAllText($filename, $cmds -join " && ");
}

<#
	Generates a bash script containing the given commands.
	@param $cmds Commands as an array.
	@param $filename Filename.
#>
function genBash($cmds, $filename) {
	$bashScript = "#!/bin/bash`n";
	$bashScript += [string]::Join("`n", $cmds -join "`n");
	$bashScript += "`n";
	[System.IO.File]::WriteAllText($filename, $bashScript);
}

$totalCmds = @();
$totalCmds = $totalCmds + (compileTS -exec $doBuild);
$totalCmds = $totalCmds + (minifyJS -exec $doBuild);

$location = (Get-Location).ToString();
genBatch -cmds $totalCmds -filename ($location + ".\build.bat");
genBash -cmds $totalCmds -filename ($location + ".\build.sh");
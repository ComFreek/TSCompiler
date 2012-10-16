<?php

error_reporting(E_ALL);
require('../src/TSCompiler.class.php');

$errorVersion = (isset($_GET['error']) && $_GET['error'] == 'true');

// Error version
if ($errorVersion) {
	$file = 'this-file-does-not-exist.ts';
}
// Normal version
else {
	$file = 'demo.ts';
}

$errorInfo = array();
if (!$errorVersion) {
	$sourceCode = file_get_contents($file);
}
else {
	$sourceCode = 'This is the error version!';
}

$errorInfo = array();
$compiledCode = TSCompiler::compileToStr($file, $errorInfo);

header('Content-Type: text/html; charset=utf-8');
header("Expires: Tue, 03 Jul 2001 06:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
?>
<!doctype html>
<html>
	<head>
		<title>TSCompiler::compileToStr() demo</title>
		<meta charset="utf-8" />
		<style>
			html, body {
				height: 100%;
			}

			#left {
				width: 50%;
				border-right: thick solid black;
				float: left;
				margin-right: 20px;
				padding-right: 20px;
			}

			#footer {
				clear: both;
				border-top: thick solid black;
			}
		</style>
	</head>
	
	<body>
		<h1>TSCompiler::compileToStr() demo <small>(<a href="?error=false">normal version</a> &bullet; <a href="?error=true">error version</a>)</small></h1>
		<hr />
		
		<div id="left">
			<h2>The source code</h2>
			<pre><?php echo $sourceCode; ?></pre>
		</div>
		
		<div id="right">
			<h2>Compiled code</h2>
			<pre><?php echo $compiledCode; ?></pre>
		</div>
		
		<div id="footer">
			<h2>Error information</h2>
			<?php print_r($errorInfo); ?>
		</div>
	</body>
</html>
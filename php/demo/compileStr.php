<?php

error_reporting(E_ALL);
require('../src/TSCompiler.class.php');

$errorInfo = NULL;
$compiledCode = '';
$sourceCode = file_get_contents('demo.ts');

if (isset($_POST['str']) && !empty($_POST['str'])) {
	$compiledCode = TSCompiler::compileStr($_POST['str'], array(), $errorInfo);
	$sourceCode = $_POST['str'];
}
	
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
	</head>
	
	<body>
		<h1>TSCompiler::compileStr() demo</h1>
		<hr />
		
		<h2>The source code</h2>
		<form action="compileStr.php" method="POST">
			<textarea name="str" rows="30" cols="100"><?php echo htmlentities($sourceCode); ?></textarea>
			<br /><br />
			<input type="submit" value="Compile &amp; Run!" />
		</form>

		<hr />
		
		<h2>Error information</h2>
		<?php print_r($errorInfo); ?>
		
		<hr />
		
		<h2>Compiled code</h2>
		<pre><?php echo $compiledCode;?></pre>
	</body>
</html>
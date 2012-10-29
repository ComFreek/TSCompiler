var TSCompiler;
(function (TSCompiler) {
    TSCompiler.API_VERSION = 0.1;
    var CompileInfo = (function () {
        function CompileInfo() {
            this.errors = [];
            this.outStream = new StringOutputStream();
        }
        CompileInfo.prototype.addError = function (start, len, msg, block) {
            this.errors.push({
                start: start,
                len: len,
                msg: msg,
                block: block
            });
        };
        CompileInfo.prototype.getErrorCallback = function () {
            var $this = this;
            return (function () {
                $this.addError.apply($this, arguments);
            })
        };
        CompileInfo.prototype.getErrorCount = function () {
            return this.errors.length;
        };
        return CompileInfo;
    })();
    TSCompiler.CompileInfo = CompileInfo;    
    var StringOutputStream = (function () {
        function StringOutputStream() {
            this.data = "";
        }
        StringOutputStream.prototype.Write = function (s) {
            this.data += s;
        };
        StringOutputStream.prototype.WriteLine = function (s) {
            this.data += s + "\n";
        };
        StringOutputStream.prototype.Close = function () {
        };
        return StringOutputStream;
    })();    
    function compile(options, cInfo) {
        if(typeof cInfo == "undefined") {
            cInfo = new CompileInfo();
        }
        var compiler = new TypeScript.TypeScriptCompiler(cInfo.outStream);
        compiler.parser.errorRecovery = true;
        compiler.setErrorCallback(cInfo.getErrorCallback());
        for(var i = 0; i < options.units.length; i++) {
            var unit = options.units[i];
            compiler.addUnit(unit.data, unit.name);
        }
        compiler.typeCheck();
        compiler.emit(false, function create() {
            return cInfo.outStream;
        });
        return cInfo.outStream.data;
    }
    TSCompiler.compile = compile;
    function compileStr(str, options, cInfo) {
        if(!options) {
            options = {
                units: []
            };
        }
        options.units.push({
            data: str,
            name: ""
        });
        return compile(options, cInfo);
    }
    TSCompiler.compileStr = compileStr;
    function runStr(str, options, cInfo) {
        var code = compileStr(str, options, cInfo);
        insertScriptBlock(code);
        return code;
    }
    TSCompiler.runStr = runStr;
    function insertScriptBlock(content) {
        var block = document.createElement("script");
        block.setAttribute("type", "text/javascript");
        block.innerHTML = content;
        document.body.appendChild(block);
    }
    TSCompiler.insertScriptBlock = insertScriptBlock;
            function runScriptBlock(block, options, cInfo) {
        if(typeof block == "string") {
            block = document.getElementById(block);
        }
        if(!block || !block.tagName || block.tagName.toLowerCase() != "script") {
            throw Error("Invalid script block.");
        }
        var result = compileStr(block.innerHTML, options, cInfo);
        insertScriptBlock(result);
    }
    TSCompiler.runScriptBlock = runScriptBlock;
    function runAllScriptBlocks(allowedTypes, options, cInfo) {
        if(typeof allowedTypes == "undefined" || allowedTypes === null) {
            allowedTypes = [
                "text/typescript", 
                "application/typescript"
            ];
        }
        var testType = true;
        var blocks = null;
        if(document.querySelectorAll) {
            testType = false;
            var query = "";
            for(var i = 0, len = allowedTypes.length; i < len; i++) {
                query += "script[type=\"" + allowedTypes[i] + "\"]";
                if(i != len - 1) {
                    query += ",";
                }
            }
            blocks = document.querySelectorAll(query);
        } else {
            blocks = document.getElementsByTagName("script");
        }
        for(var i = 0, len = blocks.length; i < len; i++) {
            var block = blocks[i];
            if(testType) {
                var type = block.getAttribute("type").toLowerCase();
                var ok = false;
                for(var j = 0, typeLen = allowedTypes.length; j < typeLen; j++) {
                    if(type == allowedTypes[j]) {
                        ok = true;
                        break;
                    }
                }
                if(!ok) {
                    continue;
                }
            }
            if(block.src) {
                compileExtern(block.src);
            } else {
                runScriptBlock(block, options, cInfo);
            }
        }
    }
    TSCompiler.runAllScriptBlocks = runAllScriptBlocks;
    function compileExtern(url, run, callback, options, cInfo) {
        if(!callback) {
            callback = function () {
            };
        }
        if(typeof run == "undefined") {
            run = true;
        }
        if(typeof cInfo == "undefined" || cInfo === null) {
            cInfo = new CompileInfo();
        }
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onreadystatechange = function () {
            if(xhr.readyState == 4) {
                if(xhr.status == 200) {
                    var js = compileStr(xhr.responseText, options, cInfo);
                    if(run) {
                        insertScriptBlock(js);
                        callback({
                            result: js,
                            compileInfo: cInfo
                        });
                    } else {
                        callback({
                            result: js,
                            compileInfo: cInfo
                        });
                    }
                } else {
                    callback({
                        error: true
                    });
                }
            }
        };
        xhr.send(null);
    }
    TSCompiler.compileExtern = compileExtern;
})(TSCompiler || (TSCompiler = {}));

; ;

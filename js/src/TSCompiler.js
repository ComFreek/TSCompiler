var TSCompiler;
(function (TSCompiler) {
    TSCompiler.API_VERSION = 0.1;
    function compile(options, cInfo) {
        if(typeof cInfo == "undefined") {
            cInfo = new TSCompiler.Types.CompileInfo();
        }
        var settings = new TypeScript.CompilationSettings();
        settings.generateDeclarationFiles = (options.produceDeclarations === true);
        var compiler = new TypeScript.TypeScriptCompiler(cInfo.emittedUnits.getDefaultStream(), null, new TypeScript.NullLogger(), settings);
        compiler.parser.errorRecovery = true;
        compiler.setErrorCallback(cInfo.getErrorCallback());
        for(var i = 0; i < options.units.length; i++) {
            var unit = options.units[i];
            compiler.addUnit(unit.data, unit.name);
        }
        compiler.typeCheck();
        compiler.emit(true, cInfo.emittedUnits.getEmitCallback());
        return cInfo.emittedUnits.getDefJS();
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
        TSCompiler.Helpers.insertScriptBlock(code);
        return code;
    }
    TSCompiler.runStr = runStr;
            function runScriptBlock(block, options, cInfo) {
        if(typeof block == "string") {
            block = document.getElementById(block);
        }
        if(!block || !block.tagName || block.tagName.toLowerCase() != "script") {
            throw Error("Invalid script block.");
        }
        var result = compileStr(block.innerHTML, options, cInfo);
        TSCompiler.Helpers.insertScriptBlock(result);
    }
    TSCompiler.runScriptBlock = runScriptBlock;
    function runAllScriptBlocks(allowedTypes, options, cInfo) {
        if(typeof allowedTypes == "undefined" || allowedTypes === null) {
            allowedTypes = [
                "text/typescript", 
                "application/typescript"
            ];
        }
        TSCompiler.Helpers.filterScriptBlocks(allowedTypes, function (block) {
            if(block.src) {
                compileExtern(block.src);
            } else {
                runScriptBlock(block, options, cInfo);
            }
        });
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
            cInfo = new TSCompiler.Types.CompileInfo();
        }
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onreadystatechange = function () {
            if(xhr.readyState == 4) {
                if(xhr.status == 200) {
                    var js = compileStr(xhr.responseText, options, cInfo);
                    if(run) {
                        TSCompiler.Helpers.insertScriptBlock(js);
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
var TSCompiler;
(function (TSCompiler) {
    (function (Types) {
        var CompileInfo = (function () {
            function CompileInfo() {
                this.errors = [];
                this.emittedUnits = new EmitDataStore();
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
            CompileInfo.prototype.addOutputUnit = function () {
            };
            return CompileInfo;
        })();
        Types.CompileInfo = CompileInfo;        
        var EmitDataStore = (function () {
            function EmitDataStore() {
                this.units = {
                };
                this.units[".js"] = new StringOutputStream();
            }
            EmitDataStore.prototype.getEmitCallback = function () {
                var $this = this;
                return (function (name) {
                    return $this.emitCallback.apply($this, [
                        name
                    ]);
                })
            };
            EmitDataStore.prototype.emitCallback = function (name) {
                if(typeof this.units[name] == "undefined") {
                    this.units[name] = new StringOutputStream();
                }
                return this.units[name];
            };
            EmitDataStore.prototype.getDefaultStream = function () {
                return this.units[".js"];
            };
            EmitDataStore.prototype.getDefJS = function () {
                return this.units[".js"].data;
            };
            EmitDataStore.prototype.getDefDecl = function () {
                if(this.units[".d.ts"]) {
                    return this.units[".d.ts"].data;
                }
                return "";
            };
            EmitDataStore.prototype.getUnit = function (name) {
                return this.units[name].data;
            };
            EmitDataStore.prototype.getAllUnits = function () {
                return this.units;
            };
            return EmitDataStore;
        })();
        Types.EmitDataStore = EmitDataStore;        
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
    })(TSCompiler.Types || (TSCompiler.Types = {}));
    var Types = TSCompiler.Types;

})(TSCompiler || (TSCompiler = {}));

; ;
var TSCompiler;
(function (TSCompiler) {
    (function (Helpers) {
        function insertScriptBlock(content) {
            var block = document.createElement("script");
            block.setAttribute("type", "text/javascript");
            block.innerHTML = content;
            document.body.appendChild(block);
        }
        Helpers.insertScriptBlock = insertScriptBlock;
        function filterScriptBlocks(types, callback) {
            var testType = true;
            var blocks = null;
            if(document.querySelectorAll) {
                testType = false;
                var query = "";
                for(var i = 0, len = types.length; i < len; i++) {
                    query += "script[type=\"" + types[i] + "\"]";
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
                    for(var j = 0, typeLen = types.length; j < typeLen; j++) {
                        if(type == types[j]) {
                            ok = true;
                            break;
                        }
                    }
                    if(!ok) {
                        continue;
                    }
                }
                callback(block);
            }
        }
        Helpers.filterScriptBlocks = filterScriptBlocks;
    })(TSCompiler.Helpers || (TSCompiler.Helpers = {}));
    var Helpers = TSCompiler.Helpers;

})(TSCompiler || (TSCompiler = {}));

; ;

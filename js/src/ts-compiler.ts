///<reference path="ts-compiler-helpers.ts" />
///<reference path="ts-compiler-types.ts" />
declare var TypeScript;

/**
  * JavaScript language binding
  */
module TSCompiler {
  /**
    * Stores the current API version.
    */
  export var API_VERSION = 0.1;

  /**
    * Compiles units using the supplied options argument.
    * @param options See CompileOptions for all available options.
    * @param cInfo You can pass a CompileInfo object in order to save occurred errors.
    * @return The compiled data
    */
  export function compile(options: Types.CompileOptions, cInfo?: Types.CompileInfo): string {
    if (typeof cInfo == "undefined") {
      cInfo = new Types.CompileInfo();
    }

    var settings = new TypeScript.CompilationSettings();
    settings.generateDeclarationFiles = (options.produceDeclarations === true);

    var compiler = new TypeScript.TypeScriptCompiler(cInfo.emittedUnits.getDefaultStream(), null, new TypeScript.NullLogger(), settings);
    
    compiler.parser.errorRecovery = true;
    compiler.setErrorCallback(cInfo.getErrorCallback());

    for (var i = 0; i < options.units.length; i++) {
      var unit = options.units[i];
      compiler.addUnit(unit.data, unit.name);
    }

    compiler.typeCheck();
    compiler.emit(true, cInfo.emittedUnits.getEmitCallback());

    return cInfo.emittedUnits.getDefJS();
  }

  /**
    * Compiles a given string.
    * @param str The code
    * @param options Optional options to use
    * @param cInfo Optional CompileInfo object for retreiving additional information
    * @return The compiled string
    */
  export function compileStr(str: string, options?: Types.CompileOptions, cInfo?: Types.CompileInfo): string {
    if (!options) {
      options = {
        units: [
        ]
      };
    }
    options.units.push({ data: str, name: "" });
    return compile(options, cInfo);
  }

  /**
    * Compiles and executes a given string
    * @param str The code
    * @param options Optional options to use
    * @param cInfo Optional CompileInfo object for retreiving additional information
    * @param The compiled string
    */
  export function runStr(str: string, options?: Types.CompileOptions, cInfo?: Types.CompileInfo) {
    var code = compileStr(str, options, cInfo);
    Helpers.insertScriptBlock(code);

    return code;
  }

  /**
    * Compiles and executes a script block and inserts a new one with the compiled JavaScript.
    * @param block Either an Element object (get it via document.getElementById() or similar) or an ID of an existing object
    * @param options Optional options to use
    * @param cInfo Optional CompileInfo object for retreiving additional information
    */
  export function runScriptBlock(block: Element, options?: Types.CompileOptions, cInfo?: Types.CompileInfo);
  export function runScriptBlock(block: string, options?: Types.CompileOptions, cInfo?: Types.CompileInfo);
  export function runScriptBlock(block: any, options?: Types.CompileOptions, cInfo?: Types.CompileInfo) {
    if (typeof block == "string") {
      block = document.getElementById(block);
    }
    if (!block || !block.tagName || block.tagName.toLowerCase() != "script") {
      throw Error("Invalid script block.");
    }

    var result = compileStr(block.innerHTML, options, cInfo);
    Helpers.insertScriptBlock(result);
  }

  /**
    * Compiles and executes all script blocks filtered by their type attribute and inserts each compiled data into new JavaScript block.
    * You can also use <script> blocks with the src attribute. The data will be retreived via AJAX.
    *
    * @param allowedTypes An array of allowed type attributes. This is by default "text/typescript" and "application/typescript"
    * @param options Optional options to use
    * @param cInfo Optional CompileInfo object for retreiving additonal information
    */
  export function runAllScriptBlocks(allowedTypes?: string[], options?: Types.CompileOptions, cInfo?: Types.CompileInfo) {
    if (typeof allowedTypes == "undefined" || allowedTypes === null) {
      allowedTypes = [
        "text/typescript",
        "application/typescript"
      ]
    }
    
    Helpers.filterScriptBlocks(allowedTypes, function (block: HTMLScriptElement) {
      if (block.src) {
        compileExtern(block.src);
      }
      else {
        runScriptBlock(block, options, cInfo);
      }
    });
  }

  /**
    * Compiles an external resource specified by an URL.
    * @param url The URL
    * @param run Indicates whether the compiled data should be inserted into a <script> block which will then be run.
    * @param callback An optional callback function will get passed an object with these key/value pairs:
    * - result: The compiled JS
    * - compileInfo: A CompileInfo object
    * - error: TRUE if an error occurred (check for this value before you access the other attributes!)
    * @param options Optional options to use
    * @param cInfo Optional CompileInfo object for retreiving additonal information
    */
  export function compileExtern(url: string, run?: bool, callback?: Types.ExternCompileCallback, options?: Types.CompileOptions, cInfo?: Types.CompileInfo) {
    if (!callback) {
      callback = function () {}
    }

    if (typeof run == "undefined") {
      run = true;
    }

    if (typeof cInfo == "undefined" || cInfo === null) {
      cInfo = new Types.CompileInfo();
    }

    var xhr = new XMLHttpRequest();

    xhr.open("GET", url);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {

        if (xhr.status == 200) {
          var js = compileStr(xhr.responseText, options, cInfo);
          if (run) {
            Helpers.insertScriptBlock(js);
            callback({ result: js, compileInfo: cInfo });
          }
          else {
            callback({ result: js, compileInfo: cInfo });
          }

        }
        else {
          callback({ error: true });
        }

      }
    }
    xhr.send(null);
  }
};
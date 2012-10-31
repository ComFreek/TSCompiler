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
    * Stores a compiler error.
    */
  interface CompileInfoError {
    start: number;
    len: number;
    msg: string;
    block: number;
  }

  /**
    * Typedefs the error callback function's type.
    */
  interface CompilerErrorCallback {
    (start: number, len: number, msg: string, block: number): any;
  }

  export interface TypeScriptEmitCallback {
    (name: string): StringOutputStream;
  }

  export interface ExternCompileCallbackData {
    error?: bool;
    result?: string;
    compileInfo?: CompileInfo;
  }

  export interface ExternCompileCallback {
    (data: ExternCompileCallbackData): any;
  }

  /**
    * Stores the data and the name of a unit for the compiler.
    */
  interface Unit {
    data: string;
    name?: string;
  }

  /**
    * Compiler options
    */
  export interface CompileOptions {
    units: Unit[];
    produceDeclarations?: bool;
  }

  /**
    * Saves information about the compilation (only errors are currently implemented).
    */
  export class CompileInfo {
    /**
      * Logged errors
      */
    public errors: CompileInfoError[] = [];

    public emittedUnits: EmitDataStore = new EmitDataStore();

    /**
      * Adds an error to the list.
      * @param start Start position
      * @param len Length
      * @param msg Error message
      * @param block The full block
      */
    public addError(start: number, len: number, msg: string, block: number) {
      this.errors.push({
        start: start,
        len: len,
        msg: msg,
        block: block
      });
    }

    /**
      * Returns an error callback function which automatically adds the found error to the list.
      * @return The function
      */
    public getErrorCallback(): CompilerErrorCallback {
      var $this = this;
      return (function () {
        $this.addError.apply($this, arguments);
      });
    }

    /**
      * Returns the number of errors.
      * @return Error count
      */
    public getErrorCount(): number {
      return this.errors.length;
    }

    public addOutputUnit() {
    }
  }

  /**
    * Represents a string output stream which writes the applied data to a string.
    */
  class StringOutputStream {
    /**
      * The retreived data
      */
    public data: string = "";

    /**
      * Writes data
      * @param s Data
      */
    public Write(s: string) {
      this.data += s;
    }

    /**
      * Writes data an adds a newline.
      * @param s Data
      */
    public WriteLine(s: string) {
      this.data += s + "\n";
    }

    /**
      * Does nothing.
      */
    public Close() {
    }
  }

  /**
    * Stores the output of TypeScript's emit callback.
    */
  class EmitDataStore {
    /**
      * Stores the emitted units (files).
      */
    private units = {};

    /**
      * Initializes a default .js unit.
      */
    constructor () {
      this.units[".js"] = new StringOutputStream();
    }

    /**
      * Returns the needed callback for TypeScript's emitter.
      * @return The callback function
      */
    public getEmitCallback() : TypeScriptEmitCallback {
      var $this = this;
      return (function (name: string): StringOutputStream {
        return $this.emitCallback.apply($this, [name]);
      });
    }

    /**
      * Returns a StringOutputStream for the given unit name.
      * This method should only be called by the returned callback from getEmitCallback()!
      * @param name The unit name
      * @return A StringOutputStream object whose methods can be called in order to append data to the stream.
      */
    private emitCallback(name: string): StringOutputStream {
      if (typeof this.units[name] == "undefined") {
        this.units[name] = new StringOutputStream();
      }
      return this.units[name];
    }

    /**
      * Returns the default stream (i.e. output unit)
      * @return A StringOutputStream object
      */
    public getDefaultStream(): StringOutputStream {
      return this.units[".js"];
    }

    /**
      * Returns the output JS from the default stream
      * @eturn JavaScript code
      */
    public getDefJS(): string {
      return this.units[".js"].data;
    }

    /**
      * Returns the output declaration code from the default decl stream
      * @return Declaration code
      */
    public getDefDecl(): string {
      if (this.units[".d.ts"]) {
        return this.units[".d.ts"].data;
      }
      return "";
    }

    /**
      * Returns a specific unit
      * @param name The unit name
      * @return The collected data by its stream.
      */
    public getUnit(name: string): string {
      return this.units[name].data;
    }

    /**
      * Returns all unit objects
      * @return An associative array of units whose keys are the unit names.
      */
    public getAllUnits() {
      return this.units;
    }
  }

  /**
    * Compiles units using the supplied options argument.
    * @param options See CompileOptions for all available options.
    * @param cInfo You can pass a CompileInfo object in order to save occurred errors.
    * @return The compiled data
    */
  export function compile(options: CompileOptions, cInfo?: CompileInfo): string {
    if (typeof cInfo == "undefined") {
      cInfo = new CompileInfo();
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
  export function compileStr(str: string, options?: CompileOptions, cInfo?: CompileInfo): string {
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
  export function runStr(str: string, options?: CompileOptions, cInfo?: CompileInfo) {
    var code = compileStr(str, options, cInfo);
    insertScriptBlock(code);

    return code;
  }

  /**
    * Inserts a new JavaScript block into the <body> element.
    * @param content The content (innerHTML)
    */
  export function insertScriptBlock(content: string) {
    var block = document.createElement("script");
    block.setAttribute("type", "text/javascript");
    block.innerHTML = content;
    document.body.appendChild(block);
  }

  /**
    * Compiles and executes a script block and inserts a new one with the compiled JavaScript.
    * @param block Either an Element object (get it via document.getElementById() or similar) or an ID of an existing object
    * @param options Optional options to use
    * @param cInfo Optional CompileInfo object for retreiving additional information
    */
  export function runScriptBlock(block: Element, options?: CompileOptions, cInfo?: CompileInfo);
  export function runScriptBlock(block: string, options?: CompileOptions, cInfo?: CompileInfo);
  export function runScriptBlock(block: any, options?: CompileOptions, cInfo?: CompileInfo) {
    if (typeof block == "string") {
      block = document.getElementById(block);
    }
    if (!block || !block.tagName || block.tagName.toLowerCase() != "script") {
      throw Error("Invalid script block.");
    }

    var result = compileStr(block.innerHTML, options, cInfo);
    insertScriptBlock(result);
  }

  /**
    * Compiles and executes all script blocks filtered by their type attribute and inserts each compiled data into new JavaScript block.
    * You can also use <script> blocks with the src attribute. The data will be retreived via AJAX.
    *
    * @param allowedTypes An array of allowed type attributes. This is by default "text/typescript" and "application/typescript"
    * @param options Optional options to use
    * @param cInfo Optional CompileInfo object for retreiving additonal information
    */
  export function runAllScriptBlocks(allowedTypes?: string[], options?: CompileOptions, cInfo?: CompileInfo) {
    if (typeof allowedTypes == "undefined" || allowedTypes === null) {
      allowedTypes = [
        "text/typescript",
        "application/typescript"
      ]
    }
    
    var testType = true;
    var blocks = null;

    if (document.querySelectorAll) {
      testType = false;
      var query = "";
      for (var i = 0, len = allowedTypes.length; i < len; i++) {
        query += "script[type=\"" + allowedTypes[i] + "\"]";
        if (i != len - 1) {
          query += ",";
        }
      }
      
      blocks = document.querySelectorAll(query);
    }
    else {
      blocks = document.getElementsByTagName("script");
    }
    
    for (var i = 0, len = blocks.length; i < len; i++) {
      var block = blocks[i];      

      if (testType) {
        var type = block.getAttribute("type").toLowerCase();
        var ok = false;
        for (var j = 0, typeLen = allowedTypes.length; j < typeLen; j++) {
          if (type == allowedTypes[j]) {
            ok = true;
            break;
          }
        }

        if (!ok) {
          continue;
        }
      }
      
      if (block.src) {
        compileExtern(block.src);
      }
      else {
        runScriptBlock(block, options, cInfo);
      }
    }
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
  export function compileExtern(url: string, run?: bool, callback?: ExternCompileCallback, options?: CompileOptions, cInfo?: CompileInfo) {
    if (!callback) {
      callback = function () {}
    }

    if (typeof run == "undefined") {
      run = true;
    }

    if (typeof cInfo == "undefined" || cInfo === null) {
      cInfo = new CompileInfo();
    }

    var xhr = new XMLHttpRequest();

    xhr.open("GET", url);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {

        if (xhr.status == 200) {
          var js = compileStr(xhr.responseText, options, cInfo);
          if (run) {
            insertScriptBlock(js);
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
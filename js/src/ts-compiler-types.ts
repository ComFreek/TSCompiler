///<reference path="ts-compiler.ts" />
declare var TypeScript;

/**
  * Type/class declarations/definitions
  */
module TSCompiler.Types {

  /**
    * Stores a compiler error.
    */
  export interface CompileInfoError {
    start: number;
    len: number;
    msg: string;
    block: number;
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
    * Typedefs the error callback function's type.
    */
  export interface CompilerErrorCallback {
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
  export interface Unit {
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
    * Stores the output of TypeScript's emit callback.
    */
  export class EmitDataStore {
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
};
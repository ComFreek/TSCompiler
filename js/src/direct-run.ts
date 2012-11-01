///<reference path="ts-compiler.ts" />

// This file is meant to be included with ts-compiler.ts
// in a special file in the build process,
// so the user just has to include
// this file in his HTML document and all TS blocks are run!


/**
  * Contains functions for hashing strings and getting/setting cache.
  */
module TSCompiler.CacheSystem {
  
  // Taken from http://erlycoder.com/49/javascript-hash-functions-to-convert-string-into-integer-hash-
  // Reformatted some parts and added some var's!
  function hashCode(str: string) {
    var hash = 0;
    if (str.length == 0) {
      return hash;
    }
    for (var i = 0, len = str.length; i < len; i++) {
      var char = str.charCodeAt(i); 
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  /**
    * Caches something.
    * @param key The key to use (which will be hashed using hashCode()).
    * @param value The value to assign to the item
    * @param storage Pass either localStorage or sessionStorage (which is the default one).
    */
  export function setCache(key: string, value: string, storage = sessionStorage) {
    var key = hashCode(key);
    storage[key] = value;
  }

  /**
    * Returns a previous cached item.
    * @param key The key to use (which will be hashed using hashCode()).
    * @param storage Pass either localStorage or sessionStorage (which is the default one).
    * @return Returns either the cached data or FALSE if no value exists for the given key.
    */
  export function getCache(key: string, storage = sessionStorage) {
    var key = hashCode(key);
    if (typeof storage[key] == "undefined") {
      return false;
    }
    return storage[key];
  }
}

/**
  * Encapsulates the run system.
  */
module TSCompiler.DirectRunSystem {
  /**
    * Only script elements containing one of the mentioned types will be run.
    */
  var allowedTypes = [
    "text/typescript",
    "application/typescript"
  ];

  /**
    * Runs all script elements which have an allowed type.
    * @param useCache Specifies whether the function should cache compiled TypeScript sources.
    */
  export function run(useCache: bool = true) {
    TSCompiler.filterScriptBlocks(allowedTypes, function (block: HTMLScriptElement) {

      var tsCode = block.innerHTML;
      if (useCache) {
        var jsCode = CacheSystem.getCache(tsCode);

        if (jsCode !== false) {
          TSCompiler.insertScriptBlock(jsCode);
        }
        else {
          jsCode = TSCompiler.runStr(tsCode);
          CacheSystem.setCache(tsCode, jsCode);
        }
      }
      else {
        TSCompiler.runScriptBlock(block);
      }
    });
  }
}

// Run!
TSCompiler.DirectRunSystem.run();
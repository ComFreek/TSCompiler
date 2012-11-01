///<reference path="types.ts" />
declare var TypeScript;

/**
  * Some helper functions
  */
module TSCompiler.Helpers {
 
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
    * Filters script blocks by their type attribute.
    * @param types An array of strings specifying the allowed types.
    * @param callback A callback function which will be called each time a block is found.
    */
  export function filterScriptBlocks(types: string[], callback: (scriptBlock: HTMLScriptElement) => any) {
    var testType = true;
    var blocks = null;

    if (document.querySelectorAll) {
      testType = false;
      var query = "";
      for (var i = 0, len = types.length; i < len; i++) {
        query += "script[type=\"" + types[i] + "\"]";
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
        for (var j = 0, typeLen = types.length; j < typeLen; j++) {
          if (type == types[j]) {
            ok = true;
            break;
          }
        }

        if (!ok) {
          continue;
        }
      }
      
      callback(block);
    }
  }
};
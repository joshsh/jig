/**
 * Manages the Gremlin Terminal. Migrated from Webling (https://github.com/xedin/webling).
 *
 * Credit to Neo Technology (http://neotechnology.com/) for most of the code related to the
 * Gremlin Terminal in Rexster.  Specifically, this code was borrowed from
 * https://github.com/neo4j/webadmin and re-purposed for Rexster's needs.
 *
 * Refitted from webling - [https://github.com/xedin/webling]
 * Original header comments below.
 *
 * TryMongo
 * Original version from: Kyle Banker (http://www.kylebanker.com)
 * Rerewritten to fit gremlin needs by: Pavel A. Yaskevich
 * Date: September 1, 2009
 * (c) Creative Commons 2010
 * http://creativecommons.org/licenses/by-sa/2.5/
 */

// TODO: make variable non-global
var scriptEngine = new Jig.ScriptEngine({});

function make_base_auth(user, password) {
  var tok = user + ':' + password;
  var hash = btoa(tok);
  return "Basic " + hash;
}

function escapeLine(value, index) {
    return "&nbsp;&nbsp;[" + index + "]&nbsp;" + value
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            + "<br />";
}

// Readline class to handle line input.
var ReadLine = function(options, history) {
  this.options      = options || {};
  this.htmlForInput = this.options.htmlForInput;

  this.inputHandler = function(h, v, scope) {

    req = '';

    if(scope == true) {
      for(i = 0; i < h.scopeHistory.length; i++) {
          req += h.scopeHistory[i] + "\n";
      }
      req += "end\n";
    } else {
      req = v;
    }

    console.log("evaluating this query: " + req);

    var localResult = scriptEngine.eval(req);
    console.log("local result: " + localResult);

    var userName = document.getElementById("jig-user-name").value;
    var password = document.getElementById("jig-password").value;
    var endpoint = document.getElementById("jig-session-url").value + "/eval";

    //if (endpoint.length > 5) {
console.log("using configuration: " + userName + " -- " + password + " -- " + endpoint);

        $.ajax({
            data: localResult,
            type: "POST",
            url: endpoint,
            contentType: "text/javascript",
            beforeSend: function (xhr){
                xhr.setRequestHeader('Authorization', make_base_auth(userName, password));
            },
            success: function(value) {
                console.log("result from AG server: " + value);

                var obj = value.trim().startsWith("[") ? eval(value) : value;

                h.insertResponse("<br/>");

                if (obj instanceof Array) {
                    for (i in obj) {
                        var result = obj[i];
                        h.insertResponse(escapeLine(JSON.stringify(result), i));
                    }
                } else {
                    h.insertResponse(escapeLine(value, 0));
                }

                // Save to the command history...
                if ((lineValue = $.trim(v)) !== "") {
                    h.history.push(lineValue);
                    h.historyPtr = h.history.length;
                }

                h.scopeHistory = [];
                h.newPromptLine();
            },
            error: function(request, textStatus, errorThrown) {
                h.insertResponse("Error: (" + errorThrown + ", " + textStatus + ")");
                h.newPromptLine();
            }
        });
  };

  this.terminal     = $(this.options.terminalId || "#terminal");
  this.lineClass    = this.options.lineClass || '.readLine';
  this.history      = [];
  this.historyPtr   = 0;
  this.scopeHistory = [];
  this.initialize();
};

ReadLine.prototype = {
  initialize: function() {
    this.addInputLine();
  },

  newPromptLine: function() {
    this.activeLine.value = '';
    this.activeLine.attr({disabled: true});
    this.activeLine.next('.spinner').remove();
    this.activeLine.removeClass('active');
    this.addInputLine(this.depth);
  },

  // Enter a new input line with proper behavior.
  addInputLine: function(depth) {
    stackLevel = depth || 0;
    this.terminal.append(this.htmlForInput(stackLevel));
    var ctx = this;
    ctx.activeLine = $(this.lineClass + '.active');

    // Bind key events for entering and navigating history.
    ctx.activeLine.bind("keydown", function(ev) {
      switch (ev.keyCode) {
        case EnterKeyCode:
          ctx.processInput(this.value);
          break;
        case UpArrowKeyCode:
          ctx.getCommand('previous');
          ev.preventDefault();
          break;
        case DownArrowKeyCode:
          ctx.getCommand('next');
          ev.preventDefault();
          break;
      }
    });

    $(document).bind("keydown", function(ev) {
      //ctx.activeLine.focus();
    });

    this.activeLine.focus();
  },

  // Returns the 'next' or 'previous' command in this history.
  getCommand: function(direction) {
    if(this.history.length === 0) {
      return;
    }
    this.adjustHistoryPointer(direction);
    this.activeLine[0].value = this.history[this.historyPtr];

    var lenOfCommand = this.activeLine[0].value.length;
    $(this.activeLine[0]).selectRange(lenOfCommand, lenOfCommand);
  },

  // Moves the history pointer to the 'next' or 'previous' position.
  adjustHistoryPointer: function(direction) {
    if(direction == 'previous') {
      if(this.historyPtr - 1 >= 0) {
        this.historyPtr -= 1;
      }
    } else {
      if(this.historyPtr + 1 < this.history.length) {
        this.historyPtr += 1;
      }
    }
  },

  // Return the handler's response.
  processInput: function(value) {
    if($.trim(value) == '') {
      this.newPromptLine();
      return null;
    }

    /*
    if($.trim(value) == 'end') {
      this.depth--;
      if(this.depth == 0) {
        this.inputHandler(this, value, true);
        return false;
      }
    }
    */

    this.scopeHistory.push(value);

    this.inputHandler(this, value);
  },

  insertResponse: function(response) {
    if(response !== "") {
      this.activeLine.parent().append("<p class='response'>" + response + "</p>");
    }
  },

  // Simply return the entered string if the user hasn't specified a smarter handler.
  mockHandler: function(inputString) {
    return function() {
      this._process = function() { return inputString; };
    };
  }
};

$htmlFormat = function(obj) {
  return tojson(obj, ' ', ' ', true);
}

$.fn.selectRange = function(start, end) {
    return this.each(function() {
        if(this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(start, end);
        } else if(this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};

var DefaultInputHtml = function(stack) {
    var linePrompt = "";
    for(var i=0; i <= stack; i++) {
      linePrompt += "<span class='prompt'>jig&gt;</span>";
    }
    return "<div class='line'>" +
           linePrompt +
           "<input type='text' class='readLine active' />" +
           "<img class='spinner' src='images/spinner.gif' style='display:none;' /></div>";
}

var EnterKeyCode      = 13;
var UpArrowKeyCode    = 38;
var DownArrowKeyCode  = 40;




$(document).ready(function() {
    var terminal = new ReadLine({htmlForInput: DefaultInputHtml});
});

var STEPS = new Array(
        "_",
        "bothE",
        "common",
        "distinct",
        "E",
        "ends",
        "head",
        "id",
        "inE",
        "label",
        "limit",
        "nearby",
        "outE",
        "tail",
        "triples",
        "V");
var METHODS = new Array(
        "aggr",
        "count",
        "eval",
        "mean",
        "path",
        "sum");
var KEYWORDS = new Array(
        // methods
        "aggr",
        "count",
        "eval",
        "mean",
        "path",
        "sum",
        // steps
        "_",
        "bothE",
        "common",
        "distinct",
        "E",
        "ends",
        "head",
        "id",
        "inE",
        "label",
        "limit",
        "nearby",
        "outE",
        "tail",
        "triples",
        "V");

var Jig = {};

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.replaceAll = function(target, replacement) {
  return this.split(target).join(replacement);
};

String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
};

String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
};

Jig.ScriptEngine = function(settings) {

    // appends an ".eval()" for raw steps
    // e.g. "foo.head()" becomes "foo.head().eval()"
    // note: this is an expensive operation
    function cleanParens(r) {
        if (r.endsWith(")")) {
            var i = r.lastIndexOf("(");
            var s = r.substring(0, i);

            for (var step in STEPS) {
                if (s.endsWith("." + STEPS[step])) {
                    return r + ".eval()";
                }
            }
        }

        return r;
    }

    function cleanBrackets(r) {
        if (r.endsWith("]")) {
            var i = r.lastIndexOf("[");
            return cleanParens(r.substring(0, i)) + r.substring(i);
        } else {
            return r;
        }
    }

    function transform(script) {
        console.log("Jig.ScriptEngine.transform has been called");

        // Emulate method metaprogramming at a syntactic level (since the JavaScript-to-Lisp compiler doesn't support it)
        var r = script.trim();
        while (r.endsWith(";")) {
            r = r.substring(0, r.length() - 1).trim();
        }
        for (var k in KEYWORDS) {
            var keyword = KEYWORDS[k];

            r = r.replaceAll("." + keyword + ".", "." + keyword + "().");
            r = r.replaceAll("." + keyword + "[", "." + keyword + "()[");
            //r = r.replaceAll("[.]" + keyword + "\\s*;", "." + keyword + "();");

            //r = r.replaceAll("." + keyword + "$", "." + keyword + "()");
            if (r.endsWith("." + keyword)) {
                r = r + "()";
            }
        }
        r = cleanParens(r);
        r = cleanBrackets(r);
        for (var step in STEPS) {
            if (r.endsWith("." + STEPS[step])) {
                r = r + ".eval()";
                break;
            }
        }

        return r;
    }

    return {
        eval: function(script) {
            console.log("Jig.ScriptEngine.eval has been called");

            // FIXME
            var result = transform(script);

            return result;
        }
    };
}

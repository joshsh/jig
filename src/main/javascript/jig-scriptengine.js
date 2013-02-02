
Jig.ScriptEngine = function(settings) {

    var bar;

    String.prototype.trim = function () {
        return this.replace(/^\s*/, "").replace(/\s*$/, "");
    };

    function padNumber(n, digits) {

    }

    return {
        baz: function() {
            console.log("Jig.ScriptEngine.baz has been called");
        },
        quux: function() {
            console.log("Jig.ScriptEngine.quux has been called");
        }
    };
}
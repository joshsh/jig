
Jig.Console = function(settings) {

    var bar;

    String.prototype.trim = function () {
        return this.replace(/^\s*/, "").replace(/\s*$/, "");
    };

    function padNumber(n, digits) {

    }

    return {
        baz: function() {
        baz: function() {
            console.log("Jig.Console.baz has been called");
        },
        quux: function() {
            console.log("Jig.Console.quux has been called");
        }
    };
}
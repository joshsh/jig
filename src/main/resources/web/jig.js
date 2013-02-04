var foo = false;

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

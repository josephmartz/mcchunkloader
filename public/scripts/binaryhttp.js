(function() {
  var exports, require;

  if (typeof window !== "undefined" && window !== null) {
    exports = window.exports;
    require = window.require;
  }

  exports.loadBinary = function(url, progresscallback, donecallback) {
    var xmlhttp;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, true);
    if (xmlhttp.responseType != null) xmlhttp.responseType = "arraybuffer";
    xmlhttp.addEventListener('progress', progresscallback, false);
    xmlhttp.onload = function() {
      var buffer;
      buffer = xmlhttp.response;
      if (buffer != null) return donecallback(buffer);
    };
    return xmlhttp.send();
  };

  exports.binaryFromFile = function(file, progresscallback, donecallback) {
    var reader;
    reader = new FileReader();
    reader.onload = function(ev) {
      return donecallback(ev.target.result);
    };
    return reader.readAsArrayBuffer(file);
  };

}).call(this);

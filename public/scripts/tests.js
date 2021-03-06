(function() {
  var binaryhttp, chunkdata, data, delay, done, exports, nbt, onProgress, options, region, render, require, whichChunks;

  if (typeof window !== "undefined" && window !== null) {
    exports = window.exports;
    require = window.require;
  }

  data = void 0;

  binaryhttp = require('binaryhttp');

  region = require('region');

  chunkdata = require('chunkdata');

  render = require('render');

  nbt = require('nbt');

  whichChunks = function(region) {
    var chunks, count;
    count = 0;
    return chunks = {};
  };

  onProgress = function(evt) {
    return $('#proginner').width($('#progouter').width() * (evt.position / evt.total));
  };

  delay = function(ms, func) {
    return setTimeout(func, ms);
  };

  options = {};

  done = function(arraybuffer) {
    return delay(150, function() {
      var renderer, seconds, start, testregion, total;
      start = new Date().getTime();
      data = arraybuffer;
      testregion = new region.Region(data);
      renderer = new render.RegionRenderer(testregion, options);
      total = new Date().getTime() - start;
      seconds = total / 1000.0;
      return console.log("loaded in " + seconds + " seconds");
    });
  };

  window.fileselected = function() {
    binaryhttp.binaryFromFile(document.getElementById('mcafile').files[0], onProgress, done);
    return $('#mcafile').hide();
  };

  exports.runTests = function() {
    var param, params, paramstr, pos, tokens, _i, _len, _ref;
    pos = window.location.href.indexOf('?');
    paramstr = window.location.href.substr(pos + 1);
    params = paramstr.split('&');
    options = {};
    for (_i = 0, _len = params.length; _i < _len; _i++) {
      param = params[_i];
      tokens = param.split('=');
      options[tokens[0]] = tokens[1];
    }
    console.log(options);
    if (((_ref = options.url) != null ? _ref.length : void 0) > 0) {
      return binaryhttp.loadBinary(options.url, onProgress, done);
    } else {
      return $('#mcafile').show();
    }
  };

}).call(this);

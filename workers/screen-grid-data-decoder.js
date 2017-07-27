'use strict';

importScripts('./util.js');
var total = 0;

onmessage = function onmessage(e) {
  var lines = e.data.text.split('\n');
  var result = [];

  lines.forEach(function (line) {
    if (!line) {
      return;
    }
    var count = decodeNumber(line.slice(0, 2), 90, 32);
    var coords = decodePolyline(line.slice(2));
    for (var i = 0; i < coords.length; i++) {
      var c = coords[i];
      for (var j = 0; j < count; j++) {
        result.push(c);
        total++;
      }
    }
  });
  postMessage({
    action: 'add',
    data: result,
    meta: { count: total }
  });
};
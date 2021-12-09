"use strict";

importScripts('./util.js');
var result = [];

onmessage = function onmessage(e) {
  var lines = e.data.text.split('\n');
  lines.forEach(function (line) {
    if (!line) {
      return;
    }

    var parts = line.split('\x01');

    if (parts.length < 2) {
      return;
    }

    var label = parts[0];
    var coordinates = decodePolyline(parts[1]);
    coordinates.forEach(function (p) {
      result.push({
        label: label,
        coordinates: p
      });
    });
  });

  if (e.data.event === 'load') {
    flush();
    postMessage({
      action: 'end'
    });
  }
};

function flush() {
  postMessage({
    action: 'add',
    data: result,
    meta: {
      count: result.length
    }
  });
  result = [];
}
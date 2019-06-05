"use strict";

importScripts('./util.js');
var FLUSH_LIMIT = 200000;
var coordinates;
var result = [];
var locCount = 0;
var movieCount = 0;

onmessage = function onmessage(e) {
  var lines = e.data.text.split('\n');
  lines.forEach(function (line) {
    if (!line) {
      return;
    }

    if (!coordinates) {
      coordinates = decodePolyline(line, 5);
      return;
    }

    var parts = line.split('\t');

    if (parts.length < 3) {
      return;
    }

    var name = parts[0] + ' (' + parts[1] + ')';
    movieCount++;
    parts.slice(2).forEach(function (str) {
      var tokens = str.split('\x01');
      var coordIndex = decodeNumber(tokens[1], 90, 32);
      var coord = coordinates[coordIndex];
      result.push({
        name: name,
        scene: tokens[0],
        coordinates: coord
      });
      locCount++;
    });

    if (result.length >= FLUSH_LIMIT) {
      flush();
    }
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
      movies: movieCount,
      locations: locCount
    }
  });
  result = [];
}
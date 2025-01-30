// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use strict';

importScripts('./util.js');
var FLUSH_LIMIT = 20000;
var result = [];
var count = 0;
var triangleCount = 0;

onmessage = function (e) {
  var lines = e.data.text.split('\n');

  lines.forEach(function (line) {
    if (!line) {
      return;
    }
    var parts = line.split('\x01');
    var height = decodeNumber(parts[0], 90, 32);

    // footprints
    parts.slice(1).forEach(function (str) {
      var coords = decodePolyline(str);
      triangleCount += coords.length * 3 - 2;
      coords.push(coords[0]);
      result.push({
        height: height,
        polygon: coords
      });
    });

    count++;

    if (result.length >= FLUSH_LIMIT) {
      flush();
    }
  });

  if (e.data.event === 'load') {
    flush();
    postMessage({ action: 'end' });
  }
};

function flush() {
  postMessage({
    action: 'add',
    data: result,
    meta: { buildings: count, triangles: triangleCount, progressAlt: count / 3895 * 0.2 }
  });
  result = [];
}
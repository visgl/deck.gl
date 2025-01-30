// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use strict';

importScripts('./util.js');
var coordinates = undefined;
var result = [];

onmessage = function (e) {
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
    if (parts.length < 5) {
      return;
    }

    result.push({
      name: parts[0],
      'class': parts[1],
      coordinates: coordinates[decodeNumber(parts[2], 90, 32)],
      mass: decodeNumber(parts[3], 90, 32),
      year: decodeNumber(parts[4], 90, 32)
    });
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
    meta: { count: result.length }
  });
  result = [];
}
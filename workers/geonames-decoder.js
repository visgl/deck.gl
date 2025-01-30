// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use strict';

importScripts('./util.js');
var result = [];

onmessage = function (e) {
  var lines = e.data.text.split('\n');

  lines.forEach(function (line) {
    if (!line) {
      return;
    }

    var parts = line.split('\x01');
    if (parts.length < 4) {
      return;
    }

    var name = parts[0];
    var longitude = decodeNumber(parts[1], 90, 32) / 1e4 - 180;
    var latitude = decodeNumber(parts[2], 90, 32) / 1e4;
    var population = decodeNumber(parts[3], 90, 32);

    result.push({ name: name, longitude: longitude, latitude: latitude, population: population });
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
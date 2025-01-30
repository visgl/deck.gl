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

    var parts = line.split('\t');
    if (parts.length < 5) {
      return;
    }
    var type = parts[0][0] + 'M';
    var frequency = decodeNumber(parts[0].slice(1, 3), 90, 32);
    if (type === 'FM') frequency /= 10;

    result.push({
      type: type,
      frequency: frequency,
      callSign: parts[0].slice(3),
      name: parts[4],
      state: parts[3].slice(0, 2),
      city: parts[3].slice(2),
      longitude: decodeNumber(parts[1], 90, 32) / 1e5 - 180,
      latitude: decodeNumber(parts[2], 90, 32) / 1e5 - 90
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
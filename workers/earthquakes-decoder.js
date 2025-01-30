// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use strict';

importScripts('./util.js');

var result = [];
var count = 0;
var blob = '';
var timestamp = 0;

var pattern = /^(.)(.+)\x01(.{4})(.{4})(.+)$/;

onmessage = function (e) {
  var lines = (blob + e.data.text).split('\n');
  blob = lines.pop();

  // time,latitude,longitude,depth,mag
  lines.forEach(function (line) {
    if (!line) {
      return;
    }
    var parts = line.match(pattern);
    parts.shift();
    parts = parts.map(function (x) {
      return decodeNumber(x, 90, 32);
    });

    timestamp += parts[1];

    result.push({
      timestamp: timestamp,
      latitude: (parts[2] - 9e5) / 1e4,
      longitude: (parts[3] - 1.8e6) / 1e4,
      depth: (parts[4] - 300) / 100,
      magnitude: (parts[0] + 30) / 10
    });
    count++;
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
    meta: { count: count }
  });
  result = [];
}
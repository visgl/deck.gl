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
    var hex = parts[0];
    for (var i = 1; i < parts.length; i += 3) {
      var lng = decodeNumber(parts[i], 90, 32) / 1e5 - 180;
      var lat = decodeNumber(parts[i + 1], 90, 32) / 1e5;
      var count = decodeNumber(parts[i + 2], 90, 32);
      result.push({ hex: hex, home_lng: lng, home_lat: lat, count: count });
    }
  });

  if (e.data.event === 'load') {
    postMessage({
      action: 'add',
      data: result,
      meta: {
        count: result.length
      }
    });
    postMessage({ action: 'end' });
  }
};
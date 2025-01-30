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
    var d = {
      name: parts[0],
      longitude: decodeNumber(parts[1], 90, 32) / 1e5 - 180,
      latitude: decodeNumber(parts[2], 90, 32) / 1e5
    };
    for (var i = parts.length - 1, year = 2016; i >= 3; i -= 3, year -= 4) {
      var dem = decodeNumber(parts[i - 2], 90, 32);
      var rep = decodeNumber(parts[i - 1], 90, 32);
      var others = decodeNumber(parts[i], 90, 32);
      d[year] = { dem: dem, rep: rep, total: dem + rep + others };
    }

    result.push(d);
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
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use strict';

importScripts('./util.js');
var total = 0;
var result = [];

onmessage = function (e) {
  var lines = e.data.text.split('\n');

  lines.forEach(function (line) {
    if (!line) {
      return;
    }
    var count = decodeNumber(line.slice(0, 2), 90, 32);
    var coords = decodePolyline(line.slice(2));
    for (var i = 0; i < coords.length; i++) {
      var c = coords[i];
      c[2] = count;
      result.push(c);
      total++;
    }
  });

  if (e.data.event === 'load') {
    postMessage({
      action: 'add',
      data: result,
      meta: { count: total, progress: 1 }
    });
    postMessage({ action: 'end' });
  }
};
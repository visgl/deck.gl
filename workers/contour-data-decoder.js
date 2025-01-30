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
      longitude: decodeNumber(parts[0], 90, 32) / 1e5 - 180,
      latitude: decodeNumber(parts[1], 90, 32) / 1e5,
      population: decodeNumber(parts[2], 90, 32),
      casesByWeek: {}
    };
    var firstWeek = decodeNumber(parts[3], 90, 32);
    for (var i = 4, week = firstWeek; i < parts.length; i++, week++) {
      d.casesByWeek[week] = decodeNumber(parts[i], 90, 32);
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
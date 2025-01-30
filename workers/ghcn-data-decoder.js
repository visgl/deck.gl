// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use strict';

importScripts('./util.js');
var result = [];
var countries = {};
var vertices = 0;

onmessage = function (e) {
  var lines = e.data.text.split('\n');

  lines.forEach(function (line) {
    if (!line) {
      return;
    }

    if (line[2] === ' ') {
      countries[line.slice(0, 2)] = line.slice(3);
      return;
    }

    var parts = line.split('\t');
    var startYear = decodeNumber(parts[3], 90, 32);
    var meanTemp = [];
    for (var i = 4; i < parts.length; i++) {
      if (parts[i]) {
        var year = startYear + i - 4;
        var value = usePrecision(40 - decodeNumber(parts[i], 90, 32) / 100, 2);
        meanTemp.push([year, value]);
        vertices++;
      }
    }

    result.push({
      id: parts[0].slice(0, 11),
      country: countries[parts[0].slice(0, 2)],
      name: parts[0].slice(11),
      latitude: usePrecision(decodeNumber(parts[1], 90, 32) / 1e4 - 90, 4),
      altitude: usePrecision(decodeNumber(parts[2], 90, 32) / 10 - 500, 1),
      meanTemp: meanTemp
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
    meta: { stations: result.length, vertices: vertices }
  });
  result = [];
}

function usePrecision(x, precision) {
  var m = Math.pow(10, precision);
  return Math.round(x * m) / m;
}
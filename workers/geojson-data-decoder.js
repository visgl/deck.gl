// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use strict';

importScripts('./util.js');
var result = [];
var count = 0;
var vertexCount = 0;

onmessage = function (e) {
  var lines = e.data.text.split('\n');

  lines.forEach(function (line) {
    if (!line) {
      return;
    }

    var parts = line.split('\x01');
    var valuePerParcel = decodeNumber(parts[0], 90, 32);
    var valuePerSqm = decodeNumber(parts[1], 90, 32);
    var growth = decodeNumber(parts[2], 90, 32) / 20 - 1;

    parts.slice(3).forEach(function (str) {
      var coordinates = decodePolyline(str, 6);
      coordinates.push(coordinates[0]);

      result.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates]
        },
        properties: {
          valuePerParcel: valuePerParcel,
          valuePerSqm: valuePerSqm,
          growth: growth
        }
      });
      count++;
      vertexCount += (coordinates.length - 1) * 2;
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
    meta: { count: count, vertexCount: vertexCount }
  });
  result = [];
}
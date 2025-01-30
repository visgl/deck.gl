// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use strict';

importScripts('./util.js');
var result = [];
var count = 0;
var vertexCount = 0;

var ID_PATTERN = /(\w\w)(I|US|SR)(.*)/;

onmessage = function (e) {
  var lines = e.data.text.split('\n');

  lines.forEach(function (line) {
    if (!line) {
      return;
    }

    var parts = line.split('\x01');

    var match = parts[0].match(ID_PATTERN);
    var state = match[1];
    var type = match[2];
    var id = match[3];
    var name = parts[1];
    var length = decodeNumber(parts[2], 90, 32) / 1000;

    var coordinates = [];

    parts.slice(3).forEach(function (str) {
      var lineString = decodePolyline(str, 5);
      coordinates.push(lineString);
      count++;
      vertexCount += lineString.length;
    });

    result.push({
      type: 'Feature',
      geometry: {
        type: coordinates.length === 1 ? 'LineString' : 'MultiLineString',
        coordinates: coordinates.length === 1 ? coordinates[0] : coordinates
      },
      properties: { state: state, type: type, id: id, name: name, length: length }
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
// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use strict';

importScripts('./util.js');
var result = [];

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

    parts.slice(1).forEach(function (str) {
      var items = str.split('\t').map(function (x) {
        return decodeNumber(x, 90, 32);
      });

      result.push({
        state: state,
        type: type,
        id: id,
        year: 1990 + items[0] * 5,
        incidents: items[1],
        fatalities: items[1] + (items[2] || 0)
      });
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
    data: result
  });
  result = [];
}
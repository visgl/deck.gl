// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use strict';

importScripts('./util.js');

var flights = [];
onmessage = function (e) {
  var lines = e.data.text.split('\n');

  var time = 0;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = lines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var line = _step.value;

      if (!line) {
        continue;
      }

      var i = 0;
      time += decodeNumber(line.slice(i, i += 1), 90, 32);
      var time2 = decodeNumber(line.slice(i, i += 3), 90, 32);
      var lon1 = decodeNumber(line.slice(i, i += 3), 90, 32) / 1e3 - 180;
      var lat1 = decodeNumber(line.slice(i, i += 3), 90, 32) / 1e3 - 90;
      var lon2 = decodeNumber(line.slice(i, i += 3), 90, 32) / 1e3 - 180;
      var lat2 = decodeNumber(line.slice(i, i += 3), 90, 32) / 1e3 - 90;

      flights.push({
        time1: time,
        time2: time2,
        lon1: lon1,
        lat1: lat1,
        lon2: lon2,
        lat2: lat2
      });
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  if (e.data.event === 'load') {
    postMessage({
      action: 'add',
      data: flights,
      meta: { count: flights.length }
    });
    postMessage({ action: 'end' });
  }
};
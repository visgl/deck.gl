// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

'use strict';

importScripts('./util.js');
var count = 0;
var dayIndex = 0;

onmessage = function (e) {
  var lines = e.data.text.split('\n');
  var SEC_PER_DAY = 60 * 60 * 24;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = lines[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var line = _step.value;

      if (!line) {
        continue;
      }

      var timeOffset = dayIndex * SEC_PER_DAY;
      var date = line.slice(0, 10);
      var flights = [];
      var i = 10;
      var time = 0;
      while (i < line.length) {
        time += decodeNumber(line.slice(i, i += 1), 90, 32);
        var time2 = decodeNumber(line.slice(i, i += 3), 90, 32);
        var lon1 = decodeNumber(line.slice(i, i += 3), 90, 32) / 1e3 - 180;
        var lat1 = decodeNumber(line.slice(i, i += 3), 90, 32) / 1e3 - 90;
        var alt1 = decodeNumber(line.slice(i, i += 1), 90, 32) * 100;
        var lon2 = decodeNumber(line.slice(i, i += 3), 90, 32) / 1e3 - 180;
        var lat2 = decodeNumber(line.slice(i, i += 3), 90, 32) / 1e3 - 90;
        var alt2 = decodeNumber(line.slice(i, i += 1), 90, 32) * 100;

        flights.push({
          time1: time + timeOffset,
          time2: time2 + timeOffset,
          lon1: lon1,
          lat1: lat1,
          alt1: alt1,
          lon2: lon2,
          lat2: lat2,
          alt2: alt2
        });
      }

      count += flights.length;
      dayIndex++;
      postMessage({
        action: 'add',
        data: [{ date: date, flights: flights }],
        meta: { count: count }
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
    postMessage({ action: 'end' });
  }
};
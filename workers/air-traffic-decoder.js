"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

importScripts('./util.js');
var count = 0;

onmessage = function onmessage(e) {
  var lines = e.data.text.split('\n');

  var _iterator = _createForOfIteratorHelper(lines),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var line = _step.value;

      if (!line) {
        continue;
      }

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
          time1: time,
          time2: time2,
          lon1: lon1,
          lat1: lat1,
          alt1: alt1,
          lon2: lon2,
          lat2: lat2,
          alt2: alt2
        });
      }

      count += flights.length;
      postMessage({
        action: 'add',
        data: [{
          date: date,
          flights: flights
        }],
        meta: {
          count: count
        }
      });
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  if (e.data.event === 'load') {
    postMessage({
      action: 'end'
    });
  }
};
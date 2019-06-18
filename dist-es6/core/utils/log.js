var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint-disable no-console */
/* global console */
import assert from 'assert';

var cache = {};

function log(priority, arg) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  assert(Number.isFinite(priority), 'log priority must be a number');
  if (priority <= log.priority) {
    // Node doesn't have console.debug, but using it looks better in browser consoles
    args = formatArgs.apply(undefined, [arg].concat(_toConsumableArray(args)));
    if (console.debug) {
      var _console;

      (_console = console).debug.apply(_console, _toConsumableArray(args));
    } else {
      var _console2;

      (_console2 = console).info.apply(_console2, _toConsumableArray(args));
    }
  }
}

function once(priority, arg) {
  for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
    args[_key2 - 2] = arguments[_key2];
  }

  if (!cache[arg] && priority <= log.priority) {
    var _console3;

    args = checkForAssertionErrors(args);
    (_console3 = console).error.apply(_console3, _toConsumableArray(formatArgs.apply(undefined, [arg].concat(_toConsumableArray(args)))));
    cache[arg] = true;
  }
}

function warn(arg) {
  if (!cache[arg]) {
    var _console4;

    for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }

    (_console4 = console).warn.apply(_console4, ['deck.gl: ' + arg].concat(args));
    cache[arg] = true;
  }
}

function error(arg) {
  var _console5;

  for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    args[_key4 - 1] = arguments[_key4];
  }

  (_console5 = console).error.apply(_console5, ['deck.gl: ' + arg].concat(args));
}

function deprecated(oldUsage, newUsage) {
  log.warn('deck.gl: `' + oldUsage + '` is deprecated and will be removed in a later version. Use `' + newUsage + '` instead');
}

// Logs a message with a time
function time(priority, label) {
  assert(Number.isFinite(priority), 'log priority must be a number');
  if (priority <= log.priority) {
    // In case the platform doesn't have console.time
    if (console.time) {
      console.time(label);
    } else {
      console.info(label);
    }
  }
}

function timeEnd(priority, label) {
  assert(Number.isFinite(priority), 'log priority must be a number');
  if (priority <= log.priority) {
    // In case the platform doesn't have console.timeEnd
    if (console.timeEnd) {
      console.timeEnd(label);
    } else {
      console.info(label);
    }
  }
}

function group(priority, arg) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$collapsed = _ref.collapsed,
      collapsed = _ref$collapsed === undefined ? false : _ref$collapsed;

  if (priority <= log.priority) {
    if (collapsed) {
      console.groupCollapsed('luma.gl: ' + arg);
    } else {
      console.group('luma.gl: ' + arg);
    }
  }
}

function groupEnd(priority, arg) {
  if (priority <= log.priority) {
    console.groupEnd('luma.gl: ' + arg);
  }
}

// Helper functions

function formatArgs(firstArg) {
  if (typeof firstArg === 'function') {
    firstArg = firstArg();
  }

  for (var _len5 = arguments.length, args = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
    args[_key5 - 1] = arguments[_key5];
  }

  if (typeof firstArg === 'string') {
    args.unshift('deck.gl ' + firstArg);
  } else {
    args.unshift(firstArg);
    args.unshift('deck.gl');
  }
  return args;
}

// Assertions don't generate standard exceptions and don't print nicely
function checkForAssertionErrors(args) {
  var isAssertion = args && args.length > 0 && _typeof(args[0]) === 'object' && args[0] !== null && args[0].name === 'AssertionError';

  if (isAssertion) {
    args = Array.prototype.slice.call(args);
    args.unshift('assert(' + args[0].message + ')');
  }
  return args;
}

log.priority = 0;
log.log = log;
log.once = once;
log.time = time;
log.timeEnd = timeEnd;
log.warn = warn;
log.error = error;
log.deprecated = deprecated;
log.group = group;
log.groupEnd = groupEnd;

export default log;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3V0aWxzL2xvZy5qcyJdLCJuYW1lcyI6WyJhc3NlcnQiLCJjYWNoZSIsImxvZyIsInByaW9yaXR5IiwiYXJnIiwiYXJncyIsIk51bWJlciIsImlzRmluaXRlIiwiZm9ybWF0QXJncyIsImNvbnNvbGUiLCJkZWJ1ZyIsImluZm8iLCJvbmNlIiwiY2hlY2tGb3JBc3NlcnRpb25FcnJvcnMiLCJlcnJvciIsIndhcm4iLCJkZXByZWNhdGVkIiwib2xkVXNhZ2UiLCJuZXdVc2FnZSIsInRpbWUiLCJsYWJlbCIsInRpbWVFbmQiLCJncm91cCIsImNvbGxhcHNlZCIsImdyb3VwQ29sbGFwc2VkIiwiZ3JvdXBFbmQiLCJmaXJzdEFyZyIsInVuc2hpZnQiLCJpc0Fzc2VydGlvbiIsImxlbmd0aCIsIm5hbWUiLCJBcnJheSIsInByb3RvdHlwZSIsInNsaWNlIiwiY2FsbCIsIm1lc3NhZ2UiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsT0FBT0EsTUFBUCxNQUFtQixRQUFuQjs7QUFFQSxJQUFNQyxRQUFRLEVBQWQ7O0FBRUEsU0FBU0MsR0FBVCxDQUFhQyxRQUFiLEVBQXVCQyxHQUF2QixFQUFxQztBQUFBLG9DQUFOQyxJQUFNO0FBQU5BLFFBQU07QUFBQTs7QUFDbkNMLFNBQU9NLE9BQU9DLFFBQVAsQ0FBZ0JKLFFBQWhCLENBQVAsRUFBa0MsK0JBQWxDO0FBQ0EsTUFBSUEsWUFBWUQsSUFBSUMsUUFBcEIsRUFBOEI7QUFDNUI7QUFDQUUsV0FBT0csNkJBQVdKLEdBQVgsNEJBQW1CQyxJQUFuQixHQUFQO0FBQ0EsUUFBSUksUUFBUUMsS0FBWixFQUFtQjtBQUFBOztBQUNqQiwyQkFBUUEsS0FBUixvQ0FBaUJMLElBQWpCO0FBQ0QsS0FGRCxNQUVPO0FB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Ii8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4vKiBnbG9iYWwgY29uc29sZSAqL1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBjYWNoZSA9IHt9O1xuXG5mdW5jdGlvbiBsb2cocHJpb3JpdHksIGFyZywgLi4uYXJncykge1xuICBhc3NlcnQoTnVtYmVyLmlzRmluaXRlKHByaW9yaXR5KSwgJ2xvZyBwcmlvcml0eSBtdXN0IGJlIGEgbnVtYmVyJyk7XG4gIGlmIChwcmlvcml0eSA8PSBsb2cucHJpb3JpdHkpIHtcbiAgICAvLyBOb2RlIGRvZXNuJ3QgaGF2ZSBjb25zb2xlLmRlYnVnLCBidXQgdXNpbmcgaXQgbG9va3MgYmV0dGVyIGluIGJyb3dzZXIgY29uc29sZXNcbiAgICBhcmdzID0gZm9ybWF0QXJncyhhcmcsIC4uLmFyZ3MpO1xuICAgIGlmIChjb25zb2xlLmRlYnVnKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKC4uLmFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmluZm8oLi4uYXJncyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG9uY2UocHJpb3JpdHksIGFyZywgLi4uYXJncykge1xuICBpZiAoIWNhY2hlW2FyZ10gJiYgcHJpb3JpdHkgPD0gbG9nLnByaW9yaXR5KSB7XG4gICAgYXJncyA9IGNoZWNrRm9yQXNzZXJ0aW9uRXJyb3JzKGFyZ3MpO1xuICAgIGNvbnNvbGUuZXJyb3IoLi4uZm9ybWF0QXJncyhhcmcsIC4uLmFyZ3MpKTtcbiAgICBjYWNoZVthcmddID0gdHJ1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiB3YXJuKGFyZywgLi4uYXJncykge1xuICBpZiAoIWNhY2hlW2FyZ10pIHtcbiAgICBjb25zb2xlLndhcm4oYGRlY2suZ2w6ICR7YXJnfWAsIC4uLmFyZ3MpO1xuICAgIGNhY2hlW2FyZ10gPSB0cnVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVycm9yKGFyZywgLi4uYXJncykge1xuICBjb25zb2xlLmVycm9yKGBkZWNrLmdsOiAke2FyZ31gLCAuLi5hcmdzKTtcbn1cblxuZnVuY3Rpb24gZGVwcmVjYXRlZChvbGRVc2FnZSwgbmV3VXNhZ2UpIHtcbiAgbG9nLndhcm4oYGRlY2suZ2w6IFxcYCR7b2xkVXNhZ2V9XFxgIGlzIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBcXFxuaW4gYSBsYXRlciB2ZXJzaW9uLiBVc2UgXFxgJHtuZXdVc2FnZX1cXGAgaW5zdGVhZGApO1xufVxuXG4vLyBMb2dzIGEgbWVzc2FnZSB3aXRoIGEgdGltZVxuZnVuY3Rpb24gdGltZShwcmlvcml0eSwgbGFiZWwpIHtcbiAgYXNzZXJ0KE51bWJlci5pc0Zpbml0ZShwcmlvcml0eSksICdsb2cgcHJpb3JpdHkgbXVzdCBiZSBhIG51bWJlcicpO1xuICBpZiAocHJpb3JpdHkgPD0gbG9nLnByaW9yaXR5KSB7XG4gICAgLy8gSW4gY2FzZSB0aGUgcGxhdGZvcm0gZG9lc24ndCBoYXZlIGNvbnNvbGUudGltZVxuICAgIGlmIChjb25zb2xlLnRpbWUpIHtcbiAgICAgIGNvbnNvbGUudGltZShsYWJlbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuaW5mbyhsYWJlbCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHRpbWVFbmQocHJpb3JpdHksIGxhYmVsKSB7XG4gIGFzc2VydChOdW1iZXIuaXNGaW5pdGUocHJpb3JpdHkpLCAnbG9nIHByaW9yaXR5IG11c3QgYmUgYSBudW1iZXInKTtcbiAgaWYgKHByaW9yaXR5IDw9IGxvZy5wcmlvcml0eSkge1xuICAgIC8vIEluIGNhc2UgdGhlIHBsYXRmb3JtIGRvZXNuJ3QgaGF2ZSBjb25zb2xlLnRpbWVFbmRcbiAgICBpZiAoY29uc29sZS50aW1lRW5kKSB7XG4gICAgICBjb25zb2xlLnRpbWVFbmQobGFiZWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmluZm8obGFiZWwpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBncm91cChwcmlvcml0eSwgYXJnLCB7Y29sbGFwc2VkID0gZmFsc2V9ID0ge30pIHtcbiAgaWYgKHByaW9yaXR5IDw9IGxvZy5wcmlvcml0eSkge1xuICAgIGlmIChjb2xsYXBzZWQpIHtcbiAgICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoYGx1bWEuZ2w6ICR7YXJnfWApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmdyb3VwKGBsdW1hLmdsOiAke2FyZ31gKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ3JvdXBFbmQocHJpb3JpdHksIGFyZykge1xuICBpZiAocHJpb3JpdHkgPD0gbG9nLnByaW9yaXR5KSB7XG4gICAgY29uc29sZS5ncm91cEVuZChgbHVtYS5nbDogJHthcmd9YCk7XG4gIH1cbn1cblxuLy8gSGVscGVyIGZ1bmN0aW9uc1xuXG5mdW5jdGlvbiBmb3JtYXRBcmdzKGZpcnN0QXJnLCAuLi5hcmdzKSB7XG4gIGlmICh0eXBlb2YgZmlyc3RBcmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmaXJzdEFyZyA9IGZpcnN0QXJnKCk7XG4gIH1cbiAgaWYgKHR5cGVvZiBmaXJzdEFyZyA9PT0gJ3N0cmluZycpIHtcbiAgICBhcmdzLnVuc2hpZnQoYGRlY2suZ2wgJHtmaXJzdEFyZ31gKTtcbiAgfSBlbHNlIHtcbiAgICBhcmdzLnVuc2hpZnQoZmlyc3RBcmcpO1xuICAgIGFyZ3MudW5zaGlmdCgnZGVjay5nbCcpO1xuICB9XG4gIHJldHVybiBhcmdzO1xufVxuXG4vLyBBc3NlcnRpb25zIGRvbid0IGdlbmVyYXRlIHN0YW5kYXJkIGV4Y2VwdGlvbnMgYW5kIGRvbid0IHByaW50IG5pY2VseVxuZnVuY3Rpb24gY2hlY2tGb3JBc3NlcnRpb25FcnJvcnMoYXJncykge1xuICBjb25zdCBpc0Fzc2VydGlvbiA9XG4gICAgYXJncyAmJiBhcmdzLmxlbmd0aCA+IDAgJiZcbiAgICB0eXBlb2YgYXJnc1swXSA9PT0gJ29iamVjdCcgJiYgYXJnc1swXSAhPT0gbnVsbCAmJlxuICAgIGFyZ3NbMF0ubmFtZSA9PT0gJ0Fzc2VydGlvbkVycm9yJztcblxuICBpZiAoaXNBc3NlcnRpb24pIHtcbiAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncyk7XG4gICAgYXJncy51bnNoaWZ0KGBhc3NlcnQoJHthcmdzWzBdLm1lc3NhZ2V9KWApO1xuICB9XG4gIHJldHVybiBhcmdzO1xufVxuXG5sb2cucHJpb3JpdHkgPSAwO1xubG9nLmxvZyA9IGxvZztcbmxvZy5vbmNlID0gb25jZTtcbmxvZy50aW1lID0gdGltZTtcbmxvZy50aW1lRW5kID0gdGltZUVuZDtcbmxvZy53YXJuID0gd2FybjtcbmxvZy5lcnJvciA9IGVycm9yO1xubG9nLmRlcHJlY2F0ZWQgPSBkZXByZWNhdGVkO1xubG9nLmdyb3VwID0gZ3JvdXA7XG5sb2cuZ3JvdXBFbmQgPSBncm91cEVuZDtcblxuZXhwb3J0IGRlZmF1bHQgbG9nO1xuIl19
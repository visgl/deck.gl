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

const cache = {};

function formatArgs(firstArg, ...args) {
  if (typeof firstArg === 'string') {
    args.unshift(`deck.gl ${firstArg}`);
  } else {
    args.unshift(firstArg);
    args.unshift('deck.gl');
  }
  return args;
}

function log(priority, arg, ...args) {
  assert(Number.isFinite(priority), 'log priority must be a number');
  if (priority <= log.priority) {
    // Node doesn't have console.debug, but using it looks better in browser consoles
    args = formatArgs(arg, ...args);
    if (console.debug) {
      console.debug(...args);
    } else {
      console.info(...args);
    }
  }
}

function once(priority, arg, ...args) {
  if (!cache[arg] && priority <= log.priority) {
    console.warn(...formatArgs(arg, ...args));
    cache[arg] = true;
  }
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

log.priority = 0;
log.log = log;
log.once = once;
log.time = time;
log.timeEnd = timeEnd;

export default log;

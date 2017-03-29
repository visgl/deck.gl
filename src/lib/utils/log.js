/* eslint-disable no-console */
/* global console */
import assert from 'assert';

function log(priority, ...args) {
  assert(Number.isFinite(priority), 'log priority must be a number');
  if (priority <= log.priority) {
    // Node doesn't have console.debug, but using it looks better in browser consoles
    if (console.debug) {
      console.debug(...args);
    } else {
      console.info(...args);
    }
  }
}

const cache = {};

function once(priority, arg, ...args) {
  if (!cache[arg] && priority <= log.priority) {
    console.warn(...[arg, ...args]);
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

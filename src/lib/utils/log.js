/* eslint-disable no-console */
/* global console */
import assert from 'assert';

export default function log(priority, ...args) {
  assert(Number.isFinite(priority), 'log priority must be a number');
  if (priority <= log.priority) {
    // Node doesn't have console.debug, but looks better in browser consoles
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

log.priority = 0;
log.log = log;
log.once = once;

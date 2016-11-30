/* eslint-disable no-console */
/* global console, window */
import assert from 'assert';

export default function log(priority, ...args) {
  assert(Number.isFinite(priority), 'log priority must be a number');
  if (priority <= log.priority) {
    console.debug(...args);
  }
}

const cache = {};

function once(priority, arg, ...args) {
  if (!cache[arg]) {
    log(priority, arg, ...args);
  }
  cache[arg] = true;
}

log.priority = 0;
log.log = log;
log.once = once;

// Expose to browser
if (typeof window !== 'undefined') {
  window.deck = window.deck || {log};
}

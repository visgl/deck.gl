/* eslint-disable no-console */
/* global console, window */
import assert from 'assert';

export default function log(priority, ...args) {
  assert(typeof priority === 'number');
  if (priority <= log.priority) {
    console.debug(...args);
  }
}

log.priority = 0;

// Expose to browser
if (typeof window !== 'undefined') {
  window.log = log;
}

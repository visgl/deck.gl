require('babel-polyfill');
const _ = require('lodash');
const process = require('process');

const benchmark = require('benchmark');
const Benchmark = benchmark.runInContext({_, process});
/* global window */
window.Benchmark = Benchmark;

/* eslint-disable */
(function () {
  const old = console.log;
  const logger = document.createElement('div');
  document.body.appendChild(logger);
  console.log = function f(message) {
    if (typeof message === 'object') {
      logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : message) + '<br />';
    } else {
      logger.innerHTML += message + '<br />';
    }
  }
})();

require('./index');

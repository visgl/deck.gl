// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Enables ES2015 import/export in Node.js

const console = require('console');
const process = require('process');

function checkToken(key) {
  // eslint-disable-next-line
  if (!process.env[key]) {
    console.log('\x1b[31m%s\x1b[0m', `Missing ${key}!`);
    process.exit(1); //eslint-disable-line
  }
}

checkToken('MapboxAccessToken');
checkToken('GoogleMapsAPIKey');

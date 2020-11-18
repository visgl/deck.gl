// Copyright (c) 2015 - 2018 Uber Technologies, Inc.
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

// Enables ES2015 import/export in Node.js

const console = require('console');
const process = require('process');
const readline = require("readline");

function checkToken(key) {
  // eslint-disable-next-line
  if (!process.env[key]) {
    console.log('\x1b[31m%s\x1b[0m', `Missing ${key}!`);
    process.exit(1); //eslint-disable-line
  } else {
    console.log(`${key}: \r\n\x1b[36m%s\x1b[0m ${process.env[key]}`);
  }
}

function verifyUserInput() {
  const prompts = readline.createInterface(process.stdin, process.stdout);
  prompts.question('Proceed with the above tokens: y/n \r\n', answer => {
    if (answer === 'y' || answer === 'Y') {
      process.exit(0);
    } else {
      process.exit(1); //eslint-disable-line
    }
  });
}

checkToken('MapboxAccessToken');
checkToken('GoogleMapsAPIKey');
verifyUserInput();

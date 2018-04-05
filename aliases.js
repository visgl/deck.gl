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

// Enables ES2015 import/export in Node.js

// Registers an alias for this module
const {resolve} = require('path');
const fs = require('fs');

const MODULE_PATH = resolve(__dirname, './modules');

// Get all module info
const MODULES = {};
fs.readdirSync(MODULE_PATH)
  .forEach(item => {
    const itemPath = resolve(MODULE_PATH, item);
    if (fs.lstatSync(itemPath).isDirectory()) {
      const packageInfo = require(resolve(itemPath, 'package.json'));
      MODULES[packageInfo.name] = packageInfo;
    }
  });

function getAliases(mode = 'src') {
  const aliases = {};

  for (const moduleName in MODULES) {
    const subPath = mode === 'src' ? 'src' : MODULES[moduleName].main.replace('/index.js', '');
    aliases[moduleName] = resolve(__dirname, 'node_modules', moduleName, subPath);
  }

  return Object.assign({
    // TODO - remove when core and core-layers are separated
    'deck.gl/core': resolve(aliases['@deck.gl/core'], 'core'),
    'deck.gl/core-layers': resolve(aliases['@deck.gl/core'], 'core-layers'),
    'deck.gl/test': resolve(__dirname, './test')
  }, aliases);
}

module.exports = getAliases;


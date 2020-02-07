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

import {registerLoaders} from '@loaders.gl/core';
import {ImageLoader} from '@loaders.gl/images';

import {global} from 'probe.gl/env';
import log from '../utils/log';
import {register} from '../debug';
import jsonLoader from '../utils/json-loader';

// Version detection using babel plugin
// Fallback for tests and SSR since global variable is defined by Webpack.
/* global __VERSION__ */
const version =
  typeof __VERSION__ !== 'undefined' ? __VERSION__ : global.DECK_VERSION || 'untranspiled source';

// Note: a `deck` object not created by deck.gl may exist in the global scope
const existingVersion = global.deck && global.deck.VERSION;

if (existingVersion && existingVersion !== version) {
  throw new Error(`deck.gl - multiple versions detected: ${existingVersion} vs ${version}`);
}

if (!existingVersion) {
  // eslint-disable-next-line
  if (process.env.NODE_ENV !== 'production') {
    log.log(
      0,
      `deck.gl ${version} - set deck.log.level=1 (or higher) to trace attribute updates`
    )();
  }

  global.deck = Object.assign(global.deck || {}, {
    VERSION: version,
    version,
    log,
    // experimental
    _registerLoggers: register
  });

  registerLoaders([jsonLoader, ImageLoader]);
}

export default global.deck;

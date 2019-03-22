// Copyright (c) 2019 Uber Technologies, Inc.
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

const TARGETS = {
  chrome: '60',
  edge: '15',
  firefox: '53',
  ios: '10.3',
  safari: '10.1',
  node: '8'
};

const CONFIG = {
  default: {
    presets: [
      [
        '@babel/env',
        {
          targets: TARGETS
        }
      ],
      '@babel/react'
    ],
    plugins: [
      'version-inline',
      ['@babel/plugin-proposal-decorators', {legacy: true}],
      ['@babel/plugin-proposal-class-properties', {loose: true}]
    ]
  }
};

CONFIG.es6 = Object.assign({}, CONFIG.default, {
  presets: [
    [
      '@babel/env',
      {
        targets: TARGETS,
        modules: false
      }
    ],
    '@babel/react'
  ]
});

CONFIG.esm = Object.assign({}, CONFIG.default, {
  presets: [
    [
      '@babel/env',
      {
        modules: false
      }
    ],
    '@babel/react'
  ]
});

CONFIG.es5 = Object.assign({}, CONFIG.default, {
  presets: [
    [
      '@babel/env',
      {
        modules: 'commonjs'
      }
    ],
    '@babel/react'
  ]
});

CONFIG.cover = Object.assign({}, CONFIG.default);
CONFIG.cover.plugins = CONFIG.cover.plugins.concat(['istanbul']);

module.exports = function getConfig(api) {
  // eslint-disable-next-line
  const env = api.cache(() => process.env.BABEL_ENV || process.env.NODE_ENV);

  const config = CONFIG[env] || CONFIG.default;
  // Uncomment to debug
  console.error(env, config.plugins); // eslint-disable-line no-console, no-undef
  return config;
};

module.exports.config = CONFIG.es6;

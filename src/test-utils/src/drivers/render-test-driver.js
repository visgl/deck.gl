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

/* global process */
import {BrowserDriver} from 'probe.gl/test';
import {addColor, COLOR} from '../utils/colors';

// DEFAULT config, intended to be overridden in the node script that calls us

// read the webpack env from 3 arg (node script arg)
let webpackEnv = 'render';
if (process.argv.length >= 3) {
  webpackEnv = process.argv[2];
}

const SERVER_CONFIG = {
  parameters: [`--env.${webpackEnv}`, '--progress']
};

export default class RenderTestDriver extends BrowserDriver {
  run(config = SERVER_CONFIG) {
    this.console.log(addColor('Running rendering tests in Chrome instance...', COLOR.YELLOW));
    this.time = Date.now();
    return Promise.resolve()
      .then(_ => this.startServer(config))
      .then(_ => this.startBrowser())
      .then(_ => this.newPage())
      .then(_ => this.waitForBrowserMessage('renderTestComplete'))
      .then(success => Boolean(success))
      .then(success => this._done(success))
      .then(_ => this.exit());
  }

  _done(success) {
    this.setShellStatus(success);
    const elapsed = ((Date.now() - this.time) / 1000).toFixed(1);
    this.console.log(
      success
        ? addColor(`Rendering test successfully completed in ${elapsed}s!`, COLOR.BRIGHT_GREEN)
        : addColor('Rendering test failed!', COLOR.BRIGHT_RED)
    );
  }
}

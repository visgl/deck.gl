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
import {Log, COLOR} from 'probe.gl';

const log = new Log('render-test');

// DEFAULT config, intended to be overridden in the node script that calls us

// read the webpack env from 3 arg (node script arg)
let webpackEnv = 'render';
if (process.argv.length >= 3) {
  webpackEnv = process.argv[2];
}

const SERVER_CONFIG = {
  parameters: [`--env.${webpackEnv}`]
};

export default class RenderTestDriver extends BrowserDriver {
  run(config = SERVER_CONFIG) {
    log.log({message: 'Running rendering tests in Chrome instance...', color: COLOR.YELLOW})();
    this.time = Date.now();
    return Promise.resolve()
      .then(_ => this.startServer(config))
      .then(_ => this.startBrowser())
      .then(_ => this.newPage())
      .then(_ => this.waitForBrowserMessage('renderTestComplete'))
      .then(resultString => {
        const result = JSON.parse(resultString);
        if (result.success !== Boolean(result.success) || typeof result.failedTest !== 'string') {
          throw new Error(`Illegal response "${resultString}" returned from Chrome test script`);
        }
        if (!result.success) {
          throw new Error(result.failedTest);
        }
        this._success();
      })
      .catch(error => {
        this._failure(error);
      });
  }

  _success() {
    const elapsed = ((Date.now() - this.time) / 1000).toFixed(1);
    log.log({
      message: `Rendering test successfully completed in ${elapsed}s!`,
      color: COLOR.BRIGHT_GREEN
    })();
    this.setShellStatus(true);
    this.exit();
  }

  _failure(error) {
    log.error({
      message: `Rendering test failed: ${error.message}`,
      color: COLOR.BRIGHT_RED
    })();
    // Don't call exit(). Leave browser running so user can inspect image that failed to render
    this.setShellStatus(false);
    return Promise.all([
      // this.stopBrowser(), // Don't stop the browser
      this.stopServer()
    ]).then(_ => {
      // this.exitProcess()); - Don't exit the process
    });
  }
}

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

import {addColor, COLOR} from '../utils/colors';

const ERR_AUTOMATION = 'Browser automation error, Chrome 64 or higher is required';

const DEFAULT_CONFIG = {
  process: './node_modules/.bin/webpack-dev-server',
  parameters: ['--config', 'webpack.config.js', '--progress'],
  options: {maxBuffer: 5000 * 1024}
};

const DEFAULT_PUPPETEER_OPTIONS = {
  headless: false,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
};

export default class NodeTestDriver {
  constructor() {
    this.execFile = module.require('child_process').execFile;
    this.puppeteer = module.require('puppeteer');
    this.console = module.require('console');
    this.process = module.require('process');

    this.child = null;
    this.browser = null;
    this.page = null;
    this.shellStatus = 0;
  }

  setShellStatus(success) {
    // return value that is visible to the shell, 0 is success
    this.shellStatus = success ? 0 : 1;
  }

  startBrowser(options = DEFAULT_PUPPETEER_OPTIONS) {
    if (this.browser) {
      return Promise.resolve(this.browser);
    }
    return this.puppeteer
      .launch(options)
      .then(browser => {
        this.browser = browser;
      })
      .catch(error => {
        console.error(addColor(ERR_AUTOMATION, COLOR.BRIGHT_RED)); // eslint-disable-line
        throw error;
      });

    // TODO - Support ES7 syntax
    // const browser = await this.puppeteer.launch({
    //   headless: false,
    //   executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    // });
    // const page = await browser.newPage();
    // await page.waitFor(1000);
    // await page.goto('http://localhost:8080');
    // await page.setViewport({width: 1550, height: 850});
  }

  newPage({url = 'http://localhost:8080', width = 1550, height = 850} = {}) {
    return this.startBrowser()
      .then(_ => this.browser.newPage())
      .then(page => {
        this.page = page;
      })
      .then(_ => this.page.waitFor(1000))
      .then(_ => this.page.goto(url))
      .then(_ => this.page.setViewport({width: 1550, height: 850}))
      .catch(error => {
        console.error(addColor(ERR_AUTOMATION, COLOR.BRIGHT_RED)); // eslint-disable-line
        throw error;
      });
  }

  stopBrowser() {
    return Promise.resolve()
      .then(_ => this.page.waitFor(1000))
      .then(_ => this.browser.close())
      .catch(error => {
        console.error(addColor(ERR_AUTOMATION, COLOR.BRIGHT_RED)); // eslint-disable-line
        throw error;
      });

    // TODO - Support ES7 syntax
    // await page.waitFor(1000);
    // await browser.close();
  }

  startServer(config = {}) {
    this.child = this.execFile(
      config.process || DEFAULT_CONFIG.process,
      config.parameters || DEFAULT_CONFIG.parameters,
      config.options || DEFAULT_CONFIG.options,
      (err, stdout) => {
        if (err) {
          this.console.error(err);
          return;
        }
        this.console.log(stdout);
      }
    );
  }

  stopServer() {
    if (this.child) {
      this.child.kill();
      this.child = null;
    }
  }

  exitProcess() {
    // generate a return value that is visible to the shell, 0 is success
    this.process.exit(this.shellStatus);
  }

  exit() {
    return Promise.all([this.stopBrowser(), this.stopServer()]).then(_ => this.exitProcess());
  }
}

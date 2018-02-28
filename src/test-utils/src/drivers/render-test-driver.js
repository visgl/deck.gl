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

import {NodeTestDriver} from 'probe.gl/test';
import {addColor, COLOR} from '../utils/colors';

const SERVER_CONFIG = {
  parameters: ['--config', 'webpack.config.js', '--env.render', '--progress']
};

export default class RenderTestDriver extends NodeTestDriver {
  // TODO - Search DOM by id or class should be less fragile?
  getColor(page, selector = 'body > div:nth-child(7) > p') {
    return (
      Promise.resolve()
        .then(_ => page.waitForSelector(selector))
        // TODO - How does this line work? document is defined under Node by puppeteer?
        .then(_ => page.evaluate(sel => document.querySelector(sel).style.color, selector)) //eslint-disable-line
        .then(color => color)
    );
    // TODO - Support ES7 syntax
    // await page.waitForSelector(selector);
    // const color = await page.evaluate(sel => {
    //   return document.querySelector(sel).style.color; //eslint-disable-line
    // }, selector);
    // return color;
  }

  run(config = SERVER_CONFIG) {
    this.console.log(addColor('Running rendering tests in Chrome instance...', COLOR.YELLOW));
    const time = Date.now();
    return Promise.resolve()
      .then(_ => this.startServer(config))
      .then(_ => this.startBrowser())
      .then(_ => this.newPage())
      .then(_ => this.getColor(this.page))
      .then(color => {
        const success = color === 'rgb(11, 255, 28)';
        this.setShellStatus(success);
        const elapsed = ((Date.now() - time) / 1000).toFixed(1);
        this.console.log(
          success
            ? addColor(`Rendering test successfully completed in ${elapsed}s!`, COLOR.BRIGHT_GREEN)
            : addColor('Rendering test failed!', COLOR.BRIGHT_RED)
        );
      })
      .then(_ => this.exit());
    // TODO - Support ES7 syntax
    // const color = await this.getColor(page, 'body > div:nth-child(7) > p');
    // if (color !== 'rgb(11, 255, 28)') {
    //   this.console.log('Rendering test failed!');
    //   return false;
    // }
    // return true;
  }
}

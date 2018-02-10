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

const {execFile} = require('child_process');
const puppeteer = require('puppeteer');
const console = require('console');
const process = require('process');

async function getColor(page, selector) {
  await page.waitForSelector(selector);
  const color = await page.evaluate(sel => {
    return document.querySelector(sel).style.color; //eslint-disable-line
  }, selector);
  return color;
}

async function validateRendering(child) {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    });
    const page = await browser.newPage();
    await page.waitFor(1000);
    await page.goto('http://localhost:8080');
    await page.setViewport({width: 1550, height: 850});

    const color = await getColor(page, 'body > div:nth-child(7) > p');

    child.kill();
    await page.waitFor(1000);
    await browser.close();

    if (color !== 'rgb(11, 255, 28)') {
      console.log('Rendering test failed!');
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    child.kill();
    return false;
  }
}

const child = execFile(
  '../../node_modules/.bin/webpack-dev-server',
  ['--config', 'webpack.config.test-rendering.js', '--progress'],
  {
    maxBuffer: 5000 * 1024
  },
  (err, stdout) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
  }
);

(async () => {
  const valid = await validateRendering(child);
  process.exit(valid ? 0 : 1); //eslint-disable-line
})();

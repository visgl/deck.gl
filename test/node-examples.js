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

const {execFile, execFileSync} = require('child_process');
const puppeteer = require('puppeteer');
const console = require('console');
const process = require('process');

const path = require('path');

const compareImage = require('./compare-image');

const LIB_DIR = path.resolve(__dirname, '..');
const EXAMPLES_DIR = path.resolve(LIB_DIR, 'examples');

let exampleDir;

async function validateWithWaitingTime(child, folder, waitingTime, threshold) {
  const browser = await puppeteer.launch({
    headless: false,
    args: [`--window-size=${1000},${800}`]
  });
  const page = await browser.newPage();
  await page.waitFor(2000);
  await page.goto('http://localhost:8080', {timeout: 50000});
  await page.setViewport({width: 1000, height: 800});
  await page.waitFor(waitingTime);
  await page.screenshot({path: 'new.png'});

  const golderImageName = `${LIB_DIR}/test/render/golden-images/examples/${folder.replace(
    /\//g,
    '_'
  )}.png`;
  const result = compareImage('new.png', golderImageName, threshold);

  child.kill();
  await page.waitFor(1000);
  await browser.close();

  return result;
}

async function yarnAndLaunchWebpack() {
  const output = execFileSync('yarn'); //eslint-disable-line
  // console.log(output.toString('utf8'));
  const child = execFile(
    './node_modules/.bin/webpack-dev-server',
    ['--env.local', '--config', 'webpack.config.js', '--progress', '--hot'],
    {
      maxBuffer: 5000 * 1024
    },
    err => {
      if (err) {
        console.error(err);
        return;
      }
    }
  );
  return child;
}

function checkMapboxToken() {
  // eslint-disable-next-line
  if (process.env.MapboxAccessToken === undefined) {
    console.log('\x1b[31m%s\x1b[0m', 'Need set MapboxAccessToken!');
    process.exit(1); //eslint-disable-line
  }
}

function changeFolder(folder) {
  console.log('--------------------------');
  console.log(`Begin to test ${folder}`);
  process.chdir(path.resolve(exampleDir, folder));
}

async function runTestExample(folder) {
  changeFolder(folder);
  const child = await yarnAndLaunchWebpack();
  const valid = await validateWithWaitingTime(child, folder, 5000, 0.01);
  if (!valid) {
    process.exit(1); //eslint-disable-line
  }
}

(async () => {
  checkMapboxToken();

  exampleDir = EXAMPLES_DIR;
  await runTestExample('experimental/bezier');
  await runTestExample('experimental/json-pure-js');

  await runTestExample('get-started/pure-js');
  await runTestExample('get-started/pure-js-without-map');
  await runTestExample('get-started/react-webpack-2');
  await runTestExample('get-started/react-without-map');

  await runTestExample('layer-browser');

  await runTestExample('website/3d-heatmap');
  await runTestExample('website/arc');
  await runTestExample('website/brushing');
  await runTestExample('website/geojson');
  await runTestExample('website/highway');
  await runTestExample('website/icon');
  await runTestExample('website/line');
  await runTestExample('website/plot');
  await runTestExample('website/scatterplot');
  await runTestExample('website/screen-grid');
  await runTestExample('website/tagmap');
})();

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

const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

function printResult(diffRatio, threshold) {
  return diffRatio <= threshold
    ? console.log('\x1b[32m%s\x1b[0m', 'Rendering test Passed!')
    : console.log('\x1b[31m%s\x1b[0m', 'Rendering test failed!');
}

async function validateWithWaitingTime(child, folder, waitingTime, threshold) {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const page = await browser.newPage();
  await page.waitFor(2000);
  await page.goto('http://localhost:8080');
  await page.setViewport({width: 1000, height: 800});
  await page.waitFor(waitingTime);
  await page.screenshot({path: 'new.png'});

  const goldImageData = fs.readFileSync(`../test/golden-images/${folder}.png`);
  const goldImage = PNG.sync.read(goldImageData);
  const newImageData = fs.readFileSync('new.png');
  const newImage = PNG.sync.read(newImageData);
  const diffImage = new PNG({width: goldImage.width, height: goldImage.height});

  const pixelDiffSize = pixelmatch(
    goldImage.data,
    newImage.data,
    diffImage.data,
    goldImage.width,
    goldImage.height,
    {threshold: 0.105, includeAA: true}
  );
  const pixelDiffRatio = pixelDiffSize / (goldImage.width * goldImage.height);

  console.log(`Mismatched pixel number: ${pixelDiffSize}`);
  console.log(`Mismatched pixel ratio: ${pixelDiffRatio}`);

  const diffImageData = PNG.sync.write(diffImage, {colorType: 6});
  fs.writeFileSync('diff.png', diffImageData);
  fs.unlinkSync('new.png');
  fs.unlinkSync('diff.png');

  child.kill();
  await page.waitFor(1000);
  await browser.close();
  printResult(pixelDiffRatio, threshold);
  return pixelDiffRatio <= threshold;
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

function changeFolder(folder) {
  console.log('--------------------------');
  console.log(`Begin to test ${folder}`);
  process.chdir(`./${folder}`);
}

async function TestExample(folder) {
  changeFolder(folder);
  const child = await yarnAndLaunchWebpack();
  const valid = await validateWithWaitingTime(child, folder, 5000, 0.01);
  process.chdir('../');
  if (!valid) {
    process.exit(1); //eslint-disable-line
  }
}

(async () => {
  process.chdir('./examples');

  await TestExample('3d-heatmap');
  await TestExample('arc');
  await TestExample('bezier');
  await TestExample('brushing');
  await TestExample('geojson');
  await TestExample('graph');
  await TestExample('icon');
  await TestExample('line');
  await TestExample('plot');
  await TestExample('scatterplot');
  await TestExample('screen-grid');
  await TestExample('tagmap');
  await TestExample('without-map');
})();

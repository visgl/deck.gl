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

async function validateWithWaitingTime(child, waitingTime, threshold) {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });
  const page = await browser.newPage();
  await page.waitFor(1000);
  await page.goto('http://localhost:8080');
  await page.setViewport({width: 1000, height: 800});
  await page.waitFor(waitingTime);

  await page.screenshot({path: 'new.png'});

  const goldImagedata = fs.readFileSync('gold.png');
  const goldImage = PNG.sync.read(goldImagedata);

  const newImageData = fs.readFileSync('new.png');
  const newImage = PNG.sync.read(newImageData);

  const diffImage = new PNG({width: goldImage.width, height: goldImage.height});

  const pixelDiffSize = pixelmatch(
    goldImage.data,
    newImage.data,
    diffImage.data,
    goldImage.width,
    goldImage.height,
    {threshold: 0.068, includeAA: true}
  );

  const pixelDiffRatio = pixelDiffSize / (goldImage.width * goldImage.height);
  console.log(`Mismatched pixel number: ${pixelDiffSize}`);
  console.log(`Mismatched pixel ratio: ${pixelDiffRatio}`);

  diffImage.pack().pipe(fs.createWriteStream('diff.png'));

  child.kill();
  await page.waitFor(1000);
  await browser.close();

  if (pixelDiffRatio <= threshold) {
    console.log('\x1b[32m%s\x1b[0m', 'Rendering test Passed!');
    return true;
  }
  console.log('\x1b[31m%s\x1b[0m', 'Rendering test failed!');
  return false;
}

async function yarnAndLaunchWebpack() {
  const output = execFileSync('yarn'); //eslint-disable-line
  // console.log(output.toString('utf8'));
  const child = execFile(
    './node_modules/.bin/webpack-dev-server',
    [' --env.local', '--config', 'webpack.config.js', '--progress'],
    {
      maxBuffer: 5000 * 1024
    },
    (err, stdout, stderr) => {
      if (err) {
        // console.error(err);
        return;
      }
      // console.log(stdout);
    }
  );
  return child;
}

process.chdir('./examples');

// eslint-disable-next-line
(async () => {
  let child;
  let valid = true;
  let finalResult = true;

  console.log('--------------------------');
  console.log('Begin to test plot');
  process.chdir('./plot');
  child = await yarnAndLaunchWebpack();
  valid = await validateWithWaitingTime(child, 5000, 0.01);
  finalResult = finalResult && valid;
  process.chdir('../');

  console.log('--------------------------');
  console.log('Begin to test 3d-heatmap');
  process.chdir('./3d-heatmap');
  child = await yarnAndLaunchWebpack();
  valid = await validateWithWaitingTime(child, 5000, 0.01);
  finalResult = finalResult && valid;
  process.chdir('../');

  console.log('--------------------------');
  console.log('Begin to test arc');
  process.chdir('./arc');
  child = await yarnAndLaunchWebpack();
  valid = await validateWithWaitingTime(child, 5000, 0.001);
  finalResult = finalResult && valid;
  process.chdir('../');

  console.log('--------------------------');
  console.log('Begin to test bezier');
  process.chdir('./bezier');
  child = await yarnAndLaunchWebpack();
  valid = await validateWithWaitingTime(child, 5000, 0.001);
  finalResult = finalResult && valid;
  process.chdir('../');

  console.log('--------------------------');
  console.log('Begin to test brushing');
  process.chdir('./brushing');
  child = await yarnAndLaunchWebpack();
  valid = valid && (await validateWithWaitingTime(child, 5000, 0.001));
  finalResult = finalResult && valid;
  process.chdir('../');

  console.log('--------------------------');
  console.log('Begin to test geojson');
  process.chdir('./geojson');
  child = await yarnAndLaunchWebpack();
  valid = await validateWithWaitingTime(child, 5000, 0.01);
  finalResult = finalResult && valid;
  process.chdir('../');

  console.log('--------------------------');
  console.log('Begin to test graph');
  process.chdir('./graph');
  child = await yarnAndLaunchWebpack();
  valid = await validateWithWaitingTime(child, 10000, 0.01);
  finalResult = finalResult && valid;
  process.chdir('../');

  console.log('--------------------------');
  console.log('Begin to test icon');
  process.chdir('./icon');
  child = await yarnAndLaunchWebpack();
  valid = await validateWithWaitingTime(child, 5000, 0.001);
  finalResult = finalResult && valid;
  process.chdir('../');

  console.log('--------------------------');
  console.log('Begin to test line');
  process.chdir('./line');
  child = await yarnAndLaunchWebpack();
  valid = await validateWithWaitingTime(child, 5000, 0.001);
  finalResult = finalResult && valid;
  process.chdir('../');

  process.exit(finalResult ? 0 : 1); //eslint-disable-line
})();

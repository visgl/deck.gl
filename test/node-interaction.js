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
const path = require('path');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

const EXAMPLES_WEBSITE_DIR = path.resolve(__dirname, 'interaction');

let exampleDir;

function printResult(diffRatio, threshold) {
  return diffRatio <= threshold
    ? console.log('\x1b[32m%s\x1b[0m', 'Rendering test Passed!')
    : console.log('\x1b[31m%s\x1b[0m', 'Rendering test failed!');
}

const innerWidth = 1000;
const innerHeight = 800;

const EVENTS = ['', '-pan-ur', '-pan-dl', '-tilt-ur', '-tilt-dl', '-zoom-in', '-zoom-out'];

const DIRECTION = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
  UPRIGHT: 4,
  DOWNLEFT: 5
};

async function pan(page, distance, direction) {
  const mouse = page.mouse;
  const centerx = innerWidth / 2;
  const centery = innerHeight / 2;
  await mouse.move(centerx, centery);
  await mouse.down();
  await page.waitFor(2000);
  switch (direction) {
    case DIRECTION.UP:
      await mouse.move(centerx, centery - distance, {steps: distance});
      break;
    case DIRECTION.RIGHT:
      await mouse.move(centerx + distance, centery, {steps: distance});
      break;
    case DIRECTION.DOWN:
      await mouse.move(centerx, centery + distance, {steps: distance});
      break;
    case DIRECTION.LEFT:
      await mouse.move(centerx - distance, centery, {steps: distance});
      break;
    case DIRECTION.UPRIGHT:
      await mouse.move(centerx + distance, centery - distance, {steps: distance});
      break;
    case DIRECTION.DOWNLEFT:
      await mouse.move(centerx - distance, centery + distance, {steps: distance});
      break;
    default:
      console.log('Please input a number between 0 and 5!');
      break;
  }
  await mouse.up();
}

async function panAll(page, distance, waitingTime, threshold, folder) {
  await pan(page, distance, DIRECTION.UPRIGHT);
  await page.screenshot({path: `${folder}${EVENTS[1]}.png`});
  await pan(page, distance, DIRECTION.DOWNLEFT);
  await pan(page, distance, DIRECTION.DOWNLEFT);
  await page.screenshot({path: `${folder}${EVENTS[2]}.png`});
  await pan(page, distance, DIRECTION.UPRIGHT);
}

async function tilt(page, angle, direction) {
  const mouse = page.mouse;
  const centerx = innerWidth / 2;
  const centery = innerHeight / 2;
  await mouse.move(centerx, centery);
  await mouse.down();
  await page.waitFor(2000);
  await page.keyboard.down('Shift');
  switch (direction) {
    case DIRECTION.UP:
      await mouse.move(centerx, centery - angle, {steps: angle});
      break;
    case DIRECTION.RIGHT:
      await mouse.move(centerx + angle, centery, {steps: angle});
      break;
    case DIRECTION.DOWN:
      await mouse.move(centerx, centery + angle, {steps: angle});
      break;
    case DIRECTION.LEFT:
      await mouse.move(centerx - angle, centery, {steps: angle});
      break;
    case DIRECTION.UPRIGHT:
      await mouse.move(centerx + angle, centery - angle, {steps: angle});
      break;
    case DIRECTION.DOWNLEFT:
      await mouse.move(centerx - angle, centery + angle, {steps: angle});
      break;
    default:
      console.log('Please input a number between 0 and 5');
      break;
  }
  await page.keyboard.up('Shift');
  await mouse.up();
}

async function tiltAll(page, angle, waitingTime, threshold, folder) {
  await tilt(page, angle, DIRECTION.UPRIGHT);
  await page.screenshot({path: `${folder}${EVENTS[3]}.png`});
  await tilt(page, angle, DIRECTION.DOWNLEFT);
  await tilt(page, angle, DIRECTION.DOWNLEFT);
  await page.screenshot({path: `${folder}${EVENTS[4]}.png`});
  await tilt(page, angle, DIRECTION.UPRIGHT);
}

async function zoomin(page, waitingTime) {
  const mouse = page.mouse;
  const centerx = innerWidth / 2;
  const centery = innerHeight / 2;
  await mouse.move(centerx, centery);
  await page.mouse.down();
  await page.mouse.up();
  await page.mouse.down();
  await page.mouse.up();
  await page.waitFor(waitingTime);
}

async function zoomout(page, waitingTime) {
  const mouse = page.mouse;
  const centerx = innerWidth / 2;
  const centery = innerHeight / 2;
  await mouse.move(centerx, centery);
  await page.keyboard.down('Shift');
  await page.mouse.down();
  await page.mouse.up();
  await page.mouse.down();
  await page.mouse.up();
  await page.keyboard.up('Shift');
  await page.waitFor(waitingTime);
}

async function zoom(page, waitingTime, threshold, folder) {
  await zoomin(page, waitingTime);
  await page.screenshot({path: `${folder}${EVENTS[5]}.png`});
  await zoomout(page, waitingTime);
  await zoomout(page, waitingTime);
  await page.screenshot({path: `${folder}${EVENTS[6]}.png`});
  await zoomin(page, waitingTime);
}

async function allEvents(page, waitingTime, threshold, folder) {
  await panAll(page, 100, waitingTime, threshold, folder);
  await tiltAll(page, 200, waitingTime, threshold, folder);
  await zoom(page, waitingTime, threshold, folder);
  await page.screenshot({path: `${folder}.png`});
}

async function createGoldenImage(example) {
  const len = EVENTS.length;
  console.log(`in createGoldenImage: ${example}`);
  for (let i = 0; i < len; i++) {
    fs.rename(`${example}${EVENTS[i]}.png`, `golden-images/${example}${EVENTS[i]}.png`, err => {
      if (err) throw err;
      console.log('Rename complete!');
    });
  }
}

function compareImage(newImageName, goldenImageName, threshold) {
  const newImageData = fs.readFileSync(newImageName);
  const goldenImageData = fs.readFileSync(goldenImageName);
  const newImage = PNG.sync.read(newImageData);
  const goldenImage = PNG.sync.read(goldenImageData);
  const diffImage = new PNG({width: goldenImage.width, height: goldenImage.height});
  const pixelDiffSize = pixelmatch(
    goldenImage.data,
    newImage.data,
    diffImage.data,
    goldenImage.width,
    goldenImage.height,
    {threshold: 0.105, includeAA: true}
  );

  const pixelDiffRatio = pixelDiffSize / (goldenImage.width * goldenImage.height);
  console.log(`Testing ${newImageName}`);
  console.log(`Mismatched pixel number: ${pixelDiffSize}`);
  console.log(`Mismatched pixel ratio: ${pixelDiffRatio}`);

  const diffImageData = PNG.sync.write(diffImage, {colorType: 6});
  const diffImageName = `${newImageName.split('.')[0]}_diff.png`;
  fs.writeFileSync(diffImageName, diffImageData);

  fs.unlinkSync(newImageName);
  fs.unlinkSync(diffImageName);
  printResult(pixelDiffRatio, threshold);
  return pixelDiffRatio <= threshold;
}

function compareAllImages(example, threshold) {
  let newImageName;
  let goldenImageName;
  for (let i = 0; i < EVENTS.length; i++) {
    newImageName = `${example}${EVENTS[i]}.png`;
    goldenImageName = `golden-images/${example}${EVENTS[i]}.png`;
    compareImage(newImageName, goldenImageName, threshold);
  }
}

async function launchPage() {
  const browser = await puppeteer.launch({
    headless: false,
    args: [`--window-size=${1000},${800}`]
  });
  const page = await browser.newPage();
  await page.waitFor(2000);
  await page.goto('http://localhost:8080');
  await page.setViewport({width: 1000, height: 800});
  await page.waitFor(2000);

  return [browser, page];
}

async function validateWithWaitingTime(child, folder, waitingTime, threshold, compare = true) {
  const [browser, page] = await launchPage();
  const examples = ['plot', 'bezier', 'scatterplot'];
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => App.renderToDOM(document.getElementById('app'))); //eslint-disable-line
    await allEvents(page, 1000, threshold, examples[i]); //eslint-disable-line
    await page.evaluate(() => App.nextTestCase()); //eslint-disable-line
    if (compare) {
      await compareAllImages(examples[i], 0.105);
    } else {
      await createGoldenImage(examples[i]);
    }
  }

  child.kill();
  await browser.close();
  return true;
}

async function yarnAndLaunchWebpack() {
  const output = execFileSync('yarn'); //eslint-disable-line
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
  process.chdir(path.resolve(exampleDir, folder));
}

async function runTestExample(folder) {
  changeFolder(folder);
  const child = await yarnAndLaunchWebpack();
  const valid = await validateWithWaitingTime(child, 'geojson', 1000, 0.01);
  if (!valid) {
    process.exit(1); //eslint-disable-line
  }
}

(async () => {
  // checkMapboxToken();
  exampleDir = EXAMPLES_WEBSITE_DIR;
  await runTestExample('.');
})();

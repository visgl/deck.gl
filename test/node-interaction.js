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

const {execFile} = require('child_process');
const puppeteer = require('puppeteer');
const console = require('console');
const process = require('process');

const fs = require('fs');
const path = require('path');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

const LIB_DIR = path.resolve(__dirname, './interaction');

function printResult(diffRatio, threshold) {
  return diffRatio <= threshold
    ? console.log('\x1b[32m%s\x1b[0m', 'Rendering test Passed!')
    : console.log('\x1b[31m%s\x1b[0m', 'Rendering test failed!');
}

const innerWidth = 1000;
const innerHeight = 800;

const WAIT_TIME = 2000;
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
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;
  await mouse.move(centerX, centerY);
  await mouse.down();
  await page.waitFor(WAIT_TIME);
  // when mouse.move and mouse.down events are triggered by Puppeteer,
  // the starting position is off by several pixels, 2 seconds waiting time
  // is needed remove the offset.
  switch (direction) {
    case DIRECTION.UP:
      await mouse.move(centerX, centerY - distance, {steps: distance});
      break;
    case DIRECTION.RIGHT:
      await mouse.move(centerX + distance, centerY, {steps: distance});
      break;
    case DIRECTION.DOWN:
      await mouse.move(centerX, centerY + distance, {steps: distance});
      break;
    case DIRECTION.LEFT:
      await mouse.move(centerX - distance, centerY, {steps: distance});
      break;
    case DIRECTION.UPRIGHT:
      await mouse.move(centerX + distance, centerY - distance, {steps: distance});
      break;
    case DIRECTION.DOWNLEFT:
      await mouse.move(centerX - distance, centerY + distance, {steps: distance});
      break;
    default:
      console.log('Please input a number between 0 and 5!');
      break;
  }
  await mouse.up();
}

async function panAll(page, distance, threshold, folder) {
  await pan(page, distance, DIRECTION.UPRIGHT);
  await page.screenshot({path: `${folder}${EVENTS[1]}.png`});
  await pan(page, distance, DIRECTION.DOWNLEFT);
  await pan(page, distance, DIRECTION.DOWNLEFT);
  await page.screenshot({path: `${folder}${EVENTS[2]}.png`});
  await pan(page, distance, DIRECTION.UPRIGHT);
}

async function tilt(page, angle, direction) {
  const mouse = page.mouse;
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;
  await mouse.move(centerX, centerY);
  await mouse.down();
  await page.waitFor(WAIT_TIME);
  // when mouse.move and mouse.down events are triggered by Puppeteer,
  // the starting position is off by several pixels, 2 seconds waiting time
  // is needed remove the offset.
  await page.keyboard.down('Shift');
  switch (direction) {
    case DIRECTION.UP:
      await mouse.move(centerX, centerY - angle, {steps: angle});
      break;
    case DIRECTION.RIGHT:
      await mouse.move(centerX + angle, centerY, {steps: angle});
      break;
    case DIRECTION.DOWN:
      await mouse.move(centerX, centerY + angle, {steps: angle});
      break;
    case DIRECTION.LEFT:
      await mouse.move(centerX - angle, centerY, {steps: angle});
      break;
    case DIRECTION.UPRIGHT:
      await mouse.move(centerX + angle, centerY - angle, {steps: angle});
      break;
    case DIRECTION.DOWNLEFT:
      await mouse.move(centerX - angle, centerY + angle, {steps: angle});
      break;
    default:
      console.log('Please input a number between 0 and 5');
      break;
  }
  await page.keyboard.up('Shift');
  await mouse.up();
}

async function tiltAll(page, angle, threshold, folder) {
  await tilt(page, angle, DIRECTION.UPRIGHT);
  await page.screenshot({path: `${folder}${EVENTS[3]}.png`});
  await tilt(page, angle, DIRECTION.DOWNLEFT);
  await tilt(page, angle, DIRECTION.DOWNLEFT);
  await page.screenshot({path: `${folder}${EVENTS[4]}.png`});
  await tilt(page, angle, DIRECTION.UPRIGHT);
}

async function zoomin(page) {
  const mouse = page.mouse;
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;
  await mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.up();
  await page.mouse.down();
  await page.mouse.up();
  await page.waitFor(WAIT_TIME);
}

async function zoomout(page) {
  const mouse = page.mouse;
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;
  await mouse.move(centerX, centerY);
  await page.keyboard.down('Shift');
  await page.mouse.down();
  await page.mouse.up();
  await page.mouse.down();
  await page.mouse.up();
  await page.keyboard.up('Shift');
  await page.waitFor(WAIT_TIME);
}

async function zoom(page, threshold, folder) {
  await zoomin(page);
  await page.screenshot({path: `${folder}${EVENTS[5]}.png`});
  await zoomout(page);
  await zoomout(page);
  await page.screenshot({path: `${folder}${EVENTS[6]}.png`});
  await zoomin(page);
}

async function allEvents(page, threshold, folder) {
  await panAll(page, 100, threshold, folder);
  await tiltAll(page, 200, threshold, folder);
  await zoom(page, threshold, folder);
  await page.screenshot({path: `${folder}.png`});
}

async function createGoldenImage(example) {
  const len = EVENTS.length;
  console.log(`in createGoldenImage: ${example}`);
  for (let i = 0; i < len; i++) {
    await fs.rename(
      `${example}${EVENTS[i]}.png`,
      `golden-images/${example}${EVENTS[i]}.png`,
      err => {
        if (err) throw err;
        console.log('Rename complete!');
      }
    );
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

async function validateWithWaitingTime(child, folder, threshold, compare = true) {
  const [browser, page] = await launchPage();
  const examples = ['pointcloud', 'scatterplot', 'polygon'];
  for (let i = 0; i < 3; i++) {
    console.log(`Begin the ${examples[i]} example`);
    await allEvents(page, threshold, examples[i]); //eslint-disable-line
    console.log('After all events');
    if (compare) {
      await compareAllImages(examples[i], 0.05);
    } else {
      await createGoldenImage(examples[i]);
    }
    await page.evaluate(() => window.nextTestCase()); //eslint-disable-line
    await page.waitFor(WAIT_TIME);
    await pan(page, 1, 0);
  }

  child.kill();
  await browser.close();
  return true;
}

async function yarnAndLaunchWebpack() {
  // const output = execFileSync('yarn'); //eslint-disable-line
  const child = execFile(
    '../../node_modules/.bin/webpack-dev-server',
    ['--env.interaction', '--config', '../webpack.config.js', '--progress', '--hot'],
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
  console.log('finish yarnAndLaunchWebpack');
  return child;
}

function changeFolder(folder) {
  console.log('--------------------------');
  console.log(`Begin to test ${folder}`);
  console.log(folder);
  process.chdir(folder);
}

async function runTestExample(folder) {
  changeFolder(folder);
  const child = await yarnAndLaunchWebpack();
  const valid = await validateWithWaitingTime(child, 'geojson', 0.01);
  if (!valid) {
    process.exit(1); //eslint-disable-line
  }
}
(async () => {
  // checkMapboxToken();
  await runTestExample(LIB_DIR);
})();

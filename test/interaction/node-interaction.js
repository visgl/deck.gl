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
const compareImage = require('../compare-image');

const innerWidth = 1000;
const innerHeight = 800;

const WAIT_TIME = 2000;
// when mouse.move and mouse.down events are triggered by Puppeteer,
// the starting position is off by several pixels, 2 seconds waiting time
// is needed remove the offset.

const EVENTS = ['', '-pan-ur', '-pan-dl', '-tilt-ur', '-tilt-dl', '-zoom-in', '-zoom-out'];

const DIRECTION = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
  UPRIGHT: 4,
  DOWNLEFT: 5
};

async function sendMouseMoveEvent(page, distance, direction, isTilt) {
  const mouse = page.mouse;
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;
  await mouse.move(centerX, centerY);
  await mouse.down();
  await page.waitFor(WAIT_TIME);
  // when mouse.move and mouse.down events are triggered by Puppeteer,
  // the starting position is off by several pixels, 2 seconds waiting time
  // is needed remove the offset.
  if (isTilt) {
    await page.keyboard.down('Shift');
  }
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
      console.log('Please input a number between 0 and 5');
      break;
  }
  if (isTilt) {
    await page.keyboard.up('Shift');
  }
  await mouse.up();
}

async function sendMouseEvents(page, distance, threshold, testCaseName, isTilt) {
  await sendMouseMoveEvent(page, distance, DIRECTION.UPRIGHT, isTilt);
  await page.screenshot({path: `${testCaseName}${EVENTS[1 + isTilt * 2]}.png`});
  await sendMouseMoveEvent(page, distance, DIRECTION.DOWNLEFT, isTilt);
  await sendMouseMoveEvent(page, distance, DIRECTION.DOWNLEFT, isTilt);
  await page.screenshot({path: `${testCaseName}${EVENTS[2 + isTilt * 2]}.png`});
  await sendMouseMoveEvent(page, distance, DIRECTION.UPRIGHT, isTilt);
}

async function sendDoubleClickEvent(page, isZoomout) {
  const mouse = page.mouse;
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;
  await mouse.move(centerX, centerY);
  if (isZoomout) {
    await page.keyboard.down('Shift');
  }
  await page.mouse.down();
  await page.mouse.up();
  await page.mouse.down();
  await page.mouse.up();
  if (isZoomout) {
    await page.keyboard.up('Shift');
  }
  await page.waitFor(WAIT_TIME);
}

async function zoom(page, threshold, folder) {
  await sendDoubleClickEvent(page, false);
  await page.screenshot({path: `${folder}${EVENTS[5]}.png`});
  await sendDoubleClickEvent(page, true);
  await sendDoubleClickEvent(page, true);
  await page.screenshot({path: `${folder}${EVENTS[6]}.png`});
  await sendDoubleClickEvent(page, false);
}

async function allEvents(page, threshold, folder) {
  await sendMouseEvents(page, 100, threshold, folder, false);
  await sendMouseEvents(page, 200, threshold, folder, true);
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
  await page.waitFor(WAIT_TIME);
  await page.goto('http://localhost:8080');
  await page.setViewport({width: 1000, height: 800});
  await page.waitFor(WAIT_TIME);

  return [browser, page];
}

async function validateWithWaitingTime(child, folder, threshold, compare = true) {
  const [browser, page] = await launchPage();
  let example = '';

  for (let i = 0; i < 3; i++) {
    example = `testcase${i}`;
    console.log(`Begin the ${example}`);

    await allEvents(page, threshold, example); //eslint-disable-line
    console.log('After all events');
    if (compare) {
      await compareAllImages(example, 0.01);
    } else {
      await createGoldenImage(example);
    }
    await page.evaluate(() => (example = App.nextTestCase())); //eslint-disable-line

    await page.waitFor(WAIT_TIME);
    await sendMouseMoveEvent(page, 1, 0, false);
  }

  child.kill();
  await browser.close();
  return true;
}

async function launchWebpack() {
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
  console.log('finish launchWebpack');
  return child;
}

async function runInteractionTest() {
  process.chdir(__dirname);
  const child = await launchWebpack();
  const valid = await validateWithWaitingTime(child, 'interaction', 0.01);
  if (!valid) {
    process.exit(1); //eslint-disable-line
  }
}
(async () => {
  // checkMapboxToken();
  await runInteractionTest();
})();

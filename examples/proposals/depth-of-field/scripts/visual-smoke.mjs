// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import assert from 'node:assert/strict';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {createServer} from 'vite';
import {PNG} from 'pngjs';
import {getPlaywrightLaunchOptions} from '../../../../scripts/playwright/get-playwright-launch-options.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const externalUrl = process.env['DEPTH_OF_FIELD_TEST_URL'];
const server = externalUrl
  ? null
  : await createServer({root, logLevel: 'error', server: {host: '127.0.0.1', port: 0}});
await server?.listen();
const browser = await chromium.launch(
  getPlaywrightLaunchOptions({
    headless: true,
    backend: 'webgpu',
    softwareGpu: process.platform === 'linux',
    launchOptions:
      process.platform === 'linux'
        ? {args: ['--enable-gpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader']}
        : {}
  })
);
try {
  const page = await browser.newPage({viewport: {width: 1100, height: 800}, deviceScaleFactor: 1});
  page.setDefaultTimeout(60_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto(externalUrl || server.resolvedUrls.local[0], {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => document.body.dataset.ready === 'true');
  await page.waitForFunction(() => window.riverfrontDepthOfFieldScene.diagnostics.frames > 3);
  const first = await page.evaluate(() => window.riverfrontDepthOfFieldScene.focus.selectedIndex);
  assert(first >= 0, 'automatic tour starts on a building');
  await page.waitForFunction(
    index => window.riverfrontDepthOfFieldScene.focus.selectedIndex !== index,
    first
  );
  const transition = await page.evaluate(() => ({
    ...window.riverfrontDepthOfFieldScene.diagnostics
  }));
  assert(
    Math.abs(transition.focusDistance - transition.targetDistance) > 1,
    'focus eases instead of jumping'
  );
  await page.uncheck('#automatic');
  await page.waitForFunction(() => {
    const diagnostics = window.riverfrontDepthOfFieldScene.diagnostics;
    return Math.abs(diagnostics.focusDistance - diagnostics.targetDistance) < 1;
  });
  await page.screenshot({path: join(tmpdir(), 'riverfront-depth-of-field.png')});
  await page.screenshot({
    path: join(root, '../thumbnails/depth-of-field.jpg'),
    type: 'jpeg',
    quality: 88,
    clip: {x: 340, y: 0, width: 760, height: 800}
  });
  const blurred = PNG.sync.read(await page.screenshot());
  await page.uncheck('#enabled');
  await page.waitForTimeout(150);
  const sharp = PNG.sync.read(await page.screenshot());
  let changedPixels = 0;
  for (let row = 0; row < sharp.height; row++) {
    for (let column = 340; column < sharp.width; column++) {
      const offset = (row * sharp.width + column) * 4;
      if (Math.abs(blurred.data[offset] - sharp.data[offset]) > 8) changedPixels++;
    }
  }
  assert(changedPixels > 1500, `depth-driven blur changes the scene (${changedPixels} pixels)`);
  await page.check('#enabled');
  await page.check('#automatic');
  const clickPositions = await page.evaluate(() => {
    const scene = window.riverfrontDepthOfFieldScene;
    const layer = scene.deck.layerManager.getLayers()[0];
    return scene.features
      .filter(feature => feature.kind === 'building')
      .map(feature =>
        layer.project([feature.center[0], feature.center[1], feature.center[2] + feature.size[2]])
      )
      .filter(
        ([horizontal, vertical]) =>
          horizontal > 340 && horizontal < 1050 && vertical > 40 && vertical < 760
      )
      .sort((first, second) => second[1] - first[1]);
  });
  assert(clickPositions.length > 0, 'visible buildings are available to pick');
  await page.mouse.click(clickPositions[0][0], clickPositions[0][1]);
  await page.waitForFunction(() => !window.riverfrontDepthOfFieldScene.focus.automatic);
  const selected = await page.evaluate(
    () => window.riverfrontDepthOfFieldScene.focus.selectedIndex
  );
  await page.waitForTimeout(5200);
  assert.equal(
    await page.evaluate(() => window.riverfrontDepthOfFieldScene.focus.selectedIndex),
    selected,
    'click holds focus beyond the tour interval'
  );
  assert.equal(
    await page.locator('#automatic').isChecked(),
    false,
    'automatic checkbox follows picking'
  );
  await page.setViewportSize({width: 850, height: 650});
  await page.waitForTimeout(150);
  await page.mouse.move(700, 600);
  await page.mouse.down({button: 'right'});
  await page.mouse.move(700, 40, {steps: 12});
  await page.mouse.up({button: 'right'});
  await page.waitForFunction(
    () => window.riverfrontDepthOfFieldScene.deck.getViewports()[0].pitch > 80
  );
  assert.equal(await page.evaluate(() => window.riverfrontDepthOfFieldScene.diagnostics.error), '');
  assert.deepEqual(errors, [], 'browser and GPU report no errors');
  await page.evaluate(() => {
    const scene = window.riverfrontDepthOfFieldScene;
    scene.finalize();
    scene.finalize();
    if (scene.capture.getFrame('riverfront')) throw new Error('capture survives finalization');
  });
  console.log(
    `webgpu: ${changedPixels} blurred pixels; automatic tour, smooth focus, click hold, resize, and cleanup passed`
  );
} finally {
  await browser.close();
  await server?.close();
}

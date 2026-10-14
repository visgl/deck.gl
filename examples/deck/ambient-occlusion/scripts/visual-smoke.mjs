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
const server = await createServer({root, logLevel: 'error', server: {host: '127.0.0.1', port: 0}});
await server.listen();
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
  await page.goto(server.resolvedUrls.local[0], {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => document.body.dataset.ready === 'true', undefined, {
    timeout: 60_000
  });
  await page.waitForFunction(
    () => window.riverfrontAmbientOcclusionScene.effect.frameCount > 2,
    undefined,
    {timeout: 30_000}
  );
  assert(
    await page.evaluate(() => window.riverfrontAmbientOcclusionScene.effect.historyFrames > 2),
    'reflection history accumulates across capture frames'
  );
  await page.evaluate(() =>
    window.riverfrontAmbientOcclusionScene.deck.setProps({_animate: false})
  );
  await page.screenshot({path: join(tmpdir(), 'ambient-occlusion-ao.png')});
  await page.uncheck('#reflections');
  const facadeSamples = await page.evaluate(() => {
    const layer = window.riverfrontAmbientOcclusionScene.deck.props.layers.find(
      candidate => candidate.id === 'riverfront-city'
    );
    return layer.props.features
      .filter(feature => feature.kind === 'building')
      .flatMap(feature => {
        const [east, north, base] = feature.center;
        const [width, depth, height] = feature.size;
        const elevation = base + height * 0.5;
        return [
          [east - width * 0.5, north, elevation],
          [east + width * 0.5, north, elevation],
          [east, north - depth * 0.5, elevation],
          [east, north + depth * 0.5, elevation]
        ].map(position => layer.project(position));
      });
  });
  await page.waitForTimeout(150);
  const occluded = PNG.sync.read(await page.screenshot());
  await page.uncheck('#ambientOcclusion');
  await page.waitForTimeout(150);
  const unoccluded = PNG.sync.read(await page.screenshot());
  const darkenedFacades = facadeSamples.filter(([horizontal, vertical]) => {
    const column = Math.round(horizontal);
    const row = Math.round(vertical);
    if (column <= 320 || column >= unoccluded.width || row < 0 || row >= unoccluded.height)
      return false;
    const offset = (row * unoccluded.width + column) * 4;
    const [red, green, blue] = unoccluded.data.subarray(offset, offset + 3);
    // The warm facade color excludes sky, water, ground, and controls from this comparison.
    return (
      red > green && green > blue && red - blue > 12 && red > 100 && red - occluded.data[offset] > 8
    );
  }).length;
  assert(darkenedFacades >= 4, `AO visibly shades building faces (${darkenedFacades} samples)`);
  await page.check('#ambientOcclusion');
  await page.check('#reflections');
  for (const id of ['ambientOcclusion', 'reflections', 'outlines']) {
    await page.locator(`#${id}`).evaluate(input => input.click());
    await page.waitForTimeout(50);
    await page.locator(`#${id}`).evaluate(input => input.click());
  }
  assert.equal(
    await page.evaluate(() => window.riverfrontAmbientOcclusionScene.diagnostics.error),
    '',
    'scene initializes'
  );
  assert.equal(
    await page.evaluate(() => window.riverfrontAmbientOcclusionScene.diagnostics.backend),
    'webgpu',
    'uses WebGPU'
  );
  assert.equal(
    await page.locator('#fog, #bloom').count(),
    0,
    'controls focus on ambient occlusion'
  );
  assert.deepEqual(errors, [], 'browser and GPU report no errors');
  console.log(
    `webgpu: visible AO on ${darkenedFacades} facade samples, Deck capture, effect controls, and cleanup passed`
  );
  await page.evaluate(() => window.riverfrontAmbientOcclusionScene.finalize());
} finally {
  await browser.close();
  await server.close();
}

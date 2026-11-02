// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {createServer} from 'vite';
import {PNG} from 'pngjs';
import {getPlaywrightLaunchOptions} from '../../scripts/playwright/get-playwright-launch-options.mjs';

const kind = process.argv[2] || 'fireflies';
const backend = process.argv.includes('--backend=webgl') ? 'webgl' : 'webgpu';
// Smoke assertions use CSS pixels; poster generation retains its original framebuffer quality.
const deviceScaleFactor = Number(
  process.env.RIVERFRONT_DEVICE_SCALE ??
    (process.argv.includes('--thumbnail') || backend === 'webgl' ? 1 : 0.5)
);
assert(deviceScaleFactor > 0 && Number.isFinite(deviceScaleFactor));
assert(['fireflies', 'hdr-night-lighting', 'global-illumination', 'light-shafts'].includes(kind));
const example =
  process.argv.find(argument => argument.startsWith('--example='))?.split('=')[1] ?? kind;
const root = join(dirname(fileURLToPath(import.meta.url)), example);
const server = await createServer({
  root,
  logLevel: 'error',
  server: {host: '127.0.0.1', port: 0, watch: null}
});
await server.listen();
const browser = await chromium.launch(
  getPlaywrightLaunchOptions({
    headless: true,
    backend,
    softwareGpu: process.platform === 'linux',
    launchOptions:
      process.platform === 'linux'
        ? {args: ['--enable-gpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader']}
        : {}
  })
);
try {
  const page = await browser.newPage({viewport: {width: 1100, height: 800}, deviceScaleFactor});
  const captureScreenshot = options => page.screenshot({...options, scale: 'css'});
  page.setDefaultTimeout(120_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') {
      errors.push(message.text());
      console.error(message.text());
    }
  });
  await page.goto(`${server.resolvedUrls.local[0]}?backend=${backend}`, {
    waitUntil: 'domcontentloaded'
  });
  await page.waitForFunction(
    () => document.body.dataset.ready === 'true' || document.body.dataset.ready === 'error'
  );
  assert.equal(await page.evaluate(() => document.body.dataset.ready), 'true', errors.join('\n'));
  assert.equal(
    await page.locator('vite-error-overlay').count(),
    0,
    'preview has no bundler error overlay'
  );
  await page.waitForFunction(
    () =>
      window.riverfrontLighting.diagnostics.frames > 4 ||
      window.riverfrontLighting.diagnostics.error
  );
  assert.equal(
    await page.evaluate(() => window.riverfrontLighting.diagnostics.error),
    '',
    'scene initializes every layer'
  );
  // Chromium's native resize observer can ignore the emulated device scale.
  await page.evaluate(
    scale => window.riverfrontLighting.deck.setProps({useDevicePixels: scale}),
    deviceScaleFactor
  );
  await page.waitForFunction(scale => {
    const canvas = document.querySelector('canvas');
    return (
      canvas.width === Math.floor(canvas.clientWidth * scale) &&
      canvas.height === Math.floor(canvas.clientHeight * scale)
    );
  }, deviceScaleFactor);
  await page.waitForFunction(() => window.riverfrontLighting.diagnostics.frames > 4);
  if (kind === 'fireflies' && backend === 'webgpu') {
    await page.evaluate(() => {
      window.riverfrontLighting.setSetting('speed', 2);
      window.riverfrontLighting.setSetting('debugMode', 3);
    });
    const frameIndex = await page.evaluate(() => window.riverfrontLighting.diagnostics.frames);
    await page.waitForFunction(
      previous => window.riverfrontLighting.diagnostics.frames > previous + 4,
      frameIndex
    );
    const moving = PNG.sync.read(await captureScreenshot());
    let movingPixels = 0;
    for (let row = 0; row < moving.height; row++)
      for (let column = 340; column < moving.width; column++) {
        if (moving.data[(row * moving.width + column) * 4 + 2] > 1) movingPixels++;
      }
    assert(movingPixels > 20, `animated cores write object motion (${movingPixels} pixels)`);
    await page.evaluate(() => {
      window.riverfrontLighting.setSetting('speed', 0.6);
      window.riverfrontLighting.setSetting('debugMode', 0);
    });
  }
  // Isolate bloom from exposure adaptation when comparing HDR images.
  if (kind === 'hdr-night-lighting') await page.uncheck('#autoExposure');
  await page.uncheck('#animate');
  await page.waitForFunction(() => !window.riverfrontLighting.deck.props._animate);
  if (backend === 'webgpu') {
    const presentation = await page.evaluate(() => {
      const configuration = document
        .querySelector('canvas')
        .getContext('webgpu')
        .getConfiguration();
      return {
        format: configuration.format,
        mode: configuration.toneMapping.mode,
        reported: window.riverfrontLighting.diagnostics.highDynamicRange
      };
    });
    assert.equal(
      presentation.reported,
      presentation.format === 'rgba16float' && presentation.mode === 'extended',
      'HDR status matches the accepted native canvas'
    );
  }
  if (kind === 'fireflies') {
    const reflected = PNG.sync.read(
      await captureScreenshot({path: join(tmpdir(), 'riverfront-fireflies-reflected.png')})
    );
    await page.uncheck('#reflections');
    await page.waitForFunction(() => !window.riverfrontLighting.deck.props._animate);
    const unreflected = PNG.sync.read(
      await captureScreenshot({path: join(tmpdir(), 'riverfront-fireflies-unreflected.png')})
    );
    let reflectionPixels = 0;
    for (let row = 0; row < reflected.height; row++)
      for (let column = 340; column < reflected.width; column++) {
        const offset = (row * reflected.width + column) * 4;
        if (
          reflected.data[offset + 1] - unreflected.data[offset + 1] > 8 &&
          unreflected.data[offset + 2] > unreflected.data[offset]
        )
          reflectionPixels++;
      }
    assert(
      reflectionPixels > 50,
      `water contains distinct glowing reflections (${reflectionPixels} pixels)`
    );
    console.log(`fireflies: ${reflectionPixels} visibly reflected water pixels`);
    await page.check('#reflections');
    await page.waitForFunction(() => !window.riverfrontLighting.deck.props._animate);
  }
  if (kind === 'fireflies' && backend === 'webgpu') {
    const bloomed = PNG.sync.read(await captureScreenshot());
    await page.uncheck('#bloom');
    await page.waitForFunction(() => !window.riverfrontLighting.deck.props._animate);
    const unbloomed = PNG.sync.read(await captureScreenshot());
    let bloomPixels = 0;
    for (let row = 0; row < bloomed.height; row++)
      for (let column = 340; column < bloomed.width; column++) {
        const offset = (row * bloomed.width + column) * 4;
        if (bloomed.data[offset + 1] - unbloomed.data[offset + 1] > 6) bloomPixels++;
      }
    assert(bloomPixels > 100, `bloom spreads beyond the source glow (${bloomPixels} pixels)`);
    console.log(`fireflies: ${bloomPixels} visibly bloomed pixels`);
    await page.check('#bloom');
    await page.evaluate(() => window.riverfrontLighting.setSetting('ripples', 0.15));
    await page.waitForFunction(() => !window.riverfrontLighting.deck.props._animate);
    await page.evaluate(() => window.riverfrontLighting.setSetting('ripples', 0));
    await page.waitForFunction(() => !window.riverfrontLighting.deck.props._animate);
  }
  if (kind === 'fireflies') {
    await page.selectOption('#species', 'genji-hotaru');
    await page.waitForFunction(() => !window.riverfrontLighting.deck.props._animate);
    const hotaru = PNG.sync.read(await captureScreenshot());
    await page.selectOption('#species', 'photinus-scintillans');
    await page.waitForFunction(() => !window.riverfrontLighting.deck.props._animate);
    const amber = PNG.sync.read(await captureScreenshot());
    let colorPixels = 0;
    for (let row = 0; row < hotaru.height; row++)
      for (let column = 340; column < hotaru.width; column++) {
        const offset = (row * hotaru.width + column) * 4;
        const greenBalance = hotaru.data[offset + 1] - hotaru.data[offset];
        const amberBalance = amber.data[offset + 1] - amber.data[offset];
        if (greenBalance - amberBalance > 6) colorPixels++;
      }
    assert(colorPixels > 100, `species changes the rendered emission tint (${colorPixels} pixels)`);
    console.log(
      `fireflies: ${colorPixels} species-tinted pixels; Hotaru selection works while paused`
    );
    await page.selectOption('#species', 'photinus-pyralis');
    await page.waitForFunction(() => !window.riverfrontLighting.deck.props._animate);
  }
  if (process.argv.includes('--thumbnail')) {
    const posterPath = join(root, '../thumbnails', `${kind}.jpg`);
    await mkdir(dirname(posterPath), {recursive: true});
    const hiddenControls = await page.addStyleTag({content: 'aside {visibility: hidden;}'});
    await captureScreenshot({path: posterPath, type: 'jpeg', quality: 90});
    await hiddenControls.evaluate(element => element.remove());
  }
  const screenshotPath = join(tmpdir(), `riverfront-${kind}.png`);
  const enabled = PNG.sync.read(await captureScreenshot({path: screenshotPath}));
  if (kind === 'hdr-night-lighting') await page.uncheck('#bloom');
  else await page.uncheck('#enabled');
  await page.waitForFunction(() => !window.riverfrontLighting.deck.props._animate);
  const disabled = PNG.sync.read(await captureScreenshot());
  let changed = 0;
  let totalDifference = 0;
  for (let row = 0; row < enabled.height; row++) {
    for (let column = 340; column < enabled.width; column++) {
      const offset = (row * enabled.width + column) * 4;
      const difference =
        Math.abs(enabled.data[offset] - disabled.data[offset]) +
        Math.abs(enabled.data[offset + 1] - disabled.data[offset + 1]) +
        Math.abs(enabled.data[offset + 2] - disabled.data[offset + 2]);
      totalDifference += difference;
      if (difference > 6) changed++;
    }
  }
  assert(
    changed > 100,
    `${kind} visibly changes scene pixels (${changed}, total ${totalDifference})`
  );
  const diagnostics = await page.evaluate(() => window.riverfrontLighting.diagnostics);
  assert.equal(diagnostics.error, '', 'scene reports no errors');
  assert.equal(diagnostics.backend, backend);
  if (backend === 'webgpu') await page.selectOption('#buffer-view', '3');
  await page.waitForFunction(() => !window.riverfrontLighting.deck.props._animate);
  const frames = await page.evaluate(() => window.riverfrontLighting.diagnostics.frames);
  await page.waitForTimeout(200);
  assert.equal(
    await page.evaluate(() => window.riverfrontLighting.diagnostics.frames),
    frames,
    'paused scene stops'
  );
  if (backend === 'webgpu') await page.selectOption('#buffer-view', '0');
  await page.click('#center');
  await page.setViewportSize({width: 1000, height: 700});
  await page.waitForFunction(() => !window.riverfrontLighting.deck.props._animate);
  await page.evaluate(() => window.riverfrontLighting.finalize());
  assert(await page.evaluate(() => window.riverfrontLighting.diagnostics.finalized));
  assert.deepEqual(errors, [], 'no browser or GPU errors');
  console.log(
    `${kind}: ${changed} changed pixels, shared buffers, pause, resize and cleanup passed; ${screenshotPath}`
  );
} finally {
  await browser.close();
  await server.close();
}

// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors
import assert from 'node:assert/strict';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {PNG} from 'pngjs';
import {createServer} from 'vite';
import {getPlaywrightLaunchOptions} from '../../../../scripts/playwright/get-playwright-launch-options.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const server = await createServer({root, logLevel: 'error', server: {host: '127.0.0.1', port: 0}});
await server.listen();
function differentPixels(first, second) {
  let count = 0;
  const scale = first.width / 1100;
  for (
    let vertical = 80 * scale;
    vertical < Math.min(first.height, second.height) - 20;
    vertical++
  ) {
    for (
      let horizontal = 300 * scale;
      horizontal < Math.min(first.width, second.width) - 20;
      horizontal++
    ) {
      const firstOffset = (vertical * first.width + horizontal) * 4;
      const secondOffset = (vertical * second.width + horizontal) * 4;
      if (
        [0, 1, 2].some(
          channel =>
            Math.abs(first.data[firstOffset + channel] - second.data[secondOffset + channel]) > 3
        )
      )
        count++;
    }
  }
  return count;
}
try {
  for (const backend of ['webgpu', 'webgl']) {
    const browser = await chromium.launch(
      getPlaywrightLaunchOptions({
        headless: true,
        backend,
        softwareGpu: true,
        launchOptions:
          process.platform === 'linux' && backend === 'webgpu'
            ? {args: ['--enable-gpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader']}
            : {}
      })
    );
    try {
      const page = await browser.newPage({
        viewport: {width: 1100, height: 800},
        deviceScaleFactor: backend === 'webgpu' ? 2 : 1
      });
      const errors = [];
      page.on('pageerror', error => {
        errors.push(error.message);
        console.error(error.message);
      });
      page.on('console', message => {
        if (message.type() === 'error') {
          errors.push(message.text());
          console.error(message.text());
        }
      });
      await page.goto(
        `${process.env.PATTERN_EXAMPLE_URL || server.resolvedUrls.local[0]}?backend=${backend}`
      );
      await page.waitForFunction(() => document.body.dataset.ready === 'true', undefined, {
        timeout: 60_000
      });
      await page.waitForTimeout(500);
      const hatch = PNG.sync.read(
        await page.screenshot({path: join(tmpdir(), `pattern-fills-${backend}-hatch.png`)})
      );
      if (process.env.PATTERN_THUMBNAIL && backend === 'webgpu') {
        await page.screenshot({path: process.env.PATTERN_THUMBNAIL, type: 'jpeg', quality: 90});
      }
      await page.evaluate(() => {
        window.ownedVertices = window.patternScene.deck.props.layers.find(
          layer => layer.id === 'buildings'
        ).state.vertices;
        window.patternScene.rebuildLayers();
      });
      await page.waitForTimeout(150);
      assert.equal(
        differentPixels(hatch, PNG.sync.read(await page.screenshot())),
        0,
        `${backend}: redraw preserves phase`
      );
      await page.selectOption('#pattern', 'crosshatch');
      await page.waitForTimeout(150);
      const crosshatch = PNG.sync.read(
        await page.screenshot({path: join(tmpdir(), `pattern-fills-${backend}-crosshatch.png`)})
      );
      assert(
        differentPixels(hatch, crosshatch) > 100,
        `${backend}: crossing strokes change coverage`
      );
      await page.selectOption('#pattern', 'dots');
      await page.waitForTimeout(150);
      const dots = PNG.sync.read(
        await page.screenshot({path: join(tmpdir(), `pattern-fills-${backend}-dots.png`)})
      );
      assert(differentPixels(crosshatch, dots) > 100, `${backend}: dot fill changes coverage`);
      await page.uncheck('#enabled');
      await page.waitForTimeout(150);
      const filled = PNG.sync.read(await page.screenshot());
      assert(
        differentPixels(crosshatch, filled) > 500,
        `${backend}: fill contributes visible pixels`
      );
      await page.check('#enabled');
      await page.locator('#width').focus();
      await page.keyboard.press('Home');
      await page.waitForTimeout(150);
      assert.equal(
        differentPixels(filled, PNG.sync.read(await page.screenshot())),
        0,
        `${backend}: zero width removes pattern`
      );
      assert.equal(
        await page.evaluate(
          () =>
            window.ownedVertices ===
            window.patternScene.deck.props.layers.find(layer => layer.id === 'buildings').state
              .vertices
        ),
        true,
        `${backend}: uniform changes reuse geometry`
      );
      const picked = await page.evaluate(async () => {
        const scene = window.patternScene;
        scene.setPattern({pattern: 'crosshatch', width: 0.4});
        scene.deck.setProps({
          initialViewState: {
            longitude: -74.006,
            latitude: 40.7128,
            zoom: 15.6,
            pitch: 0,
            bearing: 0
          }
        });
        await new Promise(resolve => setTimeout(resolve, 150));
        const feature = scene.features.find(feature => feature.name === 'East 4.1');
        const layer = scene.deck.props.layers.find(layer => layer.id === 'buildings');
        const position = layer.project([feature.center[0], feature.center[1], feature.size[2]]);
        const info = await scene.deck.pickObjectAsync({x: position[0], y: position[1]});
        return info?.object?.name;
      });
      assert.equal(picked, 'East 4.1', `${backend}: picking ignores visual coverage`);
      await page.setViewportSize({width: 900, height: 650});
      await page.waitForFunction(() => window.patternScene.deck.width === 900);
      await page.evaluate(() => {
        window.patternScene.finalize();
        window.patternScene.finalize();
      });
      assert.equal(
        await page.evaluate(() => window.ownedVertices.destroyed),
        true,
        `${backend}: layer releases owned geometry`
      );
      assert.deepEqual(errors, [], `${backend}: GPU and browser errors`);
      console.log(
        `${backend}: pattern comparison, stable redraw, toggles, zero width, picking, resize, reuse and cleanup passed`
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}

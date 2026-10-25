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
        `${process.env.SKETCH_EXAMPLE_URL || server.resolvedUrls.local[0]}?backend=${backend}`
      );
      await page.waitForFunction(() => document.body.dataset.ready === 'true', undefined, {
        timeout: 60_000
      });
      await page.waitForTimeout(500);
      assert.equal(
        await page.isChecked('#fills'),
        false,
        `${backend}: building faces are off by default`
      );
      await page.check('#fills');
      await page.waitForTimeout(150);
      const pencil = PNG.sync.read(
        await page.screenshot({path: join(tmpdir(), `sketch-edges-${backend}.png`)})
      );
      if (process.env.SKETCH_THUMBNAIL && backend === 'webgpu') {
        await page.screenshot({path: process.env.SKETCH_THUMBNAIL, type: 'jpeg', quality: 90});
      }

      await page.evaluate(() => window.sketchScene.rebuildLayers());
      await page.waitForTimeout(150);
      assert.equal(
        differentPixels(pencil, PNG.sync.read(await page.screenshot())),
        0,
        `${backend}: stable seeds survive layer replacement`
      );
      await page.selectOption('#style', 'solid');
      await page.mouse.move(1090, 790);
      await page.waitForTimeout(200);
      const solid = PNG.sync.read(await page.screenshot());
      assert(
        differentPixels(pencil, solid) > 100,
        `${backend}: pencil grain and irregularity affect visible strokes`
      );
      await page.uncheck('#edges');
      await page.waitForTimeout(150);
      const filled = PNG.sync.read(await page.screenshot());
      assert(differentPixels(solid, filled) > 500, `${backend}: edges contribute visible pixels`);
      assert.equal(
        await page.evaluate(() => window.sketchScene.segments.destroyed),
        false,
        'edge layer borrows its input buffer'
      );
      await page.check('#edges');
      await page.uncheck('#context');
      await page.waitForTimeout(150);
      const solidWithoutContext = PNG.sync.read(await page.screenshot());
      // Use opaque solid strokes so background-dependent pencil grain cannot bias this comparison.
      await page.uncheck('#fills');
      await page.waitForTimeout(150);
      const wireframe = PNG.sync.read(
        await page.screenshot({path: join(tmpdir(), `sketch-edges-${backend}-wireframe.png`)})
      );
      const countDark = image => {
        let count = 0;
        const scale = image.width / 1100;
        for (let vertical = 80 * scale; vertical < image.height - 20; vertical++) {
          for (let horizontal = 300 * scale; horizontal < image.width - 20; horizontal++) {
            const offset = (vertical * image.width + horizontal) * 4;
            if (Math.max(...image.data.subarray(offset, offset + 3)) < 75) count++;
          }
        }
        return count;
      };
      const wireframeDarkCount = countDark(wireframe);
      const solidDarkCount = countDark(solidWithoutContext);
      assert(
        wireframeDarkCount > solidDarkCount * 1.1,
        `${backend}: opaque faces hide rear dark strokes (${wireframeDarkCount} > ${solidDarkCount} * 1.1)`
      );
      await page.check('#fills');
      await page.check('#context');
      await page.selectOption('#edge-mode', 'triangles');
      await page.waitForFunction(() => window.sketchScene.diagnostics.edgeCount === 680);
      await page.selectOption('#edge-mode', 'architectural');
      await page.waitForFunction(() => window.sketchScene.diagnostics.edgeCount === 480);
      await page.selectOption('#style', 'sketch');
      const picked = await page.evaluate(async () => {
        const scene = window.sketchScene;
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
        const position = scene.deck.props.layers[0].project([
          feature.center[0],
          feature.center[1],
          feature.center[2] + feature.size[2]
        ]);
        const info = await scene.deck.pickObjectAsync({x: position[0], y: position[1]});
        return info?.object?.name;
      });
      assert.equal(picked, 'East 4.1', `${backend}: roof picking`);
      const edgePick = await page.evaluate(async () => {
        const scene = window.sketchScene;
        const layer = scene.deck.props.layers.find(layer => layer?.id === 'sketch-edges');
        const feature = scene.features.find(feature => feature.name === 'East 4.1');
        const position = layer.project([
          feature.center[0],
          feature.center[1] - feature.size[1] / 2,
          feature.size[2]
        ]);
        const info = await scene.deck.pickObjectAsync({
          x: position[0],
          y: position[1],
          radius: 3,
          layerIds: ['sketch-edges']
        });
        return info?.object?.name;
      });
      assert.equal(edgePick, 'East 4.1', `${backend}: stroke picking returns its feature`);

      await page.setViewportSize({width: 900, height: 650});
      await page.waitForFunction(() => window.sketchScene.deck.width === 900);
      await page.evaluate(() =>
        window.sketchScene.deck.setProps({
          initialViewState: {
            longitude: -74.006,
            latitude: 40.7128,
            zoom: 16.3,
            pitch: 78,
            bearing: 15
          }
        })
      );
      await page.waitForTimeout(200);
      await page.screenshot({path: join(tmpdir(), `sketch-edges-${backend}-grazing.png`)});
      await page.evaluate(() => {
        window.borrowedSegments = window.sketchScene.segments;
        window.sketchScene.finalize();
        window.sketchScene.finalize();
      });
      assert.equal(
        await page.evaluate(() => window.borrowedSegments.destroyed),
        true,
        'application releases owned segments'
      );
      assert.deepEqual(errors, [], `${backend}: GPU and browser errors`);
      console.log(
        `${backend}: style comparison, stable replacement, toggles, occlusion, picking, resize, grazing view and teardown passed`
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}

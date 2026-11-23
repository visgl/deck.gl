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
        `${process.env.STROKE_EXAMPLE_URL || server.resolvedUrls.local[0]}?backend=${backend}`
      );
      await page.waitForFunction(() => document.body.dataset.ready === 'true', undefined, {
        timeout: 60_000
      });
      await page.waitForFunction(
        () =>
          window.strokeScene.diagnostics.error ||
          window.strokeScene.deck.props.layers.find(layer => layer.id === 'routes')?.isLoaded
      );
      assert.equal(
        await page.evaluate(() => window.strokeScene.diagnostics.error),
        '',
        `${backend}: layer initialization`
      );
      await page.waitForTimeout(150);
      const dashed = PNG.sync.read(
        await page.screenshot({path: join(tmpdir(), `styled-paths-${backend}.png`)})
      );
      if (process.env.STROKE_THUMBNAIL && backend === 'webgpu') {
        await page.screenshot({path: process.env.STROKE_THUMBNAIL, type: 'jpeg', quality: 90});
      }
      await page.evaluate(() => {
        window.ownedVertices = window.strokeScene.deck.props.layers.find(
          layer => layer.id === 'routes'
        ).state.vertices;
        window.strokeScene.rebuildLayers();
      });
      await page.waitForTimeout(150);
      assert.equal(
        differentPixels(dashed, PNG.sync.read(await page.screenshot())),
        0,
        `${backend}: stable phase on redraw`
      );
      await page.evaluate(() => window.strokeScene.setDash({offset: 25}));
      await page.waitForTimeout(150);
      assert(
        differentPixels(dashed, PNG.sync.read(await page.screenshot())) > 100,
        `${backend}: phase moves the dashes`
      );
      await page.uncheck('#enabled');
      await page.waitForTimeout(150);
      const solid = PNG.sync.read(await page.screenshot());
      assert(differentPixels(dashed, solid) > 100, `${backend}: dash toggle changes coverage`);
      assert.equal(
        await page.evaluate(
          () =>
            window.ownedVertices ===
            window.strokeScene.deck.props.layers.find(layer => layer.id === 'routes').state.vertices
        ),
        true,
        `${backend}: dash uniforms reuse geometry`
      );
      await page.selectOption('#appearance', 'sketch');
      await page.waitForTimeout(150);
      const pencil = PNG.sync.read(
        await page.screenshot({path: join(tmpdir(), `styled-paths-pencil-${backend}.png`)})
      );
      assert(
        differentPixels(solid, pencil) > 100,
        `${backend}: shared pencil coverage changes the route ink`
      );
      await page.evaluate(() => {
        window.styleVertices = window.strokeScene.deck.props.layers.find(
          layer => layer.id === 'routes'
        ).state.vertices;
        window.strokeScene.setGrain(0);
      });
      await page.waitForTimeout(150);
      assert(
        differentPixels(pencil, PNG.sync.read(await page.screenshot())) > 30,
        `${backend}: grain affects pencil coverage`
      );
      assert(
        await page.evaluate(
          () =>
            window.styleVertices ===
            window.strokeScene.deck.props.layers.find(layer => layer.id === 'routes').state.vertices
        ),
        `${backend}: grain reuses geometry`
      );
      await page.evaluate(() => {
        window.strokeScene.setGrain(0.6);
        window.strokeScene.setRoutes(window.strokeScene.routes.slice(0, 2));
      });
      await page.waitForTimeout(150);
      const orderedPencil = PNG.sync.read(await page.screenshot());
      await page.evaluate(() =>
        window.strokeScene.setRoutes(window.strokeScene.routes.slice(0, 2).reverse())
      );
      await page.waitForTimeout(150);
      assert.equal(
        differentPixels(orderedPencil, PNG.sync.read(await page.screenshot())),
        0,
        `${backend}: feature order does not reseed pencil grain`
      );
      await page.evaluate(() => window.strokeScene.setRoutes(window.strokeScene.routes));
      await page.selectOption('#appearance', 'glow');
      await page.waitForTimeout(150);
      const luminous = PNG.sync.read(
        await page.screenshot({path: join(tmpdir(), `styled-paths-glow-${backend}.png`)})
      );
      await page.evaluate(() => {
        window.styleVertices = window.strokeScene.deck.props.layers.find(
          layer => layer.id === 'routes'
        ).state.vertices;
        window.strokeScene.setGlowIntensity(0);
      });
      await page.waitForTimeout(150);
      const unlit = PNG.sync.read(await page.screenshot());
      assert(
        differentPixels(luminous, unlit) > 100,
        `${backend}: glow adds visible radiance without bloom`
      );
      assert(
        await page.evaluate(
          () =>
            window.styleVertices ===
            window.strokeScene.deck.props.layers.find(layer => layer.id === 'routes').state.vertices
        ),
        `${backend}: intensity reuses geometry`
      );
      await page.evaluate(() => window.strokeScene.setGlowIntensity(0.8));
      await page.selectOption('#appearance', 'plain');
      await page.selectOption('#join', 'bevel');
      await page.selectOption('#cap', 'square');
      await page.locator('#width').focus();
      await page.keyboard.press('End');
      await page.waitForTimeout(150);
      assert(
        differentPixels(solid, PNG.sync.read(await page.screenshot())) > 100,
        `${backend}: geometry controls change stroke shape`
      );
      assert.equal(
        await page.evaluate(() => window.ownedVertices.destroyed),
        true,
        `${backend}: replaced geometry is released`
      );
      const picked = await page.evaluate(async () => {
        const scene = window.strokeScene;
        scene.setEnabled(true);
        scene.setDash({dashLength: 25, gapLength: 15, offset: 0});
        scene.setGeometryOptions({width: 14});
        scene.deck.setProps({
          initialViewState: {
            longitude: -74.006,
            latitude: 40.7128,
            zoom: 15.6,
            pitch: 0,
            bearing: 0
          }
        });
        await new Promise(resolve => setTimeout(resolve, 200));
        const layer = scene.deck.props.layers.find(layer => layer.id === 'routes');
        // South crossing runs east from -330: distances 330 and 350 are ink and gap.
        const inkPosition = layer.project([0, -265, 14]);
        const gapPosition = layer.project([20, -265, 14]);
        const ink = await scene.deck.pickObjectAsync({x: inkPosition[0], y: inkPosition[1]});
        const gap = await scene.deck.pickObjectAsync({x: gapPosition[0], y: gapPosition[1]});
        return {ink: ink?.object?.name, gap: gap?.object?.name};
      });
      assert.equal(picked.ink, 'South crossing', `${backend}: route picking`);
      assert.equal(picked.gap, 'South bridge', `${backend}: gaps pick the surface below`);
      await page.selectOption('#appearance', 'glow');
      const glowPicking = await page.evaluate(async () => {
        const scene = window.strokeScene;
        scene.setEnabled(false);
        await new Promise(resolve => setTimeout(resolve, 150));
        const layer = scene.deck.props.layers.find(layer => layer.id === 'routes');
        const center = layer.project([0, -265, 14]);
        const halo = layer.project([0, -247, 14]);
        const centerHit = await scene.deck.pickObjectAsync({x: center[0], y: center[1]});
        const haloHit = await scene.deck.pickObjectAsync({x: halo[0], y: halo[1]});
        scene.setGlowIntensity(0);
        await new Promise(resolve => setTimeout(resolve, 100));
        const disabledHit = await scene.deck.pickObjectAsync({x: center[0], y: center[1]});
        scene.setGlowIntensity(0.8);
        return {
          center: centerHit?.object?.name,
          halo: haloHit?.object?.name,
          disabled: disabledHit?.object?.name
        };
      });
      assert.equal(glowPicking.center, 'South crossing', `${backend}: glow core remains pickable`);
      assert.equal(glowPicking.halo, 'River', `${backend}: faint halo does not intercept picking`);
      assert.equal(
        glowPicking.disabled,
        'South bridge',
        `${backend}: invisible glow does not intercept picking`
      );
      const hidden = await page.evaluate(async () => {
        const scene = window.strokeScene;
        const district = scene.deck.props.layers.find(layer => layer.id === 'district');
        const building = district.props.features.find(feature => feature.kind === 'building');
        scene.setRoutes([
          {
            name: 'Hidden route',
            color: [1, 1, 1],
            path: [
              [building.center[0] - 5, building.center[1], 2],
              [building.center[0] + 5, building.center[1], 2]
            ]
          }
        ]);
        await new Promise(resolve => setTimeout(resolve, 150));
        const layer = scene.deck.props.layers.find(layer => layer.id === 'routes');
        const position = layer.project([building.center[0], building.center[1], 2]);
        const hit = await scene.deck.pickObjectAsync({x: position[0], y: position[1]});
        return {actual: hit?.object?.name, expected: building.name};
      });
      assert.equal(hidden.actual, hidden.expected, `${backend}: opaque roofs occlude glow picking`);
      await page.evaluate(() => window.strokeScene.setRoutes(window.strokeScene.routes));
      await page.evaluate(() => window.strokeScene.setGeometryOptions({width: 0}));
      await page.waitForTimeout(150);
      assert.equal(
        await page.evaluate(
          () =>
            window.strokeScene.deck.props.layers.find(layer => layer.id === 'routes').state.model
              .vertexCount
        ),
        0,
        `${backend}: zero width is empty`
      );
      await page.setViewportSize({width: 900, height: 650});
      await page.waitForFunction(() => window.strokeScene.deck.width === 900);
      await page.evaluate(() => {
        window.ownedVertices = window.strokeScene.deck.props.layers.find(
          layer => layer.id === 'routes'
        ).state.vertices;
        window.strokeScene.finalize();
        window.strokeScene.finalize();
      });
      assert.equal(
        await page.evaluate(() => window.ownedVertices.destroyed),
        true,
        `${backend}: finalization releases owned geometry`
      );
      assert.equal(
        await page.evaluate(() => window.strokeScene.diagnostics.error),
        '',
        `${backend}: Deck layer errors`
      );
      assert.deepEqual(errors, [], `${backend}: GPU and browser errors`);
      console.log(
        `${backend}: caps, joins, dashes, pencil grain, stable seeds, additive glow, halo picking, depth, resize, zero width, reuse and cleanup passed`
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}

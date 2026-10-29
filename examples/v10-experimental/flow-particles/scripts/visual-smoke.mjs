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
import {
  setVisualTestPixelScale,
  captureVisualTestScreenshot,
  assertRejectedWebGPUFallback
} from '../../../../scripts/playwright/visual-test-utils.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const server = await createServer({root, logLevel: 'error', server: {host: '127.0.0.1', port: 0}});
await server.listen();
function changedPixels(first, second) {
  let count = 0;
  for (let vertical = 0; vertical < first.height; vertical++) {
    for (let horizontal = 300; horizontal < first.width; horizontal++) {
      const offset = (vertical * first.width + horizontal) * 4;
      if (
        [0, 1, 2].some(
          channel => Math.abs(first.data[offset + channel] - second.data[offset + channel]) > 12
        )
      )
        count++;
    }
  }
  return count;
}
function countParticlePixels(image) {
  let count = 0;
  for (let vertical = 0; vertical < image.height; vertical++) {
    for (let horizontal = 300; horizontal < image.width; horizontal++) {
      const offset = (vertical * image.width + horizontal) * 4;
      const [red, green, blue] = image.data.subarray(offset, offset + 3);
      if (green > 100 && green > red * 1.4 && blue > red * 1.2) count++;
    }
  }
  return count;
}
try {
  for (const backend of process.env.FLOW_BACKEND
    ? [process.env.FLOW_BACKEND]
    : ['webgpu', 'webgl']) {
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
      const page = await browser.newPage({viewport: {width: 1100, height: 800}});
      const captureScreenshot = options => captureVisualTestScreenshot(page, options);
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
        `${process.env.FLOW_EXAMPLE_URL || server.resolvedUrls.local[0]}?backend=${backend}`
      );
      await page.waitForFunction(() => document.body.dataset.ready === 'true', undefined, {
        timeout: 60_000
      });
      await setVisualTestPixelScale(page, 'flowScene', process.env.FLOW_THUMBNAIL ? 1 : undefined);
      try {
        await page.waitForFunction(() => window.flowScene?.diagnostics.frames >= 8);
      } catch (error) {
        console.error(
          await page.evaluate(() => ({
            diagnostics: window.flowScene?.diagnostics,
            status: document.querySelector('#status')?.textContent,
            animate: window.flowScene?.deck.props._animate
          }))
        );
        await captureScreenshot({path: join(tmpdir(), `flow-failure-${backend}.png`)});
        throw error;
      }
      assert.equal(
        await page.evaluate(() => window.flowScene.diagnostics.backend),
        backend,
        `${backend}: requested backend is active`
      );
      const frameSynchronization = await page.evaluate(async () => {
        const scene = window.flowScene;
        const originalAfterRender = scene.deck.props.onAfterRender;
        const mismatches = [];
        let samples = 0;
        await new Promise(resolve => {
          scene.deck.setProps({
            onAfterRender: context => {
              originalAfterRender(context);
              const layer = scene.deck.layerManager
                .getLayers()
                .find(candidate => candidate.id === 'particles');
              if (layer?.state?.model) {
                const bindings = layer.state.model.bindings;
                if (
                  bindings.flowState !== scene.particles.texture ||
                  bindings.flowPreviousState !== scene.particles.previousTexture
                )
                  mismatches.push(samples);
                samples++;
              }
              if (samples >= 12) resolve();
            }
          });
        });
        scene.deck.setProps({onAfterRender: originalAfterRender});
        return {samples, mismatches};
      });
      assert.deepEqual(
        frameSynchronization.mismatches,
        [],
        `${backend}: rendered state matches this frame's simulation`
      );
      const moving = PNG.sync.read(await captureScreenshot());
      await page.waitForTimeout(500);
      assert(
        changedPixels(moving, PNG.sync.read(await captureScreenshot())) > 200,
        `${backend}: particles move`
      );
      await page.uncheck('#playing');
      await page.waitForTimeout(100);
      const paused = PNG.sync.read(
        await captureScreenshot({path: join(tmpdir(), `flow-particles-${backend}.png`)})
      );
      await page.waitForTimeout(250);
      assert.equal(
        changedPixels(paused, PNG.sync.read(await captureScreenshot())),
        0,
        `${backend}: pause freezes particles`
      );
      // At the oblique default camera angle, the river must not hide the tail behind its surface.
      await page.evaluate(() => window.flowScene.setTrail(0));
      await page.waitForTimeout(150);
      const shortTrails = countParticlePixels(PNG.sync.read(await captureScreenshot()));
      await page.evaluate(() => window.flowScene.setTrail(6));
      await page.waitForTimeout(150);
      const longTrails = countParticlePixels(PNG.sync.read(await captureScreenshot()));
      assert(
        longTrails > shortTrails * 2,
        `${backend}: long trails remain visible above the river (${longTrails} vs ${shortTrails} pixels)`
      );
      if (process.env.FLOW_THUMBNAIL && backend === 'webgpu')
        await captureScreenshot({path: process.env.FLOW_THUMBNAIL, type: 'jpeg', quality: 90});
      await page.evaluate(() => {
        window.borrowedFieldTexture = window.flowScene.fieldAtlas.texture;
        window.originalSimulation = window.flowScene.simulation;
        const district = window.flowScene.deck.layerManager
          .getLayers()
          .find(layer => layer.id === 'buildings');
        window.districtModel = district.state.model;
        window.districtVertices = district.state.vertices;
      });
      await page.selectOption('#field', 'changing');
      await page.uncheck('#northern-section');
      await page.check('#northern-section');
      assert.equal(
        await page.evaluate(() => window.flowScene.simulation === window.originalSimulation),
        true,
        `${backend}: field edits preserve simulation`
      );
      await page.check('#playing');
      const firstFieldUpdate = await page.evaluate(() => window.flowScene.diagnostics.fieldUpdates);
      await page.waitForFunction(
        first => window.flowScene.diagnostics.fieldUpdates >= first + 2,
        firstFieldUpdate
      );
      await page.uncheck('#playing');
      await page.waitForTimeout(100);
      const pausedField = await page.evaluate(() => ({
        time: window.flowScene.diagnostics.fieldTime,
        updates: window.flowScene.diagnostics.fieldUpdates
      }));
      await page.waitForTimeout(250);
      assert.deepEqual(
        await page.evaluate(() => ({
          time: window.flowScene.diagnostics.fieldTime,
          updates: window.flowScene.diagnostics.fieldUpdates
        })),
        pausedField,
        `${backend}: pause freezes the changing field`
      );
      await page.click('#reset');
      await page.waitForTimeout(100);
      const firstReset = PNG.sync.read(await captureScreenshot());
      await page.click('#reset');
      await page.waitForTimeout(100);
      assert.equal(
        changedPixels(firstReset, PNG.sync.read(await captureScreenshot())),
        0,
        `${backend}: reset restores seeded particles and field time`
      );
      assert.equal(await page.evaluate(() => window.flowScene.diagnostics.fieldTime), 0);
      await page.selectOption('#field', 'river');
      for (const count of process.env.FLOW_RUN_TIMING === 'true' && !process.env.FLOW_SKIP_TIMING
        ? [2048, 8192, 32768]
        : []) {
        await page.selectOption('#count', String(count));
        await page.check('#playing');
        const timing = await page.evaluate(async () => {
          const scene = window.flowScene;
          const start = performance.now();
          const firstFrame = scene.diagnostics.frames;
          await new Promise(resolve => {
            function poll() {
              if (scene.diagnostics.frames >= firstFrame + 30) resolve();
              else requestAnimationFrame(poll);
            }
            poll();
          });
          return {
            millisecondsPerFrame:
              (performance.now() - start) / (scene.diagnostics.frames - firstFrame),
            stateBytes: scene.simulation.byteLength,
            submissionMilliseconds: scene.diagnostics.submissionMilliseconds
          };
        });
        console.log(`${backend} ${count} particles: ${JSON.stringify(timing)}`);
        await page.uncheck('#playing');
      }
      await page.selectOption('#field', 'eddies');
      await page.selectOption('#field', 'missing');
      await page.selectOption('#field', 'river');
      for (const count of ['8192', '32768', '2048']) {
        await page.selectOption('#count', count);
        assert.equal(
          await page.evaluate(() => window.flowScene.simulation.particleCount),
          Number(count),
          `${backend}: density control rebuilds the simulation`
        );
      }
      assert.equal(
        await page.evaluate(
          () =>
            window.flowScene.fieldAtlas.texture === window.borrowedFieldTexture &&
            !window.borrowedFieldTexture.destroyed
        ),
        true,
        `${backend}: field texture survives pattern and density changes`
      );
      await page.evaluate(async () => {
        const scene = window.flowScene;
        scene.deck.setProps({
          initialViewState: {
            longitude: -74.006,
            latitude: 40.7128,
            zoom: 15.6,
            pitch: 0,
            bearing: 0
          }
        });
        const data = new Float32Array(scene.simulation.width * scene.simulation.height * 4);
        for (let index = 0; index < data.length / 4; index++) data[index * 4 + 2] = -1;
        data.set([0.5, 0.5, 1, 0], 0);
        data.set([0.5, (275 + 620) / 1240, 1, 0], 4);
        scene.particles.texture.writeData(data);
        scene.particles.previousTexture.writeData(data);
        scene.setWidth(8);
        scene.deck.redraw('controlled particle picking');
      });
      await page.waitForTimeout(200);
      await captureScreenshot({path: join(tmpdir(), `flow-picking-${backend}.png`)});
      const picked = await page.evaluate(async () => {
        const scene = window.flowScene;
        const layer = scene.deck.layerManager.getLayers().find(layer => layer.id === 'particles');
        const center = layer.project([0, 0, 1]);
        const bridge = layer.project([0, 275, 1]);
        const visible = await scene.deck.pickObjectAsync({x: center[0], y: center[1], radius: 3});
        const hidden = await scene.deck.pickObjectAsync({x: bridge[0], y: bridge[1], radius: 3});
        window.borrowedParticleTexture = scene.particles.texture;
        return {
          visibleLayer: visible?.layer?.id,
          visibleId: visible?.object?.id,
          hiddenLayer: hidden?.layer?.id,
          hiddenName: hidden?.object?.name
        };
      });
      assert.equal(picked.visibleLayer, 'particles', `${backend}: picks a particle`);
      assert.equal(picked.visibleId, 0, `${backend}: stable particle ID`);
      assert.equal(picked.hiddenLayer, 'buildings', `${backend}: bridge occlusion`);
      assert.equal(picked.hiddenName, 'North bridge');
      assert(
        await page.evaluate(() => {
          const district = window.flowScene.deck.layerManager
            .getLayers()
            .find(layer => layer.id === 'buildings');
          return (
            district.state.model === window.districtModel &&
            district.state.vertices === window.districtVertices
          );
        }),
        `${backend}: particle controls and navigation reuse district geometry`
      );
      await page.evaluate(() => window.flowScene.deck.setProps({layers: []}));
      await page.waitForTimeout(100);
      assert.equal(
        await page.evaluate(() => window.borrowedParticleTexture.destroyed),
        false,
        `${backend}: layer borrows textures`
      );
      assert(
        await page.evaluate(
          () => window.districtModel._destroyed && window.districtVertices.destroyed
        ),
        `${backend}: removing district releases its model and geometry`
      );
      await page.evaluate(() => {
        window.flowScene.finalize();
        window.flowScene.finalize();
      });
      assert.equal(
        await page.evaluate(() => window.borrowedParticleTexture.destroyed),
        true,
        `${backend}: simulation owns textures`
      );
      assert.equal(
        await page.evaluate(() => window.borrowedFieldTexture.destroyed),
        true,
        `${backend}: application owns field texture`
      );
      assert.deepEqual(errors, [], `${backend}: browser/GPU errors`);
      console.log(
        `${backend}: animation, pause, fields, density, picking, occlusion, ownership and cleanup passed`
      );
      if (backend === 'webgl') {
        await assertRejectedWebGPUFallback(
          browser,
          process.env.FLOW_EXAMPLE_URL || server.resolvedUrls.local[0],
          'flowScene'
        );
        console.log('Default backend: rejected WebGPU adapter fallback passed');
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}

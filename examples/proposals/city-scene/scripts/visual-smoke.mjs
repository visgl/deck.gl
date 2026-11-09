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
import {setVisualTestPixelScale} from '../../../../scripts/playwright/visual-test-utils.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const softwareGpu = process.env.CITY_SCENE_HARDWARE !== 'true';
// Set CITY_SCENE_DEVICE_SCALE=1 to compare against the original framebuffer resolution.
// Full-resolution reflection history can take longer on shared software-rendered CI workers.
const reflectionIdleTimeout = softwareGpu ? 180_000 : 60_000;
const server = await createServer({root, logLevel: 'error', server: {host: '127.0.0.1', port: 0}});
await server.listen();
const url = server.resolvedUrls?.local[0];
assert(url);
try {
  for (const backend of ['webgpu', 'webgl']) {
    // The SSR phase uses one sixteenth of the original pixels. WebGL water needs half size.
    const pixelScaleFactor = Number(
      process.env.CITY_SCENE_DEVICE_SCALE ?? (backend === 'webgpu' ? 0.25 : 0.5)
    );
    assert(pixelScaleFactor > 0 && Number.isFinite(pixelScaleFactor));
    const browser = await chromium.launch(
      getPlaywrightLaunchOptions({
        headless: true,
        backend,
        softwareGpu,
        // Linux canvas presentation needs the Vulkan compositor and an X display (see #2874).
        launchOptions:
          process.platform === 'linux' && backend === 'webgpu'
            ? {args: ['--enable-gpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader']}
            : {}
      })
    );
    try {
      const page = await browser.newPage({
        viewport: {width: 1200, height: 850},
        deviceScaleFactor: 1
      });
      // Pixel assertions use CSS coordinates, independent of framebuffer resolution.
      const captureScreenshot = options => page.screenshot({...options, scale: 'css'});
      const waitForIdle = () =>
        page.waitForFunction(
          () => !window.cityScene.deck.props._animate && !window.cityScene.deck.needsRedraw(),
          undefined,
          {timeout: reflectionIdleTimeout}
        );
      const errors = [];
      page.on('pageerror', error => {
        errors.push(error.message);
        process.stderr.write(`${error.message}\n`);
      });
      page.on('console', message => {
        if (message.type() === 'error') {
          errors.push(message.text());
          process.stderr.write(`${message.text()}\n`);
        }
      });
      await page.goto(`${process.env.CITY_SCENE_URL || url}?backend=${backend}`);
      await page.waitForFunction(() => document.body.dataset.ready === 'true', undefined, {
        timeout: 60_000
      });
      await page.waitForFunction(() => window.cityScene?.diagnostics.frames > 0);
      await setVisualTestPixelScale(page, 'cityScene', pixelScaleFactor);
      assert.equal(await page.evaluate(() => window.cityScene.diagnostics.backend), backend);
      assert.deepEqual(
        await page.evaluate(
          () =>
            window.cityScene.deck.props.layers.find(layer => layer?.id === 'river-water')?.props
              .flowDirection
        ),
        [0, 1],
        `${backend}: river flow follows its north-south footprint axis`
      );
      await page.waitForFunction(() => window.cityScene.diagnostics.timeSeconds > 0);
      const playingWaterImage = PNG.sync.read(
        await captureScreenshot({
          path: join(
            process.env.CITY_SCENE_ARTIFACTS ?? tmpdir(),
            `city-scene-${backend}-playing.png`
          )
        })
      );
      await page.waitForTimeout(650);
      const movingWaterImage = PNG.sync.read(await captureScreenshot());
      let animatedWaterPixels = 0;
      for (let vertical = 120; vertical < 650; vertical++) {
        for (let horizontal = 350; horizontal < 950; horizontal++) {
          const offset = (vertical * playingWaterImage.width + horizontal) * 4;
          const colorDifference = Math.max(
            Math.abs(playingWaterImage.data[offset] - movingWaterImage.data[offset]),
            Math.abs(playingWaterImage.data[offset + 1] - movingWaterImage.data[offset + 1]),
            Math.abs(playingWaterImage.data[offset + 2] - movingWaterImage.data[offset + 2])
          );
          if (colorDifference > 3) animatedWaterPixels++;
        }
      }
      assert(
        animatedWaterPixels > 100,
        `${backend}: water visibly moves during playback (${animatedWaterPixels} pixels)`
      );
      if (backend === 'webgpu') {
        assert(
          await page.evaluate(
            () =>
              window.cityScene.deck.props.effects.find(
                effect => effect.id === 'city-river-reflections'
              ).historyFrames > 1
          ),
          'SSR accumulates successive frames'
        );
      }
      await page.click('#playback');
      await page.mouse.move(1190, 840);
      const pausedTime = await page.evaluate(() => window.cityScene.diagnostics.timeSeconds);
      await waitForIdle();
      assert.equal(
        await page.evaluate(() => window.cityScene.diagnostics.timeSeconds),
        pausedTime,
        'settling reflections never advances paused water'
      );
      await page.waitForTimeout(150);
      const pausedFrames = await page.evaluate(() => window.cityScene.diagnostics.frames);
      await page.waitForTimeout(150);
      assert.equal(
        await page.evaluate(() => window.cityScene.diagnostics.frames),
        pausedFrames,
        `${backend}: pause stops drawing`
      );
      if (backend === 'webgpu') {
        const restartedHistoryFrames = await page.evaluate(() => {
          window.cityScene.setTime(2);
          const frames = window.cityScene.deck.props.effects.find(
            effect => effect.id === 'city-river-reflections'
          ).historyFrames;
          window.cityScene.setReflectionDebugMode(1);
          return frames;
        });
        assert.equal(restartedHistoryFrames, 1, 'time reset starts fresh reflection history');
        await waitForIdle();
        const settled = await page.evaluate(() => {
          const effect = window.cityScene.deck.props.effects.find(
            effect => effect.id === 'city-river-reflections'
          );
          return {
            frames: effect.historyFrames,
            budget: effect.settlingFrameCount,
            time: window.cityScene.diagnostics.timeSeconds
          };
        });
        assert(
          settled.frames >= settled.budget && settled.frames <= settled.budget + 2,
          'reset settles within the quality-derived frame budget'
        );
        assert.equal(settled.time, 2, 'time reset stays exact during accumulation');
        const settledFrames = await page.evaluate(() => window.cityScene.diagnostics.frames);
        await page.waitForTimeout(150);
        assert.equal(
          await page.evaluate(() => window.cityScene.diagnostics.frames),
          settledFrames,
          'reset returns to idle after settling'
        );
        const reflections = PNG.sync.read(
          await captureScreenshot({
            path: join(process.env.CITY_SCENE_ARTIFACTS ?? tmpdir(), 'city-scene-reflections.png')
          })
        );
        let reflectedPixels = 0;
        for (let vertical = 120; vertical < 650; vertical++) {
          for (let horizontal = 350; horizontal < 950; horizontal++) {
            const offset = (vertical * reflections.width + horizontal) * 4;
            if (Math.max(...reflections.data.subarray(offset, offset + 3)) > 8) reflectedPixels++;
          }
        }
        assert(
          reflectedPixels > 1000,
          `SSR traces visible scene reflections (${reflectedPixels} pixels)`
        );
        // Temporal noise suppression is exercised with a 3x3 GPU fixture in
        // ssr-camera-temporal.spec.ts; keep scene capture/composition coverage here.

        // Quality switches replace only postprocessing targets, retaining shared scene capture.
        for (const [quality, scale] of [
          ['fast', 0.25],
          ['detailed', 1],
          ['balanced', 0.5]
        ]) {
          await page.evaluate(() => {
            const effect = window.cityScene.deck.props.effects.find(
              effect => effect.id === 'city-river-reflections'
            );
            window.previousReflectionTexture =
              effect.renderer.passRenderers[0].renderTargets.ssrRaw.texture;
            window.previousCaptureTexture = effect.capture.getFrame('city').buffer.colorTexture;
          });
          await page.selectOption('#reflection-quality', quality);
          const targets = await page.evaluate(() => {
            const effect = window.cityScene.deck.props.effects.find(
              effect => effect.id === 'city-river-reflections'
            );
            const capture = effect.capture.getFrame('city').buffer;
            const targets = effect.renderer.passRenderers[0].renderTargets;
            return {
              released: window.previousReflectionTexture.destroyed,
              captureReused: capture.colorTexture === window.previousCaptureTexture,
              width: targets.ssrRaw.texture.width,
              expectedWidth: capture.width,
              historyWidth: targets.ssrHistoryDepth.texture.width,
              historyFrames: effect.historyFrames,
              settlingFrameCount: effect.settlingFrameCount
            };
          });
          assert(targets.released, `${quality}: switching quality releases old reflection targets`);
          assert(targets.captureReused, `${quality}: quality reuses scene capture`);
          assert.equal(targets.width, Math.max(1, Math.ceil(targets.expectedWidth * scale)));
          assert.equal(
            targets.historyWidth,
            targets.expectedWidth,
            'camera depth history remains full resolution'
          );
          assert(
            targets.historyFrames >= 1 && targets.historyFrames <= targets.settlingFrameCount + 2,
            'quality starts fresh history'
          );
          await waitForIdle();
          const qualityFrames = await page.evaluate(() => window.cityScene.diagnostics.frames);
          await page.waitForTimeout(100);
          assert.equal(
            await page.evaluate(() => window.cityScene.diagnostics.frames),
            qualityFrames,
            `${quality}: returns to idle after bounded settling`
          );
          assert.equal(
            await page.evaluate(() => window.cityScene.diagnostics.timeSeconds),
            2,
            `${quality}: water time remains frozen`
          );
          const qualityImage = PNG.sync.read(await captureScreenshot());
          let litPixels = 0;
          for (let vertical = 120; vertical < 650; vertical++)
            for (let horizontal = 350; horizontal < 950; horizontal++) {
              const offset = (vertical * qualityImage.width + horizontal) * 4;
              if (Math.max(...qualityImage.data.subarray(offset, offset + 3)) > 8) litPixels++;
            }
          assert(litPixels > 1000, `${quality}: produces visible reflection radiance`);
        }

        const captureBeforeViews = await page.evaluate(() => {
          window.captureBeforeViews = window.cityScene.deck.props.effects
            .find(effect => effect.id === 'city-river-reflections')
            .capture.getFrame('city').buffer;
          return window.cityScene.diagnostics.timeSeconds;
        });
        await page.selectOption('#reflection-view', '3');
        const fallbackImage = PNG.sync.read(
          await captureScreenshot({
            path: join(
              process.env.CITY_SCENE_ARTIFACTS ?? tmpdir(),
              'city-scene-material-fallback.png'
            )
          })
        );
        await page.selectOption('#reflection-view', '2');
        const coverageImage = PNG.sync.read(
          await captureScreenshot({
            path: join(
              process.env.CITY_SCENE_ARTIFACTS ?? tmpdir(),
              'city-scene-reflection-coverage.png'
            )
          })
        );
        await page.selectOption('#reflection-view', '0');
        const combinedImage = PNG.sync.read(await captureScreenshot());
        const sampleColumns = await page.evaluate(() => {
          const deck = window.cityScene.deck;
          const viewport = deck.getViewports()[0];
          const columns = [];
          for (const longitudeOffset of [-0.0003, 0, 0.0003]) {
            const samples = [];
            for (let latitudeIndex = -8; latitudeIndex <= 8; latitudeIndex++) {
              const [horizontal, vertical] = viewport.project([
                -74.006 + longitudeOffset,
                40.7128 + latitudeIndex * 0.0004
              ]);
              if (horizontal < 350 || horizontal >= 950 || vertical < 120 || vertical >= 650)
                continue;
              samples.push([Math.floor(horizontal), Math.floor(vertical)]);
            }
            columns.push(samples);
          }
          return columns;
        });
        let fallbackSamples = 0;
        for (const samples of sampleColumns) {
          for (const [horizontal, vertical] of samples) {
            const offset = (vertical * coverageImage.width + horizontal) * 4;
            // Exact zero-confidence debug color: this ray has no reliable screen-space contribution.
            if (
              coverageImage.data[offset] !== 11 ||
              coverageImage.data[offset + 1] !== 20 ||
              coverageImage.data[offset + 2] !== 56
            )
              continue;
            // Filter confidence on the CPU before paying for a GPU picking pass.
            const isWater = await page.evaluate(
              async ([x, y]) =>
                (await window.cityScene.deck.pickObjectAsync({x, y}))?.object?.kind === 'water',
              [horizontal, vertical]
            );
            if (!isWater) continue;
            fallbackSamples++;
            for (const channel of [0, 1, 2])
              assert(
                Math.abs(
                  combinedImage.data[offset + channel] - fallbackImage.data[offset + channel]
                ) <= 3,
                'unresolved water reflections retain the material fallback'
              );
            break; // One verified water sample per spatially separated column.
          }
        }
        assert(
          fallbackSamples > 0,
          'sample visible water with zero screen-space reflection confidence'
        );
        assert(
          countSceneDifferences(fallbackImage, combinedImage) > 100,
          'scene reflections contribute beyond the sky material fallback'
        );
        assert(
          countSceneDifferences(coverageImage, combinedImage) > 1000,
          'coverage view distinguishes reflection confidence from the final image'
        );
        assert.equal(
          await page.evaluate(() => window.cityScene.diagnostics.timeSeconds),
          captureBeforeViews,
          'debug views preserve the paused clock'
        );
        assert(
          await page.evaluate(
            () =>
              window.captureBeforeViews ===
              window.cityScene.deck.props.effects
                .find(effect => effect.id === 'city-river-reflections')
                .capture.getFrame('city').buffer
          ),
          'debug views reuse capture targets'
        );

        await page.evaluate(() => {
          window.cityScene.setReflectionDebugMode(0);
          window.reflectionTexture = window.cityScene.deck.props.effects
            .find(effect => effect.id === 'city-river-reflections')
            .capture.getFrame('city').buffer.normalRoughnessTexture;
        });
        await page.evaluate(() => window.cityScene.setTime(2));
        assert(
          await page.evaluate(() => window.cityScene.deck.props._animate),
          'reset starts bounded reflection drawing'
        );
        await page.uncheck('#reflections');
        assert(
          !(await page.evaluate(() => window.cityScene.deck.props._animate)),
          'disabling reflections cancels settling'
        );
        await page.waitForTimeout(150);
        assert.equal(
          await page.evaluate(() => window.reflectionTexture.destroyed),
          true,
          'disabling SSR releases auxiliary textures'
        );
        assert(
          await page.locator('#reflection-view').isDisabled(),
          'disabling SSR disables its debug views'
        );
        const withoutReflections = PNG.sync.read(await captureScreenshot());
        assert(
          countSceneDifferences(fallbackImage, withoutReflections) < 1000,
          'material fallback agrees with ordinary rendering when SSR is disabled'
        );
        await page.check('#reflections');
        await page.waitForFunction(() =>
          window.cityScene.deck.props.effects
            .find(effect => effect.id === 'city-river-reflections')
            ?.capture.getFrame('city')
        );
        await waitForIdle();
        assert.equal(
          await page.evaluate(
            () =>
              window.cityScene.deck.props.effects
                .find(effect => effect.id === 'city-river-reflections')
                .capture.getFrame('city').buffer.normalRoughnessTexture.destroyed
          ),
          false,
          'enabling SSR recreates auxiliary textures'
        );
        const cameraChange = await page.evaluate(() => {
          const scene = window.cityScene;
          const effect = scene.deck.props.effects.find(
            effect => effect.id === 'city-river-reflections'
          );
          const longitude = scene.deck.getViewports()[0].longitude + 0.000005;
          const before = {frames: effect.frameCount, budget: effect.settlingFrameCount, longitude};
          scene.deck.props.onViewStateChange({
            viewState: {...scene.deck.props.viewState, longitude}
          });
          return before;
        });
        await page.waitForFunction(
          longitude => window.cityScene.deck.getViewports()[0].longitude === longitude,
          cameraChange.longitude
        );
        await waitForIdle();
        const cameraFrames = await page.evaluate(
          () =>
            window.cityScene.deck.props.effects.find(
              effect => effect.id === 'city-river-reflections'
            ).frameCount
        );
        assert(
          cameraFrames - cameraChange.frames >= cameraChange.budget &&
            cameraFrames - cameraChange.frames <= cameraChange.budget + 2,
          'a small camera move schedules bounded settling without an explicit reset'
        );
        assert.equal(
          await page.evaluate(() => window.cityScene.diagnostics.timeSeconds),
          2,
          'camera settling keeps water paused'
        );
      } else {
        assert(
          await page.locator('#reflection-quality').isDisabled(),
          'WebGL disables reflection quality'
        );
        assert(
          await page.locator('#reflection-view').isDisabled(),
          'WebGL retains sky material and disables SSR views'
        );
        assert(
          await page.locator('#reflections').isDisabled(),
          'WebGL clearly disables the WebGPU reflection pass'
        );
      }
      // Picking and borrowed-buffer ownership do not consume reflection history.
      // Reflection composition and convergence were checked above; resize checks re-enable it.
      if (backend === 'webgpu') await page.uncheck('#reflections');
      await page.selectOption('#camera', 'overhead');
      await page.waitForFunction(() => window.cityScene.deck.getViewports()[0].pitch === 0);
      await waitForIdle();
      await captureScreenshot({
        path: join(
          process.env.CITY_SCENE_ARTIFACTS ?? tmpdir(),
          `city-scene-${backend}-overhead.png`
        )
      });
      const picked = await page.evaluate(async () => {
        const position = window.cityScene.getFeatureScreenPosition('East 4.1');
        if (!position) throw new Error('Missing fixture building');
        const info = await window.cityScene.deck.pickObjectAsync({x: position[0], y: position[1]});
        return info?.object?.name;
      });
      assert.equal(picked, 'East 4.1', `${backend}: geographic roof picking`);
      const position = await page.evaluate(() =>
        window.cityScene.getFeatureScreenPosition('East 4.1')
      );
      assert(position);
      await page.mouse.click(position[0], position[1]);
      await page.waitForFunction(() => window.cityScene.diagnostics.selected === 'East 4.1');
      const neighborhood = await page.evaluate(async () => {
        const position = window.cityScene.getFeatureScreenPosition('East 4.1');
        const hits = await window.cityScene.deck.pickObjectsAsync({
          x: position[0] - 5,
          y: position[1] - 9,
          width: 10,
          height: 18
        });
        return hits.map(hit => hit.object?.name);
      });
      assert(neighborhood.includes('East 4.1'), `${backend}: multi-row picking readback`);
      const framesBeforeReplacement = await page.evaluate(
        () => window.cityScene.diagnostics.frames
      );
      await page.uncheck('#buildings');
      await page.waitForFunction(
        previousFrames =>
          window.cityScene.diagnostics.frames > previousFrames &&
          window.cityScene.deck.props.layers.find(layer => layer?.id === 'city-mesh').isLoaded,
        framesBeforeReplacement
      );
      const replacement = await page.evaluate(async () => {
        const scene = window.cityScene;
        const position = scene.deck.getViewports()[0].project([-74.006, 40.7128]);
        const info = await scene.deck.pickObjectAsync({x: position[0], y: position[1]});
        return info?.object?.kind;
      });
      assert.equal(replacement, 'water', `${backend}: river picking after layer replacement`);
      const bridge = await page.evaluate(async () => {
        const position = window.cityScene.getFeatureScreenPosition('North bridge');
        const info = await window.cityScene.deck.pickObjectAsync({x: position[0], y: position[1]});
        return info?.object?.kind;
      });
      assert.equal(bridge, 'bridge', `${backend}: bridge occludes the water surface`);
      await page.evaluate(() => {
        window.borrowedWaterPositions = window.cityScene.deck.props.layers.find(
          layer => layer?.id === 'river-water'
        ).props.positions;
      });
      await page.uncheck('#water');
      await page.waitForTimeout(100);
      assert.equal(
        await page.evaluate(() => window.borrowedWaterPositions.destroyed),
        false,
        'removing water preserves borrowed positions'
      );
      await page.check('#water');
      await page.waitForFunction(() =>
        window.cityScene.deck.props.layers.some(layer => layer?.id === 'river-water')
      );
      await page.check('#buildings');
      await page.selectOption('#camera', 'waterfront');
      await page.waitForFunction(() => window.cityScene.deck.getViewports()[0].pitch === 68);
      if (backend === 'webgpu') await page.check('#reflections');
      const timeBeforeResize = await page.evaluate(() => window.cityScene.diagnostics.timeSeconds);
      await page.setViewportSize({width: 1000, height: 720});
      await page.waitForFunction(() => window.cityScene.deck.width === 1000);
      await waitForIdle();
      assert.equal(
        await page.evaluate(() => window.cityScene.diagnostics.timeSeconds),
        timeBeforeResize,
        'resize settles without advancing water'
      );
      await page.selectOption('#camera', 'district');
      await page.waitForFunction(() => window.cityScene.deck.getViewports()[0].pitch === 52);
      await page.mouse.move(990, 710);
      // Test material replay independently of SSR's intentionally stochastic redraw history.
      if (backend === 'webgpu') await page.uncheck('#reflections');
      // Fine water-normal changes need the previous resolution; keep their thresholds intact.
      await setVisualTestPixelScale(page, 'cityScene', Math.max(0.5, pixelScaleFactor));
      await waitForIdle();
      await page.evaluate(() => window.cityScene.setTime(2));
      await page.waitForTimeout(100);
      await page.evaluate(
        () => document.activeElement instanceof HTMLElement && document.activeElement.blur()
      );
      const firstWaterImage = PNG.sync.read(await captureScreenshot());
      await page.evaluate(() => {
        const deck = window.cityScene.deck;
        const water = deck.props.layers.find(layer => layer?.id === 'river-water');
        window.waterMaterialBeforeSky = water.props.material;
        window.waterModelBeforeSky = water.state.model;
        deck.setProps({
          layers: deck.props.layers.map(layer =>
            layer === water
              ? water.clone({material: {...water.props.material, skyZenithColor: [1, 0.05, 0.05]}})
              : layer
          )
        });
      });
      await waitForIdle();
      const customSkyImage = PNG.sync.read(await captureScreenshot());
      assert(
        countSceneDifferences(firstWaterImage, customSkyImage) > 100,
        `${backend}: custom sky color changes the material fallback`
      );
      await page.evaluate(() => {
        const deck = window.cityScene.deck;
        const water = deck.props.layers.find(layer => layer?.id === 'river-water');
        deck.setProps({
          layers: deck.props.layers.map(layer =>
            layer === water ? water.clone({material: window.waterMaterialBeforeSky}) : layer
          )
        });
      });
      await waitForIdle();
      const restoredSkyImage = PNG.sync.read(await captureScreenshot());
      assert.equal(
        countSceneDifferences(firstWaterImage, restoredSkyImage),
        0,
        `${backend}: removing the custom sky prop restores default shading`
      );
      assert(
        await page.evaluate(
          () =>
            window.waterModelBeforeSky ===
            window.cityScene.deck.props.layers.find(layer => layer?.id === 'river-water').state
              .model
        ),
        `${backend}: sky updates reuse the water model`
      );

      await page.selectOption('#water-preset', 'slate');
      await page.waitForTimeout(100);
      assert.equal(await page.locator('#water-color').inputValue(), '#67747a');
      const slateWaterImage = PNG.sync.read(await captureScreenshot());
      let slateChangedPixels = 0;
      for (let vertical = 120; vertical < 650; vertical++) {
        for (let horizontal = 350; horizontal < 950; horizontal++) {
          const offset = (vertical * firstWaterImage.width + horizontal) * 4;
          if (
            Math.abs(firstWaterImage.data[offset] - slateWaterImage.data[offset]) > 3 ||
            Math.abs(firstWaterImage.data[offset + 1] - slateWaterImage.data[offset + 1]) > 3 ||
            Math.abs(firstWaterImage.data[offset + 2] - slateWaterImage.data[offset + 2]) > 3
          ) {
            slateChangedPixels++;
          }
        }
      }
      assert(
        slateChangedPixels > 1000,
        `${backend}: slate preset changes water tint (${slateChangedPixels} pixels)`
      );
      await page.selectOption('#water-preset', 'teal');
      await page.waitForTimeout(100);
      await page.locator('#water-color').evaluate(input => {
        input.value = '#d47a24';
        input.dispatchEvent(new Event('input', {bubbles: true}));
      });
      await page.waitForTimeout(100);
      const coloredWaterImage = PNG.sync.read(await captureScreenshot());
      let colorChangedPixels = 0;
      for (let vertical = 120; vertical < 650; vertical++) {
        for (let horizontal = 350; horizontal < 950; horizontal++) {
          const offset = (vertical * firstWaterImage.width + horizontal) * 4;
          if (
            Math.abs(firstWaterImage.data[offset] - coloredWaterImage.data[offset]) > 3 ||
            Math.abs(firstWaterImage.data[offset + 1] - coloredWaterImage.data[offset + 1]) > 3 ||
            Math.abs(firstWaterImage.data[offset + 2] - coloredWaterImage.data[offset + 2]) > 3
          ) {
            colorChangedPixels++;
          }
        }
      }
      assert(
        colorChangedPixels > 1000,
        `${backend}: river color selector changes water appearance (${colorChangedPixels} pixels)`
      );
      await page.locator('#water-color').evaluate(input => {
        input.value = '#0b4252';
        input.dispatchEvent(new Event('input', {bubbles: true}));
      });
      await page.waitForTimeout(100);
      await page.selectOption('#water-style', 'classic');
      await page.waitForTimeout(100);
      const classicWaterImage = PNG.sync.read(await captureScreenshot());
      let styleChangedPixels = 0;
      for (let vertical = 120; vertical < 650; vertical++) {
        for (let horizontal = 350; horizontal < 950; horizontal++) {
          const offset = (vertical * firstWaterImage.width + horizontal) * 4;
          if (Math.abs(firstWaterImage.data[offset] - classicWaterImage.data[offset]) > 3)
            styleChangedPixels++;
        }
      }
      assert(
        styleChangedPixels > 1000,
        `${backend}: river and classic water styles differ (${styleChangedPixels} pixels)`
      );
      await page.selectOption('#water-style', 'river');
      await page.waitForTimeout(100);
      await page.evaluate(() => window.cityScene.setTime(8));
      await page.waitForTimeout(100);
      const secondWaterImage = PNG.sync.read(await captureScreenshot());
      // Motion can change any color channel, especially at a smaller framebuffer resolution.
      const changedPixels = countSceneDifferences(firstWaterImage, secondWaterImage);
      assert(
        changedPixels > 100,
        `${backend}: time changes water shading (${changedPixels} pixels)`
      );
      await page.evaluate(() => window.cityScene.setTime(2));
      await page.waitForTimeout(100);
      await page.evaluate(
        () => document.activeElement instanceof HTMLElement && document.activeElement.blur()
      );
      const repeatedWaterImage = PNG.sync.read(await captureScreenshot());
      let replayDifferences = 0;
      for (let vertical = 120; vertical < 650; vertical++) {
        for (let horizontal = 350; horizontal < 950; horizontal++) {
          const index = (vertical * firstWaterImage.width + horizontal) * 4;
          const colorDifference = Math.max(
            Math.abs(repeatedWaterImage.data[index] - firstWaterImage.data[index]),
            Math.abs(repeatedWaterImage.data[index + 1] - firstWaterImage.data[index + 1]),
            Math.abs(repeatedWaterImage.data[index + 2] - firstWaterImage.data[index + 2])
          );
          if (colorDifference > 1) replayDifferences++;
        }
      }
      assert.equal(replayDifferences, 0, `${backend}: replaying time is deterministic`);
      if (backend === 'webgpu') {
        await page.check('#reflections');
        await page.waitForTimeout(150);
      }
      // Compose the existing edge layer with water and the shared SSR capture.
      await page.selectOption('#camera', 'overhead');
      await waitForIdle();
      const roof = await page.evaluate(() => {
        const scene = window.cityScene;
        const building = scene.features.find(feature => feature.name === 'East 4.1');
        const layer = scene.deck.props.layers.find(layer => layer?.id === 'city-mesh');
        const corners = [-1, 1].flatMap(east =>
          [-1, 1].map(north =>
            layer.project([
              building.center[0] + (east * building.size[0]) / 2,
              building.center[1] + (north * building.size[1]) / 2,
              building.center[2] + building.size[2]
            ])
          )
        );
        return [
          Math.floor(Math.min(...corners.map(point => point[0])) - 8),
          Math.floor(Math.min(...corners.map(point => point[1])) - 8),
          Math.ceil(Math.max(...corners.map(point => point[0])) + 8),
          Math.ceil(Math.max(...corners.map(point => point[1])) + 8)
        ];
      });
      function changedRoofPixels(first, second) {
        let count = 0;
        for (
          let vertical = Math.max(0, roof[1]);
          vertical < Math.min(first.height, roof[3]);
          vertical++
        ) {
          for (
            let horizontal = Math.max(300, roof[0]);
            horizontal < Math.min(first.width, roof[2]);
            horizontal++
          ) {
            const offset = (vertical * first.width + horizontal) * 4;
            if (
              [0, 1, 2].some(
                channel =>
                  Math.abs(first.data[offset + channel] - second.data[offset + channel]) > 3
              )
            )
              count++;
          }
        }
        return count;
      }
      for (const reflections of backend === 'webgpu' ? [false, true] : [false]) {
        if (backend === 'webgpu') await page.locator('#reflections').setChecked(reflections);
        await page.selectOption('#edge-style', 'none');
        await waitForIdle();
        const ordinaryRoof = PNG.sync.read(await captureScreenshot());
        await page.selectOption('#edge-style', 'solid');
        await waitForIdle();
        const solidRoof = PNG.sync.read(await captureScreenshot());
        assert(
          changedRoofPixels(ordinaryRoof, solidRoof) > 20,
          `${backend}: solid edges visible with SSR=${reflections}`
        );
        await page.evaluate(() => {
          const layer = window.cityScene.deck.props.layers.find(
            layer => layer?.id === 'city-building-edges'
          );
          window.cityDistrictVertices = window.cityScene.deck.props.layers.find(
            layer => layer?.id === 'city-mesh'
          ).state.vertices;
          window.borrowedCityEdges = layer.props.segments;
          window.cityEdgeCorners = layer.state.corners;
        });
        await page.selectOption('#edge-style', 'pencil');
        await waitForIdle();
        assert(
          changedRoofPixels(solidRoof, PNG.sync.read(await captureScreenshot())) > 20,
          `${backend}: pencil grain changes the roof edges with SSR=${reflections}`
        );
        assert(
          await page.evaluate(() => {
            const layer = window.cityScene.deck.props.layers.find(
              layer => layer?.id === 'city-building-edges'
            );
            return (
              layer.props.segments === window.borrowedCityEdges &&
              layer.state.corners === window.cityEdgeCorners &&
              window.cityScene.deck.props.layers.find(candidate => candidate?.id === 'city-mesh')
                .state.vertices === window.cityDistrictVertices
            );
          }),
          'edge style changes reuse district geometry, borrowed segments, and layer resources'
        );
        if (reflections)
          assert.equal(
            await page.evaluate(() => {
              const scene = window.cityScene;
              const layer = scene.deck.props.layers.find(
                layer => layer?.id === 'city-building-edges'
              );
              return scene.deck.props.effects
                .find(effect => effect.id === 'city-scene-buffers')
                .props.getLayerOptions(layer).mode;
            }),
            'transparent',
            'edges contribute color without replacing opaque depth or normals'
          );
      }
      await page.selectOption('#edge-style', 'solid');
      const framesBeforeWidth = await page.evaluate(() => {
        const scene = window.cityScene;
        const frames = scene.diagnostics.frames;
        scene.setEdgeWidth(4);
        return frames;
      });
      await page.waitForFunction(
        frames => window.cityScene.diagnostics.frames > frames,
        framesBeforeWidth
      );
      const edgePicking = await page.evaluate(async () => {
        const scene = window.cityScene;
        const building = scene.features.find(feature => feature.name === 'East 4.1');
        const layer = scene.deck.props.layers.find(layer => layer?.id === 'city-mesh');
        const positions = [
          [
            building.center[0],
            building.center[1] + building.size[1] / 2,
            building.center[2] + building.size[2]
          ],
          [building.center[0], building.center[1] - building.size[1] / 2, building.center[2]]
        ].map(position => layer.project(position));
        const hits = [];
        for (const position of positions) {
          const hit = await scene.deck.pickObjectAsync({x: position[0], y: position[1]});
          hits.push({name: hit?.object?.name, layer: hit?.layer.id});
        }
        return hits;
      });
      assert.deepEqual(
        edgePicking[0],
        {name: 'East 4.1', layer: 'city-building-edges'},
        `${backend}: roof edges pick their building`
      );
      assert.deepEqual(
        edgePicking[1],
        {name: 'East 4.1', layer: 'city-mesh'},
        `${backend}: opaque roof occludes the bottom edge`
      );
      await page.uncheck('#water');
      await page.evaluate(() => window.cityScene.setPlaying(true));
      await waitForIdle();
      await page.waitForTimeout(150);
      const staticFrames = await page.evaluate(() => window.cityScene.diagnostics.frames);
      await page.waitForTimeout(150);
      assert.equal(
        await page.evaluate(() => window.cityScene.diagnostics.frames),
        staticFrames,
        'static edges do not animate when water is disabled'
      );
      assert(
        await page.evaluate(() =>
          window.cityScene.deck.props.layers.some(layer => layer?.id === 'city-building-edges')
        ),
        'water toggle preserves building edges'
      );
      await page.uncheck('#buildings');
      await page.waitForFunction(() => window.cityEdgeCorners.destroyed);
      assert(
        await page.evaluate(
          () => window.cityEdgeCorners.destroyed && !window.borrowedCityEdges.destroyed
        ),
        'hiding buildings releases edge-layer resources but preserves borrowed segments'
      );
      assert(
        !(await page.evaluate(() =>
          window.cityScene.deck.props.layers.some(layer => layer?.id === 'city-building-edges')
        )),
        'hidden buildings have no stray strokes'
      );
      await page.check('#buildings');
      await page.check('#water');
      await page.selectOption('#edge-style', 'pencil');
      await page.evaluate(() => {
        window.cityScene.setTime(2);
        window.cityScene.setEdgeWidth(2.2);
      });
      await page.selectOption('#camera', 'waterfront');
      await page.waitForFunction(() => window.cityScene.deck.getViewports()[0].pitch === 68);
      await waitForIdle();
      await captureScreenshot({
        path: join(
          process.env.CITY_SCENE_ARTIFACTS ?? tmpdir(),
          `city-scene-${backend}-pencil-waterfront.png`
        )
      });
      assert(
        await page.evaluate(
          () =>
            window.cityScene.deck.props.layers.find(layer => layer?.id === 'city-building-edges')
              .props.segments === window.borrowedCityEdges
        ),
        'camera changes preserve world-anchored edge geometry'
      );
      await page.selectOption('#camera', 'district');
      await waitForIdle();
      await page.waitForTimeout(150);
      const screenshotPath = join(
        process.env.CITY_SCENE_ARTIFACTS ?? tmpdir(),
        `city-scene-${backend}.png`
      );
      const screenshot = PNG.sync.read(await captureScreenshot({path: screenshotPath}));
      const colors = new Set();
      // Inspect the scene to the right of the controls, rather than counting text or UI pixels.
      for (let vertical = 120; vertical < 650; vertical += 3) {
        for (let horizontal = 350; horizontal < 950; horizontal += 3) {
          const offset = (vertical * screenshot.width + horizontal) * 4;
          colors.add(screenshot.data.subarray(offset, offset + 3).toString('hex'));
        }
      }
      assert(colors.size > 20, `${backend}: scene contains shaded geometry`);
      assert.equal(await page.evaluate(() => window.cityScene.diagnostics.error), '');
      await page.evaluate(() => {
        window.cityScene.setTime(9);
        window.cityScene.finalize();
        window.cityScene.finalize();
      });
      assert.equal(
        await page.evaluate(() => window.borrowedWaterPositions.destroyed),
        true,
        'application releases water positions on finalization'
      );
      assert(
        await page.evaluate(() => window.borrowedCityEdges.destroyed),
        'application releases edge segments on finalization'
      );
      const frames = await page.evaluate(() => window.cityScene.diagnostics.frames);
      await page.waitForTimeout(150);
      assert.equal(
        await page.evaluate(() => window.cityScene.diagnostics.frames),
        frames,
        'finalization stops rendering'
      );
      assert.deepEqual(errors, [], `${backend}: browser errors`);
      process.stdout.write(
        `${backend}: animated water, shared building edges, SSR composition, deterministic time, pause, picking, buffer ownership, camera, resize, finalization passed. ${screenshotPath}\n`
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}

function countSceneDifferences(first, second) {
  let count = 0;
  for (let vertical = 120; vertical < 650; vertical++) {
    for (let horizontal = 350; horizontal < 950; horizontal++) {
      const offset = (vertical * first.width + horizontal) * 4;
      if (
        [0, 1, 2].some(
          channel => Math.abs(first.data[offset + channel] - second.data[offset + channel]) > 3
        )
      )
        count++;
    }
  }
  return count;
}

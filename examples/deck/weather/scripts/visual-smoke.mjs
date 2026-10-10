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
function changedPixels(first, second, threshold = 10) {
  let count = 0;
  for (let vertical = 0; vertical < first.height; vertical++)
    for (let horizontal = 310; horizontal < first.width; horizontal++) {
      const offset = (vertical * first.width + horizontal) * 4;
      if (
        [0, 1, 2].some(
          channel =>
            Math.abs(first.data[offset + channel] - second.data[offset + channel]) > threshold
        )
      )
        count++;
    }
  return count;
}
try {
  for (const backend of process.env.WEATHER_BACKEND
    ? [process.env.WEATHER_BACKEND]
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
        `${process.env.WEATHER_EXAMPLE_URL || server.resolvedUrls.local[0]}?backend=${backend}`
      );
      await page.waitForFunction(() => document.body.dataset.ready === 'true', undefined, {
        timeout: 60_000
      });
      await page.waitForFunction(() => window.weatherScene?.diagnostics.frames > 2);
      await setVisualTestPixelScale(
        page,
        'weatherScene',
        process.env.WEATHER_THUMBNAIL ? 1 : undefined
      );
      assert.equal(await page.inputValue('#preset'), 'rain', `${backend}: opens with rain enabled`);
      assert.deepEqual(
        await page.locator('#preset option').allTextContents(),
        ['Rain', 'Snow', 'Clouds', 'Sunny'],
        `${backend}: weather presets`
      );
      assert(
        await page.isChecked('#fog-enabled'),
        `${backend}: opens with independent fog enabled`
      );
      assert.equal(
        await page.inputValue('#visibility'),
        '700',
        `${backend}: fog is apparent by default`
      );
      const defaultFogStart = PNG.sync.read(
        await captureScreenshot({path: join(tmpdir(), `weather-default-${backend}.png`)})
      );
      const defaultFogTime = await page.evaluate(() => window.weatherScene.diagnostics.time);
      await page.waitForTimeout(2500);
      const defaultFogEnd = PNG.sync.read(
        await captureScreenshot({path: join(tmpdir(), `weather-default-moving-${backend}.png`)})
      );
      const defaultFogChanges = changedPixels(defaultFogStart, defaultFogEnd, 8);
      const defaultFogElapsed =
        (await page.evaluate(() => window.weatherScene.diagnostics.time)) - defaultFogTime;
      console.log(
        `${backend}: default fog changes ${defaultFogChanges} pixels in ${defaultFogElapsed.toFixed(2)} simulation seconds`
      );
      assert(
        defaultFogChanges > 10000,
        `${backend}: default fog has clearly visible motion over 2.5 seconds (${defaultFogChanges} pixels)`
      );
      // A slow visible frame must not silently reduce the animation speed.
      const slowFrame = await page.evaluate(() => {
        const scene = window.weatherScene;
        const before = {frames: scene.diagnostics.frames, time: scene.diagnostics.time};
        const start = performance.now();
        while (performance.now() - start < 350) {
          /* Simulate one long visible frame. */
        }
        return before;
      });
      await page.waitForFunction(
        frames => window.weatherScene.diagnostics.frames > frames,
        slowFrame.frames
      );
      assert(
        (await page.evaluate(() => window.weatherScene.diagnostics.time)) - slowFrame.time >= 0.3,
        `${backend}: slow frames preserve elapsed animation time`
      );
      await page.uncheck('#playing');
      await page.uncheck('#accumulate');
      for (const preset of ['clear', 'rain', 'snow', 'clouds']) {
        await page.selectOption('#preset', preset);
        assert.equal(
          await page.isChecked('#clouds'),
          preset !== 'clear',
          `${backend}: ${preset} selects cloud state`
        );
        assert.equal(
          await page.evaluate(
            () =>
              window.weatherScene.deck.props.layers.find(layer => layer.id === 'weather').props
                .visible
          ),
          preset === 'rain' || preset === 'snow',
          `${backend}: ${preset} selects precipitation`
        );
        await page.uncheck('#fog-enabled');
        if (preset === 'rain') await page.waitForTimeout(150);
        const withoutFog = preset === 'rain' ? PNG.sync.read(await captureScreenshot()) : null;
        assert.deepEqual(
          await page.evaluate(() =>
            window.weatherScene.deck.props.layers
              .filter(layer => ['district', 'weather'].includes(layer.id))
              .map(layer => layer.props.fog().density)
          ),
          [0, 0],
          `${backend}: ${preset} disables fog in scene and precipitation`
        );
        assert(await page.isDisabled('#visibility'), `${backend}: disabled fog dims its controls`);
        await page.check('#fog-enabled');
        if (preset === 'rain') await page.waitForTimeout(150);
        assert.deepEqual(
          await page.evaluate(() =>
            window.weatherScene.deck.props.layers
              .filter(layer => ['district', 'weather'].includes(layer.id))
              .map(layer => layer.props.fog().density)
          ),
          [3.912 / 700, 3.912 / 700],
          `${backend}: ${preset} enables fog in scene and precipitation`
        );
        if (withoutFog)
          assert(
            changedPixels(withoutFog, PNG.sync.read(await captureScreenshot())) > 10000,
            `${backend}: fog visibly toggles independently with rain`
          );
        assert.equal(
          await page.inputValue('#preset'),
          preset,
          `${backend}: fog preserves weather choice`
        );
        assert.equal(
          await page.inputValue('#visibility'),
          '700',
          `${backend}: fog retains visibility`
        );
      }
      await page.selectOption('#preset', 'clear');
      await page.uncheck('#clouds');
      await page.uncheck('#fog-enabled');
      await page.check('#playing');
      await page.waitForTimeout(200);
      const noWeather = await page.evaluate(() => ({...window.weatherScene.diagnostics}));
      await page.waitForTimeout(250);
      assert.deepEqual(
        await page.evaluate(() => ({...window.weatherScene.diagnostics})),
        noWeather,
        `${backend}: no precipitation and no fog stops animation`
      );
      await page.check('#fog-enabled');
      const initialZoom = await page.evaluate(
        () => window.weatherScene.deck.getViewports()[0].zoom
      );
      await page.mouse.move(850, 400);
      await page.mouse.wheel(0, 240);
      await page.waitForFunction(
        initialZoom => window.weatherScene.deck.getViewports()[0].zoom < initialZoom - 0.1,
        initialZoom
      );
      await page.evaluate(() =>
        window.weatherScene.deck.setProps({
          initialViewState: {
            longitude: -74.006,
            latitude: 40.7128,
            zoom: 15.6,
            pitch: 58,
            bearing: -25
          }
        })
      );
      await page.selectOption('#preset', 'rain');
      await page.waitForFunction(() => window.weatherScene?.diagnostics.frames > 8, undefined, {
        timeout: 30_000
      });
      assert.equal(
        await page.evaluate(() => window.weatherScene.diagnostics.error),
        '',
        `${backend}: scene initialization`
      );
      const moving = PNG.sync.read(await captureScreenshot());
      await page.waitForTimeout(350);
      assert(
        changedPixels(moving, PNG.sync.read(await captureScreenshot())) > 200,
        `${backend}: rain moves`
      );
      await page.uncheck('#playing');
      await page.waitForTimeout(150);
      const paused = PNG.sync.read(
        await captureScreenshot({path: join(tmpdir(), `weather-rain-${backend}.png`)})
      );
      await page.waitForTimeout(250);
      assert.equal(
        changedPixels(paused, PNG.sync.read(await captureScreenshot())),
        0,
        `${backend}: pause freezes precipitation`
      );
      if (process.env.WEATHER_THUMBNAIL && backend === 'webgpu')
        await captureScreenshot({path: process.env.WEATHER_THUMBNAIL, type: 'jpeg', quality: 90});
      await page.selectOption('#preset', 'snow');
      await page.waitForTimeout(150);
      const snow = PNG.sync.read(
        await captureScreenshot({path: join(tmpdir(), `weather-snow-${backend}.png`)})
      );
      assert(changedPixels(paused, snow) > 500, `${backend}: snow differs from rain`);
      await page.check('#playing');
      await page.waitForTimeout(350);
      assert(
        changedPixels(snow, PNG.sync.read(await captureScreenshot())) > 200,
        `${backend}: snow drifts`
      );
      await page.uncheck('#playing');
      await page.waitForTimeout(150);
      // Put snow inside an opaque building so this tests depth independently of roof masking.
      await page.evaluate(() => {
        const scene = window.weatherScene;
        window.originalWeatherLayers = scene.deck.props.layers;
        const building = scene.deck.props.layers
          .find(layer => layer.id === 'district')
          .props.features.find(
            feature =>
              feature.kind === 'building' &&
              feature.center[0] === 122 &&
              Math.abs(feature.center[1]) < 150
          );
        scene.deck.setProps({
          layers: scene.deck.props.layers.map(layer =>
            layer.id === 'weather'
              ? layer.clone({
                  particleCount: 2048,
                  surfaceTexture: null,
                  fog: {density: 0},
                  widthPixels: 6,
                  precipitation: {
                    seed: 29,
                    fallSpeed: 0,
                    turbulence: 0,
                    wind: [0, 0],
                    volumeCenter: [
                      building.center[0],
                      building.center[1],
                      building.center[2] + building.size[2] / 2
                    ],
                    volumeSize: building.size.map(value => value * 0.25)
                  }
                })
              : layer
          )
        });
      });
      await page.waitForTimeout(150);
      const normalDepth = PNG.sync.read(await captureScreenshot());
      await page.evaluate(() => {
        const scene = window.weatherScene;
        scene.deck.setProps({
          layers: scene.deck.props.layers.map(layer =>
            layer.id === 'weather'
              ? layer.clone({parameters: {...layer.props.parameters, depthCompare: 'always'}})
              : layer
          )
        });
      });
      await page.waitForTimeout(150);
      const occludedPixels = changedPixels(
        normalDepth,
        PNG.sync.read(
          await captureScreenshot({path: join(tmpdir(), `weather-depth-always-${backend}.png`)})
        )
      );
      assert(
        occludedPixels > 50,
        `${backend}: opaque scene depth hides snow (${occludedPixels} pixels)`
      );
      await page.evaluate(() =>
        window.weatherScene.deck.setProps({layers: window.originalWeatherLayers})
      );
      await page.evaluate(() => window.weatherScene.setFogVariation(0));
      // With fog motion disabled, disabled precipitation must stop both the clock and frame requests, even with Animate enabled.
      await page.check('#playing');
      for (const preset of ['clear', 'rain', 'snow']) {
        await page.selectOption('#preset', preset);
        await page.uncheck('#clouds');
        if (preset !== 'clear') await page.evaluate(() => window.weatherScene.setIntensity(0));
        await page.waitForTimeout(250);
        const idle = await page.evaluate(() => ({...window.weatherScene.diagnostics}));
        // A software-GPU frame can outlast 250 ms. Drain actual updates and redraws before asserting idle behavior.
        await page.waitForFunction(
          () => {
            const deck = window.weatherScene.deck;
            return !deck.layerManager.needsUpdate() && !deck.needsRedraw();
          },
          undefined,
          {timeout: 30_000}
        );
        const settled = await page.evaluate(() => ({...window.weatherScene.diagnostics}));
        assert(
          settled.frames - idle.frames <= 1,
          `${backend}: ${preset} disabled precipitation drains one pending frame`
        );
        assert.equal(
          settled.time,
          idle.time,
          `${backend}: ${preset} disabled precipitation freezes time`
        );
        await page.waitForTimeout(250);
        const quiet = await page.evaluate(() => ({...window.weatherScene.diagnostics}));
        assert.equal(
          quiet.frames,
          settled.frames,
          `${backend}: ${preset} stays idle after pending frame`
        );
        assert.equal(
          quiet.time,
          settled.time,
          `${backend}: ${preset} keeps time frozen while idle`
        );
        await page.evaluate(() => window.weatherScene.setWindDirection(90));
        await page.waitForTimeout(150);
        assert.equal(
          await page.evaluate(() => window.weatherScene.diagnostics.time),
          idle.time,
          `${backend}: an idle settings redraw does not advance time`
        );
      }
      const stoppedTime = await page.evaluate(() => window.weatherScene.diagnostics.time);
      await page.evaluate(() => window.weatherScene.setIntensity(0.6));
      // Resuming initializes the clock on the first frame; software GPUs may need more than 250 ms for the next frame.
      await page.waitForFunction(
        stoppedTime => window.weatherScene.diagnostics.time > stoppedTime,
        stoppedTime,
        {timeout: 30_000}
      );
      assert(
        (await page.evaluate(() => window.weatherScene.diagnostics.time)) > stoppedTime,
        `${backend}: restoring particle count resumes animation`
      );
      await page.uncheck('#playing');
      await page.selectOption('#preset', 'clear');
      await page.evaluate(() => window.weatherScene.setVisibility(5000));
      await page.waitForTimeout(150);
      const thinFog = PNG.sync.read(await captureScreenshot());
      await page.evaluate(() => window.weatherScene.setVisibility(300));
      await page.waitForTimeout(150);
      assert(
        changedPixels(
          thinFog,
          PNG.sync.read(
            await captureScreenshot({path: join(tmpdir(), `weather-fog-${backend}.png`)})
          )
        ) > 10000,
        `${backend}: visibility changes world-space fog`
      );
      // Fog varies spatially at a fixed clock and drifts without particles or new GPU resources.
      await page.evaluate(() => {
        const scene = window.weatherScene;
        scene.setVisibility(900);
        scene.setFogVariation(0);
        scene.setTime(0);
      });
      await page.waitForTimeout(150);
      const uniformFog = PNG.sync.read(await captureScreenshot());
      await page.evaluate(() => window.weatherScene.setFogVariation(0.85));
      await page.waitForTimeout(150);
      const wispyFog = PNG.sync.read(
        await captureScreenshot({path: join(tmpdir(), `weather-wisps-${backend}.png`)})
      );
      assert(
        changedPixels(uniformFog, wispyFog) > 1000,
        `${backend}: fog density varies spatially`
      );
      await page.evaluate(() => {
        window.fogDistrictModel = window.weatherScene.deck.layerManager
          .getLayers()
          .find(layer => layer.id === 'district').state.model;
        window.weatherScene.setTime(40);
      });
      await page.waitForTimeout(150);
      const driftedFog = PNG.sync.read(
        await captureScreenshot({path: join(tmpdir(), `weather-wisps-drifted-${backend}.png`)})
      );
      assert(
        changedPixels(wispyFog, driftedFog) > 1000,
        `${backend}: wisps advect through the scene`
      );
      await page.waitForTimeout(200);
      assert.equal(
        changedPixels(driftedFog, PNG.sync.read(await captureScreenshot())),
        0,
        `${backend}: pause freezes fog`
      );
      await page.evaluate(() => window.weatherScene.setTime(0));
      await page.waitForTimeout(150);
      assert.equal(
        changedPixels(wispyFog, PNG.sync.read(await captureScreenshot())),
        0,
        `${backend}: fog reset is deterministic`
      );
      // The image must move during playback, not only after an explicit time/slider change.
      await page.evaluate(() => window.weatherScene.setFogSpeed(3));
      await page.waitForTimeout(150);
      const liveFogStart = PNG.sync.read(await captureScreenshot());
      await page.check('#playing');
      await page.waitForFunction(() => window.weatherScene.diagnostics.time > 2.5, undefined, {
        timeout: 30000
      });
      const liveFogChanges = changedPixels(
        liveFogStart,
        PNG.sync.read(await captureScreenshot()),
        3
      );
      assert(
        liveFogChanges > 1000,
        `${backend}: fog visibly animates over 2.5 seconds (${liveFogChanges} pixels)`
      );
      assert(
        await page.evaluate(() => window.weatherScene.deck.props._animate),
        `${backend}: fog alone schedules animation`
      );
      assert(
        await page.evaluate(
          () =>
            window.fogDistrictModel ===
            window.weatherScene.deck.layerManager.getLayers().find(layer => layer.id === 'district')
              .state.model
        ),
        `${backend}: fog animation reuses district geometry`
      );
      await page.uncheck('#playing');
      await page.waitForTimeout(150);
      const beforeSpeedChange = PNG.sync.read(await captureScreenshot());
      await page.evaluate(() => window.weatherScene.setFogSpeed(9));
      await page.waitForTimeout(150);
      assert.equal(
        changedPixels(beforeSpeedChange, PNG.sync.read(await captureScreenshot()), 1),
        0,
        `${backend}: changing drift speed does not jump paused fog`
      );
      await page.check('#playing');
      await page.evaluate(() => window.weatherScene.setFogSpeed(0));
      await page.waitForTimeout(250);
      const idleFog = await page.evaluate(() => ({...window.weatherScene.diagnostics}));
      await page.waitForTimeout(250);
      assert.deepEqual(
        await page.evaluate(() => ({...window.weatherScene.diagnostics})),
        idleFog,
        `${backend}: zero drift stops fog redraws`
      );
      await page.uncheck('#playing');
      await page.evaluate(() => window.weatherScene.setProjection('globe'));
      await page.selectOption('#preset', 'snow');
      await page.evaluate(() => window.weatherScene.setVisibility(3000));
      await page.waitForTimeout(200);
      const globe = PNG.sync.read(
        await captureScreenshot({path: join(tmpdir(), `weather-globe-${backend}.png`)})
      );
      const localCamera = await page.evaluate(() => {
        const layer = window.weatherScene.deck.layerManager
          .getLayers()
          .find(layer => layer.id === 'weather');
        return Array.from(
          layer.state.model.shaderInputs.getUniformValues().weatherRender.cameraPosition
        );
      });
      assert(
        localCamera.every(Number.isFinite) && Math.hypot(...localCamera) < 10000,
        `${backend}: globe camera is local metres`
      );
      await page.evaluate(() => window.weatherScene.setIntensity(0));
      await page.waitForTimeout(150);
      assert(
        changedPixels(globe, PNG.sync.read(await captureScreenshot())) > 200,
        `${backend}: snow remains visible on the globe`
      );
      await page.evaluate(() => window.weatherScene.setIntensity(0.6));
      await page.evaluate(() => window.weatherScene.setProjection('map'));
      await page.selectOption('#preset', 'snow');
      await page.evaluate(() => {
        window.weatherScene.setVisibility(5000);
        window.weatherScene.setIntensity(0);
      });
      await page.waitForTimeout(150);
      const noParticles = PNG.sync.read(await captureScreenshot());
      await page.evaluate(() => {
        const scene = window.weatherScene;
        const texture = scene.surfaceTexture;
        texture.writeData(new Float32Array(texture.width * texture.height).fill(1000));
        scene.setIntensity(0.6);
        const layers = scene.deck.props.layers;
        scene.deck.setProps({
          layers: layers.map(layer =>
            layer.id === 'weather'
              ? layer.clone({surfaceBounds: [-100000, -100000, 100000, 100000]})
              : layer
          )
        });
      });
      await page.waitForTimeout(150);
      assert.equal(
        changedPixels(noParticles, PNG.sync.read(await captureScreenshot())),
        0,
        `${backend}: surface heights suppress covered precipitation`
      );
      await page.uncheck('#fog-enabled');
      await page.selectOption('#preset', 'clear');
      await page.locator('#wetness').fill('0');
      await page.locator('#snow-cover').fill('0');
      await page.waitForTimeout(200);
      const drySurface = PNG.sync.read(await captureScreenshot());
      await page.locator('#wetness').fill('1');
      await page.waitForTimeout(200);
      assert(
        changedPixels(drySurface, PNG.sync.read(await captureScreenshot())) > 1000,
        `${backend}: wetness visibly changes surfaces`
      );
      await page.locator('#snow-cover').fill('1');
      await page.waitForTimeout(200);
      const snowySurface = PNG.sync.read(
        await captureScreenshot({path: join(tmpdir(), `weather-snow-cover-${backend}.png`)})
      );
      assert(
        changedPixels(drySurface, snowySurface) > 1000,
        `${backend}: snow visibly covers upward-facing surfaces`
      );
      await page.uncheck('#surface-enabled');
      await page.waitForTimeout(200);
      assert.equal(
        changedPixels(drySurface, PNG.sync.read(await captureScreenshot())),
        0,
        `${backend}: surface toggle restores dry materials`
      );
      await page.check('#surface-enabled');
      await page.selectOption('#preset', 'snow');
      await page.locator('#snow-cover').fill('0.1');
      await page.evaluate(() => window.weatherScene.setIntensity(0.6));
      await page.check('#accumulate');
      await page.check('#playing');
      const accumulationStart = await page.evaluate(() => window.weatherScene.surfaceSettings.snow);
      await page.waitForFunction(
        value => window.weatherScene.surfaceSettings.snow > value + 0.01,
        accumulationStart
      );
      await page.uncheck('#playing');
      await page.waitForTimeout(150);
      const pausedSurface = await page.evaluate(() => ({...window.weatherScene.surfaceSettings}));
      await page.waitForTimeout(200);
      assert.deepEqual(
        await page.evaluate(() => window.weatherScene.surfaceSettings),
        pausedSurface,
        `${backend}: pause freezes accumulation exactly`
      );
      await page.click('#reset');
      assert.equal(
        await page.evaluate(() => window.weatherScene.surfaceSettings.snow),
        0,
        `${backend}: reset clears snow`
      );
      assert.equal(
        await page.evaluate(() => window.weatherScene.surfaceSettings.wetness),
        0,
        `${backend}: reset clears wetness`
      );
      // One astronomy clock updates the sky and scene lighting while weather remains paused.
      await page.uncheck('#fog-enabled');
      await page.uncheck('#clouds');
      await page.selectOption('#preset', 'clear');
      await page.locator('#hour').fill('12');
      await page.click('#center');
      await page.waitForTimeout(150);
      const daylight = PNG.sync.read(await captureScreenshot());
      await page.locator('#hour').fill('22');
      await page.waitForTimeout(150);
      assert(
        changedPixels(daylight, PNG.sync.read(await captureScreenshot())) > 10000,
        `${backend}: astronomy time changes sky and surface lighting`
      );
      for (const body of ['sun', 'moon']) {
        await page.locator('#hour').fill(body === 'sun' ? '9' : '0');
        await page.click(`#look-${body}`);
        await page.waitForTimeout(150);
        const visibleBody = PNG.sync.read(await captureScreenshot());
        await page.evaluate(body => {
          const deck = window.weatherScene.deck;
          deck.setProps({
            layers: deck.props.layers.map(layer =>
              layer.id === 'weather-sky' ? layer.clone({[body]: false}) : layer
            )
          });
        }, body);
        await page.waitForTimeout(150);
        assert(
          changedPixels(visibleBody, PNG.sync.read(await captureScreenshot()), 8) > 100,
          `${backend}: Look at ${body} reveals the celestial disk`
        );
      }
      await page.click('#center');
      assert.equal(
        await page.evaluate(() => window.weatherScene.deck.getViewports()[0].pitch),
        74,
        `${backend}: Center restores the district view`
      );
      await page.evaluate(() => {
        window.borrowedWeatherSurface = window.weatherScene.surfaceTexture;
        window.weatherScene.deck.setProps({layers: []});
      });
      await page.waitForTimeout(150);
      assert.equal(
        await page.evaluate(() => window.borrowedWeatherSurface.destroyed),
        false,
        `${backend}: layer borrows surface texture`
      );
      await page.evaluate(() => {
        window.weatherScene.finalize();
        window.weatherScene.finalize();
      });
      assert.equal(
        await page.evaluate(() => window.borrowedWeatherSurface.destroyed),
        true,
        `${backend}: application releases surface texture`
      );
      assert.equal(
        await page.evaluate(() => window.weatherScene.diagnostics.error),
        '',
        `${backend}: scene errors`
      );
      assert.deepEqual(errors, [], `${backend}: GPU/browser errors`);
      console.log(
        `${backend}: rain, snow, fog, pause, depth occlusion, surface masking and cleanup passed`
      );
      if (backend === 'webgl') {
        await assertRejectedWebGPUFallback(
          browser,
          process.env.WEATHER_EXAMPLE_URL || server.resolvedUrls.local[0],
          'weatherScene'
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

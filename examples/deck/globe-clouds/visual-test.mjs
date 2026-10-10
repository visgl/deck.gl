// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {createServer} from 'vite';
import {PNG} from 'pngjs';
import {getPlaywrightLaunchOptions} from '../../../scripts/playwright/get-playwright-launch-options.mjs';
import {
  setVisualTestPixelScale,
  captureVisualTestScreenshot
} from '../../../scripts/playwright/visual-test-utils.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const server = await createServer({
  root,
  logLevel: 'error',
  server: {host: '127.0.0.1', port: 0, watch: null}
});
await server.listen();
try {
  for (const backend of ['webgpu', 'webgl']) {
    const browser = await chromium.launch(
      getPlaywrightLaunchOptions({
        headless: true,
        backend,
        softwareGpu: process.platform === 'linux' || process.env.GLOBE_SOFTWARE_GPU === 'true',
        launchOptions:
          process.platform === 'linux' && backend === 'webgpu'
            ? {args: ['--enable-gpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader']}
            : {}
      })
    );
    try {
      const page = await browser.newPage({
        viewport: {width: 1100, height: 800},
        deviceScaleFactor: 1
      });
      page.setDefaultTimeout(120000);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text());
      });
      await page.goto(`${server.resolvedUrls.local[0]}?backend=${backend}`);
      await page.waitForFunction(() => ['true', 'error'].includes(document.body.dataset.ready));
      assert.equal(
        await page.evaluate(() => document.body.dataset.ready),
        'true',
        `${await page.locator('#status').textContent()}\n${errors.join('\n')}`
      );
      await setVisualTestPixelScale(
        page,
        'globeCloudScene',
        process.argv.includes('--thumbnail') ? 1 : undefined
      );
      await page.getByLabel('Animate', {exact: true}).uncheck();
      const screenshot = async () => {
        for (let frame = 0; frame < 3; frame++) {
          const frames = await page.evaluate(() => {
            const scene = window.globeCloudScene;
            const previousFrames = scene.diagnostics.frames;
            scene.deck.redraw('visual screenshot');
            return previousFrames;
          });
          await page.waitForFunction(
            previous => window.globeCloudScene.diagnostics.frames > previous,
            frames
          );
        }
        return PNG.sync.read(await captureVisualTestScreenshot(page.locator('#scene')));
      };
      const clouds = await screenshot();
      await page.getByLabel('Clouds', {exact: true}).uncheck();
      const surface = await screenshot();
      const differences = (first, second) =>
        first.data.reduce(
          (sum, value, index) =>
            sum + (index % 4 !== 3 && Math.abs(value - second.data[index]) > 10 ? 1 : 0),
          0
        );
      assert(differences(clouds, surface) > 1000, 'Clouds visibly change the surface');
      const brightSurface = surface.data.reduce(
        (sum, value, index) => sum + (index % 4 === 0 && value > 120 ? 1 : 0),
        0
      );
      assert(brightSurface > 1000, 'The sunlit Earth hemisphere renders above the background');
      await page.getByLabel('Clouds', {exact: true}).check();
      await page.evaluate(() => {
        window.globeCloudScene.diagnostics.time += 40;
        window.globeCloudScene.setCover(0.45);
      });
      const drift = await screenshot();
      assert(differences(clouds, drift) > 1000, 'Elapsed time moves spherical cloud formations');
      for (const [longitude, latitude] of [
        [179.9, 35],
        [-179.9, 35],
        [0, 85],
        [0, -85]
      ]) {
        await page.evaluate(
          ({longitude, latitude}) =>
            window.globeCloudScene.deck.setProps({
              initialViewState: {longitude, latitude, zoom: 1.4}
            }),
          {longitude, latitude}
        );
        await screenshot();
      }
      await page.getByRole('button', {name: 'Center', exact: true}).click();
      await page.getByLabel('UTC hour').fill('1');
      const night = await screenshot();
      assert(differences(clouds, night) > 1000, 'Astronomy time moves the day/night terminator');
      await page.getByLabel('UTC hour').fill('13');
      for (const body of ['sun', 'moon']) {
        await page
          .getByRole('button', {name: body === 'sun' ? 'Sun' : 'Moon', exact: true})
          .click();
        const enabled = await screenshot();
        await page.getByLabel(body === 'sun' ? 'Sun' : 'Moon', {exact: true}).uncheck();
        const disabled = await screenshot();
        assert(differences(enabled, disabled) > 300, `${body} is visible beside the globe`);
        await page.getByLabel(body === 'sun' ? 'Sun' : 'Moon', {exact: true}).check();
      }
      // Subpixel stars require the original resolution on SwiftShader WebGL.
      // Keep this focused visibility assertion at full resolution rather than lowering its threshold.
      await setVisualTestPixelScale(page, 'globeCloudScene', 1);
      const starry = await screenshot();
      await page.getByLabel('Stars', {exact: true}).uncheck();
      assert(differences(starry, await screenshot()) > 100, 'Catalog stars fill the sky');
      await page.getByLabel('Stars', {exact: true}).check();
      await setVisualTestPixelScale(
        page,
        'globeCloudScene',
        process.argv.includes('--thumbnail') ? 1 : undefined
      );
      await page.getByRole('button', {name: 'Center', exact: true}).click();
      await page.getByLabel('Animate', {exact: true}).check();
      const before = await page.evaluate(() => window.globeCloudScene.diagnostics.time);
      await page.waitForFunction(
        previous => window.globeCloudScene.diagnostics.time > previous + 0.5,
        before
      );
      await page.getByLabel('Animate', {exact: true}).uncheck();
      await screenshot();
      if (backend === 'webgpu' && process.argv.includes('--thumbnail')) {
        const thumbnailPath = join(root, '../thumbnails/globe-clouds.jpg');
        await mkdir(dirname(thumbnailPath), {recursive: true});
        await captureVisualTestScreenshot(page.locator('#scene'), {
          path: thumbnailPath,
          type: 'jpeg',
          quality: 90
        });
      }
      await captureVisualTestScreenshot(page, {
        path: join(tmpdir(), `globe-cloud-cover-${backend}.png`)
      });
      await page.setViewportSize({width: 450, height: 680});
      await screenshot();
      await captureVisualTestScreenshot(page, {
        path: join(tmpdir(), `globe-cloud-cover-mobile-${backend}.png`)
      });
      await page.evaluate(() => window.globeCloudScene.finalize());
      assert.equal(await page.evaluate(() => window.globeCloudScene.diagnostics.finalized), true);
      assert.deepEqual(errors, []);
      console.log(
        `${backend}: surface, cover, drift, terminator, poles, seam, animation and compact layout passed`
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}

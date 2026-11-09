// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {mkdir} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {createServer} from 'vite';
import {getPlaywrightLaunchOptions} from '../../../../scripts/playwright/get-playwright-launch-options.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = resolve(root, '../thumbnails/ambient-occlusion.jpg');
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
  const page = await browser.newPage({viewport: {width: 1280, height: 720}, deviceScaleFactor: 1});
  page.setDefaultTimeout(60_000);
  await page.goto(server.resolvedUrls.local[0], {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => document.body.dataset.ready === 'true', undefined, {
    timeout: 60_000
  });
  await page.waitForFunction(
    () => window.riverfrontAmbientOcclusionScene.effect.frameCount > 2,
    undefined,
    {timeout: 30_000}
  );
  await page.evaluate(() =>
    window.riverfrontAmbientOcclusionScene.deck.setProps({_animate: false})
  );
  await mkdir(dirname(outputPath), {recursive: true});
  await page.screenshot({path: outputPath, type: 'jpeg', quality: 90, timeout: 60_000});
  console.log(`Wrote ${outputPath}`);
} finally {
  await browser.close();
  await server.close();
}

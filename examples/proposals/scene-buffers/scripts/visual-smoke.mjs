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
try {
  const browser = await chromium.launch(
    getPlaywrightLaunchOptions({
      headless: true,
      backend: 'webgpu',
      softwareGpu: true,
      launchOptions:
        process.platform === 'linux'
          ? {args: ['--enable-gpu', '--enable-features=Vulkan', '--use-vulkan=swiftshader']}
          : {}
    })
  );
  try {
    const page = await browser.newPage({
      viewport: {width: 1100, height: 800},
      deviceScaleFactor: 2
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
    await page.goto(process.env.BUFFER_EXAMPLE_URL || server.resolvedUrls.local[0]);
    await page.waitForFunction(() => document.body.dataset.ready === 'true', undefined, {
      timeout: 60_000
    });
    await page.waitForTimeout(800);
    const original = PNG.sync.read(
      await page.screenshot({path: join(tmpdir(), 'scene-buffers-webgpu.png')})
    );
    if (process.env.BUFFER_THUMBNAIL)
      await page.screenshot({path: process.env.BUFFER_THUMBNAIL, type: 'jpeg', quality: 90});
    await page.uncheck('#bloom');
    await page.waitForTimeout(150);
    assert(
      differentPixels(original, PNG.sync.read(await page.screenshot())) > 100,
      'bloom changes the rendered scene'
    );
    await page.check('#bloom');
    await page.check('#edges');
    await page.waitForTimeout(150);
    assert(
      differentPixels(original, PNG.sync.read(await page.screenshot())) > 100,
      'surface edges change the rendered scene'
    );
    await page.uncheck('#edges');
    await page.uncheck('#selection');
    await page.waitForTimeout(150);
    assert(
      differentPixels(original, PNG.sync.read(await page.screenshot())) > 20,
      'selection outline changes the rendered scene'
    );
    await page.check('#selection');
    for (const mode of ['normals', 'depth', 'selection']) {
      await page.selectOption('#mode', mode);
      await page.waitForTimeout(150);
      assert(
        differentPixels(
          original,
          PNG.sync.read(await page.screenshot({path: join(tmpdir(), `scene-buffers-${mode}.png`)}))
        ) > 10000,
        `${mode}: buffer view differs`
      );
    }
    await page.uncheck('#glass');
    await page.waitForTimeout(150);
    const maskWithoutGlass = PNG.sync.read(await page.screenshot());
    await page.check('#glass');
    await page.waitForTimeout(150);
    assert.equal(
      differentPixels(maskWithoutGlass, PNG.sync.read(await page.screenshot())),
      0,
      'glass does not overwrite the opaque selection mask'
    );
    await page.selectOption('#mode', 'scene');
    const withGlass = PNG.sync.read(await page.screenshot());
    await page.uncheck('#glass');
    await page.waitForTimeout(150);
    assert(
      differentPixels(withGlass, PNG.sync.read(await page.screenshot())) > 100,
      'glass changes the composited scene'
    );
    await page.check('#glass');
    await page.waitForFunction(() =>
      Boolean(
        window.bufferScene.deck.props.layers.find(layer => layer.id === 'selected').context
          ?.viewport
      )
    );
    const selected = await page.evaluate(async () => {
      const scene = window.bufferScene;
      const layer = scene.deck.props.layers.find(candidate => candidate.id === 'selected');
      const feature = layer.props.features[0];
      const position = layer.project([feature.center[0], feature.center[1], feature.size[2]]);
      const info = await scene.deck.pickObjectAsync({x: position[0], y: position[1]});
      return {name: info?.object?.name, expected: feature.name};
    });
    assert.equal(selected.name, selected.expected, 'picking survives auxiliary passes');
    await page.evaluate(() => {
      const scene = window.bufferScene;
      window.retainedBuffer = scene.capture.getFrame('main').buffer;
      window.retainedVertices = scene.deck.props.layers.find(
        layer => layer.id === 'buildings'
      ).state.vertices;
      scene.resetHistory();
    });
    assert.equal(
      await page.evaluate(() =>
        Boolean(window.bufferScene.capture.getFrame('main').previousBuffer)
      ),
      false,
      'reset invalidates history for the next capture'
    );
    await page.evaluate(() => window.bufferScene.deck.redraw('scene-buffer controls'));
    assert.equal(
      await page.evaluate(() =>
        Boolean(window.bufferScene.capture.getFrame('main').previousBuffer)
      ),
      true,
      'next capture restores history'
    );
    await page.selectOption('#mode', 'previous');
    await page.waitForTimeout(150);
    assert.equal(
      await page.evaluate(
        () =>
          window.retainedVertices ===
          window.bufferScene.deck.props.layers.find(layer => layer.id === 'buildings').state
            .vertices
      ),
      true,
      'effect controls reuse geometry'
    );
    await page.setViewportSize({width: 900, height: 650});
    await page.waitForTimeout(300);
    await page.waitForFunction(
      () =>
        window.bufferScene.deck.width === 900 &&
        window.bufferScene.capture.getFrame('main').buffer.width ===
          document.querySelector('canvas').width
    );

    assert.equal(
      await page.evaluate(() => window.retainedBuffer.colorTexture.destroyed),
      true,
      'resize releases old captures'
    );
    await page.evaluate(() => {
      window.bufferScene.finalize();
      window.bufferScene.finalize();
    });
    assert.equal(
      await page.evaluate(() => window.retainedVertices.destroyed),
      true,
      'finalization releases geometry'
    );
    assert.deepEqual(errors, [], 'GPU and browser errors');
    console.log(
      'WebGPU: bloom, edges, selection, buffer views, picking, history, resize, reuse and cleanup passed'
    );
  } finally {
    await browser.close();
  }
} finally {
  await server.close();
}

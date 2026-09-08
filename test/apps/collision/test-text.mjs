// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Start the local app first, then run: node test/apps/collision/test-text.mjs
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {PNG} from 'pngjs';

const gpu = process.env.COLLISION_TEST_GPU;
const browser = await chromium.launch({
  headless: !gpu,
  args: gpu ? [`--use-angle=${gpu}`] : []
});
const page = await browser.newPage({viewport: {width: 1200, height: 800}});
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text());
});
let count = 0;
try {
  await page.goto('http://localhost:8080/text.html');
  await page.waitForFunction(() => window.collisionTest?.deck.isInitialized);
  await page.waitForTimeout(500);
  for (const scene of ['pairs', 'multiline']) {
    await page.selectOption('#scene', scene);
    for (const geojson of [false, true]) {
      for (const billboard of [true, false]) {
        for (const anchor of ['start', 'middle', 'end']) {
          for (const baseline of ['top', 'center', 'bottom']) {
            for (const [offsetX, offsetY] of [
              [0, 0],
              [100, -70],
              [-100, 70]
            ]) {
              // Keep neighboring pairs separate; multiline labels are wider than the single-line scene.
              for (const zoom of [scene === 'multiline' ? -0.5 : -1, 0, 3]) {
                for (const reversePriority of [false, true]) {
                  const settings = {
                    geojson,
                    billboard,
                    anchor,
                    baseline,
                    offsetX,
                    offsetY,
                    reversePriority
                  };
                  const indexes = await page.evaluate(
                    async ({settings, zoom}) => {
                      const {deck, settings: current, update} = window.collisionTest;
                      Object.assign(current, settings);
                      update();
                      deck.setProps({viewState: {target: [150, -180, 0], zoom}});
                      await new Promise(resolve => {
                        const onAfterRender = deck.props.onAfterRender;
                        deck.setProps({
                          onAfterRender: () => {
                            if (deck.props.layers.every(layer => layer.isLoaded)) {
                              deck.setProps({onAfterRender});
                              resolve();
                            }
                          }
                        });
                        deck.redraw('collision assertion');
                      });
                      return deck
                        .pickObjects({x: 0, y: 0, width: 1200, height: 800})
                        .map(({object}) => (object.properties || object).index)
                        .filter(index => index < 2)
                        .sort();
                    },
                    {settings, zoom}
                  );
                  const expected = zoom === 3 ? [0, 1] : [reversePriority ? 1 : 0];
                  assert.deepEqual(indexes, expected, JSON.stringify({scene, ...settings, zoom}));
                  count++;
                }
              }
            }
          }
        }
      }
    }
  }
  // Check displayed pixels as well as picking: the screen and picking passes must agree.
  for (const reversePriority of [false, true]) {
    for (const zoom of [2.4, 2.8]) {
      await page.evaluate(
        ({reversePriority, zoom}) => {
          const {deck, settings, update} = window.collisionTest;
          Object.assign(settings, {
            geojson: false,
            billboard: true,
            anchor: 'middle',
            baseline: 'center',
            offsetX: 0,
            offsetY: 0,
            reversePriority
          });
          update();
          deck.setProps({viewState: {target: [160, -180, 0], zoom}});
        },
        {reversePriority, zoom}
      );
      await page.evaluate(
        () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      );
      const png = PNG.sync.read(
        await page.screenshot({clip: {x: 400, y: 300, width: 400, height: 200}})
      );
      let red = 0;
      let green = 0;
      for (let i = 0; i < png.data.length; i += 4) {
        const [r, g, b] = png.data.subarray(i, i + 3);
        if (r > g * 1.4 && r > b * 1.4) red++;
        if (g > r * 1.4 && g > b * 1.4) green++;
      }
      assert.equal(red > 0, zoom === 2.8 || reversePriority, `Red pixels: zoom=${zoom}`);
      assert.equal(green > 0, zoom === 2.8 || !reversePriority, `Green pixels: zoom=${zoom}`);
    }
  }
  assert.deepEqual(errors, [], 'Browser errors');
  console.log(`Passed ${count} text collision combinations.`);
} finally {
  await browser.close();
}

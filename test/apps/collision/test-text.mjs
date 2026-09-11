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
  await page.goto(process.env.COLLISION_TEST_URL || 'http://localhost:8080/text.html');
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
  // The same multiline pairs must collide when their members belong to separate layers.
  await page.check('#splitLayers');
  for (const collisionGreedy of [false, true]) {
    for (const geojson of [true, false]) {
      for (const devicePixels of [1, 1.5, 2]) {
        for (const reversePriority of [false, true]) {
          for (const zoom of [0, 3]) {
            const actual = await page.evaluate(
              async ({geojson, devicePixels, reversePriority, zoom, collisionGreedy}) => {
                const {deck, settings, update} = window.collisionTest;
                Object.assign(settings, {
                  geojson,
                  devicePixels,
                  reversePriority,
                  collisionGreedy
                });
                update();
                // A one-point priority gap must win over the default layer depth offsets.
                deck.setProps({
                  layers: deck.props.layers.map(layer =>
                    layer.clone({
                      getCollisionPriority: object =>
                        (object.properties || object).high !== reversePriority ? 1 : 0
                    })
                  )
                });
                deck.setProps({viewState: {target: [160, -180, 0], zoom}});
                await new Promise(resolve => {
                  deck.setProps({
                    onAfterRender: () => {
                      if (deck.props.layers.every(layer => layer.isLoaded)) {
                        deck.setProps({onAfterRender: () => {}});
                        resolve();
                      }
                    }
                  });
                  deck.redraw('shared group assertion');
                });
                return (await deck.pickObjectsAsync({x: 0, y: 0, width: 1200, height: 800}))
                  .map(({object}) => (object.properties || object).index)
                  .filter(index => index < 2)
                  .sort();
              },
              {geojson, devicePixels, reversePriority, zoom, collisionGreedy}
            );
            assert.deepEqual(
              actual,
              zoom === 3 ? [0, 1] : [reversePriority ? 1 : 0],
              JSON.stringify({
                splitLayers: true,
                geojson,
                devicePixels,
                reversePriority,
                zoom,
                collisionGreedy
              })
            );
            count++;
          }
        }
      }
    }
  }
  await page.uncheck('#splitLayers');
  await page.evaluate(() => {
    window.collisionTest.settings.devicePixels = 1;
    window.collisionTest.update();
  });
  // Dense chains must leave room for many separated labels, at either priority order.
  await page.selectOption('#scene', 'stress');
  for (const reversePriority of [false, true]) {
    for (const zoom of [-5, -4, -3]) {
      const visible = await page.evaluate(
        async ({reversePriority, zoom}) => {
          const {deck, settings, update} = window.collisionTest;
          Object.assign(settings, {
            reversePriority,
            angle: 0,
            collisionScale: 1,
            collisionGreedy: true
          });
          update();
          deck.setProps({viewState: {target: [11040, 2025, 0], zoom}});
          await new Promise(resolve => {
            deck.setProps({
              onAfterRender: () => {
                if (deck.props.layers.every(layer => layer.isLoaded)) {
                  deck.setProps({onAfterRender: () => {}});
                  resolve();
                }
              }
            });
            deck.redraw('dense packing assertion');
          });
          return (await deck.pickObjectsAsync({x: 0, y: 0, width: 1200, height: 800})).map(
            ({object}) => ({high: object.high, index: object.index})
          );
        },
        {reversePriority, zoom}
      );
      assert.ok(visible.length >= 30, `Dense packing: zoom=${zoom}, count=${visible.length}`);
      assert.ok(
        visible.every(label => label.high !== reversePriority),
        'Dense packing priorities'
      );
    }
  }
  // Toggling back restores the GPU-only path without recreating the layer.
  await page.check('#collisionGreedy');
  await page.uncheck('#collisionGreedy');
  const fastCount = await page.evaluate(async () => {
    const {deck} = window.collisionTest;
    deck.setProps({viewState: {target: [11040, 2025, 0], zoom: -5}});
    await new Promise(resolve => {
      deck.setProps({
        onAfterRender: () => {
          if (deck.props.layers.every(layer => layer.isLoaded)) {
            deck.setProps({onAfterRender: () => {}});
            resolve();
          }
        }
      });
      deck.redraw('GPU-only assertion');
    });
    return (await deck.pickObjectsAsync({x: 0, y: 0, width: 1200, height: 800})).length;
  });
  assert.equal(fastCount, 1, 'GPU-only overlap-chain behavior');
  // Priority endpoints must stay inside the clipping planes on hardware GPUs.
  for (const priority of [999, 1000, -1000]) {
    for (const collisionGreedy of [false, true]) {
      for (const splitLayers of [false, true]) {
        const actual = await page.evaluate(
          async ({priority, collisionGreedy, splitLayers}) => {
            const {deck, MapView} = window.collisionTest;
            const source = deck.props.layers.find(
              layer => layer.constructor.layerName === 'TextLayer'
            );
            const TextLayer = source.constructor;
            const data = [
              {
                index: 0,
                text: 'Short label',
                position: [0, 0],
                size: 23,
                offset: [0, -20.5],
                baseline: 'bottom',
                priority
              },
              {
                index: 1,
                text: 'Long label with several words wrapping onto three lines',
                position: [0.0597593335, 0.006976],
                size: 26,
                offset: [0, 0],
                baseline: 'center',
                priority
              }
            ];
            const props = {
              ...source.props,
              id: 'priority-boundary',
              data,
              collisionGreedy,
              coordinateSystem: 'lnglat',
              fontFamily: 'Arial',
              fontWeight: 700,
              maxWidth: 10,
              wordBreak: 'break-word',
              lineHeight: 1,
              getPosition: d => d.position,
              getText: d => d.text,
              getSize: d => d.size,
              getCollisionPriority: d => d.priority,
              getPixelOffset: d => d.offset,
              getAlignmentBaseline: d => d.baseline,
              getTextAnchor: 'middle',
              getAngle: 0,
              collisionTestProps: {},
              updateTriggers: {},
              getColor: d => (d.index ? [0, 145, 85] : [215, 55, 45])
            };
            const layers = splitLayers
              ? data.map(
                  d => new TextLayer({...props, id: `priority-boundary-${d.index}`, data: [d]})
                )
              : [new TextLayer(props)];
            let screen;
            await new Promise(resolve => {
              deck.setProps({
                layers,
                views: new MapView({id: 'main'}),
                // Preserve the fractional viewport that reproduced near-plane clipping on D3D11.
                width: 1109.328125,
                height: 975.328125,
                useDevicePixels: 1.5,
                viewState: {
                  longitude: 0,
                  latitude: 0,
                  zoom: 10.42516610807454,
                  pitch: 0,
                  bearing: 0
                },
                onAfterRender: () => {
                  if (!layers.every(layer => layer.isLoaded)) return;
                  const gl = deck.device.gl;
                  const pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
                  gl.readPixels(
                    0,
                    0,
                    gl.drawingBufferWidth,
                    gl.drawingBufferHeight,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    pixels
                  );
                  let red = 0;
                  let green = 0;
                  for (let i = 0; i < pixels.length; i += 4) {
                    const [r, g, b] = pixels.subarray(i, i + 3);
                    if (r > g * 1.4 && r > b * 1.4) red++;
                    if (g > r * 1.4 && g > b * 1.4) green++;
                  }
                  screen = [...(red ? [0] : []), ...(green ? [1] : [])];
                  deck.setProps({onAfterRender: () => {}});
                  resolve();
                }
              });
              deck.redraw('priority boundary assertion');
            });
            const visible = (
              await deck.pickObjectsAsync({x: 0, y: 0, width: deck.width, height: deck.height})
            )
              .map(({object}) => object.index)
              .sort();
            return {visible, screen};
          },
          {priority, collisionGreedy, splitLayers}
        );
        assert.deepEqual(
          actual,
          {visible: [1], screen: [1]},
          JSON.stringify({priority, collisionGreedy, splitLayers})
        );
        count++;
      }
    }
  }
  assert.deepEqual(errors, [], 'Browser errors');
  console.log(`Passed ${count} text collision combinations.`);
} finally {
  await browser.close();
}

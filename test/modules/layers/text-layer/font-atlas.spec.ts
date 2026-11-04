// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {TextLayer} from '@deck.gl/layers';
import {device, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {setFontAtlasCacheLimit} from '@luma.gl/engine/text-fonts';

test('TextLayer - fontAtlasCacheLimit', () => {
  TextLayer.fontAtlasCacheLimit = 10;
  expect(true, 'fontAtlasCacheLimit is set without error').toBeTruthy();
});

test('TextLayer - fontAtlasCacheLimit - null argument', () => {
  let didThrow = false;

  try {
    TextLayer.fontAtlasCacheLimit = null;
  } catch (e) {
    didThrow = true;
  }

  expect(didThrow, 'exceptioh was thrown when null argument passed').toBeTruthy();
});

test('TextLayer - fontAtlasCacheLimit - invalid type argument', () => {
  let didThrow = false;

  try {
    TextLayer.fontAtlasCacheLimit = 'Three';
  } catch (e) {
    didThrow = true;
  }

  expect(
    didThrow,
    'exceptioh was thrown an exception when argument other than string passed'
  ).toBeTruthy();
});

test('TextLayer - fontAtlasCacheLimit - less than hard limit', () => {
  let didThrow = false;

  try {
    TextLayer.fontAtlasCacheLimit = 2;
  } catch (e) {
    didThrow = true;
  }

  expect(
    didThrow,
    'exceptioh was thrown an exception when a limit less than hard limit passed'
  ).toBeTruthy();
});

test('TextLayer uses luma atlases while retaining deck character sets after eviction', async () => {
  const {default: FontAtlasManager} = await import(
    '../../../../modules/layers/src/text-layer/font-atlas-manager'
  );
  setFontAtlasCacheLimit(3);
  const manager = new FontAtlasManager();
  manager.setProps({fontSize: 37, characterSet: 'A'});
  expect((manager.mapping!.A as any).atlasPage).toBe(0);
  for (let fontSize = 40; fontSize < 45; fontSize++) {
    new FontAtlasManager().setProps({fontSize, characterSet: 'X'});
  }
  manager.setProps({characterSet: 'B'});
  expect(Object.keys(manager.mapping!)).toEqual(expect.arrayContaining(['A', 'B']));
  expect(manager.atlas!.height).toBeGreaterThan(0);
});

test('TextLayer empty default atlas has a valid upload size', async () => {
  const {default: FontAtlasManager} = await import(
    '../../../../modules/layers/src/text-layer/font-atlas-manager'
  );
  for (const sdf of [false, true]) {
    const manager = new FontAtlasManager();
    manager.setProps({characterSet: [], fontSize: 39, sdf});
    expect(manager.atlas!.height).toBe(1);
    expect(manager.atlas!.data.height).toBe(1);
    manager.setProps({characterSet: 'A'});
    expect(manager.mapping!.A).toBeTruthy();
    expect(manager.atlas!.height).toBeGreaterThan(1);
  }
});

test('TextLayer custom font renderer remains separate from luma default atlases', async () => {
  const {default: FontAtlasManager} = await import(
    '../../../../modules/layers/src/text-layer/font-atlas-manager'
  );
  const normal = new FontAtlasManager();
  normal.setProps({characterSet: 'A', fontSize: 41});
  const custom = new FontAtlasManager();
  custom.setProps({
    characterSet: 'A',
    fontSize: 41,
    _getFontRenderer: () => ({
      measure: () => ({advance: 7, width: 5, ascent: 8, descent: 2}),
      draw: () => ({data: new ImageData(5, 10)})
    })
  });
  expect(custom.mapping!.A.advance).toBe(7);
  expect(custom.atlas!.data).not.toBe(normal.atlas!.data);
  expect(custom.atlas!.baselineOffset).toBe(3);
});

test('TextLayer SDF padding retains the full field and smoothing remains a layer setting', async () => {
  const {default: FontAtlasManager} = await import(
    '../../../../modules/layers/src/text-layer/font-atlas-manager'
  );
  const manager = new FontAtlasManager();
  manager.setProps({
    characterSet: 'A',
    fontSize: 43,
    sdf: true,
    radius: 12,
    cutoff: 0.25,
    buffer: 4,
    smoothing: 0.1
  });
  const frame = {...manager.mapping!.A};
  const canvas = manager.atlas!.data;
  manager.setProps({smoothing: 0.3});
  expect(manager.props.smoothing).toBe(0.3);
  expect(manager.atlas!.data).toBe(canvas);
  const widePadding = new FontAtlasManager();
  widePadding.setProps({
    characterSet: 'A',
    fontSize: 43,
    sdf: true,
    radius: 12,
    cutoff: 0.25,
    buffer: 9
  });
  expect(widePadding.mapping!.A.width).toBe(frame.width);
  expect(widePadding.mapping!.A.height).toBe(frame.height);
});

for (const backend of ['webgl'] as const) {
  test(`TextLayer renders and updates luma SDF atlases on ${backend}`, async ({skip}) => {
    const testDevice = device;
    if (!testDevice) return skip();
    let atlas;
    await testLayerAsync({
      Layer: TextLayer,
      device: testDevice,
      draw: true,
      onError: error => {
        throw error;
      },
      testCases: [
        {
          props: {
            data: [{text: 'A'}],
            characterSet: 'auto',
            fontFamily: `Luma migration ${backend}, monospace`,
            fontSettings: {sdf: true},
            outlineWidth: 8,
            getPosition: [0, 0],
            getText: row => row.text
          }
        },
        {updateProps: {data: [{text: 'Ag'}]}},
        {updateProps: {fontSettings: {sdf: true, smoothing: 0.3}}}
      ].map((testCase, index) => ({
        ...testCase,
        onAfterUpdate: ({layer}) => {
          const manager = layer.state.fontAtlasManager;
          expect(manager.atlas!.height).toBeGreaterThan(0);
          if (index === 1) atlas = manager.atlas!.data;
          if (index === 2) {
            expect(manager.atlas!.data).toBe(atlas);
            expect(
              layer.getSubLayers().find(child => child.id.endsWith('-characters'))!.props.smoothing
            ).toBe(0.3);
          }
        }
      }))
    });
  });
}

test('TextLayer cache limit resets both atlas caches', async () => {
  const {default: FontAtlasManager} = await import(
    '../../../../modules/layers/src/text-layer/font-atlas-manager'
  );
  const manager = new FontAtlasManager();
  manager.setProps({fontSize: 46, characterSet: 'A'});
  const canvas = manager.atlas!.data;
  TextLayer.fontAtlasCacheLimit = 3;
  const replacement = new FontAtlasManager();
  replacement.setProps({fontSize: 46, characterSet: 'A'});
  expect(replacement.atlas!.data).not.toBe(canvas);
});

test('TextLayer luma atlases upload to WebGPU, including empty atlases', async ({skip}) => {
  const device = await getWebGPUTestDevice('core');
  if (!device) return skip();
  const {default: FontAtlasManager} = await import(
    '../../../../modules/layers/src/text-layer/font-atlas-manager'
  );
  device.handle.pushErrorScope('validation');
  for (const characterSet of ['', 'Ag']) {
    const manager = new FontAtlasManager();
    manager.setProps({characterSet, fontFamily: 'monospace', sdf: true});
    const atlas = manager.atlas!;
    const texture = device.createTexture({
      data: atlas.data,
      width: atlas.width,
      height: atlas.height
    });
    expect(texture.width).toBe(atlas.width);
    expect(texture.height).toBe(atlas.height);
    texture.destroy();
  }
  expect(await device.handle.popErrorScope()).toBeNull();
});

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {TextLayer} from '@deck.gl/layers';
import FontAtlasManager from '@deck.gl/layers/text-layer/font-atlas-manager';

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

test('FontAtlasManager - SDF glyph frames hold the full distance field', () => {
  // The default `buffer` is smaller than the distance field, see #9032
  const fontAtlasManager = new FontAtlasManager();
  fontAtlasManager.setProps({sdf: true, characterSet: 'Hgjy_|.'});
  const {data: canvas, mapping} = fontAtlasManager.atlas!;
  const context = canvas.getContext('2d')!;

  const edgeAlphas: Record<string, number> = {};
  for (const char of Object.keys(mapping)) {
    const frame = mapping[char];
    const {data, width, height} = context.getImageData(frame.x, frame.y, frame.width, frame.height);
    let maxEdgeAlpha = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
          maxEdgeAlpha = Math.max(maxEdgeAlpha, data[(y * width + x) * 4 + 3]);
        }
      }
    }
    edgeAlphas[char] = maxEdgeAlpha;
  }

  expect(edgeAlphas, 'distance field reaches zero inside each glyph frame').toEqual({
    H: 0,
    g: 0,
    j: 0,
    y: 0,
    _: 0,
    '|': 0,
    '.': 0
  });
});

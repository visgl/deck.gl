// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {createTexture, destroyTexture} from '@deck.gl/core/utils/texture';
import {device} from '@deck.gl/test-utils/vitest';

const SIZE = 64;
// 1 + floor(log2(64))
const EXPECTED_MIP_LEVELS = 7;

test('createTexture#plain object image', () => {
  // The documented `{data, width, height}` form carries its dimensions on the object itself, not on
  // `data`. Reading them from the wrong level produced `mipLevels: NaN`, which rendered as opaque
  // black. See issue #10371
  const texture = createTexture(
    'test-owner',
    device,
    {data: new Uint8Array(SIZE * SIZE * 4).fill(200), width: SIZE, height: SIZE},
    {}
  );

  expect(texture, 'creates a texture').toBeTruthy();
  expect(texture!.width, 'reads width from the plain object').toBe(SIZE);
  expect(texture!.height, 'reads height from the plain object').toBe(SIZE);
  expect(texture!.mipLevels, 'derives a valid mip level count').toBe(EXPECTED_MIP_LEVELS);

  destroyTexture('test-owner', texture!);
});

test('createTexture#browser image object', () => {
  // Browser objects are wrapped as `{data: browserImage}`, so their dimensions live on `data`
  const texture = createTexture(
    'test-owner',
    device,
    new ImageData(new Uint8ClampedArray(SIZE * SIZE * 4).fill(200), SIZE, SIZE),
    {}
  );

  expect(texture, 'creates a texture').toBeTruthy();
  expect(texture!.width, 'reads width from the wrapped image').toBe(SIZE);
  expect(texture!.height, 'reads height from the wrapped image').toBe(SIZE);
  expect(texture!.mipLevels, 'derives a valid mip level count').toBe(EXPECTED_MIP_LEVELS);

  destroyTexture('test-owner', texture!);
});

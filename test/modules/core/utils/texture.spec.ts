// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {device} from '@deck.gl/test-utils/vitest';
import {createTexture, destroyTexture} from '@deck.gl/core/utils/texture';

test('createTexture#plain object with size on the object', () => {
  const width = 8;
  const height = 4;
  const texture = createTexture(
    'texture-spec',
    device,
    {width, height, data: new Uint8Array(width * height * 4).fill(255)},
    {}
  );
  expect(texture).toBeTruthy();
  expect(texture!.width).toBe(width);
  expect(texture!.height).toBe(height);
  expect(texture!.mipLevels).toBe(device.getMipLevelCount(width, height));
  destroyTexture('texture-spec', texture!);
});

test('createTexture#browser image object', () => {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 2;
  const texture = createTexture('texture-spec', device, canvas, {});
  expect(texture!.width).toBe(16);
  expect(texture!.height).toBe(2);
  expect(texture!.mipLevels).toBe(device.getMipLevelCount(16, 2));
  destroyTexture('texture-spec', texture!);
});

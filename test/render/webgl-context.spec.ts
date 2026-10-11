// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, test, expect} from 'vitest';
import type {TestDeviceType} from './deck-test-utils';
import {isRenderTestDeviceEnabled} from './render-test-suite';

describe.each(['webgl', 'webgpu'] as TestDeviceType[])('%s', deviceType => {
  test.runIf(isRenderTestDeviceEnabled(deviceType))(`render browser provides ${deviceType}`, () => {
    if (deviceType === 'webgpu') {
      expect('gpu' in navigator, 'Expected render browser to provide WebGPU').toBe(true);
      return;
    }

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');

    expect(gl, 'Expected render browser to provide a WebGL2 context').toBeTruthy();
  });
});

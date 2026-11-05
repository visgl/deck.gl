// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Timeline} from '@luma.gl/engine';
import {device} from '@deck.gl/test-utils/vitest';
import Attribute from '@deck.gl/core/lib/attribute/attribute';
import GPUInterpolationTransition from '@deck.gl/core/transitions/gpu-interpolation-transition';
import {padBuffer} from '@deck.gl/core/transitions/gpu-transition-utils';
import type {InterpolationTransitionSettings} from '@deck.gl/core/lib/attribute/transition-settings';

const webglTest = device.type === 'webgl' ? test : test.skip;
const settings: InterpolationTransitionSettings = {
  type: 'interpolation',
  duration: 1000,
  enter: value => value
};

webglTest('interpolation preserves its source when restarted before rendering', async () => {
  const attribute = new Attribute(device, {id: 'positions', size: 3, accessor: 'getPosition'});
  attribute.setData({value: new Float32Array([10, 20, 30])});
  const timeline = new Timeline();
  const transition = new GPUInterpolationTransition({device, attribute, timeline});
  const read = async () => {
    const result = await transition.attributeInTransition.getBuffer()!.readAsync();
    return Array.from(new Float32Array(result.buffer, result.byteOffset, result.byteLength / 4));
  };

  try {
    transition.start(settings, 1);
    transition.start(settings, 1);
    transition.start(settings, 1);
    transition.update();
    expect(await read()).toEqual([10, 20, 30]);

    attribute.setData({value: new Float32Array([30, 40, 50])});
    transition.start(settings, 1);
    transition.update();
    timeline.setTime(500);
    transition.update();
    expect(await read()).toEqual([20, 30, 40]);

    // Repeated restarts must preserve the last rendered value, including when growing.
    attribute.setData({value: new Float32Array([50, 60, 70, 80, 90, 100])});
    transition.start(settings, 2);
    transition.start(settings, 2);
    transition.update();
    expect(await read()).toEqual([20, 30, 40, 80, 90, 100]);
  } finally {
    transition.delete();
    transition.attributeInTransition.delete();
    attribute.delete();
  }
});

webglTest.each([false, true])('identity enter respects vertexOffset (fp64=%s)', async fp64 => {
  const attribute = new Attribute(device, {
    id: 'positions',
    size: 3,
    type: fp64 ? 'float64' : 'float32',
    fp64,
    vertexOffset: 1,
    accessor: 'getPosition'
  });
  const values = [10.1, 20.2, 30.3, 40.4, 50.5, 60.6];
  attribute.setData({value: fp64 ? new Float64Array(values) : new Float32Array(values)});
  const length = values.length * (fp64 ? 2 : 1);
  const buffer = padBuffer({
    device,
    attribute,
    fromLength: 0,
    toLength: length,
    getData: settings.enter
  });
  try {
    const source = await attribute.getBuffer()!.readAsync(attribute.byteOffset, length * 4);
    const padded = await buffer.readAsync(attribute.byteOffset, length * 4);
    expect(padded).toEqual(source);
  } finally {
    buffer.destroy();
    attribute.delete();
  }
});

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';

// import {COORDINATE_SYSTEM, Viewport, WebMercatorViewport} from 'deck.gl';
import {device} from '@deck.gl/test-utils';
import {picking, project32} from '@deck.gl/core';
import {Transform} from '@luma.gl/engine';
import VS from '../../../../modules/layers/src/path-layer/path-layer-vertex.glsl';

test('path-layer-vertex#flipIfTrue', () => {
  if (!Transform.isSupported(device)) {
    console.log('Transform not supported skipping the test');
    return;
  }

  const inject = {
    'vs:#decl': `
in float inFlag;
out float result;
`,
    'vs:#main-start': '  if (true) { result = flipIfTrue(bool(inFlag)); } else {\n',
    'vs:#main-end': '  }\n'
  };
  const inFlag = device.createBuffer({data: Float32Array([0, 1])});
  const expectedResult = [1, -1];
  const transform = new Transform(device, {
    sourceBuffers: {
      inFlag
    },
    vs: VS,
    modules: [picking, project32],
    inject,
    feedbackMap: {
      inFlag: 'result'
    },
    elementCount: 2
  });
  transform.run();
  const result = transform.getData({varyingName: 'result'});
  expect(result, 'flipIfTrue: should return correct value').toEqual(expectedResult);
});

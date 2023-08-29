import test from 'tape-promise/tape';

// import {COORDINATE_SYSTEM, Viewport, WebMercatorViewport} from 'deck.gl';
import {device} from '@deck.gl/test-utils';
import {picking, project32} from '@deck.gl/core';
import {Transform} from '@luma.gl/engine';
import VS from '../../../../modules/layers/src/path-layer/path-layer-vertex.glsl';

test('path-layer-vertex#flipIfTrue', t => {
  if (!Transform.isSupported(device)) {
    t.comment('Transform not supported skipping the test');
    t.end();
    return;
  }

  const inject = {
    'vs:#decl': `
attribute float inFlag;
varying float result;
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
  t.deepEqual(result, expectedResult, 'flipIfTrue: should return correct value');
  t.end();
});

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils/vitest';
import {TripsLayer} from '@deck.gl/geo-layers';
import {ShaderAssembler} from '@luma.gl/shadertools';
import {trips} from 'deck.gl-test/data';
import pathShaderSource from '@deck.gl/layers/path-layer/path-layer.wgsl';
import {tripsUniforms} from '@deck.gl/geo-layers/trips-layer/trips-layer-uniforms';
import {
  packTripTimestamps,
  tripsShaderInjectionsWGSL
} from '@deck.gl/geo-layers/trips-layer/trips-layer.wgsl';

test('TripsLayer#packTripTimestamps', () => {
  expect(packTripTimestamps([10, 20, 35])).toEqual(new Float32Array([10, 20, 20, 35, 35, 35]));
  expect(packTripTimestamps(new Float32Array([4, 8]))).toEqual(new Float32Array([4, 8, 8, 8]));
  expect(packTripTimestamps([])).toEqual(new Float32Array());
});

test('TripsLayer#WebGPU shader extends PathLayer', () => {
  for (const insertionPoint of Object.keys(tripsShaderInjectionsWGSL)) {
    expect(pathShaderSource).toContain(insertionPoint);
  }

  const shaderAssembler = new ShaderAssembler();
  const {source} = shaderAssembler.assembleWGSLShader({
    platformInfo: {
      type: 'webgpu',
      shaderLanguage: 'wgsl',
      shaderLanguageVersion: 300,
      gpu: 'test',
      features: new Set()
    },
    source: pathShaderSource,
    modules: [tripsUniforms],
    inject: tripsShaderInjectionsWGSL
  });

  expect(source).toContain('@location(13) instanceTimestamps: vec2<f32>');
  expect(source).toContain('@location(6) vTime: f32');
  expect(source).toContain('attributes.instanceTimestamps.x');
  expect(source).toContain('attributes.instanceTimestamps.y');
  expect(source).toContain('varyings.vTime > trips.currentTime');
  expect(source).toContain('trips.fadeTrail > 0.5');
  expect(source).toContain('var<uniform> trips: TripsUniforms');
  expect(source).not.toContain('in float instanceTimestamps');
});

test('TripsLayer', () => {
  const testCases = generateLayerTests({
    Layer: TripsLayer,
    sampleProps: {
      data: trips,
      getPath: d => d.map(p => p.begin_shape),
      getTimestamps: d => d.map(p => p.begin_time)
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title)
  });

  testLayer({Layer: TripsLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

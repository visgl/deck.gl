// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils/vitest';
import {LayerManager, MapView} from '@deck.gl/core';
import {TripsLayer} from '@deck.gl/geo-layers';
import {ShaderAssembler} from '@luma.gl/shadertools';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {trips} from 'deck.gl-test/data';
import pathShaderSource, {getShaderWGSL} from '@deck.gl/layers/path-layer/path-layer.wgsl';
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

test('TripsLayer#packTripTimestamps follows closed path padding', () => {
  expect(packTripTimestamps([10, 20, 35, 50], 6)).toEqual(
    new Float32Array([10, 20, 20, 35, 35, 10, 10, 20, 20, 35, 35, 10])
  );

  expect(packTripTimestamps([10, 20, 35], 5, true)).toEqual(
    new Float32Array([10, 20, 20, 35, 35, 10, 10, 20, 20, 35])
  );
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

test('TripsLayer#time-window discard follows PathLayer coverage derivatives', () => {
  const shaderAssembler = new ShaderAssembler();
  const {source} = shaderAssembler.assembleWGSLShader({
    platformInfo: {
      type: 'webgpu',
      shaderLanguage: 'wgsl',
      shaderLanguageVersion: 300,
      gpu: 'test',
      features: new Set()
    },
    source: getShaderWGSL(true),
    modules: [tripsUniforms],
    inject: tripsShaderInjectionsWGSL
  });

  expect(source.indexOf('fwidth(bodyCoord)')).toBeGreaterThan(-1);
  expect(source.indexOf('varyings.vTime > trips.currentTime')).toBeGreaterThan(
    source.indexOf('fwidth(bodyCoord)')
  );
});

test('TripsLayer#initializes with a WebGPU device', async ({skip}) => {
  const webgpuDevice = await getWebGPUTestDevice();
  if (!webgpuDevice) {
    skip();
    return;
  }

  const viewport = new MapView({}).makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1}
  });
  const errors: Error[] = [];
  const layerManager = new LayerManager(webgpuDevice, {viewport});
  layerManager.setProps({onError: error => errors.push(error)});

  const layer = new TripsLayer({
    id: 'webgpu-trips',
    data: [
      {
        path: [
          [0, 0],
          [1, 1],
          [2, 1]
        ],
        timestamps: [0, 10, 20]
      }
    ],
    getPath: trip => trip.path,
    getTimestamps: trip => trip.timestamps,
    currentTime: 10,
    trailLength: 20
  });

  webgpuDevice.handle.pushErrorScope('validation');
  layerManager.setLayers([layer]);

  expect(errors).toEqual([]);
  expect(layer.state.model).toBeDefined();
  const groupedLayout = layer
    .getAttributeManager()
    ?.getBufferLayouts()
    .find(layout => layout.name === 'path-instance-data');
  expect(groupedLayout?.attributes?.map(attribute => attribute.attribute)).toContain(
    'instanceTimestamps'
  );
  expect(groupedLayout?.attributes?.map(attribute => attribute.attribute)).not.toContain(
    'timestamps'
  );
  expect(await webgpuDevice.handle.popErrorScope()).toBeNull();

  layerManager.finalize();
});

test('TripsLayer#WebGPU preserves timestamps for closed paths', async ({skip}) => {
  const webgpuDevice = await getWebGPUTestDevice();

  if (!webgpuDevice) {
    skip();
    return;
  }

  const viewport = new MapView().makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1}
  });
  const testCases = [
    {
      id: 'webgpu-closed-trip',
      path: [
        [0, 0],
        [1, 1],
        [2, 1],
        [0, 0]
      ],
      timestamps: [0, 10, 20, 30],
      pathType: undefined,
      expected: new Float32Array([0, 10, 10, 20, 20, 0, 0, 10, 10, 20, 20, 0])
    },
    {
      id: 'webgpu-loop-trip',
      path: [0, 0, 1, 1, 2, 1],
      timestamps: [0, 10, 20],
      pathType: 'loop' as const,
      expected: new Float32Array([0, 10, 10, 20, 20, 0, 0, 10, 10, 20])
    }
  ];

  for (const testCase of testCases) {
    const errors: Error[] = [];
    const layerManager = new LayerManager(webgpuDevice, {viewport});
    layerManager.setProps({onError: error => errors.push(error)});

    const layer = new TripsLayer({
      id: testCase.id,
      data: [{path: testCase.path, timestamps: testCase.timestamps}],
      positionFormat: 'XY',
      _pathType: testCase.pathType,
      getPath: trip => trip.path,
      getTimestamps: trip => trip.timestamps,
      currentTime: 10,
      trailLength: 20
    });

    webgpuDevice.handle.pushErrorScope('validation');
    layerManager.setLayers([layer]);

    expect(errors, testCase.id).toEqual([]);
    expect(layer.state.model, testCase.id).toBeDefined();
    expect(layer.getAttributeManager()?.attributes.instanceTimestamps.value, testCase.id).toEqual(
      testCase.expected
    );

    await webgpuDevice.handle.queue.onSubmittedWorkDone();
    expect(await webgpuDevice.handle.popErrorScope(), testCase.id).toBeNull();

    layerManager.finalize();
  }
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

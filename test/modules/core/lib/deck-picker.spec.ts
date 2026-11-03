// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {LayerManager, MapView, OrthographicView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import DeckPicker from '@deck.gl/core/lib/deck-picker';
import {device} from '@deck.gl/test-utils/vitest';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import type {CanvasContext} from '@luma.gl/core';

const DEVICE_RECT_TEST_CASES = [
  {
    title: 'at center with radius',
    input: {deviceX: 5, deviceY: 5, deviceRadius: 1, deviceWidth: 10, deviceHeight: 10},
    output: {x: 4, y: 4, width: 3, height: 3}
  },
  {
    title: 'at center without radius',
    input: {deviceX: 5, deviceY: 5, deviceRadius: 0, deviceWidth: 10, deviceHeight: 10},
    output: {x: 5, y: 5, width: 1, height: 1}
  },
  {
    title: 'clipped by bounds',
    input: {deviceX: 0, deviceY: 10, deviceRadius: 1, deviceWidth: 10, deviceHeight: 10},
    output: {x: 0, y: 9, width: 2, height: 1}
  },
  {
    title: 'x out of bounds',
    input: {deviceX: -1, deviceY: 1, deviceRadius: 0, deviceWidth: 1, deviceHeight: 1},
    output: null
  },
  {
    title: 'y out of bounds',
    input: {deviceX: 0, deviceY: 2, deviceRadius: 0, deviceWidth: 1, deviceHeight: 1},
    output: null
  }
];

test('DeckPicker#getPickingRect', () => {
  const deckPicker = new DeckPicker(device);

  for (const testCase of DEVICE_RECT_TEST_CASES) {
    expect(
      deckPicker._getPickingRect(testCase.input),
      `${testCase.title}: returns correct result`
    ).toEqual(testCase.output);
  }
});

test('DeckPicker#_resizeBuffer uses drawing buffer size', () => {
  const deckPicker = new DeckPicker(device);
  const drawingBufferSize: [number, number] = [37, 41];
  const canvasContext = {
    getCSSSize: () => [10, 11],
    getDrawingBufferSize: () => drawingBufferSize
  } as CanvasContext;

  try {
    deckPicker._resizeBuffer(canvasContext);

    expect(deckPicker.pickingFBO?.width, 'pickingFBO width follows drawing buffer').toBe(
      drawingBufferSize[0]
    );
    expect(deckPicker.pickingFBO?.height, 'pickingFBO height follows drawing buffer').toBe(
      drawingBufferSize[1]
    );
    expect(
      deckPicker.depthFBO,
      'depthFBO is generated when float texture is renderable'
    ).toBeTruthy();
    expect(deckPicker.depthFBO?.width, 'depthFBO width follows drawing buffer').toBe(
      drawingBufferSize[0]
    );
    expect(deckPicker.depthFBO?.height, 'depthFBO height follows drawing buffer').toBe(
      drawingBufferSize[1]
    );
  } finally {
    deckPicker.finalize();
  }
});

/* eslint-disable max-statements */
test('DeckPicker#pick empty', () => {
  const deckPicker = new DeckPicker(device);
  const view = new MapView();
  const viewport = view.makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1}
  });
  const layerManager = new LayerManager(device, {viewport});
  const drawAndSample = vi.spyOn(deckPicker, '_drawAndSample');

  const opts = {
    layers: [],
    views: [view],
    viewports: [viewport],
    effects: [],
    onViewportActive: layerManager.activateViewport,
    x: 1,
    y: 1
  };

  const layer = new ScatterplotLayer({
    data: [{position: [0, 0]}, {position: [0, 0]}],
    radiusMinPixels: 100,
    pickable: true
  });
  layerManager.setLayers([layer]);

  let output = deckPicker.pickObject(opts);
  expect(output.result, 'No layer is picked').toEqual([]);
  expect(output.emptyInfo.x, 'emptyInfo.x is populated').toBeTruthy();
  expect(output.emptyInfo.coordinate[0], 'emptyInfo.coordinate is populated').toBeTruthy();

  output = deckPicker.pickObjects(opts);
  expect(output, 'No layer is picked').toEqual([]);

  expect(deckPicker.pickingFBO, 'pickingFBO is not generated').toBeFalsy();

  opts.layers = [layer];
  deckPicker.setProps({_pickable: false});
  output = deckPicker.pickObject(opts);
  expect(output.result, 'No layer is picked').toEqual([]);

  expect(deckPicker.pickingFBO, 'pickingFBO is not generated').toBeFalsy();

  deckPicker.setProps({_pickable: true});
  output = deckPicker.pickObject(opts);
  expect(output.result[0].layer, 'Layer is picked').toBe(layer);
  expect(
    drawAndSample,
    'the active canvas context reaches synchronous picking'
  ).toHaveBeenCalledWith(
    expect.objectContaining({canvasContext: device.getDefaultCanvasContext()})
  );

  expect(deckPicker.pickingFBO, 'pickingFBO is generated').toBeTruthy();

  layerManager.finalize();
  deckPicker.finalize();
});

/* eslint-disable max-statements */
test('DeckPicker#pick async empty', async () => {
  const deckPicker = new DeckPicker(device);
  const view = new MapView();
  const viewport = view.makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1}
  });
  const layerManager = new LayerManager(device, {viewport});
  const drawAndSampleAsync = vi.spyOn(deckPicker, '_drawAndSampleAsync');

  const opts = {
    layers: [],
    views: [view],
    viewports: [viewport],
    effects: [],
    onViewportActive: layerManager.activateViewport,
    x: 1,
    y: 1
  };

  const layer = new ScatterplotLayer({
    data: [{position: [0, 0]}, {position: [0, 0]}],
    radiusMinPixels: 100,
    pickable: true
  });
  layerManager.setLayers([layer]);

  let output = await deckPicker.pickObjectAsync(opts);
  expect(output.result, 'No layer is picked (async)').toEqual([]);
  expect(output.emptyInfo.x, 'emptyInfo.x is populated (async)').toBeTruthy();

  const outputObjects = await deckPicker.pickObjectsAsync(opts);
  expect(outputObjects, 'No layer is picked (async pickObjects)').toEqual([]);

  opts.layers = [layer];
  deckPicker.setProps({_pickable: true});
  output = await deckPicker.pickObjectAsync(opts);
  expect(output.result[0].layer, 'Layer is picked (async)').toBe(layer);
  expect(
    drawAndSampleAsync,
    'the active canvas context reaches asynchronous picking'
  ).toHaveBeenCalledWith(
    expect.objectContaining({canvasContext: device.getDefaultCanvasContext()})
  );

  expect(deckPicker.pickingFBO, 'pickingFBO is generated (async)').toBeTruthy();

  layerManager.finalize();
  deckPicker.finalize();
});

test('DeckPicker#pick async on WebGPU uses a top-left framebuffer origin', async ({skip}) => {
  const webgpuDevice = await getWebGPUTestDevice();
  if (!webgpuDevice) {
    skip();
    return;
  }

  const size = 64;
  // A 1:1 canvas context, so CSS pixels and device pixels match
  const canvasContext = {
    getCSSSize: () => [size, size],
    getDrawingBufferSize: () => [size, size],
    cssToDeviceRatio: () => 1,
    cssToDevicePixels: ([x, y]: number[], yInvert = true) => ({
      x,
      y: yInvert ? size - 1 - y : y,
      width: 1,
      height: 1
    })
  } as unknown as CanvasContext;
  // The view covers the top quarter of the canvas. Its dot is centered at CSS [32, 8].
  const view = new OrthographicView({id: 'top', x: 0, y: 0, width: '100%', height: '25%'});
  const viewport = view.makeViewport({
    width: size,
    height: size,
    viewState: {target: [0, 0, 0], zoom: 0}
  });
  const layer = new ScatterplotLayer({
    id: 'webgpu-picking-origin',
    data: [{position: [0, 0]}],
    getPosition: point => point.position,
    radiusUnits: 'pixels',
    getRadius: 4,
    pickable: true
  });
  const deckPicker = new DeckPicker(webgpuDevice);
  const layerManager = new LayerManager(webgpuDevice, {viewport});

  try {
    layerManager.setLayers([layer]);
    const opts = {
      layers: layerManager.getLayers(),
      views: {[view.id]: view},
      viewports: [viewport],
      effects: [],
      onViewportActive: layerManager.activateViewport,
      canvasContext
    };

    const beginRenderPass = vi.spyOn(webgpuDevice, 'beginRenderPass');
    let output = await deckPicker.pickObjectAsync({...opts, x: 32, y: 8});
    expect(output.result[0]?.layer, 'the dot is picked in the top quarter').toBe(layer);
    expect(
      beginRenderPass.mock.calls[0][0]?.parameters?.scissorRect,
      'the picking scissor rectangle has a top-left origin'
    ).toEqual([32, 8, 1, 1]);
    beginRenderPass.mockRestore();

    output = await deckPicker.pickObjectAsync({...opts, x: 32, y: size - 8});
    expect(output.result, 'nothing is picked in the bottom quarter').toEqual([]);

    // Picking below the dot, the closest dot pixel is above the pick point (larger bottom-left y)
    output = await deckPicker.pickObjectAsync({...opts, x: 32, y: 16, radius: 6});
    expect(output.result[0]?.layer, 'the dot is picked within the radius').toBe(layer);
    expect(
      output.result[0]?.devicePixel?.[1],
      'readback rows are in bottom-to-top order'
    ).toBeGreaterThan(size - 1 - 16);
  } finally {
    layerManager.finalize();
    deckPicker.finalize();
  }
});

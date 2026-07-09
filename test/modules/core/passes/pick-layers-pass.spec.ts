// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {LayerManager, MapView, PolygonLayer, ScatterplotLayer} from 'deck.gl';
import PickLayersPass from '@deck.gl/core/passes/pick-layers-pass';
import * as FIXTURES from 'deck.gl-test/data';
import {device, getLayerUniforms} from '@deck.gl/test-utils/vitest';

test('PickLayersPass#drawPickingBuffer', () => {
  const pickingFBO = device.createFramebuffer({colorAttachments: ['rgba8unorm']});

  // Resize it to current canvas size (this is a noop if size hasn't changed)
  pickingFBO.resize({width: 100, height: 100});

  const viewport = new MapView().makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1}
  });

  const layer = new PolygonLayer({
    data: FIXTURES.polygons.slice(0, 3),
    getPolygon: f => f,
    getFillColor: (f, {index}) => [index, 0, 0],
    pickable: true
  });

  const layerManager = new LayerManager(device, {viewport});
  const pickLayersPass = new PickLayersPass(device);

  layerManager.setLayers([layer]);
  pickLayersPass.render({
    viewports: [viewport],
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    pickingFBO,
    deviceRect: {x: 0, y: 0, width: 100, height: 100}
  });

  const subLayers = layer.getSubLayers();

  expect(`PickLayersPass rendered`).toBeTruthy();
  expect(
    getLayerUniforms(subLayers[0], 'lighting').enabled,
    `PickLayersPass lighting disabled correctly`
  ).toBe(0);
});

test('PickLayersPass#view clearColor does not corrupt the picking buffer', () => {
  const pickingFBO = device.createFramebuffer({colorAttachments: ['rgba8unorm']});
  pickingFBO.resize({width: 100, height: 100});

  const view = new MapView({clear: true, clearColor: [255, 255, 255, 255]});
  const viewport = view.makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1}
  });

  const layer = new ScatterplotLayer({
    data: [{position: [0, 0]}],
    getPosition: d => d.position,
    radiusMinPixels: 10,
    pickable: true
  });

  const layerManager = new LayerManager(device, {viewport});
  const pickLayersPass = new PickLayersPass(device);

  layerManager.setLayers([layer]);
  const {decodePickingColor} = pickLayersPass.render({
    viewports: [viewport],
    views: {[view.id]: view},
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    pickingFBO,
    deviceRect: {x: 0, y: 0, width: 100, height: 100}
  });

  const pixels = device.readPixelsToArrayWebGL(pickingFBO, {
    sourceX: 0,
    sourceY: 0,
    sourceWidth: 100,
    sourceHeight: 100
  });

  // The object is at the center of the viewport with a 10px radius,
  // so the corner pixel only contains the view's clear color
  const cornerColor = pixels.slice(0, 4);
  expect(
    cornerColor[3],
    'background pixel decodes to "no object" (alpha 0) despite view clearColor'
  ).toBe(0);

  const centerIndex = (50 * 100 + 50) * 4;
  const centerColor = pixels.slice(centerIndex, centerIndex + 4);
  const pickedObject = decodePickingColor!(centerColor);
  expect(pickedObject?.pickedLayer?.id, 'object is still picked at the center').toBe(layer.id);
});

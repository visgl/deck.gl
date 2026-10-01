// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {LayerManager, MapView, PolygonLayer, ScatterplotLayer} from 'deck.gl';
import PickLayersPass from '@deck.gl/core/passes/pick-layers-pass';
import * as FIXTURES from 'deck.gl-test/data';
import {device, getLayerUniforms} from '@deck.gl/test-utils/vitest';
import type {CanvasContext} from '@luma.gl/core';

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

test('PickLayersPass#forwards the supplied canvas context', () => {
  const pickingFBO = device.createFramebuffer({colorAttachments: ['rgba8unorm']});
  pickingFBO.resize({width: 64, height: 64});

  const view = new MapView();
  const viewport = view.makeViewport({
    width: 10,
    height: 8,
    viewState: {longitude: 0, latitude: 0, zoom: 1}
  });
  const layer = new ScatterplotLayer({
    data: [{position: [0, 0]}],
    getPosition: datum => datum.position,
    radiusMinPixels: 2,
    pickable: true
  });
  const canvasContext = {
    getCurrentFramebuffer: () => pickingFBO,
    getDrawingBufferSize: () => [64, 64],
    cssToDeviceRatio: () => 2
  } as CanvasContext;
  const layerManager = new LayerManager(device, {viewport});
  const pickLayersPass = new PickLayersPass(device);

  layerManager.setLayers([layer]);
  pickLayersPass.render({
    canvasContext,
    viewports: [viewport],
    views: {[view.id]: view},
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    pickingFBO,
    deviceRect: {x: 0, y: 0, width: 64, height: 64}
  });

  expect(
    // @ts-expect-error glParameters not exposed
    layerManager.context.renderPass.glParameters.viewport,
    'picking pass preserves the supplied canvas pixel ratio'
  ).toEqual([0, 48, 20, 16]);

  layerManager.finalize();
  pickingFBO.destroy();
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

test('PickLayersPass#overlapping view clearColor:false preserves underlying picking', () => {
  const pickingFBO = device.createFramebuffer({colorAttachments: ['rgba8unorm']});
  pickingFBO.resize({width: 100, height: 100});

  // Bottom view: full screen, no clear. Its object renders at screen (50, 50).
  const viewA = new MapView({id: 'A'});
  // Top view: right region x:40..100 with clear enabled but clearColor:false.
  // Its rect covers (50, 50), so a forced color clear there would wipe A's pixel.
  const viewB = new MapView({id: 'B', x: 40, width: 60, clear: true, clearColor: false});

  const viewState = {longitude: 0, latitude: 0, zoom: 1};
  const viewportA = viewA.makeViewport({width: 100, height: 100, viewState});
  const viewportB = viewB.makeViewport({width: 100, height: 100, viewState});

  const layer = new ScatterplotLayer({
    data: [{position: [0, 0]}],
    getPosition: d => d.position,
    radiusMinPixels: 10,
    pickable: true
  });

  const layerManager = new LayerManager(device, {viewport: viewportA});
  const pickLayersPass = new PickLayersPass(device);

  layerManager.setLayers([layer]);
  const {decodePickingColor} = pickLayersPass.render({
    viewports: [viewportA, viewportB],
    views: {A: viewA, B: viewB},
    // Render the object in view A only; view B just performs its clear.
    layerFilter: ({viewport}) => viewport.id === 'A',
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

  // (50, 50) is inside view B's rect (x >= 40). With clearColor:false the color must be
  // preserved, so view A's object is still picked there instead of being cleared away.
  const centerIndex = (50 * 100 + 50) * 4;
  const centerColor = pixels.slice(centerIndex, centerIndex + 4);
  const pickedObject = decodePickingColor!(centerColor);
  expect(
    pickedObject?.pickedLayer?.id,
    "bottom view's object survives the top view's clearColor:false clear"
  ).toBe(layer.id);
});

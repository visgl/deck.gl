// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {LayerManager, MapView, PolygonLayer, SimpleMeshLayer} from 'deck.gl';
import ShadowPass from '@deck.gl/core/passes/shadow-pass';
import {CubeGeometry} from '@luma.gl/engine';
import * as FIXTURES from 'deck.gl-test/data';
import {device, getLayerUniforms} from '@deck.gl/test-utils/vitest';
const webglTest = device.type === 'webgl' ? test : test.skip;

test('ShadowPass#constructor and delete', () => {
  const shadowPass = new ShadowPass(device, {pixelRatio: 1.0});

  expect(shadowPass, `ShadowPass is constructed`).toBeTruthy();
  expect(shadowPass.fbo, `ShadowPass creates fbo`).toBeTruthy();

  shadowPass.delete();

  expect(shadowPass.fbo, `ShadowPass deletes fbo`).toBeFalsy();
});

webglTest('ShadowPass#render', () => {
  const viewport = new MapView().makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1}
  });

  const layer = new PolygonLayer({
    data: FIXTURES.polygons.slice(0, 3),
    getPolygon: f => f,
    getFillColor: (f, {index}) => [index, 0, 0]
  });

  const layerManager = new LayerManager(device, {viewport});

  layerManager.setLayers([layer]);

  const shadowPass = new ShadowPass(device, {pixelRatio: 1.0});
  shadowPass.render({
    viewports: [viewport],
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    deviceRect: {x: 0, y: 0, width: 100, height: 100},
    pixelRatio: 1,
    effectProps: {shadow_lightId: 0}
  });

  // These will likely fail locally due to DPR (200, 200)
  const shadowMap = shadowPass.fbo.colorAttachments[0].texture;
  expect(shadowMap.width, `ShadowPass resize shadow map width`).toBe(100);
  expect(shadowMap.height, `ShadowPass resize shadow map height`).toBe(100);
  shadowPass.delete();
});

test('ShadowPass#getShaderModuleProps', () => {
  const layer = new PolygonLayer({
    data: FIXTURES.polygons.slice(0, 3),
    getPolygon: f => f,
    getFillColor: (f, {index}) => [index, 0, 0]
  });

  const shadowPass = new ShadowPass(device, {pixelRatio: 1.0});
  const shaderModuleProps = shadowPass.getShaderModuleProps(layer, [], {
    project: {}
  });

  expect(shaderModuleProps.shadow.drawToShadowMap, `ShadowPass has module props`).toBe(true);
  expect(shaderModuleProps.lighting.enabled, `ShadowPass disables lighting`).toBe(false);
  shadowPass.delete();
});

webglTest('ShadowPass#render disables lighting', () => {
  const viewport = new MapView().makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1}
  });

  // SimpleMeshLayer applies lighting after DECKGL_FILTER_COLOR, where the shadow module writes
  // the packed depth. Lighting must be off in the shadow pass or the stored depth gets scaled.
  const layer = new SimpleMeshLayer({
    data: [0],
    mesh: new CubeGeometry(),
    getPosition: [0, 0, 0]
  });

  const layerManager = new LayerManager(device, {viewport});
  layerManager.setLayers([layer]);

  expect(getLayerUniforms(layer, 'lighting').enabled, `lighting is enabled by default`).toBe(1);

  const shadowPass = new ShadowPass(device, {pixelRatio: 1.0});
  shadowPass.render({
    viewports: [viewport],
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    deviceRect: {x: 0, y: 0, width: 100, height: 100},
    pixelRatio: 1
  });

  expect(
    getLayerUniforms(layer, 'lighting').enabled,
    `ShadowPass lighting disabled correctly`
  ).toBe(0);

  shadowPass.delete();
  layerManager.finalize();
});

test('ShadowPass#getLayerParameters', () => {
  const layer = new PolygonLayer({
    data: FIXTURES.polygons.slice(0, 3),
    getPolygon: f => f,
    parameters: {depthBias: 10}
  });

  const shadowPass = new ShadowPass(device, {pixelRatio: 1.0});
  const parameters = shadowPass.getLayerParameters(layer, 3, null);

  expect(parameters.depthBias, `ShadowPass draws without polygon offset`).toBe(0);
  expect(parameters.blend, `ShadowPass disables blending`).toBe(false);
  shadowPass.delete();
});

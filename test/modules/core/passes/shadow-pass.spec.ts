// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';

import {LayerManager, MapView, PolygonLayer} from 'deck.gl';
import ShadowPass from '@deck.gl/core/passes/shadow-pass';
import * as FIXTURES from 'deck.gl-test/data';
import {device} from '@deck.gl/test-utils';

test('ShadowPass#constructor and delete', t => {
  const shadowPass = new ShadowPass(device, {pixelRatio: 1.0});

  t.ok(shadowPass, `ShadowPass is constructed`);
  t.ok(shadowPass.fbo, `ShadowPass creates fbo`);

  shadowPass.delete();

  t.notOk(shadowPass.fbo, `ShadowPass deletes fbo`);
  t.end();
});

test('ShadowPass#render', t => {
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
  t.equal(shadowMap.width, 100, `ShadowPass resize shadow map width`);
  t.equal(shadowMap.height, 100, `ShadowPass resize shadow map height`);
  shadowPass.delete();
  t.end();
});

test('ShadowPass#getShaderModuleProps', t => {
  const layer = new PolygonLayer({
    data: FIXTURES.polygons.slice(0, 3),
    getPolygon: f => f,
    getFillColor: (f, {index}) => [index, 0, 0]
  });

  const shadowPass = new ShadowPass(device, {pixelRatio: 1.0});
  const shaderModuleProps = shadowPass.getShaderModuleProps(layer);

  t.equal(shaderModuleProps.shadow.drawToShadowMap, true, `ShadowPass has module parameters`);
  shadowPass.delete();
  t.end();
});

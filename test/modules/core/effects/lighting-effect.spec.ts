// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {LightingEffect} from '@deck.gl/core';
import {_CameraLight as CameraLight, DirectionalLight, PointLight} from '@deck.gl/core';
import {MapView, LayerManager} from '@deck.gl/core';
import {PolygonLayer} from '@deck.gl/layers';
import {equals} from '@math.gl/core';
import * as FIXTURES from 'deck.gl-test/data';
import {device} from '@deck.gl/test-utils';

const testViewport = new MapView().makeViewport({
  width: 100,
  height: 100,
  viewState: {longitude: -122, latitude: 37, zoom: 13}
});

function makeMockContext(device, layerManager) {
  return {
    device,
    deck: {
      _addDefaultShaderModule: layerManager.addDefaultShaderModule.bind(layerManager),
      _removeDefaultShaderModule: layerManager.removeDefaultShaderModule.bind(layerManager)
    }
  };
}

test('LightingEffect#constructor', t => {
  const lightingEffect = new LightingEffect();
  t.ok(lightingEffect, 'Lighting effect created');
  t.ok(lightingEffect.ambientLight, 'Default ambient light created');
  t.equal(lightingEffect.directionalLights.length, 2, 'Default directional lights created');
  t.end();
});

test('LightingEffect#getShaderModuleProps', t => {
  const cameraLight = new CameraLight();
  const pointLight = new PointLight();
  const lightingEffect = new LightingEffect({cameraLight, pointLight});

  const layer = new PolygonLayer({
    data: FIXTURES.polygons.slice(0, 3),
    getPolygon: f => f,
    getFillColor: (f, {index}) => [index, 0, 0]
  });

  layer.context = {viewport: testViewport};
  pointLight.intensity = 2.0;
  pointLight.color = [255, 0, 0];

  const layerManager = new LayerManager(device, {viewport: testViewport});
  layerManager.setLayers([layer]);

  const effectContext = makeMockContext(device, layerManager);
  lightingEffect.setup(effectContext);
  lightingEffect.preRender({
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    viewports: [testViewport],
    pixelRatio: 1
  });

  const {lighting} = lightingEffect.getShaderModuleProps(layer);
  t.is(lighting.pointLights.length, 2, 'Lights are exported');
  t.ok(
    equals(lighting.pointLights[0].position, [0, 0, 0.018310546875]),
    'Camera light projection is ok'
  );
  t.deepEqual(lighting.pointLights[1].color, [255, 0, 0], 'point light color is ok');

  t.equal(lighting.ambientLight, undefined, 'Lighting effect getGLParameters is ok');
  t.deepEqual(lighting.directionalLights, [], 'Lighting effect getGLParameters is ok');

  lightingEffect.cleanup(effectContext);
  layerManager.finalize();
  t.end();
});

test('LightingEffect#preRender, cleanup', t => {
  const dirLight0 = new DirectionalLight({
    color: [255, 255, 255],
    intensity: 1.0,
    direction: [10, -20, -30],
    _shadow: true
  });

  const dirLight1 = new DirectionalLight({
    color: [255, 255, 255],
    intensity: 1.0,
    direction: [-10, -20, -30],
    _shadow: true
  });

  const lightingEffect = new LightingEffect({dirLight0, dirLight1});

  const layer = new PolygonLayer({
    data: FIXTURES.polygons.slice(0, 3),
    getPolygon: f => f,
    getFillColor: (f, {index}) => [index, 0, 0]
  });

  layer.context = {viewport: testViewport};

  const layerManager = new LayerManager(device, {viewport: testViewport});
  layerManager.setLayers([layer]);

  const effectContext = makeMockContext(device, layerManager);
  lightingEffect.setup(effectContext);

  lightingEffect.preRender({
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    viewports: [testViewport],
    pixelRatio: 1
  });

  t.equal(lightingEffect.shadowPasses.length, 2, 'LightingEffect creates shadow passes');
  t.ok(lightingEffect.dummyShadowMap, 'LightingEffect creates dummy shadow map');

  lightingEffect.cleanup(effectContext);
  layerManager.finalize();
  t.equal(lightingEffect.shadowPasses.length, 0, 'LightingEffect creates shadow passes');
  t.notOk(lightingEffect.dummyShadowMap, 'LightingEffect cleans up dummy shadow map');
  t.end();
});

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {LightingEffect} from '@deck.gl/core';
import {_CameraLight as CameraLight, DirectionalLight, PointLight} from '@deck.gl/core';
import {MapView, LayerManager, WebMercatorViewport} from '@deck.gl/core';
import {PolygonLayer} from '@deck.gl/layers';
import {equals, Matrix4} from '@math.gl/core';
import * as FIXTURES from 'deck.gl-test/data';
import {device} from '@deck.gl/test-utils/vitest';

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

test('LightingEffect#constructor', () => {
  const lightingEffect = new LightingEffect();
  expect(lightingEffect, 'Lighting effect created').toBeTruthy();
  expect(lightingEffect.ambientLight, 'Default ambient light created').toBeTruthy();
  expect(lightingEffect.directionalLights.length, 'Default directional lights created').toBe(2);
});

test('LightingEffect#getShaderModuleProps', () => {
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
  expect(lighting.lights.length, 'Lights are exported').toBe(2);
  expect(
    equals(lighting.lights[0].position, [0, 0, 0.018310546875]),
    'Camera light projection is ok'
  ).toBeTruthy();
  expect(lighting.lights[1].color, 'point light color is ok').toEqual([255, 0, 0]);

  expect(lighting.ambientLight, 'Lighting effect getGLParameters is ok').toBe(undefined);
  expect(lighting.directionalLights, 'Lighting effect getGLParameters is ok').toBe(undefined);
  expect(lighting.pointLights, 'Lighting effect getGLParameters is ok').toBe(undefined);

  lightingEffect.cleanup(effectContext);
  layerManager.finalize();
});

test('LightingEffect#setProps toggles shadow resources', () => {
  const makeLight = (shadow: boolean) =>
    new DirectionalLight({
      color: [255, 255, 255],
      intensity: 1.0,
      direction: [10, -20, -30],
      _shadow: shadow
    });

  const layer = new PolygonLayer({
    data: FIXTURES.polygons.slice(0, 3),
    getPolygon: f => f,
    getFillColor: (f, {index}) => [index, 0, 0]
  });

  const layerManager = new LayerManager(device, {viewport: testViewport});
  layerManager.setLayers([layer]);
  const hasShadowModule = () =>
    layerManager.context.defaultShaderModules.some(module => module.name === 'shadow');

  const lightingEffect = new LightingEffect({dirLight: makeLight(true)});
  const effectContext = makeMockContext(device, layerManager);
  lightingEffect.setup(effectContext);
  layerManager.updateLayers();

  expect(lightingEffect.shadowPasses.length, 'shadow passes are created').toBe(1);
  expect(hasShadowModule(), 'shadow module is added').toBe(true);

  lightingEffect.setProps({dirLight: makeLight(false)});

  expect(lightingEffect.shadowPasses.length, 'shadow passes are released').toBe(0);
  expect(lightingEffect.dummyShadowMap, 'dummy shadow map is released').toBeFalsy();
  expect(hasShadowModule(), 'shadow module is removed').toBe(false);
  expect(layerManager.needsUpdate(), 'layers are rebuilt without the shadow module').toBeTruthy();
  layerManager.updateLayers();

  lightingEffect.setProps({dirLight: makeLight(true)});

  expect(lightingEffect.shadowPasses.length, 'shadow passes are recreated').toBe(1);
  expect(hasShadowModule(), 'shadow module is added again').toBe(true);

  lightingEffect.cleanup(effectContext);
  layerManager.finalize();
});

test('LightingEffect#preRender, cleanup', () => {
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

  expect(lightingEffect.shadowPasses.length, 'LightingEffect creates shadow passes').toBe(2);
  expect(lightingEffect.dummyShadowMap, 'LightingEffect creates dummy shadow map').toBeTruthy();

  lightingEffect.cleanup(effectContext);
  layerManager.finalize();
  expect(lightingEffect.shadowPasses.length, 'LightingEffect creates shadow passes').toBe(0);
  expect(lightingEffect.dummyShadowMap, 'LightingEffect cleans up dummy shadow map').toBeFalsy();
});

// Independently specified WGS84 lights must share the rendered geometry's reference.
test.each(['meter-offsets', 'lnglat-offsets'])(
  'PointLight retains the %s layer reference',
  coordinateSystem => {
    const viewport = new WebMercatorViewport({longitude: -120, latitude: 35, zoom: 14});
    const manager = new LayerManager(device, {viewport});
    const layer = new PolygonLayer({
      coordinateSystem,
      coordinateOrigin: [-122.45, 37.78, 0],
      modelMatrix: new Matrix4().translate([100, 200, 300]),
      data: []
    });
    try {
      manager.setLayers([layer]);
      const light = new PointLight({position: [-122.46, 37.8, 1000]});
      const result = light.getProjectedLight({layer}).position;
      expect(
        equals(result, [-0.014222222222187497, 0.03599369037291922, 0.016187212628251565])
      ).toBe(true);
    } finally {
      manager.finalize();
    }
  }
);

test('PointLight preserves offset altitude scaling below the Mercator auto-offset threshold', () => {
  const viewport = new WebMercatorViewport({longitude: -120, latitude: 35, zoom: 8});
  const manager = new LayerManager(device, {viewport});
  const layer = new PolygonLayer({
    coordinateSystem: 'meter-offsets',
    coordinateOrigin: [-122.45, 37.78, 0],
    data: []
  });
  try {
    manager.setLayers([layer]);
    const result = new PointLight({position: [-122.46, 37.8, 1000]}).getProjectedLight({
      layer
    }).position;
    expect(equals(result, [-0.014222222222187497, 0.03599369037291922, 0.016187212628251565])).toBe(
      true
    );
  } finally {
    manager.finalize();
  }
});

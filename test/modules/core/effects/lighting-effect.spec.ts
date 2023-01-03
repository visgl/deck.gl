import test from 'tape-promise/tape';
import {LightingEffect, getProgramManager} from '@deck.gl/core';
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

test('LightingEffect#constructor', t => {
  const lightingEffect = new LightingEffect();
  t.ok(lightingEffect, 'Lighting effect created');
  t.ok(lightingEffect.ambientLight, 'Default ambient light created');
  t.equal(lightingEffect.directionalLights.length, 2, 'Default directional lights created');
  t.end();
});

test('LightingEffect#getModuleParameters', t => {
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

  lightingEffect.preRender(device, {
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    viewports: [testViewport],
    pixelRatio: 1
  });

  const {lightSources} = lightingEffect.getModuleParameters(layer);
  t.is(lightSources.pointLights.length, 2, 'Lights are exported');
  t.ok(
    equals(lightSources.pointLights[0].position, [0, 0, 0.018310546875]),
    'Camera light projection is ok'
  );
  t.deepEqual(lightSources.pointLights[1].color, [255, 0, 0], 'point light color is ok');

  t.equal(lightSources.ambientLight, null, 'Lighting effect getParameters is ok');
  t.deepEqual(lightSources.directionalLights, [], 'Lighting effect getParameters is ok');

  lightingEffect.cleanup();
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

  lightingEffect.preRender(device, {
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    viewports: [testViewport],
    pixelRatio: 1
  });

  t.equal(lightingEffect.shadowPasses.length, 2, 'LightingEffect creates shadow passes');
  t.ok(lightingEffect.dummyShadowMap, 'LightingEffect creates dummy shadow map');

  lightingEffect.cleanup();
  t.equal(lightingEffect.shadowPasses.length, 0, 'LightingEffect creates shadow passes');
  t.notOk(lightingEffect.dummyShadowMap, 'LightingEffect cleans up dummy shadow map');
  t.end();
});

test('LightingEffect#shadow module', t => {
  const dirLight = new DirectionalLight({
    color: [255, 255, 255],
    intensity: 1.0,
    direction: [10, -20, -30],
    _shadow: true
  });

  const lightingEffect = new LightingEffect({dirLight});
  const pipelineFactory = getProgramManager(device);
  lightingEffect.preRender(device, {
    layers: [],
    viewports: [testViewport],
    onViewportActive: () => {},
    views: [],
    pixelRatio: 1
  });
  // @ts-expect-error private
  let defaultModules = pipelineFactory._defaultModules;
  let hasShadow = defaultModules.some(m => m.name === 'shadow');
  t.equal(hasShadow, true, 'LightingEffect adds shadow module to default correctly');

  lightingEffect.cleanup();
  // @ts-expect-error private
  defaultModules = pipelineFactory._defaultModules;
  hasShadow = defaultModules.some(m => m.name === 'shadow');
  t.equal(hasShadow, false, 'LightingEffect removes shadow module to default correctly');
  t.end();
});

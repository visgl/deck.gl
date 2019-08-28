import test from 'tape-catch';
import LightingEffect from '@deck.gl/core/effects/lighting/lighting-effect';
import {_CameraLight as CameraLight, DirectionalLight, PointLight} from '@deck.gl/core';
import {ProgramManager} from '@luma.gl/core';
import {MapView, PolygonLayer, LayerManager} from 'deck.gl';
import * as FIXTURES from 'deck.gl-test/data';
import {gl} from '@deck.gl/test-utils';

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

test('LightingEffect#CameraLight', t => {
  const cameraLight = new CameraLight();
  const lightEffect = new LightingEffect({cameraLight});

  const layer = new PolygonLayer({
    data: FIXTURES.polygons.slice(0, 3),
    getPolygon: f => f,
    getFillColor: (f, {index}) => [index, 0, 0]
  });

  layer.context = {viewport: testViewport};

  const projectedLights = lightEffect._getProjectedPointLights(layer);
  t.ok(projectedLights[0], 'Camera light is ok');
  t.deepEqual(projectedLights[0].position, [0, 0, 150], 'Camera light projection is ok');

  const parameters = lightEffect.getParameters(layer);
  t.ok(parameters, 'Lighting effect getParameters is ok');
  t.equal(parameters.lightSources.ambientLight, null, 'Lighting effect getParameters is ok');
  t.deepEqual(parameters.lightSources.directionalLights, [], 'Lighting effect getParameters is ok');
  t.deepEqual(
    parameters.lightSources.pointLights[0].position,
    [0, 0, 150],
    'Lighting effect getParameters is ok'
  );
  t.end();
});

test('LightingEffect#PointLight', t => {
  const pointLight = new PointLight();
  const lightEffect = new LightingEffect({pointLight});

  const layer = new PolygonLayer({
    data: FIXTURES.polygons.slice(0, 3),
    getPolygon: f => f,
    getFillColor: (f, {index}) => [index, 0, 0]
  });

  layer.context = {viewport: testViewport};
  pointLight.intensity = 2.0;
  pointLight.color = [255, 0, 0];

  const projectedLights = lightEffect._getProjectedPointLights(layer);
  t.ok(projectedLights[0], 'point light is ok');
  t.equal(projectedLights[0].intensity, 2.0, 'point light intensity is ok');
  t.deepEqual(projectedLights[0].color, [255, 0, 0], 'point light color is ok');
  t.end();
});

test('LightingEffect#prepare and cleanup', t => {
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
  const programManager = new ProgramManager(gl);

  const layer = new PolygonLayer({
    data: FIXTURES.polygons.slice(0, 3),
    getPolygon: f => f,
    getFillColor: (f, {index}) => [index, 0, 0]
  });

  layer.context = {viewport: testViewport};

  const layerManager = new LayerManager(gl, {viewport: testViewport});
  layerManager.setLayers([layer]);

  lightingEffect.prepare(gl, {
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    viewports: [testViewport],
    pixelRatio: 1,
    programManager
  });

  t.equal(lightingEffect.shadowPasses.length, 2, 'LightingEffect prepares shadow passes');
  t.ok(lightingEffect.dummyShadowMap, 'LightingEffect prepares dummy shadow map');

  lightingEffect.cleanup();
  t.equal(lightingEffect.shadowPasses.length, 0, 'LightingEffect prepares shadow passes');
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
  const programManager = new ProgramManager(gl);
  lightingEffect.prepare(gl, {
    layers: [],
    viewports: [testViewport],
    onViewportActive: () => {},
    views: [],
    pixelRatio: 1,
    programManager
  });
  let defaultModules = programManager._defaultModules;
  let hasShadow = defaultModules.some(m => m.name === 'shadow');
  t.equal(hasShadow, true, 'LightingEffect adds shadow module to default correctly');

  lightingEffect.cleanup();
  defaultModules = programManager._defaultModules;
  hasShadow = defaultModules.some(m => m.name === 'shadow');
  t.equal(hasShadow, false, 'LightingEffect removes shadow module to default correctly');
  t.end();
});

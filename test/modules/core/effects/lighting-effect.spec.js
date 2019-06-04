import test from 'tape-catch';
import LightingEffect from '@deck.gl/core/effects/lighting/lighting-effect';
import {_CameraLight as CameraLight, PointLight} from '@deck.gl/core';

import {MapView, PolygonLayer} from 'deck.gl';
import * as FIXTURES from 'deck.gl-test/data';

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

  const viewport = new MapView().makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: -122, latitude: 37, zoom: 13}
  });

  const layer = new PolygonLayer({
    data: FIXTURES.polygons.slice(0, 3),
    getPolygon: f => f,
    getFillColor: (f, {index}) => [index, 0, 0]
  });

  layer.context = {viewport};

  const projectedLights = lightEffect.getProjectedPointLights(layer);
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

  const viewport = new MapView().makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: -122, latitude: 37, zoom: 13}
  });

  const layer = new PolygonLayer({
    data: FIXTURES.polygons.slice(0, 3),
    getPolygon: f => f,
    getFillColor: (f, {index}) => [index, 0, 0]
  });

  layer.context = {viewport};
  pointLight.intensity = 2.0;
  pointLight.color = [255, 0, 0];

  const projectedLights = lightEffect.getProjectedPointLights(layer);
  t.ok(projectedLights[0], 'point light is ok');
  t.equal(projectedLights[0].intensity, 2.0, 'point light intensity is ok');
  t.deepEqual(projectedLights[0].color, [255, 0, 0], 'point light color is ok');
  t.end();
});

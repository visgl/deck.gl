import test from 'tape-catch';
import LightWithShadowEffect from '@deck.gl/core/effects/lighting/light-with-shadow-effect';
import {gl} from '@deck.gl/test-utils';
import {MapView, PolygonLayer} from 'deck.gl';
import * as FIXTURES from 'deck.gl-test/data';
import {getDefaultShaderModules} from '@luma.gl/core';

test('LightWithShadowEffect#constructor', t => {
  const lightingEffect = new LightWithShadowEffect();
  lightingEffect.cleanup();

  t.ok(lightingEffect, 'LightWithShadowEffect created');
  t.ok(lightingEffect.ambientLight, 'Default ambient light created');
  t.equal(lightingEffect.directionalLights.length, 2, 'Default directional lights created');
  t.end();
});

test('LightWithShadowEffect#prepare and cleanup', t => {
  const lightingEffect = new LightWithShadowEffect();

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
  lightingEffect.prepare(gl, {layers: [layer], viewports: [viewport], pixelRatio: 1});

  t.equal(lightingEffect.lightMatrices.length, 2, 'LightWithShadowEffect prepares light matrices');
  t.equal(lightingEffect.shadowPasses.length, 2, 'LightWithShadowEffect prepares shadow passes');
  t.equal(
    lightingEffect.dummyShadowMaps.length,
    2,
    'LightWithShadowEffect prepares dummy shadow maps'
  );

  lightingEffect.cleanup();
  t.equal(lightingEffect.shadowPasses.length, 0, 'LightWithShadowEffect prepares shadow passes');
  t.equal(
    lightingEffect.dummyShadowMaps.length,
    0,
    'LightWithShadowEffect prepares dummy shadow maps'
  );
  t.end();
});

test('LightWithShadowEffect#shadow module', t => {
  const lightingEffect = new LightWithShadowEffect();
  const defaultModules = getDefaultShaderModules();
  let hasShadow = defaultModules.find(m => m.name === 'shadow');
  t.equal(hasShadow, true, 'LightWithShadowEffect adds shadow module to default correctly');

  lightingEffect.cleanup();
  hasShadow = defaultModules.find(m => m.name === 'shadow');
  t.equal(hasShadow, false, 'LightWithShadowEffect removes shadow module to default correctly');
  t.end();
});

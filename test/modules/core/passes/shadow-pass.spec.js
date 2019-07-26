import test from 'tape-catch';

import {LayerManager, MapView, PolygonLayer} from 'deck.gl';
import ShadowPass from '@deck.gl/core/passes/shadow-pass';
import * as FIXTURES from 'deck.gl-test/data';
import gl from '@deck.gl/test-utils/utils/setup-gl';

test('ShadowPass#constructor and delete', t => {
  const shadowPass = new ShadowPass(gl, {pixelRatio: 1.0});

  t.ok(shadowPass, `ShadowPass is constructed well`);
  t.ok(shadowPass.shadowMap, `ShadowPass creates shadow map well`);
  t.ok(shadowPass.depthBuffer, `ShadowPass creates depth buffer well`);
  t.ok(shadowPass.fbo, `ShadowPass creates fbo well`);

  shadowPass.delete();

  t.ok(!shadowPass.shadowMap, `ShadowPass deletes shadow map well`);
  t.ok(!shadowPass.depthBuffer, `ShadowPass deletes depth buffer well`);
  t.ok(!shadowPass.fbo, `ShadowPass deletes fbo well`);
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

  const layerManager = new LayerManager(gl, {viewport});

  layerManager.setLayers([layer]);

  const shadowPass = new ShadowPass(gl, {pixelRatio: 1.0});
  shadowPass.render(gl, {
    viewports: [viewport],
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    deviceRect: {x: 0, y: 0, width: 100, height: 100},
    pixelRatio: 1,
    effectProps: {shadow_lightId: 0}
  });

  t.equal(shadowPass.shadowMap.width, 100, `ShadowPass resize shadow map width well`);
  t.equal(shadowPass.shadowMap.height, 100, `ShadowPass resize shadow map height well`);
  shadowPass.delete();
  t.end();
});

test('ShadowPass#getModuleParameters', t => {
  const layer = new PolygonLayer({
    data: FIXTURES.polygons.slice(0, 3),
    getPolygon: f => f,
    getFillColor: (f, {index}) => [index, 0, 0]
  });

  const shadowPass = new ShadowPass(gl, {pixelRatio: 1.0});
  const moduleParameters = shadowPass.getModuleParameters(layer);

  t.equal(moduleParameters.pickingActive, 0, `ShadowPass has no active picking module`);
  shadowPass.delete();
  t.end();
});

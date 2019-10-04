import test from 'tape-catch';

import {LayerManager, MapView, PolygonLayer} from 'deck.gl';
import PickLayersPass from '@deck.gl/core/passes/pick-layers-pass';
import {Framebuffer} from '@luma.gl/core';
import * as FIXTURES from 'deck.gl-test/data';
import gl from '@deck.gl/test-utils/utils/setup-gl';

test('PickLayersPass#drawPickingBuffer', t => {
  const pickingFBO = new Framebuffer(gl);

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

  const layerManager = new LayerManager(gl, {viewport});
  const pickLayersPass = new PickLayersPass(gl);

  layerManager.setLayers([layer]);
  pickLayersPass.render({
    viewports: [viewport],
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    pickingFBO,
    deviceRect: {x: 0, y: 0, width: 100, height: 100}
  });

  const subLayers = layer.getSubLayers();
  const models = subLayers[0].getModels();

  t.ok(`PickLayersPass rendered`);
  t.equal(
    models[0].program.uniforms.lighting_uEnabled,
    false,
    `PickLayersPass lighting disabled correctly`
  );

  t.end();
});

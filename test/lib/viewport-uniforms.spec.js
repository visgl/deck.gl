import test from 'tape-catch';
import {Matrix4} from 'luma.gl';

import {getUniformsFromViewport} from 'deck.gl/lib/viewport-uniforms';
import {Viewport, WebMercatorViewport} from 'deck.gl/lib/viewports';
import {COORDINATE_SYSTEM} from 'deck.gl/lib/constants';

const TEST_DATA = {
  mapState: {
    width: 793,
    height: 775,
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11.5,
    bearing: -44.48928121059271,
    pitch: 43.670797287818566
    // altitude: undefined
  }
};

test('Viewport#constructors', t => {
  const viewport = new WebMercatorViewport(TEST_DATA.mapState);
  t.ok(viewport instanceof Viewport, 'Created new WebMercatorViewport');
  t.end();
});

test('getUniformsFromViewport', t => {
  const viewport = new WebMercatorViewport(TEST_DATA.mapState);
  t.ok(viewport instanceof Viewport, 'Created new WebMercatorViewport');

  let uniforms = getUniformsFromViewport(viewport);
  t.ok(uniforms.devicePixelRatio > 0, 'Returned devicePixelRatio');
  t.ok((uniforms.projectionMatrix instanceof Float32Array) ||
    (uniforms.projectionMatrix instanceof Matrix4), 'Returned projectionMatrix');
  t.ok((uniforms.modelViewMatrix instanceof Float32Array) ||
    (uniforms.modelViewMatrix instanceof Matrix4), 'Returned modelViewMatrix');

  uniforms = getUniformsFromViewport(viewport, {
    projectionMode: COORDINATE_SYSTEM.METER_OFFSETS
  });
  t.ok(uniforms.projectionCenter.some(x => x), 'Returned non-trivial projection center');

  t.end();
});

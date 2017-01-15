import test from 'tape-catch';
import {getUniformsFromViewport} from 'deck.gl/lib/viewport-uniforms';
import {Viewport, WebMercatorViewport} from 'deck.gl/lib/viewports';

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

  const uniforms = getUniformsFromViewport(viewport);
  t.ok(uniforms, 'Returned some uniforms (TODO - add detailed checks)');
  t.end();
});

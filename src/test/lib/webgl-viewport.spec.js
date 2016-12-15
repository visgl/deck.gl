import test from 'tape-catch';
import WebGLViewport from '../../lib/webgl-viewport';
import {Viewport, WebMercatorViewport} from 'viewport-mercator-project';

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

test('WebGLViewport#constructor', t => {
  const viewport = new WebMercatorViewport(TEST_DATA.mapState);
  t.ok(viewport instanceof Viewport,
    'Created new WebMercatorViewport');
  t.ok(new WebGLViewport({viewport}) instanceof WebGLViewport,
    'Created new WebGLViewport with a Viewport instance');
  t.end();
});

test('Viewport#getUniforms()', t => {
  const webglViewport = new WebGLViewport({viewport: new WebMercatorViewport(TEST_DATA.mapState)});
  t.ok(webglViewport instanceof WebGLViewport,
    'Created new WebGLViewport with a Viewport instance');
  const uniforms = webglViewport.getUniforms();
  t.ok(uniforms,
    'Returned some uniforms (TODO - add detailed checks)');
  t.end();
});

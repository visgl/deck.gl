import test from 'tape-catch';
import PostProcessEffect from '@deck.gl/core/effects/post-process-effect';

const fs = `\
vec4 testEffect_filterColor(vec4 color, vec2 texSize, vec2 texCoord) {
  return color;
}
`;

const uniforms = {
};

const testModule = {
  name: 'testEffect',
  uniforms,
  fs,
  passes: [{filter: true}]
};

test('PostProcessEfect#constructor', t => {
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

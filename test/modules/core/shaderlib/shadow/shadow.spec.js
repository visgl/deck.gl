import test from 'tape-catch';

import {MapView} from 'deck.gl';
import {shadow} from '@deck.gl/core/shaderlib';
import {Matrix4, Vector3} from 'math.gl';
import {PROJECT_COORDINATE_SYSTEM} from '@deck.gl/core/shaderlib/project/constants';

test('shadow#getUniforms', t => {
  // LNG_LAT mode
  let viewport = new MapView().makeViewport({
    width: 800,
    height: 600,
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 10,
      bearing: -30,
      pitch: 40
    }
  });

  const projectionMatrix = new Matrix4().ortho({
    left: -1,
    right: 1,
    bottom: -1,
    top: 1,
    near: 0,
    far: 2
  });

  const viewMatrix = new Matrix4()
    .lookAt({
      eye: new Vector3([-10, -10, -10]).negate()
    })
    // arbitrary number that covers enough grounds
    .scale(1e-3);

  const viewProjectionMatrix = projectionMatrix.clone().multiplyRight(viewMatrix);

  let uniforms = shadow.getUniforms(
    {
      viewport,
      shadow_viewProjectionMatrices: [viewProjectionMatrix],
      drawToShadowMap: true,
      dummyShadowMaps: [true]
    },
    {
      project_uCenter: [0, 0, 0, 0],
      project_uCoordinateSystem: PROJECT_COORDINATE_SYSTEM.LNG_LAT
    }
  );

  t.equal(uniforms.shadow_uLightCount, 1, `Shadow light count is correct!`);
  t.deepEqual(
    uniforms[`shadow_uProjectCenters[0]`],
    [0, 0, 0, 0],
    `Shadow projection center in LNG_LAT mode is correct!`
  );
  t.deepEqual(
    uniforms[`shadow_uViewProjectionMatrices[0]`],
    viewProjectionMatrix.clone().translate(new Vector3(viewport.center).negate()),
    `Shadow viewProjection matrix in LNG_LAT mode is correct!`
  );

  // LNGLAT_AUTO_OFFSET mode
  viewport = new MapView().makeViewport({
    width: 800,
    height: 600,
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 15,
      bearing: -30,
      pitch: 40
    }
  });

  uniforms = shadow.getUniforms(
    {
      viewport,
      shadow_viewProjectionMatrices: [viewProjectionMatrix],
      drawToShadowMap: true,
      dummyShadowMaps: [true]
    },
    {
      project_uCenter: [
        0.00019792175635302556,
        -0.00004773572436533868,
        1.3134969991051548,
        1.4999866483231017
      ]
    }
  );

  t.deepEqual(
    uniforms[`shadow_uProjectCenters[0]`].toArray(),
    [0.00003672678690236353, -0.00003393860333744669, 16.320487093036718, 1.0000000000047367],
    `Shadow projection center in LNGLAT_AUTO_OFFSET mode is correct!`
  );
  t.deepEqual(
    uniforms[`shadow_uViewProjectionMatrices[0]`],
    viewProjectionMatrix.multiplyRight([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]),
    `Shadow viewProjection matrix in LNGLAT_AUTO_OFFSET mode is correct!`
  );

  t.end();
});

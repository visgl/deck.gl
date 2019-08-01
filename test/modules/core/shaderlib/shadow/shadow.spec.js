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

  const viewMatrix = new Matrix4().lookAt({
    eye: new Vector3([-1, -1, -1]).negate()
  });

  let uniforms = shadow.getUniforms(
    {
      viewport,
      shadow_matrices: [viewMatrix],
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
    uniforms[`shadow_uViewProjectionMatrices[0]`].toArray(),
    [
      0.0016999849607879905,
      -0.0007500704153316311,
      -0.0009960848968223089,
      0,
      0,
      0.0015001408306632622,
      -0.0009960848968223089,
      0,
      -0.0016999849607879905,
      -0.0007500704153316311,
      -0.0009960848968223089,
      0,
      -142.25867192876336,
      -240.8948015140241,
      285.47408688945353,
      1
    ],
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
      shadow_matrices: [viewMatrix],
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
    [0.27978817346047435, 0.2796375220259506, 0.057706067456820165, 1.0000000000047367],
    `Shadow projection center in LNGLAT_AUTO_OFFSET mode is correct!`
  );
  t.deepEqual(
    uniforms[`shadow_uViewProjectionMatrices[0]`].toArray(),
    [
      0.0016999849607999596,
      -0.0007500704153308891,
      -0.0009960848968280857,
      0,
      0,
      0.0015001408306617781,
      -0.0009960848968280857,
      0,
      -0.0016999849607999596,
      -0.0007500704153308891,
      -0.0009960848968280857,
      0,
      0,
      0,
      0,
      0
    ],
    `Shadow viewProjection matrix in LNGLAT_AUTO_OFFSET mode is correct!`
  );

  t.end();
});

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {MapView, OrbitView, COORDINATE_SYSTEM} from '@deck.gl/core';
import project from '@deck.gl/core/shaderlib/project/project';
import shadow from '@deck.gl/core/shaderlib/shadow/shadow';
import {Matrix4, Vector3} from '@math.gl/core';

const TEST_VIEWPORT1 = new MapView().makeViewport({
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

const TEST_VIEWPORT2 = new MapView().makeViewport({
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

const TEST_VIEWPORT3 = new OrbitView({near: 0.1, far: 2}).makeViewport({
  width: 800,
  height: 600,
  viewState: {
    target: [0, 0, 0],
    rotationX: 0,
    rotationOrbit: 0,
    orbitAxis: 'Y',
    fov: 30,
    zoom: 0
  }
});

// unproject above test viewports corners to ground and use them as reference points to test tight fitting bounding box

const TEST_CASE1 = [
  {
    xyz: [81.1474609375, 314.2470703125, 0], // top left corner inside
    result: true
  },
  {
    xyz: [81.146484375, 314.2470703125, 0], // top left corner outside
    result: false
  },
  {
    xyz: [82.0859375, 314.7900390625, 0], // top right corner inside
    result: true
  },
  {
    xyz: [82.0859375, 314.6923828125, 0.09765625], // point with altitude inside
    result: true
  },
  {
    xyz: [81.767578125, 313.6474609375, 0], // bottom left corner inside
    result: true
  },
  {
    xyz: [82.2958984375, 313.9521484375, 0], // bottom right corner outside
    result: false
  }
];

const TEST_CASE2 = [
  {
    xyz: [-0.022979736328125, 0.00592041015625, 0], // top left corner outside
    result: false
  },
  {
    xyz: [0.00640869140625, 0.022857666015625, 0], // top right corner outside
    result: false
  },
  {
    xyz: [-0.003570556640625, -0.012847900390625, 0], // bottom left corner inside
    result: true
  },
  {
    xyz: [0.012908935546875, -0.0032958984375, 0], // bottom right corner inside
    result: true
  }
];

const TEST_CASE3 = [
  {
    xyz: [-746, -47, -556], // top left far corner outside
    result: false
  },
  {
    xyz: [746, 1071, -556], // bottom right far corner outside
    result: false
  },
  {
    xyz: [-37, 485, 583], // top left near corner inside
    result: true
  },
  {
    xyz: [37, 539, 583], // bottom right near corner inside
    result: true
  }
];

function insideClipSpace(xyz) {
  return (
    xyz[0] >= -1.0 &&
    xyz[0] <= 1.0 &&
    xyz[1] >= -1.0 &&
    xyz[1] <= 1.0 &&
    xyz[2] >= -1.0 &&
    xyz[2] <= 1.0
  );
}

test('shadow#getUniforms', () => {
  // LNG_LAT mode
  let viewport = TEST_VIEWPORT1;

  const viewMatrix = new Matrix4().lookAt({
    eye: new Vector3([-1, -1, -1]).negate()
  });

  let uniforms = shadow.getUniforms({
    project: {viewport},
    shadowMatrices: [viewMatrix],
    drawToShadowMap: true,
    dummyShadowMaps: [true]
  });

  expect(uniforms.lightCount, `Shadow light count is correct!`).toBe(1);
  expect(uniforms.projectCenter0, `Shadow projection center in LNG_LAT mode is correct!`).toEqual([
    0, 0, 0, 0
  ]);

  for (const value of TEST_CASE1) {
    const result = uniforms.viewProjectionMatrix0.transform(value.xyz);
    expect(
      insideClipSpace(result),
      `Shadow viewProjection matrix in LNG_LAT mode is correct!`
    ).toBe(value.result);
  }

  // LNGLAT_AUTO_OFFSET mode
  viewport = TEST_VIEWPORT2;

  uniforms = shadow.getUniforms({
    project: {viewport},
    shadowMatrices: [viewMatrix],
    drawToShadowMap: true,
    dummyShadowMaps: [true]
  });

  for (const value of TEST_CASE2) {
    const result = uniforms.viewProjectionMatrix0.transform(value.xyz);
    const center = uniforms.projectCenter0;
    expect(
      insideClipSpace([
        (result[0] + center[0]) / center[3],
        (result[1] + center[1]) / center[3],
        (result[2] + center[2]) / center[3]
      ]),
      `Shadow viewProjection matrix in LNGLAT_AUTO_OFFSET mode is correct!`
    ).toBe(value.result);
  }

  // Non-Geospatial Identity Mode
  viewport = TEST_VIEWPORT3;

  uniforms = shadow.getUniforms({
    project: {
      viewport,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN
    },
    shadowMatrices: [viewMatrix],
    drawToShadowMap: true,
    dummyShadowMaps: [true]
  });

  for (const value of TEST_CASE3) {
    const result = uniforms.viewProjectionMatrix0.transform(value.xyz);
    expect(
      insideClipSpace(result),
      `Shadow viewProjection matrix in Identity mode is correct!`
    ).toBe(value.result);
  }
});

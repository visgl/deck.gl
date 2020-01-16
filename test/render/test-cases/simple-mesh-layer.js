import {OrbitView, COORDINATE_SYSTEM} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {Matrix4} from 'math.gl';
import {CubeGeometry} from '@luma.gl/core';
const cube = new CubeGeometry();

import {meshSampleData} from 'deck.gl-test/data';

export default [
  {
    name: 'simple-mesh-layer-lnglat',
    viewState: {
      latitude: 37.75,
      longitude: -122.45,
      zoom: 14,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new SimpleMeshLayer({
        id: 'simple-mesh-layer-lnglat',
        data: meshSampleData,
        mesh: cube,
        sizeScale: 30,
        modelMatrix: new Matrix4().translate([0, 0, 1000]),
        coordinateOrigin: [-122.45, 37.75, 0],
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS,
        getPosition: d => [d.position[0] / 1e5, d.position[1] / 1e5, 10],
        getColor: d => d.color,
        getOrientation: d => d.orientation
      })
    ],
    goldenImage: './test/render/golden-images/simple-mesh-layer-lnglat.png'
  },
  {
    name: 'simple-mesh-layer-cartesian',
    viewState: {
      target: [0, 0, 0],
      rotationX: 0,
      rotationOrbit: 0,
      orbitAxis: 'Y',
      fov: 30,
      zoom: -1.5
    },
    views: [
      new OrbitView({
        near: 0.1,
        far: 2
      })
    ],
    layers: [
      new SimpleMeshLayer({
        id: 'simple-mesh-layer-cartesian',
        data: meshSampleData,
        mesh: cube,
        sizeScale: 30,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        modelMatrix: new Matrix4().rotateX((-45 / 180) * Math.PI),
        getPosition: d => d.position,
        getColor: d => d.color,
        getOrientation: d => d.orientation
      })
    ],
    goldenImage: './test/render/golden-images/simple-mesh-layer-cartesian.png'
  },
  {
    name: 'simple-mesh-layer-meter-offsets',
    viewState: {
      latitude: 37.75,
      longitude: -122.45,
      zoom: 14,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new SimpleMeshLayer({
        id: 'simple-mesh-layer-meter-offsets',
        data: meshSampleData,
        mesh: cube,
        sizeScale: 30,
        coordinateOrigin: [-122.45, 37.75, 0],
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        modelMatrix: new Matrix4().rotateX((-45 / 180) * Math.PI),
        getPosition: d => d.position,
        getColor: d => d.color,
        getOrientation: d => d.orientation
      })
    ],
    goldenImage: './test/render/golden-images/simple-mesh-layer-meter-offsets.png'
  }
];

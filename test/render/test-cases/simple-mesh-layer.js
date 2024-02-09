import {
  OrbitView,
  COORDINATE_SYSTEM,
  LightingEffect,
  AmbientLight,
  PointLight
} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {Matrix4} from '@math.gl/core';
import {CubeGeometry, SphereGeometry} from '@luma.gl/engine';
const cube = new CubeGeometry();

const sphere = new SphereGeometry({
  nlat: 20,
  nlong: 20
});
const sphereNoNormal = {
  indices: sphere.indices,
  attributes: {
    positions: sphere.attributes.POSITION,
    texCoords: sphere.attributes.TEXCOORD_0
  }
};

const lightingEffect = new LightingEffect({
  ambient: new AmbientLight({color: [255, 255, 255], intensity: 1.0}),
  dir: new PointLight({color: [255, 255, 255], position: [200, 200, 200], intensity: 2.0})
});

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
      fov: 30,
      zoom: -1.5
    },
    views: [
      new OrbitView({
        orbitAxis: 'Y',
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
  },
  {
    name: 'simple-mesh-layer-shading-smooth',
    viewState: {
      target: [0, 0, 0],
      rotationX: 0,
      rotationOrbit: 0,
      zoom: 0
    },
    views: [
      new OrbitView({
        orbitAxis: 'Y',
        near: 0.1,
        far: 10
      })
    ],
    effects: [lightingEffect],
    layers: [
      new SimpleMeshLayer({
        id: 'simple-mesh-layer-shading',
        data: [0],
        mesh: sphere,
        sizeScale: 120,
        getPosition: d => [0, 0, 0],
        getColor: d => [200, 200, 120],
        material: {
          specularColor: [0, 0, 255]
        }
      })
    ],
    goldenImage: './test/render/golden-images/simple-mesh-layer-shading-smooth.png'
  },
  {
    name: 'simple-mesh-layer-shading',
    viewState: {
      target: [0, 0, 0],
      rotationX: 0,
      rotationOrbit: 0,
      zoom: 0
    },
    views: [
      new OrbitView({
        orbitAxis: 'Y',
        near: 0.1,
        far: 10
      })
    ],
    effects: [lightingEffect],
    layers: [
      new SimpleMeshLayer({
        id: 'simple-mesh-layer-shading',
        data: [0],
        mesh: sphereNoNormal,
        sizeScale: 120,
        getPosition: d => [0, 0, 0],
        getColor: d => [200, 200, 120],
        material: {
          specularColor: [0, 0, 255]
        }
      })
    ],
    goldenImage: './test/render/golden-images/simple-mesh-layer-shading-flat.png'
  }
];

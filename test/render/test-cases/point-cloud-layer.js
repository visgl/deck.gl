import {OrbitView, COORDINATE_SYSTEM} from '@deck.gl/core';
import {PointCloudLayer} from '@deck.gl/layers';
import {getPointCloud, positionOrigin} from 'deck.gl-test/data';

const POINTCLOUD = getPointCloud();

export default [
  {
    name: 'pointcloud-identity',
    views: [
      new OrbitView({
        fov: 30,
        orbitAxis: 'Y'
      })
    ],
    viewState: {
      rotationX: 15,
      rotationOrbit: 30
    },
    layers: [
      new PointCloudLayer({
        id: 'pointcloud-identity',
        data: [{position: [0, 100, 0]}, {position: [-100, -100, 0]}, {position: [100, -100, 0]}],
        opacity: 0.8,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        getPosition: d => d.position,
        getNormal: d => [0, 0.5, 0.2],
        getColor: d => [255, 255, 0, 128],
        pointSize: 50
      })
    ],
    goldenImage: './test/render/golden-images/pointcloud-identity.png'
  },
  {
    name: 'pointcloud-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 13,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PointCloudLayer({
        id: 'pointcloud-lnglat',
        data: POINTCLOUD,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS,
        coordinateOrigin: positionOrigin,
        getPosition: d => [d.position[0] * 1e-5, d.position[1] * 1e-5, d.position[2]],
        getNormal: d => d.normal,
        getColor: d => d.color,
        pointSize: 2,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/pointcloud-lnglat.png'
  },
  {
    name: 'pointcloud-meter',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 13,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PointCloudLayer({
        id: 'pointcloud-meter',
        data: {
          length: POINTCLOUD.length,
          attributes: {
            getPosition: new Float32Array(POINTCLOUD.flatMap(d => d.position)),
            getNormal: new Float32Array(POINTCLOUD.flatMap(d => d.normal)),
            getColor: {value: new Uint8Array(POINTCLOUD.flatMap(d => d.color)), size: 3}
          }
        },
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: positionOrigin,
        pointSize: 2,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/pointcloud-meter.png'
  }
];

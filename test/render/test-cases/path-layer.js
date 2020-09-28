import {COORDINATE_SYSTEM, OrthographicView, _GlobeView as GlobeView} from '@deck.gl/core';
import {PathLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';
import {zigzag, zigzag3D, meterPaths, positionOrigin} from 'deck.gl-test/data';

// prettier-ignore
const DASH_TEST_DATA = [
  [53.38,218.93,43.55,179.03,26.22,158.15,-2.25,138.62,-38.51,128.07,-72.23,127.35,-103.39,133.87,
    -117.30,141.74,-126.97,153.52,-130.41,168.93,-126.97,184.34,-117.30,196.12,-103.39,203.99,-72.23,210.51,
    -38.51,209.79,-2.25,199.24,26.22,179.71,43.55,158.83,53.38,118.93,43.55,79.03,26.22,58.15,-2.25,38.62,
    -38.51,28.07,-72.23,27.35,-103.39,33.87,-117.30,41.74,-126.97,53.52,-130.41,68.93,-126.97,84.34,-117.30,96.12,
    -103.39,103.99,-72.23,110.51,-38.51,109.79,-2.25,99.24,26.22,79.71,43.55,58.83,53.38,18.93],
  [-147.88,-152.35,-97.88,-238.95,2.12,-238.95,52.12,-152.35,2.12,-65.75,-97.88,-65.75,-147.88,-152.35]
];

export default [
  {
    name: 'path-miter',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PathLayer({
        id: 'path-lnglat',
        data: zigzag,
        opacity: 0.6,
        getPath: f => f.path,
        getColor: f => [255, 0, 0],
        getWidth: f => 200,
        miterLimit: 0,
        widthMinPixels: 1
      })
    ],
    goldenImage: './test/render/golden-images/path-lnglat.png'
  },
  {
    name: 'path-rounded',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PathLayer({
        id: 'path-lnglat',
        data: zigzag,
        opacity: 0.6,
        getPath: f => f.path,
        getColor: f => [255, 0, 0],
        getWidth: f => 200,
        rounded: true,
        widthMinPixels: 1
      })
    ],
    goldenImage: './test/render/golden-images/path-rounded.png'
  },
  {
    name: 'path-lnglat-binary',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PathLayer({
        id: 'path-lnglat',
        data: {
          length: zigzag.length,
          startIndices: zigzag.reduce(
            (acc, d) => {
              acc.push(acc[acc.length - 1] + d.path.length);
              return acc;
            },
            [0]
          ),
          attributes: {
            getPath: {
              value: new Float64Array(zigzag.flatMap(d => d.path.flat())),
              size: 2
            },
            getColor: {
              value: new Uint8Array(zigzag.flatMap(d => d.path.flatMap(p => [255, 0, 0]))),
              size: 3
            }
          }
        },
        getWidth: 200,
        miterLimit: 0,
        opacity: 0.6,
        widthMinPixels: 1
      })
    ],
    goldenImage: './test/render/golden-images/path-lnglat.png'
  },
  {
    name: 'path-billboard',
    viewState: {
      latitude: 37.7518488,
      longitude: -122.427699,
      zoom: 16.5,
      pitch: 55,
      bearing: -20
    },
    layers: [
      new PathLayer({
        id: 'path-lnglat',
        data: zigzag3D,
        opacity: 0.6,
        billboard: true,
        getPath: f => f.path,
        getColor: f => [128, 0, 0],
        getWidth: f => 10
      })
    ],
    goldenImage: './test/render/golden-images/path-billboard.png'
  },
  {
    name: 'path-meter',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PathLayer({
        id: 'path-meter',
        data: meterPaths,
        getColor: f => [255, 0, 0],
        getWidth: f => 10,
        widthMinPixels: 1,
        widthScale: 100,
        sizeScale: 200,
        rounded: false,
        getMarkerPercentages: () => [],
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: positionOrigin
      })
    ],
    goldenImage: './test/render/golden-images/path-meter.png'
  },
  {
    name: 'path-dash',
    views: new OrthographicView(),
    viewState: {
      target: [0, 0, 0],
      zoom: -0.5
    },
    layers: [
      new PathLayer({
        id: 'path-dash-justified',
        data: DASH_TEST_DATA,
        getPath: d => d,
        positionFormat: 'XY',
        getDashArray: [4, 5],
        getLineColor: [200, 0, 0],
        widthMinPixels: 10,
        dashJustified: true,
        extensions: [new PathStyleExtension({dash: true})]
      }),
      new PathLayer({
        id: 'path-dash-high-precision',
        modelMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 300, 0, 0, 1],
        data: DASH_TEST_DATA,
        getPath: d => d,
        positionFormat: 'XY',
        getDashArray: [4, 5],
        getLineColor: [200, 0, 0],
        widthMinPixels: 10,
        extensions: [new PathStyleExtension({highPrecisionDash: true})]
      })
    ],
    goldenImage: './test/render/golden-images/path-dash.png'
  },
  {
    name: 'path-offset',
    viewState: {
      latitude: 37.71,
      longitude: -122.405,
      zoom: 13
    },
    layers: [
      new PathLayer({
        id: 'path-offset',
        data: [
          {path: [[-122.39, 37.7], [-122.42, 37.7], [-122.42, 37.72]], color: [255, 180, 0]},
          {path: [[-122.42, 37.72], [-122.42, 37.7], [-122.39, 37.7]], color: [80, 0, 255]}
        ],
        getPath: f => f.path,
        getColor: f => f.color,
        getWidth: 100,
        getOffset: 1,
        extensions: [new PathStyleExtension({offset: true})]
      })
    ],
    goldenImage: './test/render/golden-images/path-offset.png'
  },
  {
    name: 'path-globe',
    views: [new GlobeView()],
    viewState: {
      latitude: 0,
      longitude: 0,
      zoom: 0
    },
    layers: [
      new PathLayer({
        id: 'path-globe',
        data: getGraticules(30),
        getPath: d => d,
        widthMinPixels: 2
      })
    ],
    goldenImage: './test/render/golden-images/path-globe.png'
  }
];

function getGraticules(resolution) {
  const graticules = [];
  for (let lat = 0; lat < 90; lat += resolution) {
    const path1 = [];
    const path2 = [];
    for (let lon = -180; lon <= 180; lon += 90) {
      path1.push([lon, lat]);
      path2.push([lon, -lat]);
    }
    graticules.push(path1);
    graticules.push(path2);
  }
  for (let lon = -180; lon < 180; lon += resolution) {
    const path = [];
    for (let lat = -90; lat <= 90; lat += 90) {
      path.push([lon, lat]);
    }
    graticules.push(path);
  }
  return graticules;
}

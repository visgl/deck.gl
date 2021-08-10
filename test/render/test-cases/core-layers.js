/* eslint-disable callback-return */
import {COORDINATE_SYSTEM, OrthographicView} from '@deck.gl/core';
import {
  ScatterplotLayer,
  BitmapLayer,
  SolidPolygonLayer,
  PathLayer,
  LineLayer
} from '@deck.gl/layers';

import {Fp64Extension} from '@deck.gl/extensions';
import * as dataSamples from 'deck.gl-test/data';

// prettier-ignore
const BINARY_DATA = [
  0.7, 0.2, 0, 0, 0, 0,
  0.8, 0.6, 0, 0, 5, 0,
  0.3, 0.5, 0, 5, 5, 0,
  0, 0.8, 0.6, 5, 10, 0,
  0, 0.5, 0.7, 10, 10, 0,
  0.3, 0, 0.8, 10, 15, 0,
  0.8, 0, 0.6, 15, 15, 0
];

export default [
  {
    name: 'scatterplot-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ScatterplotLayer({
        id: 'scatterplot-lnglat',
        data: dataSamples.points,
        getPosition: d => d.COORDINATES,
        getFillColor: d => [255, 128, 0],
        getRadius: d => d.SPACES,
        pickable: true,
        radiusScale: 30,
        radiusMinPixels: 1,
        radiusMaxPixels: 30
      })
    ],
    goldenImage: './test/render/golden-images/scatterplot-lnglat.png'
  },
  {
    name: 'scatterplot-lnglat-64',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ScatterplotLayer({
        id: 'scatterplot-lnglat',
        data: dataSamples.points,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
        getPosition: d => d.COORDINATES,
        getFillColor: d => [255, 128, 0],
        getRadius: d => d.SPACES,
        pickable: true,
        radiusScale: 30,
        radiusMinPixels: 1,
        radiusMaxPixels: 30,
        extensions: [new Fp64Extension()]
      })
    ],
    goldenImage: './test/render/golden-images/scatterplot-lnglat.png'
  },
  {
    name: 'scatterplot-lnglat-billboard',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 45,
      bearing: 0
    },
    layers: [
      new ScatterplotLayer({
        id: 'scatterplot-lnglat-billboard',
        data: dataSamples.points,
        getPosition: d => d.COORDINATES,
        getFillColor: d => [255, 128, 0],
        getRadius: d => d.SPACES,
        billboard: true,
        smoothEdge: false,
        radiusScale: 30,
        radiusMinPixels: 1,
        radiusMaxPixels: 30
      })
    ],
    goldenImage: './test/render/golden-images/scatterplot-lnglat-billboard.png'
  },
  {
    name: 'line-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new LineLayer({
        id: 'line-lnglat',
        data: dataSamples.routes,
        opacity: 0.8,
        getWidth: 0,
        widthMinPixels: 2,
        getSourcePosition: d => d.START,
        getTargetPosition: d => d.END,
        getColor: d => (d.SERVICE === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0]),
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/line-lnglat.png'
  },
  {
    name: 'bitmap-layer',
    viewState: {
      latitude: 37.75,
      longitude: -122.4,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new BitmapLayer({
        opacity: 0.8,
        bounds: [-122.45, 37.7, -122.35, 37.8],
        image: './test/data/icon-atlas.png'
      })
    ],
    goldenImage: './test/render/golden-images/bitmap.png'
  },
  {
    name: 'bitmap-layer-imagecoordinates',
    viewState: {
      latitude: 0,
      longitude: 0,
      zoom: 1,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new BitmapLayer({
        bounds: [-180, -90, 180, 90],
        image: './test/data/world.jpg',
        _imageCoordinateSystem: COORDINATE_SYSTEM.LNGLAT
      })
    ],
    goldenImage: './test/render/golden-images/bitmap-imagecoordinates.png'
  },
  {
    name: 'binary',
    views: new OrthographicView(),
    viewState: {
      target: [7, 7, 0],
      zoom: 4.5
    },
    layers: [
      new SolidPolygonLayer({
        id: 'binary-polygons',
        data: {
          length: 2,
          startIndices: [0, 3],
          attributes: {
            indices: new Uint16Array([0, 1, 2, 3, 4, 5, 4, 5, 6]),
            getPolygon: {value: new Float64Array(BINARY_DATA), size: 3, offset: 24, stride: 48},
            getFillColor: {
              value: new Float32Array(BINARY_DATA),
              size: 3,
              stride: 24,
              normalized: false
            }
          }
        },
        _normalize: false,
        getWidth: 0.5
      }),

      new PathLayer({
        id: 'binary-paths',
        data: {
          length: 2,
          startIndices: [0, 3],
          attributes: {
            getPath: {value: new Float32Array(BINARY_DATA), size: 3, offset: 12, stride: 24},
            getColor: {value: new Float32Array(BINARY_DATA), size: 3, stride: 24, normalized: false}
          }
        },
        _pathType: 'open',
        getWidth: 0.5
      }),

      new ScatterplotLayer({
        id: 'binary-points',
        data: {
          length: 7,
          attributes: {
            getPosition: {value: new Float64Array(BINARY_DATA), size: 3, offset: 24, stride: 48},
            getFillColor: {
              value: new Float32Array(BINARY_DATA),
              size: 3,
              stride: 24,
              normalized: false
            }
          }
        },
        getRadius: 1
      })
    ],
    goldenImage: './test/render/golden-images/binary.png'
  }
];

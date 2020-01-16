import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {PathLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';
import {zigzag, zigzag3D, meterPaths, positionOrigin} from 'deck.gl-test/data';

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
  }
];

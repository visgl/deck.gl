import {ArcLayer} from '@deck.gl/layers';

import * as dataSamples from 'deck.gl-test/data';

export default [
  {
    name: 'arc-lnglat',
    viewState: {
      latitude: 37.76,
      longitude: -122.45,
      zoom: 11.5,
      pitch: 20,
      bearing: 0
    },
    layers: [
      new ArcLayer({
        id: 'arc-lnglat',
        data: dataSamples.routes,
        opacity: 0.8,
        getWidth: 2,
        getSourcePosition: d => d.START,
        getTargetPosition: d => d.END,
        getSourceColor: [64, 255, 0],
        getTargetColor: [0, 128, 200]
      })
    ],
    goldenImage: './test/render/golden-images/arc-lnglat.png'
  },
  {
    name: 'arc-lnglat-wrap-longitude',
    viewState: {
      latitude: 37.76,
      longitude: -122.45,
      zoom: 11.5,
      pitch: 20,
      bearing: 0
    },
    layers: [
      new ArcLayer({
        id: 'arc-lnglat',
        data: dataSamples.routes,
        opacity: 0.8,
        getWidth: 2,
        wrapLongitude: true,
        getSourcePosition: d => d.START,
        getTargetPosition: d => d.END,
        getSourceColor: [64, 255, 0],
        getTargetColor: [0, 128, 200]
      })
    ],
    goldenImage: './test/render/golden-images/arc-lnglat.png'
  },
  {
    name: 'arc-lnglat-wrap-longitude-high-zoom',
    viewState: {
      latitude: 37.76,
      longitude: -122.45,
      zoom: 13,
      pitch: 20,
      bearing: 0
    },
    layers: [
      new ArcLayer({
        id: 'arc-lnglat',
        data: dataSamples.routes,
        opacity: 0.8,
        getWidth: 2,
        wrapLongitude: true,
        getSourcePosition: d => d.START,
        getTargetPosition: d => d.END,
        getSourceColor: [64, 255, 0],
        getTargetColor: [0, 128, 200]
      })
    ],
    goldenImage: './test/render/golden-images/arc-lnglat-high-zoom.png'
  },
  {
    name: 'arc-lnglat-3d',
    viewState: {
      latitude: 37.788,
      longitude: -122.45,
      zoom: 13,
      pitch: 60,
      bearing: 0
    },
    layers: [
      new ArcLayer({
        id: 'arc-lnglat-3d',
        data: [
          {source: [-122.46, 37.77, -150], target: [-122.44, 37.77, 450], height: 0.5},
          {source: [-122.46, 37.77, -150], target: [-122.44, 37.77, 450], height: 1},
          {source: [-122.46, 37.77, -150], target: [-122.44, 37.77, 450], height: 2},
          {source: [-122.46, 37.78, 600], target: [-122.44, 37.78, 0], height: 0.5},
          {source: [-122.46, 37.78, 600], target: [-122.44, 37.78, 0], height: 1},
          {source: [-122.46, 37.78, 600], target: [-122.44, 37.78, 0], height: 2}
        ],
        opacity: 0.8,
        getWidth: 4,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getHeight: d => d.height,
        getSourceColor: [255, 255, 0],
        getTargetColor: [255, 0, 0]
      })
    ],
    goldenImage: './test/render/golden-images/arc-lnglat-3d.png'
  },
  {
    name: 'arc-shortest-path',
    viewState: {
      latitude: 0,
      longitude: 0,
      zoom: 0,
      pitch: 20,
      bearing: 0,
      repeat: true
    },
    layers: [
      new ArcLayer({
        id: 'arc-shortest-path',
        data: dataSamples.greatCircles,
        wrapLongitude: true,
        getWidth: 5,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: [64, 255, 0],
        getTargetColor: [0, 128, 200]
      })
    ],
    goldenImage: './test/render/golden-images/arc-shortest-path.png'
  },
  {
    name: 'arc-shortest-path-high-zoom',
    viewState: {
      latitude: 0,
      longitude: -179.99,
      zoom: 13,
      pitch: 20,
      bearing: 0,
      repeat: true
    },
    layers: [
      new ArcLayer({
        id: 'arc-shortest-path-high-zoom',
        data: [
          {source: [179.8, 0.1], target: [-179.8, -0.1]},
          {source: [-179.8, 0.1], target: [179.8, -0.1]}
        ],
        wrapLongitude: true,
        getWidth: 5,
        getHeight: 0,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: [64, 255, 0],
        getTargetColor: [0, 128, 200]
      })
    ],
    goldenImage: './test/render/golden-images/arc-shortest-path-high-zoom.png'
  },
  {
    name: 'arc-shortest-path-high-zoom-2',
    viewState: {
      latitude: 0,
      longitude: 179.99,
      zoom: 13,
      pitch: 20,
      bearing: 0,
      repeat: true
    },
    layers: [
      new ArcLayer({
        id: 'arc-shortest-path-high-zoom',
        data: [
          {source: [179.8, 0.1], target: [-179.8, -0.1]},
          {source: [-179.8, 0.1], target: [179.8, -0.1]}
        ],
        wrapLongitude: true,
        getWidth: 5,
        getHeight: 0,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: [64, 255, 0],
        getTargetColor: [0, 128, 200]
      })
    ],
    goldenImage: './test/render/golden-images/arc-shortest-path-high-zoom-2.png'
  },
  {
    name: 'great-circle',
    viewState: {
      latitude: 0,
      longitude: 0,
      zoom: 0,
      pitch: 0,
      bearing: 0,
      repeat: true
    },
    layers: [
      new ArcLayer({
        id: 'great-circle',
        data: dataSamples.greatCircles,
        getWidth: 5,
        getHeight: 0,
        greatCircle: true,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: [64, 255, 0],
        getTargetColor: [0, 128, 200]
      })
    ],
    goldenImage: './test/render/golden-images/great-circle.png'
  },
  {
    name: 'great-circle-modified-segments',
    viewState: {
      latitude: 0,
      longitude: 0,
      zoom: 0,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ArcLayer({
        id: 'great-circle-modified-segments',
        data: [{source: [64, 17], target: [-112, 7]}],
        getWidth: 5,
        getHeight: 0,
        greatCircle: true,
        numSegments: 150,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: [64, 255, 0],
        getTargetColor: [0, 128, 200]
      })
    ],
    goldenImage: './test/render/golden-images/great-circle-modified-segments.png'
  }
];

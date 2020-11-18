import {OrthographicView, COORDINATE_SYSTEM, _GlobeView as GlobeView} from '@deck.gl/core';
import {PolygonLayer} from '@deck.gl/layers';
import {Fp64Extension, PathStyleExtension} from '@deck.gl/extensions';

import {polygons} from 'deck.gl-test/data';

export default [
  {
    name: 'polygon-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PolygonLayer({
        id: 'polygon-lnglat',
        data: polygons,
        getPolygon: f => f,
        getFillColor: [200, 0, 0],
        getLineColor: [0, 0, 0],
        opacity: 0.8,
        lineWidthMinPixels: 1
      })
    ],
    goldenImage: './test/render/golden-images/polygon-lnglat.png'
  },
  {
    name: 'polygon-lnglat-64',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new PolygonLayer({
        id: 'polygon-lnglat-64',
        data: polygons,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
        getPolygon: f => f,
        getFillColor: [200, 0, 0],
        getLineColor: [0, 0, 0],
        opacity: 0.8,
        lineWidthMinPixels: 1,
        extensions: [new Fp64Extension()]
      })
    ],
    goldenImage: './test/render/golden-images/polygon-lnglat.png'
  },
  {
    name: 'polygon-dash',
    views: new OrthographicView(),
    viewState: {
      target: [0, 0, 0],
      zoom: 0
    },
    layers: [
      new PolygonLayer({
        id: 'polygon-lnglat',
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        data: [[[-100, -100], [-100, 100], [100, 100], [100, -100]]],
        getPolygon: f => f,
        filled: false,
        stroked: true,
        getLineColor: [0, 0, 0],
        getDashArray: [6, 3],
        getLineWidth: 10,
        opacity: 1,
        dashJustified: true,
        extensions: [new PathStyleExtension({dash: true})]
      })
    ],
    goldenImage: './test/render/golden-images/polygon-dash.png'
  },
  {
    name: 'polygon-globe',
    views: [new GlobeView()],
    viewState: {
      latitude: 0,
      longitude: 50,
      zoom: 0
    },
    layers: [
      new PolygonLayer({
        id: 'polygon-globe',
        data: [
          [
            [[60, 40], [30, -30], [-60, -40], [-30, 30]],
            [[10, 10], [20, -20], [-10, -10], [-20, 20]]
          ]
        ],
        getPolygon: d => d,
        getLineColor: [0, 0, 0],
        getFillColor: [160, 160, 0],
        widthMinPixels: 4
      })
    ],
    goldenImage: './test/render/golden-images/polygon-globe.png'
  },
  {
    name: 'polygon-globe-extruded',
    views: [new GlobeView()],
    viewState: {
      latitude: 0,
      longitude: 50,
      zoom: 0
    },
    layers: [
      new PolygonLayer({
        id: 'polygon-globe',
        data: [
          [
            [[60, 40], [30, -30], [-60, -40], [-30, 30]],
            [[10, 10], [20, -20], [-10, -10], [-20, 20]]
          ]
        ],
        getPolygon: d => d,
        extruded: true,
        wireframe: true,
        getElevation: 1e6,
        getLineColor: [0, 0, 0],
        getFillColor: [160, 160, 0],
        widthMinPixels: 4
      })
    ],
    goldenImage: './test/render/golden-images/polygon-globe-extruded.png'
  }
];

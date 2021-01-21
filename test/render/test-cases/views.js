import {COORDINATE_SYSTEM, OrthographicView, MapView, FirstPersonView} from '@deck.gl/core';
import {ScatterplotLayer, GeoJsonLayer} from '@deck.gl/layers';
import {parseColor} from '../../../examples/layer-browser/src/utils/color';

import * as dataSamples from 'deck.gl-test/data';
import * as h3 from 'h3-js';

export default [
  {
    name: 'first-person',
    views: [
      new FirstPersonView({
        fovy: 75,
        near: 10,
        far: 100000,
        focalDistance: 10
      })
    ],
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      altitude: 20,
      bearing: 270
    },
    layers: [
      new GeoJsonLayer({
        id: 'first-person',
        data: dataSamples.geojson,
        opacity: 0.8,
        getRadius: 500,
        getFillColor: f => parseColor(f.properties.fill),
        getLineColor: f => parseColor(f.properties.stroke),
        extruded: true,
        wireframe: true,
        getElevation: 500,
        lineWidthScale: 10,
        lineWidthMinPixels: 1
      })
    ],
    goldenImage: './test/render/golden-images/first-person.png'
  },
  {
    name: 'orthographic-64bit',
    views: new OrthographicView(),
    viewState: {
      target: [10000 - 122.4, 10000 + 37.75, 0],
      zoom: 14
    },
    layers: [
      new ScatterplotLayer({
        id: 'orthographic-64',
        opacity: 0.1,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
        data: dataSamples.getPoints100K().map(p => [p[0] + 10000, p[1] + 10000]),
        getPosition: d => d,
        getRadius: 0,
        radiusMinPixels: 6
      })
    ],
    goldenImage: './test/render/golden-images/orthographic-64.png'
  },
  {
    name: 'map-repeat',
    views: new MapView({repeat: true}),
    viewState: {
      latitude: 0,
      longitude: 0,
      zoom: 0,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ScatterplotLayer({
        data: h3.getRes0Indexes(),
        getPosition: d => h3.h3ToGeo(d).reverse(),
        radiusMinPixels: 4,
        getFillColor: [255, 0, 0]
      })
    ],
    goldenImage: './test/render/golden-images/map-repeat.png'
  }
];

import {SphereGeometry} from '@luma.gl/engine';
import {
  COORDINATE_SYSTEM,
  _GlobeView as GlobeView,
  OrthographicView,
  MapView,
  FirstPersonView
} from '@deck.gl/core';
import {ScatterplotLayer, GeoJsonLayer} from '@deck.gl/layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {MVTLayer} from '@deck.gl/geo-layers';
import {parseColor} from '../../../examples/layer-browser/src/utils/color';

import * as dataSamples from 'deck.gl-test/data';
import {getRes0Cells, cellToLatLng} from 'h3-js';

const EARTH_RADIUS_METERS = 6.3e6;
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
        getPointRadius: 500,
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
        data: getRes0Cells(),
        getPosition: d => cellToLatLng(d).reverse(),
        radiusMinPixels: 4,
        getFillColor: [255, 0, 0]
      })
    ],
    goldenImage: './test/render/golden-images/map-repeat.png'
  },
  ...[true, false].map(binary => {
    const id = `globe-mvt${binary ? '-binary' : ''}`;
    return {
      name: id,
      views: new GlobeView(),
      viewState: {
        longitude: -100,
        latitude: 80,
        zoom: 0,
        pitch: 0,
        bearing: 0
      },
      layers: [
        new SimpleMeshLayer({
          id: 'earth-sphere',
          data: [{position: [0, 0, 0]}],
          mesh: new SphereGeometry({radius: EARTH_RADIUS_METERS, nlat: 18, nlong: 36}),
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          getColor: [255, 255, 255]
        }),
        new MVTLayer({
          id,
          data: ['./test/data/mvt-tiles/{z}/{x}/{y}.mvt'],
          maxZoom: 3,
          minZoom: 3,
          extent: [-180, -80, 180, 80],
          stroked: false,
          getFillColor: [0, 0, 0],
          onTileError: error => {
            if (error.message.includes('404')) {
              // trying to load tiles in the previous viewport, ignore
            } else {
              throw error;
            }
          },
          lineWidthMinPixels: 1,
          binary,
          loadOptions: {
            mvt: {
              workerUrl: null
            }
          }
        })
      ],
      goldenImage: `./test/render/golden-images/globe-mvt.png`
    };
  })
];

import {GeoJsonLayer} from '@deck.gl/layers';
import {geojson, geojsonLarge} from 'deck.gl-test/data';
import antarctica from 'deck.gl-test/data/antarctica.geo.json';
import {parseColor, setOpacity} from '../../../examples/layer-browser/src/utils/color';

const MARKER_SIZE_MAP = {
  small: 200,
  medium: 500,
  large: 1000
};

export default [
  {
    name: 'geojson-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new GeoJsonLayer({
        id: 'geojson-lnglat',
        data: geojson,
        opacity: 0.8,
        getRadius: f => MARKER_SIZE_MAP[f.properties['marker-size']],
        getFillColor: f => {
          const color = parseColor(f.properties.fill || f.properties['marker-color']);
          const opacity = (f.properties['fill-opacity'] || 1) * 255;
          return setOpacity(color, opacity);
        },
        getLineColor: f => {
          const color = parseColor(f.properties.stroke);
          const opacity = (f.properties['stroke-opacity'] || 1) * 255;
          return setOpacity(color, opacity);
        },
        getLineWidth: f => f.properties['stroke-width'],
        getElevation: f => 500,
        lineWidthScale: 10,
        lineWidthMinPixels: 1,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/geojson-lnglat.png'
  },
  {
    name: 'geojson-extruded-lnglat',
    viewState: {
      latitude: 37.78,
      longitude: -122.45,
      zoom: 12,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new GeoJsonLayer({
        id: 'geojson-extruded-lnglat',
        data: geojson,
        opacity: 0.8,
        extruded: true,
        wireframe: true,
        getRadius: f => MARKER_SIZE_MAP[f.properties['marker-size']],
        getFillColor: f => {
          const color = parseColor(f.properties.fill || f.properties['marker-color']);
          const opacity = (f.properties['fill-opacity'] || 1) * 255;
          return setOpacity(color, opacity);
        },
        getLineColor: f => {
          const color = parseColor(f.properties.stroke);
          const opacity = (f.properties['stroke-opacity'] || 1) * 255;
          return setOpacity(color, opacity);
        },
        getLineWidth: f => f.properties['stroke-width'],
        getElevation: f => 500,
        lineWidthScale: 10,
        lineWidthMinPixels: 1,
        pickable: true
      })
    ],
    goldenImage: './test/render/golden-images/geojson-extruded-lnglat.png'
  },
  {
    name: 'geojson-large',
    viewState: {
      longitude: -95,
      latitude: 60,
      zoom: 3
    },
    layers: [
      new GeoJsonLayer({
        id: 'geojson-layer-large',
        data: geojsonLarge,
        stroked: false,
        filled: true,
        opacity: 0.5,
        getFillColor: [200, 0, 0]
      })
    ],
    goldenImage: './test/render/golden-images/geojson-large.png'
  },
  {
    name: 'geojson-wrap-longitude',
    viewState: {
      longitude: 0,
      latitude: 0,
      zoom: -0.3,
      repeat: true
    },
    layers: [
      new GeoJsonLayer({
        id: 'geojson-layer-wrap-longitude',
        data: antarctica,
        stroked: true,
        filled: true,
        getLineColor: [0, 0, 0],
        getFillColor: [255, 255, 0],
        lineWidthMinPixels: 2,
        wrapLongitude: true
      }),
      new GeoJsonLayer({
        id: 'arctic-circle',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [[0, 66.56333], [90, 66.56333], [180, 66.56333], [-90, 66.56333], [0, 66.56333]]
            ]
          }
        },
        stroked: true,
        filled: true,
        getLineColor: [0, 0, 0],
        getFillColor: [255, 255, 0],
        lineWidthMinPixels: 2,
        wrapLongitude: true
      })
    ],
    goldenImage: './test/render/golden-images/geojson-wrap-longitude.png'
  }
];

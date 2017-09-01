import {getPoints100K, getPoints100KMeters, coordinateOrigin} from './data-generator';

import {
  COORDINATE_SYSTEM,

  ScatterplotLayer
  // ArcLayer,
  // LineLayer,
  // HexagonLayer,

  // ScreenGridLayer,
  // IconLayer,
  // GridLayer,
  // GeoJsonLayer,
  // PolygonLayer,
  // PathLayer

} from 'deck.gl';

export const WIDTH = 1600;
export const HEIGHT = 900;

// Max color delta in the YIQ difference metric for two pixels to be considered the same
export const COLOR_DELTA_THRESHOLD = 255 * 0.05;
// Percentage of pixels that must be the same for the test to pass
export const TEST_PASS_THRESHOLD = 0.99;

export const TEST_CASES = [
  {
    name: 'scatterplot-1',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 10,
      pitch: 30,
      bearing: 0
    },
    // layer list
    layersList: [{
      type: ScatterplotLayer,
      props: {
        id: 'scatterplot-1',
        data: getPoints100K(),
        getPosition: d => d,
        getColor: d => [255, 128, 0],
        getRadius: d => 5.0,
        opacity: 0.5,
        pickable: true,
        radiusMinPixels: 5,
        radiusMaxPixels: 5
      }
    }],
    referecenResult: './golden-images/1.png'
  },

  {
    name: 'scatterplot-2',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 12,
      pitch: 0,
      bearing: 0
    },
    // layer list
    layersList: [{
      type: ScatterplotLayer,
      props: {
        id: 'scatterplot-2',
        data: getPoints100K(),
        getPosition: d => d,
        getColor: d => [255, 128, 0],
        getRadius: d => 5.0,
        opacity: 0.5,
        pickable: true,
        radiusMinPixels: 5,
        radiusMaxPixels: 5
      }
    }],
    referecenResult: './golden-images/2.png'
  },

  {
    name: 'scatterplot-1-meters',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 10,
      pitch: 30,
      bearing: 0
    },
    // layer list
    layersList: [{
      type: ScatterplotLayer,
      props: {
        id: 'scatterplot-1-meters',
        data: getPoints100KMeters(),
        coordinateSystem: COORDINATE_SYSTEM.METERS,
        coordinateOrigin,
        getPosition: d => d,
        getColor: d => [255, 128, 0],
        getRadius: d => 5.0,
        opacity: 0.5,
        pickable: true,
        radiusMinPixels: 5,
        radiusMaxPixels: 5
      }
    }],
    referecenResult: './golden-images/1.png'
  }
];

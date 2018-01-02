import dataSamples from '../../examples/layer-browser/src/immutable-data-samples';
import {parseColor, setOpacity} from '../../examples/layer-browser/src/utils/color';
import {experimental} from 'deck.gl';
const {get} = experimental;

import {
  ScatterplotLayer,
  PolygonLayer,
  PathLayer,
  ArcLayer,
  LineLayer,
  IconLayer,
  GeoJsonLayer
  // HexagonLayer,
  // ScreenGridLayer,
  // GridLayer,
} from 'deck.gl';

const LIGHT_SETTINGS = {
  lightsPosition: [-122.45, 37.66, 8000, -122.0, 38.0, 8000],
  ambientRatio: 0.3,
  diffuseRatio: 0.6,
  specularRatio: 0.4,
  lightsStrength: [1, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const MARKER_SIZE_MAP = {
  small: 200,
  medium: 500,
  large: 1000
};

export const WIDTH = 800;
export const HEIGHT = 450;

// Max color delta in the YIQ difference metric for two pixels to be considered the same
export const COLOR_DELTA_THRESHOLD = 255 * 0.05;
// Percentage of pixels that must be the same for the test to pass
export const TEST_PASS_THRESHOLD = 0.99;

export const TEST_CASES = [
  {
    name: 'polygon-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    // layer list
    layersList: [
      {
        type: PolygonLayer,
        props: {
          id: 'polygon-lnglat',
          data: dataSamples.polygons,
          getPolygon: f => f,
          getFillColor: f => [200, 0, 0],
          getLineColor: f => [0, 0, 0, 255],
          getLineDashArray: f => [20, 0],
          getWidth: f => 20,
          getElevation: f => 1000,
          opacity: 0.8,
          pickable: true,
          lineDashJustified: true,
          lightSettings: LIGHT_SETTINGS,
          elevationScale: 0.6
        }
      }
    ],
    referenceResult: './golden-images/polygon-lnglat.png'
  },
  {
    name: 'path-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    // layer list
    layersList: [
      {
        type: PathLayer,
        props: {
          id: 'path-lnglat',
          data: dataSamples.zigzag,
          opacity: 0.6,
          getPath: f => get(f, 'path'),
          getColor: f => [128, 0, 0],
          getWidth: f => 100,
          widthMinPixels: 1,
          pickable: true
        }
      }
    ],
    referenceResult: './golden-images/path-lnglat.png'
  },
  {
    name: 'scatterplot-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    // layer list
    layersList: [
      {
        type: ScatterplotLayer,
        props: {
          id: 'scatterplot-lnglat',
          data: dataSamples.points,
          getPosition: d => get(d, 'COORDINATES'),
          getColor: d => [255, 128, 0],
          getRadius: d => get(d, 'SPACES'),
          opacity: 1,
          pickable: true,
          radiusScale: 30,
          radiusMinPixels: 1,
          radiusMaxPixels: 30
        }
      }
    ],
    referenceResult: './golden-images/scatterplot-lnglat.png'
  },
  {
    name: 'arc-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    // layer list
    layersList: [
      {
        type: ArcLayer,
        props: {
          id: 'arc-lnglat',
          data: dataSamples.routes,
          getSourcePosition: d => d.START,
          getTargetPosition: d => d.END,
          getSourceColor: d => [64, 255, 0],
          getTargetColor: d => [0, 128, 200],
          pickable: true
        }
      }
    ],
    referenceResult: './golden-images/arc-lnglat.png'
  },
  {
    name: 'line-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    // layer list
    layersList: [
      {
        type: LineLayer,
        props: {
          id: 'line-lnglat',
          data: dataSamples.routes,
          getSourcePosition: d => get(d, 'START'),
          getTargetPosition: d => get(d, 'END'),
          getColor: d => (get(d, 'SERVICE') === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0]),
          pickable: true
        }
      }
    ],
    referenceResult: './golden-images/line-lnglat.png'
  },
  {
    name: 'icon-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    // rendering times
    renderingTimes: 2,
    // layer list
    layersList: [
      {
        type: IconLayer,
        props: {
          id: 'icon-lnglat',
          data: dataSamples.points,
          iconAtlas: 'icon-atlas.png',
          iconMapping: dataSamples.iconAtlas,
          sizeScale: 24,
          getPosition: d => d.COORDINATES,
          getColor: d => [64, 64, 72],
          getIcon: d => (get(d, 'PLACEMENT') === 'SW' ? 'marker' : 'marker-warning'),
          getSize: d => (get(d, 'RACKS') > 2 ? 2 : 1),
          opacity: 0.8,
          pickable: true
        }
      }
    ],
    referenceResult: './golden-images/icon-lnglat.png'
  },
  {
    name: 'geojson-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    // layer list
    layersList: [
      {
        type: GeoJsonLayer,
        props: {
          id: 'geojson-lnglat',
          data: dataSamples.geojson,
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
          pickable: true,
          fp64: true,
          lightSettings: LIGHT_SETTINGS
        }
      }
    ],
    referenceResult: './golden-images/geojson-lnglat.png'
  },
  {
    name: 'geojson-extruded-lnglat',
    // viewport params
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    // layer list
    layersList: [
      {
        type: GeoJsonLayer,
        props: {
          id: 'geojson-extruded-lnglat',
          data: dataSamples.choropleths,
          getElevation: f => ((get(f, 'properties.ZIP_CODE') * 10) % 127) * 10,
          getFillColor: f => [0, 100, (get(f, 'properties.ZIP_CODE') * 55) % 255],
          getLineColor: f => [200, 0, 80],
          extruded: true,
          wireframe: true,
          pickable: true,
          lightSettings: LIGHT_SETTINGS
        }
      }
    ],
    referenceResult: './golden-images/geojson-extruded-lnglat.png'
  }
];

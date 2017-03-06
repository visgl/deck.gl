import {
  ScatterplotLayer,
  ArcLayer,
  LineLayer,
  HexagonLayer,

  PointCloudLayer,
  ScreenGridLayer,
  IconLayer,
  GridLayer,
  PointDensityGridLayer,
  PointDensityHexagonLayer,
  GeoJsonLayer,
  PolygonLayer,
  PathLayer
} from 'deck.gl';

// Demonstrate immutable support
import {experimental} from 'deck.gl';
const {get} = experimental;

import dataSamples from '../immutable-data-samples';
import {parseColor, setOpacity} from '../utils/color';

const MARKER_SIZE_MAP = {
  small: 2,
  medium: 5,
  large: 10
};

const LIGHT_SETTINGS = {
  lightsPosition: [-122.45, 37.66, 8000, -122.0, 38.00, 8000],
  ambientRatio: 0.4,
  diffuseRatio: 0.6,
  specularRatio: 0.6,
  lightsStrength: [1, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const ArcLayerExample = {
  layer: ArcLayer,
  props: {
    id: 'arcLayer',
    data: dataSamples.routes,
    getSourcePosition: d => d.START,
    getTargetPosition: d => d.END,
    getSourceColor: d => [64, 255, 0],
    getTargetColor: d => [0, 128, 200],
    pickable: true
  }
};

const IconLayerExample = {
  layer: IconLayer,
  props: {
    iconAtlas: 'data/icon-atlas.png',
    iconMapping: dataSamples.iconAtlas,
    data: dataSamples.points,
    sizeScale: 24,
    getPosition: d => d.COORDINATES,
    getColor: d => [64, 64, 72],
    getIcon: d => get(d, 'PLACEMENT') === 'SW' ? 'marker' : 'marker-warning',
    getSize: d => get(d, 'RACKS') > 2 ? 2 : 1,
    opacity: 0.8,
    pickable: true
  }
};

const GeoJsonLayerExample = {
  layer: GeoJsonLayer,
  props: {
    id: 'geojsonLayer',
    data: dataSamples.geojson,
    // TODO change to use the color util when it is landed
    getPointColor: f => parseColor(f.properties['marker-color']),
    getPointSize: f => MARKER_SIZE_MAP[f.properties['marker-size']],
    getStrokeColor: f => {
      const color = parseColor(f.properties.stroke);
      const opacity = f.properties['stroke-opacity'] * 255;
      return setOpacity(color, opacity);
    },
    getStrokeWidth: f => f.properties['stroke-width'],
    getFillColor: f => {
      const color = parseColor(f.properties.fill);
      const opacity = f.properties['fill-opacity'] * 255;
      return setOpacity(color, opacity);
    },
    strokeWidthScale: 10,
    strokeWidthMinPixels: 1,
    pickable: true
  }
};

const GeoJsonLayerExtrudedExample = {
  layer: GeoJsonLayer,
  props: {
    id: 'geojsonLayer-extruded',
    data: dataSamples.choropleths,
    getHeight: f => get(f, 'properties.ZIP_CODE') * 10 % 127 * 10,
    getFillColor: f => [0, 255, get(f, 'properties.ZIP_CODE') * 23 % 100 + 155],
    getStrokeColor: f => [200, 0, 80],
    drawPolygons: true,
    extruded: true,
    wireframe: true,
    pickable: true
  }
};

const PolygonLayerExample = {
  layer: PolygonLayer,
  props: {
    data: dataSamples.polygons,
    getPolygon: f => f,
    getColor: f => [Math.random() * 255, 0, 0],
    opacity: 0.8,
    pickable: true
  }
};

const PathLayerExample = {
  layer: PathLayer,
  props: {
    id: 'pathLayer',
    data: dataSamples.zigzag,
    opacity: 0.6,
    getPath: f => get(f, 'path'),
    getColor: f => [128, 0, 0],
    getStrokeWidth: f => 10,
    pickable: true
  }
};

const ScreenGridLayerExample = {
  layer: ScreenGridLayer,
  props: {
    id: 'screenGridLayer',
    data: dataSamples.points,
    getPosition: d => get(d, 'COORDINATES'),
    unitWidth: 40,
    unitHeight: 40,
    minColor: [0, 0, 80, 0],
    maxColor: [100, 255, 0, 128],
    pickable: false
  }
};

const LineLayerExample = {
  layer: LineLayer,
  props: {
    id: 'lineLayer',
    data: dataSamples.routes,
    getSourcePosition: d => get(d, 'START'),
    getTargetPosition: d => get(d, 'END'),
    getColor: d => get(d, 'SERVICE') === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0],
    pickable: true
  }
};

const ScatterplotLayerExample = {
  layer: ScatterplotLayer,
  props: {
    id: 'scatterplotLayer',
    data: dataSamples.points,
    getPosition: d => get(d, 'COORDINATES'),
    getColor: d => [255, 128, 0],
    getRadius: d => get(d, 'SPACES'),
    opacity: 0.5,
    pickable: true,
    radiusMinPixels: 1,
    radiusMaxPixels: 30
  }
};

const PointCloudLayerExample = {
  layer: PointCloudLayer,
  getData: dataSamples.getPointCloud,
  props: {
    id: 'pointCloudLayer',
    outline: true,
    projectionMode: 2,
    positionOrigin: dataSamples.positionOrigin,
    getPosition: d => get(d, 'position'),
    getNormal: d => get(d, 'normal'),
    getColor: d => get(d, 'color'),
    opacity: 1,
    radius: 4,
    pickable: true
  }
};

const GridLayerExample = {
  layer: GridLayer,
  props: {
    id: 'gridLayer',
    data: dataSamples.worldGrid.data,
    latOffset: dataSamples.worldGrid.latOffset,
    lonOffset: dataSamples.worldGrid.lonOffset,
    extruded: true,
    pickable: true,
    opacity: 1,
    getColor: g => [245, 166, get(g, 'value') * 255, 255],
    getElevation: h => get(h, 'value') * 5000,
    lightSettings: LIGHT_SETTINGS
  }
};

const PointDensityGridLayerExample = {
  layer: PointDensityGridLayer,
  propTypes: {
    cellSize: {type: 'number', min: 0, max: 1000}
  },
  props: {
    id: 'pointDensityGridLayer',
    data: dataSamples.points,
    cellSize: 200,
    opacity: 1,
    extruded: true,
    pickable: true,
    getPosition: d => get(d, 'COORDINATES'),
    lightSettings: LIGHT_SETTINGS
  }
};

const HexagonLayerExample = {
  layer: HexagonLayer,
  propTypes: {
    coverage: {type: 'number', min: 0, max: 1}
  },
  props: {
    id: 'hexagonLayer',
    data: dataSamples.hexagons,
    hexagonVertices: dataSamples.hexagons[0].vertices,
    coverage: 1,
    extruded: true,
    pickable: true,
    opacity: 1,
    getColor: h => [48, 128, get(h, 'value') * 255, 255],
    getElevation: h => get(h, 'value') * 5000,
    lightSettings: LIGHT_SETTINGS
  }
};

const PointDensityHexagonLayerExample = {
  layer: PointDensityHexagonLayer,
  propTypes: {
    coverage: {type: 'number', min: 0, max: 1},
    radius: {type: 'number', min: 0, max: 3000}
  },
  props: {
    id: 'PointDensityHexagonLayer',
    data: dataSamples.points,
    extruded: true,
    pickable: true,
    radius: 1000,
    opacity: 1,
    elevationScale: 1,
    elevationRange: [0, 3000],
    coverage: 1,
    getPosition: d => get(d, 'COORDINATES'),
    lightSettings: LIGHT_SETTINGS
  }
};

// perf test examples
const ScatterplotLayerPerfExample = (id, getData) => ({
  layer: ScatterplotLayer,
  getData,
  props: {
    id: `scatterplotLayerPerf-${id}`,
    getPosition: d => d,
    getColor: d => [0, 128, 0],
    // pickable: true,
    radiusMinPixels: 1,
    radiusMaxPixels: 5
  }
});

const ScatterplotLayer64PerfExample = (id, getData) => ({
  layer: ScatterplotLayer,
  getData,
  props: {
    id: `scatterplotLayer64Perf-${id}`,
    getPosition: d => d,
    getColor: d => [0, 128, 0],
    // pickable: true,
    radiusMinPixels: 1,
    radiusMaxPixels: 5,
    fp64: true
  }
});

/* eslint-disable quote-props */
export default {
  'Core Layers': {
    'GeoJsonLayer': GeoJsonLayerExample,
    'GeoJsonLayer (Extruded)': GeoJsonLayerExtrudedExample,
    PolygonLayer: PolygonLayerExample,
    PathLayer: PathLayerExample,
    'ScatterplotLayer': ScatterplotLayerExample,
    'PointCloudLayer': PointCloudLayerExample,
    ArcLayer: ArcLayerExample,
    LineLayer: LineLayerExample,
    ScreenGridLayer: ScreenGridLayerExample,
    GridLayer: GridLayerExample,
    PointDensityGridLayer: PointDensityGridLayerExample,
    PointDensityHexagonLayer: PointDensityHexagonLayerExample,
    HexagonLayer: HexagonLayerExample,
    IconLayer: IconLayerExample
  },

  'Performance Tests': {
    'ScatterplotLayer 1M': ScatterplotLayerPerfExample('1M', dataSamples.getPoints1M),
    'ScatterplotLayer 10M': ScatterplotLayerPerfExample('10M', dataSamples.getPoints10M),
    'ScatterplotLayer64 100K': ScatterplotLayer64PerfExample('100K', dataSamples.getPoints100K),
    'ScatterplotLayer64 1M': ScatterplotLayer64PerfExample('1M', dataSamples.getPoints1M),
    'ScatterplotLayer64 10M': ScatterplotLayer64PerfExample('10M', dataSamples.getPoints10M)
  }
};

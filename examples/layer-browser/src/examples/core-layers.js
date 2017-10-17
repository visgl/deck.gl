import {
  COORDINATE_SYSTEM,

  ScatterplotLayer,
  ArcLayer,
  LineLayer,

  PointCloudLayer,
  ScreenGridLayer,
  IconLayer,
  GridCellLayer,
  GridLayer,
  HexagonCellLayer,
  HexagonLayer,

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
  small: 200,
  medium: 500,
  large: 1000
};

const LIGHT_SETTINGS = {
  lightsPosition: [-122.45, 37.66, 8000, -122.0, 38.00, 8000],
  ambientRatio: 0.3,
  diffuseRatio: 0.6,
  specularRatio: 0.4,
  lightsStrength: [1, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

const ArcLayerExample = {
  layer: ArcLayer,
  getData: () => dataSamples.routes,
  props: {
    id: 'arcLayer',
    getSourcePosition: d => d.START,
    getTargetPosition: d => d.END,
    getSourceColor: d => [64, 255, 0],
    getTargetColor: d => [0, 128, 200],
    pickable: true
  }
};

const IconLayerExample = {
  layer: IconLayer,
  getData: () => dataSamples.points,
  props: {
    iconAtlas: 'data/icon-atlas.png',
    iconMapping: dataSamples.iconAtlas,
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
  getData: () => dataSamples.geojson,
  props: {
    id: 'geojsonLayer',
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
};

const GeoJsonLayerExtrudedExample = {
  layer: GeoJsonLayer,
  getData: () => dataSamples.choropleths,
  props: {
    id: 'geojsonLayer-extruded',
    getElevation: f => get(f, 'properties.ZIP_CODE') * 10 % 127 * 10,
    getFillColor: f => [0, 100, get(f, 'properties.ZIP_CODE') * 55 % 255],
    getLineColor: f => [200, 0, 80],
    extruded: true,
    wireframe: true,
    pickable: true,
    lightSettings: LIGHT_SETTINGS
  }
};

const PolygonLayerExample = {
  layer: PolygonLayer,
  getData: () => dataSamples.polygons,
  propTypes: {
    getLineDashArray: {type: 'compound', elements: ['lineDashSizeLine']},
    lineDashSizeLine: {type: 'number', max: 20, onUpdate: (newValue, newSettings, change) => {
      change('getLineDashArray', [newValue, 20 - newValue]);
    }}
  },
  props: {
    getPolygon: f => f,
    getFillColor: f => [200 + Math.random() * 55, 0, 0],
    getLineColor: f => [0, 0, 0, 255],
    getLineDashArray: f => [20, 0],
    getWidth: f => 20,
    getElevation: f => Math.random() * 1000,
    opacity: 0.8,
    pickable: true,
    lineDashJustified: true,
    lightSettings: LIGHT_SETTINGS,
    elevationScale: 0.6
  }
};

const PathLayerExample = {
  layer: PathLayer,
  getData: () => dataSamples.zigzag,
  props: {
    id: 'pathLayer',
    opacity: 0.6,
    getPath: f => get(f, 'path'),
    getColor: f => [128, 0, 0],
    getWidth: f => 10,
    widthMinPixels: 1,
    pickable: true
  }
};

const ScreenGridLayerExample = {
  layer: ScreenGridLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'screenGridLayer',
    getPosition: d => get(d, 'COORDINATES'),
    cellSizePixels: 40,
    minColor: [0, 0, 80, 0],
    maxColor: [100, 255, 0, 128],
    pickable: false
  }
};

const LineLayerExample = {
  layer: LineLayer,
  getData: () => dataSamples.routes,
  props: {
    id: 'lineLayer',
    getSourcePosition: d => get(d, 'START'),
    getTargetPosition: d => get(d, 'END'),
    getColor: d => get(d, 'SERVICE') === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0],
    pickable: true
  }
};

const ScatterplotLayerExample = {
  layer: ScatterplotLayer,
  getData: () => dataSamples.points,
  props: {
    id: 'scatterplotLayer',
    getPosition: d => get(d, 'COORDINATES'),
    getColor: d => [255, 128, 0],
    getRadius: d => get(d, 'SPACES'),
    opacity: 1,
    pickable: true,
    radiusScale: 30,
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
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: dataSamples.positionOrigin,
    getPosition: d => get(d, 'position'),
    getNormal: d => get(d, 'normal'),
    getColor: d => get(d, 'color'),
    opacity: 1,
    radiusPixels: 4,
    pickable: true,
    lightSettings: LIGHT_SETTINGS
  }
};

const GridCellLayerExample = {
  layer: GridCellLayer,
  propTypes: {
    cellSize: {type: 'number', min: 0, max: 1000}
  },
  props: {
    id: 'gridCellLayer',
    data: dataSamples.worldGrid.data,
    cellSize: dataSamples.worldGrid.cellSize,
    extruded: true,
    pickable: true,
    opacity: 1,
    getColor: g => [245, 166, get(g, 'value') * 255, 255],
    getElevation: h => get(h, 'value') * 5000,
    lightSettings: LIGHT_SETTINGS
  }
};

function getMean(pts, key) {
  const filtered = pts.filter(pt => Number.isFinite(pt[key]));

  return filtered.length ?
    filtered.reduce((accu, curr) => accu + curr[key], 0) / filtered.length : null;
}

function getMax(pts, key) {
  const filtered = pts.filter(pt => Number.isFinite(pt[key]));

  return filtered.length ?
    filtered.reduce((accu, curr) => curr[key] > accu ? curr[key] : accu, -Infinity) : null;
}

// hexagon/grid layer compares whether getColorValue / getElevationValue has changed to
// call out bin sorting. Here we pass in the function defined
// outside props, so it doesn't create a new function on
// every rendering pass
function getColorValue(points) {
  return getMean(points, 'SPACES');
}

function getElevationValue(points) {
  return getMax(points, 'SPACES');
}

const GridLayerExample = {
  layer: GridLayer,
  propTypes: {
    cellSize: {type: 'number', min: 0, max: 1000},
    coverage: {type: 'number', min: 0, max: 1},
    lowerPercentile: {type: 'number', min: 0, max: 100},
    upperPercentile: {type: 'number', min: 0, max: 100},
    elevationLowerPercentile: {type: 'number', min: 0, max: 100},
    elevationUpperPercentile: {type: 'number', min: 0, max: 100}
  },
  props: {
    id: 'gridLayer',
    data: dataSamples.points,
    cellSize: 200,
    opacity: 1,
    extruded: true,
    pickable: true,
    getPosition: d => get(d, 'COORDINATES'),
    getColorValue,
    getElevationValue,
    lightSettings: LIGHT_SETTINGS
  }
};

const HexagonCellLayerExample = {
  layer: HexagonCellLayer,
  propTypes: {
    coverage: {type: 'number', min: 0, max: 1}
  },
  props: {
    id: 'hexagonCellLayer',
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

const HexagonLayerExample = {
  layer: HexagonLayer,
  propTypes: {
    coverage: {type: 'number', min: 0, max: 1},
    radius: {type: 'number', min: 0, max: 3000},
    lowerPercentile: {type: 'number', min: 0, max: 100},
    upperPercentile: {type: 'number', min: 0, max: 100},
    elevationLowerPercentile: {type: 'number', min: 0, max: 100},
    elevationUpperPercentile: {type: 'number', min: 0, max: 100}
  },
  props: {
    id: 'HexagonLayer',
    data: dataSamples.points,
    extruded: true,
    pickable: true,
    radius: 1000,
    opacity: 1,
    elevationScale: 1,
    elevationRange: [0, 3000],
    coverage: 1,
    getPosition: d => get(d, 'COORDINATES'),
    getColorValue,
    getElevationValue,
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
    ScatterplotLayer: ScatterplotLayerExample,
    ArcLayer: ArcLayerExample,
    LineLayer: LineLayerExample,
    IconLayer: IconLayerExample,
    GridCellLayer: GridCellLayerExample,
    GridLayer: GridLayerExample,
    ScreenGridLayer: ScreenGridLayerExample,
    HexagonCellLayer: HexagonCellLayerExample,
    HexagonLayer: HexagonLayerExample,
    PointCloudLayer: PointCloudLayerExample
  },

  'Performance Tests': {
    'ScatterplotLayer 1M': ScatterplotLayerPerfExample('1M', dataSamples.getPoints1M),
    'ScatterplotLayer 10M': ScatterplotLayerPerfExample('10M', dataSamples.getPoints10M),
    'ScatterplotLayer64 100K': ScatterplotLayer64PerfExample('100K', dataSamples.getPoints100K),
    'ScatterplotLayer64 1M': ScatterplotLayer64PerfExample('1M', dataSamples.getPoints1M),
    'ScatterplotLayer64 10M': ScatterplotLayer64PerfExample('10M', dataSamples.getPoints10M)
  }
};

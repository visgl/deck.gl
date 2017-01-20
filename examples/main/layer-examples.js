import {
  ChoroplethLayer, ScatterplotLayer, ArcLayer, LineLayer, ScreenGridLayer,
  ChoroplethLayer64, ExtrudedChoroplethLayer64, ScatterplotLayer64, ArcLayer64, LineLayer64,
  get
} from 'deck.gl';

import * as dataSamples from './data-samples';

// Demonstrate immutable support
import Immutable from 'immutable';
const immutableChoropleths = Immutable.fromJS(dataSamples.choropleths);

const ArcLayerExample = {
  layer: ArcLayer,
  props: {
    id: 'arcLayer',
    data: dataSamples.routes,
    getSourcePosition: d => d.START,
    getTargetPosition: d => d.END,
    getSourceColor: d => [64, 255, 0],
    getTargetColor: d => [0, 128, 200],
    strokeWidth: 1,
    pickable: true
  }
};

const ChoroplethLayerContourExample = {
  layer: ChoroplethLayer,
  props: {
    id: 'choroplethLayerContour',
    data: dataSamples.choropleths,
    getColor: f => [0, 80, 200],
    opacity: 0.8,
    drawContour: true
  }
};

const ChoroplethLayerExample = {
  layer: ChoroplethLayer,
  props: {
    id: 'choroplethLayerSolid',
    data: immutableChoropleths,
    getColor: f => [((get(f, 'properties.ZIP_CODE') * 10) % 127) + 128, 0, 0],
    opacity: 0.8,
    pickable: true
  }
};

const ScreenGridLayerExample = {
  layer: ScreenGridLayer,
  props: {
    id: 'screenGridLayer',
    data: dataSamples.points,
    getPosition: d => d.COORDINATES,
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
    getSourcePosition: d => d.START,
    getTargetPosition: d => d.END,
    getColor: d => d.SERVICE === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0],
    strokeWidth: 1,
    pickable: true
  }
};

const ScatterplotLayerExample = {
  layer: ScatterplotLayer,
  props: {
    id: 'scatterplotLayer',
    data: dataSamples.points,
    getPosition: d => d.COORDINATES,
    getColor: d => [255, 128, 0],
    getRadius: d => d.SPACES,
    opacity: 0.5,
    strokeWidth: 2,
    pickable: true,
    radiusMinPixels: 1,
    radiusMaxPixels: 30
  }
};

const ScatterplotLayerMetersExample = {
  layer: ScatterplotLayer,
  props: {
    id: 'scatterplotLayerMeter',
    data: dataSamples.meterPoints,
    drawOutline: true,
    projectionMode: 2,
    positionOrigin: dataSamples.positionOrigin,
    getPosition: d => d,
    getColor: d => [0, 0, 255],
    opacity: 0.5,
    pickable: true
  }
};

// 64 BIT LAYER EXAMPLES

const ArcLayer64Example = {
  layer: ArcLayer64,
  props: {
    id: 'arcLayer64',
    data: dataSamples.routes,
    getSourcePosition: d => d.START,
    getTargetPosition: d => d.END,
    getSourceColor: d => [64, 255, 0],
    getTargetColor: d => [0, 128, 200],
    strokeWidth: 1,
    pickable: true
  }
};

const ChoroplethLayer64ContourExample = {
  layer: ChoroplethLayer64,
  props: {
    id: 'choroplethLayer64Contour',
    data: dataSamples.choropleths,
    getColor: f => [0, 80, 200],
    opacity: 0.8,
    drawContour: true
  }
};

const ChoroplethLayer64SolidExample = {
  layer: ChoroplethLayer64,
  props: {
    id: 'choroplethLayer64Solid',
    data: dataSamples.choropleths,
    getColor: f => [((f.properties.ZIP_CODE * 10) % 127) + 128, 0, 0],
    opacity: 0.8,
    pickable: true
  }
};

const ExtrudedChoroplethLayer64Example = {
  layer: ExtrudedChoroplethLayer64,
  props: {
    id: 'extrudedChoroplethLayer64',
    data: dataSamples.choropleths,
    getColor: f => [((f.properties.ZIP_CODE * 10) % 127) + 128, 0, 0],
    pointLightLocation: [
      // props.mapViewState.longitude,
      // props.mapViewState.latitude,
      37.751537058389985,
      -122.42694203247012,
      1e4
    ],
    opacity: 1.0,
    pickable: true
  }
};

const LineLayer64Example = {
  layer: LineLayer64,
  props: {
    id: 'lineLayer64',
    data: dataSamples.routes,
    getSourcePosition: d => d.START,
    getTargetPosition: d => d.END,
    getColor: d => d.SERVICE === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0],
    strokeWidth: 1,
    pickable: true
  }
};

const ScatterplotLayer64Example = {
  layer: ScatterplotLayer64,
  props: {
    id: 'scatterplotLayer64',
    data: dataSamples.points,
    getPosition: d => d.COORDINATES,
    getColor: d => [255, 128, 0],
    getRadius: d => d.SPACES,
    pickable: true,
    radiusMinPixels: 1,
    radiusMaxPixels: 30
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
  layer: ScatterplotLayer64,
  getData,
  props: {
    id: `scatterplotLayer64Perf-${id}`,
    getPosition: d => d,
    getColor: d => [0, 128, 0],
    // pickable: true,
    radiusMinPixels: 1,
    radiusMaxPixels: 5
  }
});

export default {
  'Core Layers': {
    'ChoroplethLayer (Solid)': ChoroplethLayerExample,
    'ChoroplethLayer (Contour)': ChoroplethLayerContourExample,
    ScatterplotLayer: ScatterplotLayerExample,
    'ScatterplotLayer (meters)': ScatterplotLayerMetersExample,
    ArcLayer: ArcLayerExample,
    LineLayer: LineLayerExample,
    ScreenGridLayer: ScreenGridLayerExample
  },

  '64-bit Layers': {
    ArcLayer64: ArcLayer64Example,
    'ChoroplethLayer64 (Solid)': ChoroplethLayer64SolidExample,
    'ChoroplethLayer64 (Contour)': ChoroplethLayer64ContourExample,
    ExtrudedChoroplethLayer64: ExtrudedChoroplethLayer64Example,
    ScatterplotLayer64: ScatterplotLayer64Example,
    LineLayer64: LineLayer64Example
  },

  'Performance Tests': {
    'ScatterplotLayer 1M': ScatterplotLayerPerfExample('1M', dataSamples.getPoints1M),
    'ScatterplotLayer 10M': ScatterplotLayerPerfExample('10M', dataSamples.getPoints10M),
    'ScatterplotLayer64 100K': ScatterplotLayer64PerfExample('100K', dataSamples.getPoints100K),
    'ScatterplotLayer64 1M': ScatterplotLayer64PerfExample('1M', dataSamples.getPoints1M),
    'ScatterplotLayer64 10M': ScatterplotLayer64PerfExample('10M', dataSamples.getPoints10M)
  }
};

export const DEFAULT_ACTIVE_LAYERS = {};

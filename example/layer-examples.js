import {
  ChoroplethLayer,
  ScatterplotLayer,
  ArcLayer,
  LineLayer,
  ScreenGridLayer
} from '../src';

import {
  ScatterplotLayer64,
  ArcLayer64,
  ChoroplethLayer64,
  ExtrudedChoroplethLayer64,
  LineLayer64
} from '../src/layers/fp64';

import {
  EnhancedChoroplethLayer
} from '../src/layers/samples';

const ArcLayerExample = props =>
  new ArcLayer({
    ...props,
    id: props.id || 'arcLayer',
    data: props.arcs,
    strokeWidth: props.arcStrokeWidth || 1,
    pickable: true,
    onHover: props.onArcHovered,
    onClick: props.onArcClicked
  });

const ChoroplethLayerContourExample = props =>
  new ChoroplethLayer({
    ...props,
    id: props.id || 'choroplethLayerContour',
    data: props.choropleths,
    opacity: 0.8,
    drawContour: true
  });

const ChoroplethLayerExample = props =>
  new ChoroplethLayer({
    ...props,
    id: props.id || 'choroplethLayerSolid',
    data: props.choropleths,
    opacity: 0.1,
    pickable: true,
    onHover: props.onChoroplethHovered,
    onClick: props.onChoroplethClicked
  });

const ScreenGridLayerExample = props =>
  new ScreenGridLayer({
    ...props,
    id: props.id || 'screenGridLayer',
    data: props.points,
    pickable: false,
    opacity: 0.06
  });

const LineLayerExample = props =>
  new LineLayer({
    ...props,
    id: props.id || 'lineLayer',
    data: props.lines,
    strokeWidth: props.lineStrokeWidth || 1,
    pickable: true,
    onHover: props.onLineHovered,
    onClick: props.onLineClicked
  });

const ScatterplotLayerExample = props =>
  new ScatterplotLayer({
    ...props,
    id: props.id || 'scatterplotLayer',
    data: props.points,
    opacity: 0.5,
    strokeWidth: 2,
    pickable: true,
    radiusMinPixels: 1,
    radiusMaxPixels: 30,
    onHover: props.onScatterplotHovered,
    onClick: props.onScatterplotClicked
  });

const METER_PLOT = [
  {position: [0, 0], radius: 1},
  {position: [20, 20], radius: 2},
  {position: [-100, -100], radius: 3},
  {position: [-50, 200], radius: 0.5},
  {position: [1000, 1000], radius: 0.1}
];

const ScatterplotLayerMetersExample = props =>
  new ScatterplotLayer({
    ...props,
    id: props.id || 'scatterplotLayerMeter',
    drawOutline: true,
    projectionMode: 2,
    positionOrigin: [
      -122.42694203247012,
      37.751537058389985
    ],
    data: METER_PLOT,
    getColor: x => [0, 0, 255],
    opacity: 0.5,
    pickable: true,
    onHover: props.onScatterplotHovered,
    onClick: props.onScatterplotClicked
  });

// 64 BIT LAYER EXAMPLES

const ArcLayer64Example = props =>
  new ArcLayer64({
    ...props,
    id: props.id || 'arcLayer64',
    data: props.arcs,
    strokeWidth: props.arcStrokeWidth || 1,
    pickable: true,
    onHover: props.onArcHovered,
    onClick: props.onArcClicked
  });

const ChoroplethLayer64ContourExample = props =>
  new ChoroplethLayer64({
    id: props.id || 'choroplethLayer64Contour',
    ...props,
    data: props.choropleths,
    opacity: 0.8,
    drawContour: true
  });

const ChoroplethLayer64SolidExample = props =>
  new ChoroplethLayer64({
    ...props,
    id: props.id || 'choroplethLayer64Solid',
    data: props.choropleths,
    opacity: 0.1,
    pickable: true,
    onHover: props.onChoroplethHovered,
    onClick: props.onChoroplethClicked
  });

const ExtrudedChoroplethLayer64Example = props =>
  new ExtrudedChoroplethLayer64({
    ...props,
    id: props.id || 'extrudedChoroplethLayer64',
    data: props.extrudedChoropleths,
    pointLightLocation: [
      props.mapViewState.longitude,
      props.mapViewState.latitude,
      1e4
    ],
    opacity: 1.0,
    pickable: true
  });

const LineLayer64Example = props =>
  new LineLayer64({
    ...props,
    id: props.id || 'lineLayer64',
    data: props.lines,
    strokeWidth: props.arcStrokeWidth || 1,
    pickable: true,
    onHover: props.onArcHovered,
    onClick: props.onArcClicked
  });

const ScatterplotLayer64Example = props =>
  new ScatterplotLayer64({
    ...props,
    id: props.id || 'scatterplotLayer64',
    data: props.points,
    pickable: true,
    radiusMinPixels: 1,
    radiusMaxPixels: 30,
    onHover: props.onScatterplotHovered,
    onClick: props.onScatterplotClicked
  });

// SAMPLE LAYER EXAMPLES

const EnhancedChoroplethLayerExample = props =>
  new EnhancedChoroplethLayer({
    ...props,
    id: props.id || 'enhancedChoroplethLayer',
    data: props.choropleths,
    opacity: 0.01,
    pickable: true,
    onHover: props.onChoroplethHovered,
    onClick: props.onChoroplethClicked
  });

// Returns new array N times larger than input array
// filled with duplicate elements
// Avoids Array.concat (which generates temporary huge arrays)
// Avoids Array.push (which keeps reallocating the array)
function duplicateArray(array, N = 10) {
  const length = array.length;
  const newArray = Array(N * length);
  for (let i = 0; i < N; ++i) {
    for (let j = 0; j < array.length; ++j) {
      newArray[i * length + j] = array[j];
    }
  }
  return newArray;
}

function makePoints(N = 1e6, color = [88, 220, 124]) {
  const center = [
    -122.42694203247012,
    37.751537058389985
  ];
  const spread = 2;

  const points = Array(N);
  for (let i = 0; i < N; ++i) {
    points[i] = {
      position: [
        center[0] + (Math.random() - 0.5) * spread,
        center[1] + (Math.random() - 0.5) * spread,
        0.0
      ],
      color,
      radius: Math.random() + 0.5
    };
  }
  return points;
}

let points1M = null;
function make1MPoints() {
  points1M = points1M || makePoints(1e6);
  return {points: points1M, pickable: false};
}

let points10M = null;
function make10MPoints() {
  points10M = points10M || duplicateArray(makePoints(1e6, [124, 200, 10]), 10);
  // Too slow
  // points10M = makePoints(1e7, [124, 88, 220]);
  return {points: points10M, pickable: false};
}

let points100K = null;
function make100KPoints() {
  points100K = points100K || makePoints(1e5);
  return {points: points100K, pickable: false};
}

export default {
  'Core Layers': {
    ArcLayer: ArcLayerExample,
    'ChoroplethLayer (Solid)': ChoroplethLayerExample,
    'ChoroplethLayer (Contour)': ChoroplethLayerContourExample,
    LineLayer: LineLayerExample,
    ScatterplotLayer: ScatterplotLayerExample,
    'ScatterplotLayer (meters)': ScatterplotLayerMetersExample,
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

  'Sample Layers': {
    EnhancedChoroplethLayer: EnhancedChoroplethLayerExample
  },

  'Performance Tests': {
    'ScatterplotLayer 1M': [ScatterplotLayerExample, make1MPoints],
    'ScatterplotLayer 10M': [ScatterplotLayerExample, make10MPoints],
    'ScatterplotLayer64 100K': [ScatterplotLayer64Example, make100KPoints],
    'ScatterplotLayer64 1M': [ScatterplotLayer64Example, make1MPoints],
    'ScatterplotLayer64 10M': [ScatterplotLayer64Example, make10MPoints]
  }
};

export const DEFAULT_ACTIVE_LAYERS = {};

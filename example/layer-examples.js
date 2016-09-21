import {
  HexagonLayer,
  ChoroplethLayer,
  ScatterplotLayer,
  ArcLayer,
  LineLayer,
  GridLayer
} from '../src';

import {
  ExtrudedChoroplethLayer,
  ExperimentalScatterplotLayer
} from '../src/layers/experimental';

import {
  ScatterplotLayer64
} from '../src/layers/fp64'

export function GridLayerExample(props) {
  const {mapViewState, points} = props;

  return new GridLayer({
    id: props.id || 'gridLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    isPickable: false,
    opacity: 0.06,
    data: points
  });
}

export function ChoroplethContourLayerExample(props) {
  const {mapViewState, choropleths} = props;
  return new ChoroplethLayer({
    id: props.id || 'choroplethContourLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: choropleths,
    opacity: 0.8,
    drawContour: true
  });
}

export function ChoroplethLayerExample(props) {
  const {mapViewState, choropleths} = props;
  return new ChoroplethLayer({
    id: props.id || 'choroplethLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: choropleths,
    opacity: 0.01,
    isPickable: true,
    onHover: props.onChoroplethHovered,
    lick: props.onChoroplethClicked
  });
}

export function HexagonLayerExample(props) {
  const {mapViewState, hexData} = props;

  return new HexagonLayer({
    id: props.id || 'hexagonLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: hexData,
    opacity: 0.5,
    elevation: 200,
    isPickable: true,
    onHover: props.onHexagonHovered,
    onClick: props.onHexagonClicked
  });
}

export function HexagonSelectionLayerExample(props) {
  const {mapViewState} = props;
  const {selectedHexagons} = props;

  return new HexagonLayer({
    id: props.id || 'hexagonSelectionLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: selectedHexagons,
    opacity: 0.1,
    elevation: 200,
    isPickable: false
  });
}

export function ScatterplotLayerExample(props) {
  const {mapViewState, points} = props;

  return new ScatterplotLayer({
    id: props.id || 'scatterplotLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: points,
    opacity: 0.5,
    isPickable: true,
    onHover: props.onScatterplotHovered,
    onClick: props.onScatterplotClicked
  });
}

export function ArcLayerExample(props) {
  const {mapViewState, arcs} = props;

  return new ArcLayer({
    id: props.id || 'arcLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: arcs,
    strokeWidth: props.arcStrokeWidth || 1,
    isPickable: true,
    onHover: props.onArcHovered,
    onClick: props.onArcClicked
  });
}

export function ArcLayer2Example(props) {
  const {mapViewState, arcs2} = props;

  return new ArcLayer({
    id: props.id || 'arcLayer2',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: arcs2,
    strokeWidth: props.arcStrokeWidth || 1,
    isPickable: true,
    onHover: props.onArcHovered,
    onClick: props.onArcClicked
  });
}

export function LineLayerExample(props) {
  const {mapViewState, lines} = props;

  return new LineLayer({
    id: props.id || 'lineLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: lines,
    strokeWidth: props.lineStrokeWidth || 1,
    isPickable: true,
    onHover: props.onLineHovered,
    onClick: props.onLineClicked
  });
}

export function ExtrudedChoroplethLayerExample(props) {
  const {mapViewState, choropleths} = props;
  return new ExtrudedChoroplethLayer({
    id: props.id || 'extruded-choroplethLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: choropleths,
    opacity: 0.01,
    isPickable: true,
    onHover: props.onChoroplethHovered,
    lick: props.onChoroplethClicked
  });
}

export function ExperimentalScatterplotLayerExample(props) {
  const {mapViewState, points} = props;

  return new ExperimentalScatterplotLayer({
    id: props.id || 'experimentalScatterplotLayer',
    width: window.innerWidth,
    height: window.innerHeight,
    ...mapViewState,
    data: points,
    opacity: 0.5,
    isPickable: true,
    onHover: props.onScatterplotHovered,
    onClick: props.onScatterplotClicked
  });
}

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
        center[1] + (Math.random() - 0.5) * spread
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
  return {points: points1M, isPickable: false};
}

let points10M = null;
function make10MPoints() {
  points10M = points10M || duplicateArray(makePoints(1e6, [124, 88, 220]), 10);
  // Too slow
  // points10M = makePoints(1e7, [124, 88, 220]);
  return {points: points10M, isPickable: false};
}

export default {
  'Core Layers': {
    GridLayer: GridLayerExample,
    'ChoroplethLayer (Solid)': ChoroplethLayerExample,
    'ChoroplethLayer (Contour)': ChoroplethContourLayerExample,
    HexagonLayer: HexagonLayerExample,
    ScatterplotLayer: ScatterplotLayerExample,
    LineLayer: LineLayerExample,
    ArcLayer: ArcLayerExample
  },

  'Core Layers (Additional)': {
    HexagonSelectionLayer: HexagonSelectionLayerExample,
    ArcLayer2: ArcLayer2Example
  },

  'Experimental Layers': {
    ExtrudedChoroplethLayer: ExtrudedChoroplethLayerExample,
    ExperimentalScatterplotLayer: ExperimentalScatterplotLayerExample
  },

  'FP64 Layers': {
    'ScatterplotLayer64': ScatterplotLayer64Example
  },


  'Performance Tests': {
    'ScatterplotLayer 1M': [ScatterplotLayerExample, make1MPoints],
    'ScatterplotLayer 10M': [ScatterplotLayerExample, make10MPoints]
  }
};

export const DEFAULT_ACTIVE_LAYERS = {
  'ChoroplethLayer (Contour)': true,
  'ScatterplotLayer64': true
};

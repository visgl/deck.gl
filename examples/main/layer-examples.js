import {
  ChoroplethLayer,
  ScatterplotLayer,
  ArcLayer,
  LineLayer,
  ScreenGridLayer,

  ScatterplotLayer64,
  ArcLayer64,
  ChoroplethLayer64,
  ExtrudedChoroplethLayer64,
  LineLayer64

} from 'deck.gl';

import * as dataSamples from './data-samples';

const ArcLayerExample = props =>
  new ArcLayer({
    id: 'arcLayer',
    data: dataSamples.routes,
    getSourcePosition: d => d.START,
    getTargetPosition: d => d.END,
    getSourceColor: d => [64, 255, 0],
    getTargetColor: d => [0, 128, 200],
    strokeWidth: 1,
    pickable: true,
    onHover: props.onHovered,
    onClick: props.onClicked
  });

const ChoroplethLayerContourExample = props =>
  new ChoroplethLayer({
    id: 'choroplethLayerContour',
    data: dataSamples.choropleths,
    getColor: f => [0, 80, 200],
    opacity: 0.8,
    drawContour: true
  });

const ChoroplethLayerExample = props =>
  new ChoroplethLayer({
    id: 'choroplethLayerSolid',
    data: dataSamples.choropleths,
    getColor: f => [((f.properties.ZIP_CODE * 10) % 127) + 128, 0, 0],
    opacity: 0.8,
    pickable: true,
    onHover: props.onHovered,
    onClick: props.onClicked
  });

const ScreenGridLayerExample = props =>
  new ScreenGridLayer({
    id: 'screenGridLayer',
    data: dataSamples.points,
    getPosition: d => d.COORDINATES,
    unitWidth: 40,
    unitHeight: 40,
    minColor: [0, 0, 80, 0],
    maxColor: [100, 255, 0, 128],
    pickable: false
  });

const LineLayerExample = props =>
  new LineLayer({
    id: 'lineLayer',
    data: dataSamples.routes,
    getSourcePosition: d => d.START,
    getTargetPosition: d => d.END,
    getColor: d => d.SERVICE === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0],
    strokeWidth: 1,
    pickable: true,
    onHover: props.onHovered,
    onClick: props.onClicked
  });

const ScatterplotLayerExample = props =>
  new ScatterplotLayer({
    id: 'scatterplotLayer',
    data: dataSamples.points,
    getPosition: d => d.COORDINATES,
    getColor: d => [255, 128, 0],
    getRadius: d => d.SPACES,
    opacity: 0.5,
    strokeWidth: 2,
    pickable: true,
    radiusMinPixels: 1,
    radiusMaxPixels: 30,
    onHover: props.onHovered,
    onClick: props.onClicked
  });

const ScatterplotLayerMetersExample = props =>
  new ScatterplotLayer({
    id: 'scatterplotLayerMeter',
    data: dataSamples.meterPoints,
    drawOutline: true,
    projectionMode: 2,
    positionOrigin: [-122.45, 37.75],
    getPosition: d => d,
    getColor: d => [0, 0, 255],
    opacity: 0.5,
    pickable: true,
    onHover: props.onHovered,
    onClick: props.onClicked
  });

// 64 BIT LAYER EXAMPLES

const ArcLayer64Example = props =>
  new ArcLayer64({
    id: 'arcLayer64',
    data: dataSamples.routes,
    getSourcePosition: d => d.START,
    getTargetPosition: d => d.END,
    getSourceColor: d => [64, 255, 0],
    getTargetColor: d => [0, 128, 200],
    strokeWidth: 1,
    pickable: true,
    onHover: props.onHovered,
    onClick: props.onClicked
  });

const ChoroplethLayer64ContourExample = props =>
  new ChoroplethLayer64({
    id: 'choroplethLayer64Contour',
    data: dataSamples.choropleths,
    getColor: f => [0, 80, 200],
    opacity: 0.8,
    drawContour: true
  });

const ChoroplethLayer64SolidExample = props =>
  new ChoroplethLayer64({
    id: 'choroplethLayer64Solid',
    data: dataSamples.choropleths,
    getColor: f => [((f.properties.ZIP_CODE * 10) % 127) + 128, 0, 0],
    opacity: 0.8,
    pickable: true,
    onHover: props.onHovered,
    onClick: props.onClicked
  });

const ExtrudedChoroplethLayer64Example = props =>
  new ExtrudedChoroplethLayer64({
    id: 'extrudedChoroplethLayer64',
    data: dataSamples.choropleths,
    getColor: f => [((f.properties.ZIP_CODE * 10) % 127) + 128, 0, 0],
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
    id: 'lineLayer64',
    data: dataSamples.routes,
    getSourcePosition: d => d.START,
    getTargetPosition: d => d.END,
    getColor: d => d.SERVICE === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0],
    strokeWidth: 1,
    pickable: true,
    onHover: props.onHovered,
    onClick: props.onClicked
  });

const ScatterplotLayer64Example = props =>
  new ScatterplotLayer64({
    id: 'scatterplotLayer64',
    data: dataSamples.points,
    getPosition: d => d.COORDINATES,
    getColor: d => [255, 128, 0],
    getRadius: d => d.SPACES,
    pickable: true,
    radiusMinPixels: 1,
    radiusMaxPixels: 30,
    onHover: props.onHovered,
    onClick: props.onClicked
  });

// perf test examples
const ScatterplotLayerPerfExample = getData => props =>
  new ScatterplotLayer({
    id: 'scatterplotLayer',
    data: getData(),
    getPosition: d => d,
    getColor: d => [0, 128, 0],
    radius: 1,
    pickable: true,
    radiusMinPixels: 1,
    radiusMaxPixels: 30,
    onHover: props.onHovered,
    onClick: props.onClicked
  });

const ScatterplotLayer64PerfExample = getData => props =>
  new ScatterplotLayer64({
    id: 'scatterplotLayer64',
    data: getData(),
    getPosition: d => d,
    getColor: d => [0, 128, 0],
    radius: 1,
    pickable: true,
    radiusMinPixels: 1,
    radiusMaxPixels: 30,
    onHover: props.onHovered,
    onClick: props.onClicked
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
    'ScatterplotLayer 1M': ScatterplotLayerPerfExample(dataSamples.getPoints1M),
    'ScatterplotLayer 10M': ScatterplotLayerPerfExample(dataSamples.getPoints10M),
    'ScatterplotLayer64 100K': ScatterplotLayer64PerfExample(dataSamples.getPoints100K),
    'ScatterplotLayer64 1M': ScatterplotLayer64PerfExample(dataSamples.getPoints1M),
    'ScatterplotLayer64 10M': ScatterplotLayer64PerfExample(dataSamples.getPoints10M)
  }
};

export const DEFAULT_ACTIVE_LAYERS = {};

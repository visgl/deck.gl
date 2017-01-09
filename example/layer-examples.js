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

import dataSamples from './data-samples';
import {flattenCoords} from './utils';

const ArcLayerExample = props =>
  new ArcLayer({
    id: 'arcLayer',
    data: props.data,
    getSourcePosition: f => flattenCoords(f.geometry.coordinates).shift(),
    getTargetPosition: f => flattenCoords(f.geometry.coordinates).pop(),
    getSourceColor: f => f.properties.DIRECTION === 'INBOUND' ? [0, 128, 200] : [0, 200, 128],
    getTargetColor: f => f.properties.DIRECTION === 'INBOUND' ? [0, 200, 128] : [0, 128, 200],
    strokeWidth: 1,
    pickable: true,
    onHover: props.onHovered,
    onClick: props.onClicked
  });

const ChoroplethLayerContourExample = props =>
  new ChoroplethLayer({
    id: 'choroplethLayerContour',
    data: props.data,
    getColor: f => [0, 80, 200],
    opacity: 0.8,
    drawContour: true
  });

const ChoroplethLayerExample = props =>
  new ChoroplethLayer({
    id: 'choroplethLayerSolid',
    data: props.data,
    getColor: f => [((f.properties.ZIP_CODE * 10) % 127) + 128, 0, 0],
    opacity: 0.8,
    pickable: true,
    onHover: props.onHovered,
    onClick: props.onClicked
  });

const ScreenGridLayerExample = props =>
  new ScreenGridLayer({
    id: 'screenGridLayer',
    data: props.data,
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
    data: props.data,
    getSourcePosition: f => flattenCoords(f.geometry.coordinates).shift(),
    getTargetPosition: f => flattenCoords(f.geometry.coordinates).pop(),
    getColor: f => f.properties.DIRECTION === 'INBOUND' ? [0, 128, 200] : [0, 200, 128],
    strokeWidth: 1,
    pickable: true,
    onHover: props.onHovered,
    onClick: props.onClicked
  });

const ScatterplotLayerExample = props =>
  new ScatterplotLayer({
    id: 'scatterplotLayer',
    data: props.data,
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
    data: props.data,
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
    data: props.data,
    getSourcePosition: f => flattenCoords(f.geometry.coordinates).shift(),
    getTargetPosition: f => flattenCoords(f.geometry.coordinates).pop(),
    getSourceColor: f => f.properties.DIRECTION === 'INBOUND' ? [0, 128, 200] : [0, 200, 128],
    getTargetColor: f => f.properties.DIRECTION === 'INBOUND' ? [0, 200, 128] : [0, 128, 200],
    strokeWidth: 1,
    pickable: true,
    onHover: props.onHovered,
    onClick: props.onClicked
  });

const ChoroplethLayer64ContourExample = props =>
  new ChoroplethLayer64({
    id: 'choroplethLayer64Contour',
    data: props.data,
    getColor: f => [0, 80, 200],
    opacity: 0.8,
    drawContour: true
  });

const ChoroplethLayer64SolidExample = props =>
  new ChoroplethLayer64({
    id: 'choroplethLayer64Solid',
    data: props.data,
    getColor: f => [((f.properties.ZIP_CODE * 10) % 127) + 128, 0, 0],
    opacity: 0.8,
    pickable: true,
    onHover: props.onHovered,
    onClick: props.onClicked
  });

const ExtrudedChoroplethLayer64Example = props =>
  new ExtrudedChoroplethLayer64({
    id: 'extrudedChoroplethLayer64',
    data: props.data,
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
    data: props.data,
    getSourcePosition: f => flattenCoords(f.geometry.coordinates).shift(),
    getTargetPosition: f => flattenCoords(f.geometry.coordinates).pop(),
    getColor: f => f.properties.DIRECTION === 'INBOUND' ? [0, 128, 200] : [0, 200, 128],
    strokeWidth: 1,
    pickable: true,
    onHover: props.onHovered,
    onClick: props.onClicked
  });

const ScatterplotLayer64Example = props =>
  new ScatterplotLayer64({
    id: 'scatterplotLayer64',
    data: props.data,
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
const ScatterplotLayerPerfExample = props =>
  new ScatterplotLayer({
    id: 'scatterplotLayer',
    data: props.data,
    getPosition: d => d,
    getColor: d => [0, 128, 0],
    radius: 1,
    pickable: true,
    radiusMinPixels: 1,
    radiusMaxPixels: 30,
    onHover: props.onHovered,
    onClick: props.onClicked
  });

const ScatterplotLayer64PerfExample = props =>
  new ScatterplotLayer64({
    id: 'scatterplotLayer64',
    data: props.data,
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
    'ChoroplethLayer (Solid)': [ChoroplethLayerExample, dataSamples.getChoropleths],
    'ChoroplethLayer (Contour)': [ChoroplethLayerContourExample, dataSamples.getChoropleths],
    ScatterplotLayer: [ScatterplotLayerExample, dataSamples.getPoints],
    'ScatterplotLayer (meters)': [ScatterplotLayerMetersExample, dataSamples.getMeterPoints],
    ArcLayer: [ArcLayerExample, dataSamples.getRoutes],
    LineLayer: [LineLayerExample, dataSamples.getRoutes],
    ScreenGridLayer: [ScreenGridLayerExample, dataSamples.getPoints]
  },

  '64-bit Layers': {
    ArcLayer64: [ArcLayer64Example, dataSamples.getRoutes],
    'ChoroplethLayer64 (Solid)': [ChoroplethLayer64SolidExample, dataSamples.getChoropleths],
    'ChoroplethLayer64 (Contour)': [ChoroplethLayer64ContourExample, dataSamples.getChoropleths],
    ExtrudedChoroplethLayer64: [ExtrudedChoroplethLayer64Example, dataSamples.getChoropleths],
    ScatterplotLayer64: [ScatterplotLayer64Example, dataSamples.getPoints],
    LineLayer64: [LineLayer64Example, dataSamples.getRoutes]
  },

  'Performance Tests': {
    'ScatterplotLayer 1M': [ScatterplotLayerPerfExample, dataSamples.get1MPoints],
    'ScatterplotLayer 10M': [ScatterplotLayerPerfExample, dataSamples.get10MPoints],
    'ScatterplotLayer64 100K': [ScatterplotLayer64PerfExample, dataSamples.get100KPoints],
    'ScatterplotLayer64 1M': [ScatterplotLayer64PerfExample, dataSamples.get1MPoints],
    'ScatterplotLayer64 10M': [ScatterplotLayer64PerfExample, dataSamples.get10MPoints]
  }
};

export const DEFAULT_ACTIVE_LAYERS = {};

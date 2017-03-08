import {
  ChoroplethLayer,
  ChoroplethLayer64,
  ExtrudedChoroplethLayer64
} from 'deck.gl';

import * as dataSamples from '../data-samples';

const ChoroplethLayerExample = {
  layer: ChoroplethLayer,
  props: {
    id: 'choroplethLayerSolid',
    data: dataSamples.choropleths,
    getColor: f => [((f.properties.ZIP_CODE * 10) % 127) + 128, 0, 0],
    opacity: 0.8,
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

const ExtrudedChoroplethLayer64WireframeExample = {
  layer: ExtrudedChoroplethLayer64,
  props: Object.assign({}, ExtrudedChoroplethLayer64Example.props, {
    id: 'extrudedChoroplethLayer64-wireframe',
    drawWireframe: true
  })
};

/* eslint-disable quote-props */
export default {
  'Deprecated Layers': {
    'ChoroplethLayer': ChoroplethLayerExample,
    'ChoroplethLayer64 (Solid)': ChoroplethLayer64SolidExample,
    'ChoroplethLayer64 (Contour)': ChoroplethLayer64ContourExample,
    'ExtrudedChoroplethLayer64': ExtrudedChoroplethLayer64Example,
    'ExtrudedChoroplethLayer64 (Wireframe)': ExtrudedChoroplethLayer64WireframeExample
  }
};

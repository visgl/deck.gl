// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-console, no-invalid-this */
import * as data from 'deck.gl-test/data';

import {ScatterplotLayer, PolygonLayer, PathLayer, GeoJsonLayer, TextLayer} from 'deck.gl';

import {testInitializeLayer} from '@deck.gl/test-utils';

import SolidPolygonLayer from '@deck.gl/layers/solid-polygon-layer/solid-polygon-layer';

// add tests
export default function coreLayersBench(suite) {
  layerConstructionBench(suite);

  return suite
    .group('COMPOSITE LAYER INITIALIZATION')
    .add('GeoJsonLayer#initialize', () => {
      const layer = new GeoJsonLayer({data: data.choropleths});
      testInitializeLayer({layer});
    })
    .add('PolygonLayer#initialize (flat)', () => {
      const layer = new PolygonLayer({
        data: data.choropleths.features,
        getPolygon: f => f.geometry.coordinates
      });
      testInitializeLayer({layer});
    })
    .add('PolygonLayer#initialize (extruded)', () => {
      const layer = new PolygonLayer({
        data: data.choropleths.features,
        getPolygon: f => f.geometry.coordinates,
        extruded: true
      });
      testInitializeLayer({layer});
    })
    .add('PolygonLayer#initialize (wireframe)', () => {
      const layer = new PolygonLayer({
        data: data.choropleths.features,
        getPolygon: f => f.geometry.coordinates,
        extruded: true,
        wireframe: true
      });
      testInitializeLayer({layer});
    })
    .group('PRIMITIVE LAYER INITIALIZATION')
    .add('ScatterplotLayer#initialize', () => {
      const layer = new ScatterplotLayer({data: data.points, getPosition: d => d.COORDINATES});
      testInitializeLayer({layer});
    })
    .add('PathLayer#initialize', () => {
      const layer = new PathLayer({data: data.lines});
      testInitializeLayer({layer});
    })
    .add('SolidPolygonLayer#initialize (flat)', () => {
      const layer = new SolidPolygonLayer({
        data: data.choropleths.features,
        getPolygon: f => f.geometry.coordinates
      });
      testInitializeLayer({layer});
    })
    .add('SolidPolygonLayer#initialize (extruded)', () => {
      const layer = new SolidPolygonLayer({
        data: data.choropleths.features,
        getPolygon: f => f.geometry.coordinates,
        extruded: true
      });
      testInitializeLayer({layer});
    })
    .add('SolidPolygonLayer#initialize (wireframe)', () => {
      const layer = new SolidPolygonLayer({
        data: data.choropleths.features,
        getPolygon: f => f.geometry.coordinates,
        extruded: true,
        wireframe: true
      });
      testInitializeLayer({layer});
    })
    .add('TextLayer#initialize', () => {
      if (typeof document === 'undefined') {
        // FontAtlasManager does not work in Node
        return;
      }
      const layer = new TextLayer({
        data: data.points,
        getPosition: d => d.COORDINATES,
        getText: d => d.LOCATION_NAME
      });
      testInitializeLayer({layer});
    });
}

const PROPS1 = {
  // data: Special handling for null, see below
  dataComparator: null,
  updateTriggers: {}, // Update triggers: a core change detection mechanism in deck.gl
  numInstances: undefined,

  visible: true,
  pickable: false,
  opacity: 0.8,

  onHover: () => {},
  onClick: () => {},

  coordinateSystem: 1,
  coordinateOrigin: [0, 0, 0],

  parameters: {},
  uniforms: {},
  framebuffer: null,

  animation: null, // Passed prop animation functions to evaluate props

  // Offset depth based on layer index to avoid z-fighting.
  // Negative values pull layer towards the camera
  // https://www.opengl.org/archives/resources/faq/technical/polygonoffset.htm
  getPolygonOffset: ({layerIndex}) => [0, -layerIndex * 100]
};

const PROPS2 = {
  // data: Special handling for null, see below
  dataComparator2: null,
  updateTriggers2: {}, // Update triggers: a core change detection mechanism in deck.gl
  numInstances2: undefined,

  visible2: true,
  pickable2: false,
  opacity2: 0.8,

  coordinateSystem2: 1,
  coordinateOrigin2: [0, 0, 0],

  parameters2: {},
  uniforms2: {},
  framebuffer2: null,

  animation2: null // Passed prop animation functions to evaluate props
};

const PROPS3 = {
  // Selection/Highlighting
  highlightedObjectIndex: null,
  autoHighlight: false,
  highlightColor: [0, 0, 128, 128]
};

function layerConstructionBench(suite) {
  suite
    .group('LAYER CONSTRUCTION')
    .add('ScatterplotLayer#construct', () => {
      return new ScatterplotLayer({data: data.points});
    })
    .add('GeoJsonLayer#construct', () => {
      return new GeoJsonLayer({data: data.choropleths});
    })
    .add('PolygonLayer#construct', () => {
      return new PolygonLayer({
        data: data.choropleths.features,
        getPolygon: f => f.geometry.coordinates
      });
    })
    .add('SolidPolygonLayer#construct', () => {
      return new PolygonLayer({
        data: data.choropleths.features,
        getPolygon: f => f.geometry.coordinates
      });
    })
    .add('ScatterplotLayer#construct(separate prop objects)', () => {
      return new ScatterplotLayer(PROPS1, PROPS2, PROPS3);
    })
    .add('ScatterplotLayer#construct(composed prop objects)', () => {
      return new ScatterplotLayer(Object.assign({}, PROPS1, PROPS2, PROPS3));
    });
}

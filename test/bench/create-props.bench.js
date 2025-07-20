// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Layer} from '@deck.gl/core';
import Component from '@deck.gl/core/lifecycle/component';

class TestLayer extends Layer {
  initializeState() {}
}
TestLayer.layerName = 'TestLayer';
// Copied from ScatterplotLayer so that the bench result remains comparable between versions
TestLayer.defaultProps = {
  radiusScale: {type: 'number', min: 0, value: 1},
  radiusMinPixels: {type: 'number', min: 0, value: 0},
  radiusMaxPixels: {type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER},

  lineWidthUnits: 'meters',
  lineWidthScale: {type: 'number', min: 0, value: 1},
  lineWidthMinPixels: {type: 'number', min: 0, value: 0},
  lineWidthMaxPixels: {type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER},

  stroked: false,
  filled: true,

  getPosition: {type: 'accessor', value: x => x.position},
  getRadius: {type: 'accessor', value: 1},
  getFillColor: {type: 'accessor', value: [0, 0, 0, 255]},
  getLineColor: {type: 'accessor', value: [0, 0, 0, 255]},
  getLineWidth: {type: 'accessor', value: 1},

  // deprecated
  strokeWidth: {deprecatedFor: 'getLineWidth'},
  outline: {deprecatedFor: 'stroked'},
  getColor: {deprecatedFor: ['getFillColor', 'getLineColor']}
};

class TestExtensionA {}
TestExtensionA.extensionName = 'TestExtensionA';
TestExtensionA.defaultProps = {
  extAEnabled: true,
  extAValue: {type: 'number', value: 10},
  extARange: {type: 'array', value: [0, 1], compare: true}
};

class TestExtensionB {}
TestExtensionB.extensionName = 'TestExtensionB';
TestExtensionB.defaultProps = {
  extBEnabled: true,
  extBValue: {type: 'number', value: 10},
  extBRange: {type: 'array', value: [0, 1], compare: true}
};

// eslint-disable-next-line
let testInstance;

export default function comparePropsBench(suite) {
  return suite
    .group('CREATE PROPS')

    .add('createProps#empty', () => {
      testInstance = new Component();
    })
    .add('createProps#realWorld', () => {
      testInstance = new TestLayer(
        {
          stroked: true,
          getFillColor: [255, 0, 0],
          getLineColor: [255, 255, 255]
        },
        {
          id: 'scatterplot',
          data: 'http://deck.gl',
          getPosition: d => d.coordinates,
          getRadius: d => d.count
        }
      );
    })
    .add('createProps#with extensions', () => {
      testInstance = new TestLayer(
        {
          stroked: true,
          getFillColor: [255, 0, 0],
          getLineColor: [255, 255, 255]
        },
        {
          id: 'scatterplot',
          data: 'http://deck.gl',
          getPosition: d => d.coordinates,
          getRadius: d => d.count,
          extensions: [new TestExtensionA(), new TestExtensionB()]
        }
      );
    });
}

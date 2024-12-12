// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-console, no-invalid-this */

import {Layer, ScatterplotLayer} from 'deck.gl';
import {parsePropTypes} from '@deck.gl/core/lifecycle/prop-types';
import {compareProps} from '@deck.gl/core/lifecycle/props';

// sample prop types
const propTypes = Object.assign(
  {},
  parsePropTypes(Layer.defaultProps).propTypes,
  parsePropTypes(ScatterplotLayer.defaultProps).propTypes
);

const defaultProps = Object.assign(
  {},
  parsePropTypes(Layer.defaultProps).defaultProps,
  parsePropTypes(ScatterplotLayer.defaultProps).defaultProps
);

// test cases
const TEST_CASES = {
  simple: {
    oldProps: {size: 0, color: '#f00', data: []},
    newProps: {size: 0, color: '#f00', data: []}
  },
  default: {
    oldProps: Object.create(defaultProps),
    newProps: Object.create(defaultProps),
    propTypes
  },
  overrideFunc: {
    oldProps: Object.assign(Object.create(defaultProps), {
      getRadius: d => d.radius
    }),
    newProps: Object.assign(Object.create(defaultProps), {
      getRadius: d => d.radius
    }),
    propTypes
  },
  overrideArray: {
    oldProps: Object.assign(Object.create(defaultProps), {
      modelMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    }),
    newProps: Object.assign(Object.create(defaultProps), {
      modelMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    }),
    propTypes
  },
  overrideLargeArray: {
    oldProps: Object.assign(Object.create(defaultProps), {
      instancePositions: new Float32Array(1e6).fill(Math.PI)
    }),
    newProps: Object.assign(Object.create(defaultProps), {
      instancePositions: new Float32Array(1e6).fill(Math.PI)
    }),
    propTypes
  },
  realWorld: {
    oldProps: Object.assign(Object.create(defaultProps), {
      getPosition: d => d.position,
      getRadius: d => d.size,
      getLineWidth: d => d.size / 10,
      getFillColor: [0, 0, 0, 255],
      getLineColor: [200, 0, 0, 255],
      stroked: true,
      filled: true,
      lineWidthMinPixels: 1
    }),
    newProps: Object.assign(Object.create(defaultProps), {
      getPosition: d => d.position,
      getRadius: d => d.size,
      getLineWidth: d => d.size / 10,
      getFillColor: [0, 0, 0, 255],
      getLineColor: [200, 0, 0, 255],
      stroked: true,
      filled: true,
      lineWidthMinPixels: 1
    }),
    propTypes
  }
};

export default function comparePropsBench(suite) {
  return suite
    .group('COMPARE PROPS')

    .add('compareProps#simple', () => {
      compareProps(TEST_CASES.simple);
    })
    .add('compareProps#empty', () => {
      compareProps(TEST_CASES.default);
    })
    .add('compareProps#override function', () => {
      compareProps(TEST_CASES.overrideFunc);
    })
    .add('compareProps#override array', () => {
      compareProps(TEST_CASES.overrideArray);
    })
    .add('compareProps#override large array', () => {
      compareProps(TEST_CASES.overrideLargeArray);
    })
    .add('compareProps#real world sample', () => {
      compareProps(TEST_CASES.realWorld);
    });
}

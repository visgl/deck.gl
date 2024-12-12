// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-console, no-invalid-this */

import {Layer, ScatterplotLayer, LineLayer} from 'deck.gl';
import {inheritsFrom} from '@deck.gl/react/utils/inherits-from';

import {fp64} from '@luma.gl/shadertools';
const {fp64ify, fp64LowPart} = fp64;

const POSITION = [-122.4, 37.8, 0];

// add tests

export default function utilsBench(suite) {
  return suite
    .group('UTILS')
    .add('direct access#Array', () => {
      return POSITION[0];
    })
    .add('fp64#fp64ify.lowPart', () => {
      return fp64ify(Math.PI)[1];
    })
    .add('fp64#fp64LowPart', () => {
      return fp64LowPart(Math.PI);
    })
    .add('inheritsFrom(true)', () => inheritsFrom(ScatterplotLayer, Layer))
    .add('inheritsFrom(false)', () => inheritsFrom(ScatterplotLayer, LineLayer));
}

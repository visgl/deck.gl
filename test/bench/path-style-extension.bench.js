// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-console, no-invalid-this */

import {PathStyleExtension} from '@deck.gl/extensions';

const SEGMENT_COUNT = 100_000;
const NESTED_PATH = createNestedPath();
const FLAT_PATH = NESTED_PATH.flat();
const PROJECTION_CONTEXT = {
  props: {positionFormat: 'XYZ'},
  projectPosition: position => position
};
const getDashOffsets = PathStyleExtension.prototype.getDashOffsets;

export default function pathStyleExtensionBench(suite) {
  suite
    .group('PATH STYLE EXTENSION CPU PHASE (100K SEGMENTS)')
    .add('highPrecisionDash#nested positions', {minIterations: 3}, () =>
      getDashOffsets.call(PROJECTION_CONTEXT, NESTED_PATH)
    )
    .add('highPrecisionDash#flat positions', {minIterations: 3}, () =>
      getDashOffsets.call(PROJECTION_CONTEXT, FLAT_PATH)
    );
}

function createNestedPath() {
  return Array.from({length: SEGMENT_COUNT + 1}, (_, pointIndex) => [
    pointIndex,
    Math.sin(pointIndex * 0.02) * 10,
    Math.cos(pointIndex * 0.01) * 5
  ]);
}

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-console, no-invalid-this */

import {PathStyleExtension} from '@deck.gl/extensions';
import PathTesselator from '@deck.gl/layers/path-layer/path-tesselator';

const SEGMENT_COUNT = 100_000;
const NESTED_PATH = createNestedPath();
const FLAT_PATH = NESTED_PATH.flat();
const PROJECTION_CONTEXT = {
  props: {positionFormat: 'XYZ'},
  projectPosition: position => position
};
const getDashOffsets = PathStyleExtension.prototype.getDashOffsets;
const calculateDashMetrics = PathStyleExtension.prototype.calculateDashMetrics;
const pathTesselator = new PathTesselator({
  data: [NESTED_PATH],
  getGeometry: path => path,
  positionFormat: 'XYZ'
});
const DASH_METRICS_CONTEXT = {
  ...PROJECTION_CONTEXT,
  props: {...PROJECTION_CONTEXT.props, data: [NESTED_PATH]},
  state: {pathTesselator}
};
const DASH_METRICS_ATTRIBUTE = {
  size: 2,
  value: new Float32Array(pathTesselator.instanceCount * 2),
  startIndices: null
};
const FULL_PATH_RANGE = {startRow: 0, endRow: 1};

export default function pathStyleExtensionBench(suite) {
  suite
    .group('PATH STYLE EXTENSION CPU PHASE (100K SEGMENTS)')
    .add("dashMode 'path'#normalized rendered geometry", {minIterations: 3}, () =>
      calculateDashMetrics.call(DASH_METRICS_CONTEXT, DASH_METRICS_ATTRIBUTE, FULL_PATH_RANGE)
    )
    .add('getDashOffsets compatibility#nested positions', {minIterations: 3}, () =>
      getDashOffsets.call(PROJECTION_CONTEXT, NESTED_PATH)
    )
    .add('getDashOffsets compatibility#flat positions', {minIterations: 3}, () =>
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

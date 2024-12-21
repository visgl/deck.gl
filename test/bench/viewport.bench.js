// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-console, no-invalid-this */
import * as data from 'deck.gl-test/data';

import {WebMercatorViewport} from 'deck.gl';

import {COORDINATE_SYSTEM} from '@deck.gl/core/lib/constants';
import {getUniformsFromViewport} from '@deck.gl/core/shaderlib/project/viewport-uniforms';

const VIEWPORT_PARAMS = {
  width: 500,
  height: 500,
  longitude: -122,
  latitude: 37,
  zoom: 12,
  pitch: 30
};

// add tests

export default function viewportBench(suite) {
  return suite
    .group('VIEWPORTS')
    .add('getUniformsFromViewport#LNGLAT', () => {
      return getUniformsFromViewport({
        viewport: data.sampleViewport,
        modelMatrix: data.sampleModelMatrix,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT
      });
    })
    .add('getUniformsFromViewport#METER_OFFSETS', () => {
      return getUniformsFromViewport({
        viewport: data.sampleViewport,
        modelMatrix: data.sampleModelMatrix,
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS
      });
    })
    .add('getUniformsFromViewport#LNGLAT - FP64', () => {
      return getUniformsFromViewport({
        viewport: data.sampleViewport,
        fp64: true,
        modelMatrix: data.sampleModelMatrix,
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT
      });
    })
    .add('getUniformsFromViewport#METER_OFFSETS - FP64', () => {
      return getUniformsFromViewport({
        viewport: data.sampleViewport,
        fp64: true,
        modelMatrix: data.sampleModelMatrix,
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS
      });
    })
    .add('WebMercatorViewport', () => {
      return new WebMercatorViewport(VIEWPORT_PARAMS);
    });
}

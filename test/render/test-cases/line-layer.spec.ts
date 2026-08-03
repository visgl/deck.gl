// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import type {TestCase, TestDeviceType} from '../deck-test-utils';

/* eslint-disable callback-return */
import {LineLayer} from '@deck.gl/layers';
import {routes} from 'deck.gl-test/data';

function getTestCases(deviceType: TestDeviceType) {
  return [
    {
      name: 'line-lnglat',
      viewState: {
        latitude: 37.751537058389985,
        longitude: -122.42694203247012,
        zoom: 11.5,
        pitch: 0,
        bearing: 0
      },
      layers: [
        new LineLayer({
          id: 'line-lnglat',
          data: routes,
          opacity: 0.8,
          getWidth: 0,
          widthMinPixels: 2,
          getSourcePosition: d => d.START,
          getTargetPosition: d => d.END,
          getColor: d => (d.SERVICE === 'WEEKDAY' ? [255, 64, 0] : [255, 200, 0]),
          // WebGPU provides no MSAA, so analytic coverage stands in for it and lets one golden
          // serve both backends. The WebGL canvas is already multisampled, so leaving the prop
          // off there keeps this case covering the default configuration.
          antialiasing: deviceType === 'webgpu',
          pickable: true
        })
      ],
      goldenImage: './test/render/golden-images/line-lnglat.png'
    }
  ];
}

// 'webgpu' is ready to enable - the case above supplies the analytic coverage that the backend's
// lack of MSAA otherwise costs it. It stays commented out because WebGPU rasterizes nothing under
// the software renderer this suite runs on: both this case and every path-layer case come back as
// a blank frame, with the device created and no validation errors. Uncomment on a machine with
// hardware WebGPU, or once CI has it.
describe.each([
  'webgl'
  // 'webgpu'
] as const)('%s', deviceType => {
  runRenderTestSuite(getTestCases(deviceType) as TestCase[], deviceType);
});

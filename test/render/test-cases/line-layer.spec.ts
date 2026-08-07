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

// 'webgpu' is expected to fail against the shared golden for now, and is enabled deliberately so
// that gap is visible and tracked rather than invisible. Last measured 83.25% against a 99%
// threshold - the two backends rasterize 2px lines differently (WebGPU is crisper: 73.8k ink pixels
// vs WebGL's 90.0k), and it is not a misalignment, since shifting the image a pixel in any direction
// only reaches 84.98%. Closing that gap is part of finishing the WebGPU port; the diff image CI
// uploads on failure is the measurement. Requires a virtual display - see the test workflow.
describe.each(['webgl', 'webgpu'] as const)('%s', deviceType => {
  runRenderTestSuite(getTestCases(deviceType) as TestCase[], deviceType);
});

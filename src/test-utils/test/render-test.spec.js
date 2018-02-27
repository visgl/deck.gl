// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {RenderTest} from 'deck.gl-test-utils';

import {ScatterplotLayer} from 'deck.gl';

const dataSamples = {
  points: [] // TBA
};

const TEST_CASES = [
  {
    name: 'scatterplot-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new ScatterplotLayer({
        id: 'scatterplot-lnglat',
        data: dataSamples.points,
        getPosition: d => d.COORDINATES,
        getColor: d => [255, 128, 0],
        getRadius: d => d.SPACES,
        opacity: 1,
        pickable: true,
        radiusScale: 30,
        radiusMinPixels: 1,
        radiusMaxPixels: 30
      })
    ],
    referenceImageUrl: './test/render/golden-images/scatterplot-lnglat.png'
  }
];

const testRendering = new RenderTest({
  testCases: TEST_CASES,
  width: 800,
  height: 450,
  // Max color delta in the YIQ difference metric for two pixels to be considered the same
  colorDeltaThreshold: 255 * 0.05,
  // Percentage of pixels that must be the same for the test to pass
  testPassThreshold: 0.99
});

testRendering.run();

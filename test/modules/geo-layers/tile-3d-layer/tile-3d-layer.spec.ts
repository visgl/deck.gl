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
import test from 'tape-promise/tape';

import {testLayerAsync} from '@deck.gl/test-utils';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {WebMercatorViewport} from '@deck.gl/core';

test.skip('Tile3DLayer', async t => {
  debugger
  const testCases = [
    {
      props: {
        data: './test/data/3d-tiles/tileset.json',
        getPointColor: [0, 0, 0]
      },
      onBeforeUpdate: () => t.comment('inital load'),
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          t.ok(subLayers[0], 'Renders sub layers');
        }
      }
    },
    {
      updateProps: {
        opacity: 0.5
      },
      onBeforeUpdate: () => t.comment('update opacity'),
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          t.is(subLayers[0].props.opacity, 0.5, 'Updated sub layer props');
        }
      }
    }
  ];

  await testLayerAsync({
    Layer: Tile3DLayer,
    viewport: new WebMercatorViewport({
      width: 400,
      height: 300,
      longitude: -75.61209423,
      latitude: 40.042530625,
      zoom: 12
    }),
    testCases,
    onError: t.notOk
  });

  t.end();
});

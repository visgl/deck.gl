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
import test from 'tape-catch';

import {testLayerAsync} from '@deck.gl/test-utils';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {WebMercatorViewport} from '@deck.gl/core';

const fetchFile = url => {
  url = url
    .replace(/\?.+$/, '') // strip query parameters
    .replace(/^\//, './test/data/3d-tiles/');
  return require('fs').readFileSync(url);
};

test('Tile3DLayer', async t => {
  let oldFetch;
  /* global global, Response */
  const needsFetchPolyfill = typeof Response === 'undefined';
  if (needsFetchPolyfill) {
    oldFetch = global.fetch;
    global.fetch = fetchFile;
  }

  const testCases = [
    {
      props: {
        data: './test/data/3d-tiles/tileset.json',
        getPointColor: [0, 0, 0],
        loadOptions: needsFetchPolyfill ? {'3d-tiles': {isTileset: true}} : {}
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
      longitude: -1.3197,
      latitude: 0.69885,
      zoom: 12
    }),
    testCases,
    onError: t.notOk
  });

  if (oldFetch) {
    global.fetch = oldFetch;
  }
  t.end();
});

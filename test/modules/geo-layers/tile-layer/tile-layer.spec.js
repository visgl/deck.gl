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
import {WebMercatorViewport} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {generateLayerTests, testLayer} from '@deck.gl/test-utils';
import {TileLayer} from '@deck.gl/geo-layers';

test('TileLayer', t => {
  const testCases = generateLayerTests({
    Layer: TileLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });
  testLayer({Layer: TileLayer, testCases, onError: t.notOk});
  t.end();
});

test('TileLayer', t => {
  let getTileDataCalled = 0;
  const getTileData = () => {
    getTileDataCalled++;
    return [];
  };

  const renderSubLayers = props => {
    return new ScatterplotLayer(props, {id: `${props.id}-fill`});
  };
  const renderNestedSubLayers = props => {
    return [
      new ScatterplotLayer(props, {id: `${props.id}-fill`, filled: true, stroked: false}),
      new ScatterplotLayer(props, {id: `${props.id}-stroke`, filled: false, stroked: true})
    ];
  };

  const testViewport1 = new WebMercatorViewport({
    width: 100,
    height: 100,
    longitude: 0,
    latitude: 60,
    zoom: 2
  });
  const testViewport2 = new WebMercatorViewport({
    width: 100,
    height: 100,
    longitude: -90,
    latitude: -60,
    zoom: 3
  });

  const testCases = [
    {
      props: {
        data:
          'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/website/bart.geo.json'
      },
      onBeforeUpdate: () => {
        t.comment('Default getTileData');
      },
      onAfterUpdate: ({layer, subLayers}) => {
        t.is(subLayers.length, 2, 'Rendered sublayers');
        t.notOk(layer.isLoaded, 'Layer is not loaded');
      }
    },
    {
      props: {
        getTileData,
        renderSubLayers
      },
      onBeforeUpdate: () => {
        t.comment('Custom getTileData');
      },
      onAfterUpdate: ({layer, subLayers}) => {
        t.is(subLayers.length, 2, 'Rendered sublayers');
        t.is(getTileDataCalled, 2, 'Fetched tile data');
        t.notOk(layer.isLoaded, 'Layer is not loaded');
        t.ok(subLayers.every(l => l.props.visible), 'Sublayers at z=2 are visible');
      }
    },
    {
      viewport: testViewport2,
      onAfterUpdate: ({subLayers}) => {
        t.is(subLayers.length, 4, 'Rendered new sublayers');
        t.is(getTileDataCalled, 4, 'Fetched tile data');
        t.ok(
          subLayers.filter(l => l.props.tile.z === 3).every(l => l.props.visible),
          'Sublayers at z=3 are visible'
        );
      }
    },
    {
      viewport: testViewport1,
      onAfterUpdate: ({subLayers}) => {
        t.is(subLayers.length, 4, 'Rendered cached sublayers');
        t.is(getTileDataCalled, 4, 'Used cached data');
        t.ok(
          subLayers.filter(l => l.props.tile.z === 3).every(l => !l.props.visible),
          'Sublayers at z=3 are hidden'
        );
      }
    },
    {
      updateProps: {
        renderSubLayers: renderNestedSubLayers
      },
      onAfterUpdate: ({subLayers}) => {
        t.is(subLayers.length, 4, 'Should rendered cached sublayers without prop change');
      }
    },
    {
      updateProps: {
        minWidthPixels: 1
      },
      onAfterUpdate: ({subLayers}) => {
        t.is(subLayers.length, 8, 'Invalidated cached sublayers with prop change');
      }
    },
    {
      updateProps: {
        updateTriggers: {
          getTileData: 1
        }
      },
      onAfterUpdate: ({subLayers}) => {
        t.is(getTileDataCalled, 6, 'Refetched tile data');
        t.is(subLayers.length, 4, 'Invalidated cached sublayers with prop change');
      }
    }
  ];
  testLayer({Layer: TileLayer, viewport: testViewport1, testCases, onError: t.notOk});
  t.end();
});

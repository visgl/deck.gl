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
import {WebMercatorViewport} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {generateLayerTests, testLayerAsync, testLayer} from '@deck.gl/test-utils';
import {TileLayer} from '@deck.gl/geo-layers';

const DUMMY_DATA =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/test-data/geojson-point.json';

test('TileLayer', async t => {
  const testCases = generateLayerTests({
    Layer: TileLayer,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });
  await testLayerAsync({Layer: TileLayer, testCases, onError: t.notOk});
  t.end();
});

test('TileLayer', async t => {
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
      title: 'default',
      props: {
        data: DUMMY_DATA
      },
      onBeforeUpdate: () => {
        t.comment('Default getTileData');
      },
      onAfterUpdate: ({layer, subLayers}) => {
        if (!layer.isLoaded) {
          t.ok(subLayers.length < 2);
        } else {
          t.is(subLayers.length, 2, 'Rendered sublayers');
          t.ok(layer.isLoaded, 'Layer is loaded');
        }
      }
    },
    {
      title: 'show z=2',
      props: {
        getTileData,
        renderSubLayers
      },
      onBeforeUpdate: () => {
        t.comment('Custom getTileData');
      },
      onAfterUpdate: ({layer, subLayers}) => {
        if (!layer.isLoaded) {
          t.is(subLayers.length, 2, 'Cached layers are used while loading');
        } else {
          t.is(subLayers.length, 2, 'Rendered sublayers');
          t.is(getTileDataCalled, 2, 'Fetched tile data');
          t.ok(layer.isLoaded, 'Layer is loaded');
          t.ok(
            subLayers.every(l => layer.filterSubLayer({layer: l})),
            'Sublayers at z=2 are visible'
          );
        }
      }
    },
    {
      title: 'show z=3',
      viewport: testViewport2,
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          t.is(subLayers.length, 4, 'Rendered new sublayers');
          t.is(getTileDataCalled, 4, 'Fetched tile data');
          t.ok(
            subLayers
              .filter(l => l.props.tile.z === 3)
              .every(l => layer.filterSubLayer({layer: l})),
            'Sublayers at z=3 are visible'
          );
        }
      }
    },
    {
      title: 'hide z=3',
      viewport: testViewport1,
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          t.is(subLayers.length, 4, 'Rendered cached sublayers');
          t.is(getTileDataCalled, 4, 'Used cached data');
          t.ok(
            subLayers
              .filter(l => l.props.tile.z === 3)
              .every(l => !layer.filterSubLayer({layer: l})),
            'Sublayers at z=3 are hidden'
          );
        }
      }
    },
    {
      title: 'cached sublayers',
      updateProps: {
        renderSubLayers: renderNestedSubLayers
      },
      onAfterUpdate: ({subLayers}) => {
        t.is(subLayers.length, 4, 'Should rendered cached sublayers without prop change');
      }
    },
    {
      title: 'cached sublayers (invalidate)',
      updateProps: {
        minWidthPixels: 1
      },
      onAfterUpdate: ({subLayers}) => {
        t.is(subLayers.length, 8, 'Invalidated cached sublayers with prop change');
      }
    },
    {
      title: 'cached sublayers (refetch)',
      updateProps: {
        updateTriggers: {
          getTileData: 1
        }
      },
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          t.is(getTileDataCalled, 6, 'Refetched tile data');
          t.is(subLayers.length, 8, 'Cached content is used to render sub layers');
        }
      }
    }
  ];
  await testLayerAsync({Layer: TileLayer, viewport: testViewport1, testCases, onError: t.notOk});
  t.end();
});

test('TileLayer#MapView:repeat', async t => {
  const renderSubLayers = props => {
    return new ScatterplotLayer(props);
  };

  const testViewport = new WebMercatorViewport({
    width: 1200,
    height: 400,
    longitude: 0,
    latitude: 0,
    zoom: 1,
    repeat: true
  });

  t.is(testViewport.subViewports!.length, 3, 'Viewport has more than one sub viewports');

  const testCases = [
    {
      title: 'repeat',
      props: {
        data: DUMMY_DATA,
        renderSubLayers
      },
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          t.is(
            subLayers.filter(l => layer.filterSubLayer({layer: l})).length,
            4,
            'Should contain 4 visible tiles'
          );
        }
      }
    }
  ];

  await testLayerAsync({Layer: TileLayer, viewport: testViewport, testCases, onError: t.notOk});

  t.end();
});

test('TileLayer#AbortRequestsOnUpdateTrigger', async t => {
  const testViewport = new WebMercatorViewport({
    width: 1200,
    height: 400,
    longitude: 0,
    latitude: 0,
    zoom: 1,
    repeat: true
  });
  let tileset;

  const testCases = [
    {
      title: 'case-1',
      props: {
        getTileData: () => sleep(10)
      },
      onAfterUpdate: ({layer}) => {
        tileset = layer.state.tileset;
      }
    },
    {
      title: 'case-2',
      updateProps: {
        updateTriggers: {
          getTileData: 1
        }
      },
      onAfterUpdate: () => {
        t.is(
          tileset._tiles.map(tile => tile._isCancelled).length,
          4,
          'all tiles from discarded tileset should be cancelled'
        );
      }
    }
  ];

  testLayer({Layer: TileLayer, viewport: testViewport, testCases, onError: t.notOk});

  t.end();
});

test('TileLayer#AbortRequestsOnNewLayer', async t => {
  const testViewport = new WebMercatorViewport({
    width: 1200,
    height: 400,
    longitude: 0,
    latitude: 0,
    zoom: 1,
    repeat: true
  });
  let tiles;

  const testCases = [
    {
      title: 'case-1',
      props: {
        getTileData: () => sleep(10)
      },
      onAfterUpdate: ({layer}) => {
        tiles = layer.state.tileset._tiles;
      }
    },
    {
      title: 'case-2',
      props: {
        id: 'new-layer'
      },
      onAfterUpdate: () => {
        t.is(
          tiles.filter(tile => tile._isCancelled).length,
          4,
          'all tiles from discarded layer should be cancelled'
        );
      }
    }
  ];

  testLayer({Layer: TileLayer, viewport: testViewport, testCases, onError: t.notOk});

  t.end();
});

test('TileLayer#debounceTime', async t => {
  const testViewport = new WebMercatorViewport({width: 1200, height: 400, zoom: 8});
  const testCases = [
    {
      title: 'debounceTime = 0',
      props: {debounceTime: 0, getTileData: () => sleep(10)},
      onAfterUpdate: ({layer}) => {
        t.is(layer.state.tileset.opts.debounceTime, 0, 'assigns tileset#debounceTime = 0');
      }
    },
    {
      title: 'debounceTime = 25',
      props: {debounceTime: 25, getTileData: () => sleep(10)},
      onAfterUpdate: ({layer}) => {
        t.is(layer.state.tileset.opts.debounceTime, 25, 'assigns tileset#debounceTime = 25');
      }
    }
  ];

  testLayer({Layer: TileLayer, viewport: testViewport, testCases, onError: t.fail});

  t.end();
});

function sleep(ms) {
  return new Promise(resolve => {
    /* global setTimeout */
    setTimeout(resolve, ms);
  });
}

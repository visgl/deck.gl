// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {WebMercatorViewport} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {generateLayerTests, testLayerAsync, testLayer} from '@deck.gl/test-utils';
import {TileLayer} from '@deck.gl/geo-layers';

const DUMMY_DATA =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/test-data/geojson-point.json';

test('TileLayer', async () => {
  const testCases = generateLayerTests({
    Layer: TileLayer,
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title)
  });
  await testLayerAsync({Layer: TileLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('TileLayer', async () => {
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
        console.log('Default getTileData');
      },
      onAfterUpdate: ({layer, subLayers}) => {
        if (!layer.isLoaded) {
          expect(subLayers.length < 2).toBeTruthy();
        } else {
          expect(subLayers.length, 'Rendered sublayers').toBe(2);
          expect(layer.isLoaded, 'Layer is loaded').toBeTruthy();
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
        console.log('Custom getTileData');
      },
      onAfterUpdate: ({layer, subLayers}) => {
        if (!layer.isLoaded) {
          expect(subLayers.length, 'Cached layers are used while loading').toBe(2);
        } else {
          expect(subLayers.length, 'Rendered sublayers').toBe(2);
          expect(getTileDataCalled, 'Fetched tile data').toBe(2);
          expect(layer.isLoaded, 'Layer is loaded').toBeTruthy();
          expect(
            subLayers.every(l => layer.filterSubLayer({layer: l})),
            'Sublayers at z=2 are visible'
          ).toBeTruthy();
        }
      }
    },
    {
      title: 'show z=3',
      viewport: testViewport2,
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          expect(subLayers.length, 'Rendered new sublayers').toBe(4);
          expect(getTileDataCalled, 'Fetched tile data').toBe(4);
          expect(
            subLayers
              .filter(l => l.props.tile.z === 3)
              .every(l => layer.filterSubLayer({layer: l})),
            'Sublayers at z=3 are visible'
          ).toBeTruthy();
        }
      }
    },
    {
      title: 'hide z=3',
      viewport: testViewport1,
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          expect(subLayers.length, 'Rendered cached sublayers').toBe(4);
          expect(getTileDataCalled, 'Used cached data').toBe(4);
          expect(
            subLayers
              .filter(l => l.props.tile.z === 3)
              .every(l => !layer.filterSubLayer({layer: l})),
            'Sublayers at z=3 are hidden'
          ).toBeTruthy();
        }
      }
    },
    {
      title: 'cached sublayers',
      updateProps: {
        renderSubLayers: renderNestedSubLayers
      },
      onAfterUpdate: ({subLayers}) => {
        expect(subLayers.length, 'Should rendered cached sublayers without prop change').toBe(4);
      }
    },
    {
      title: 'cached sublayers (invalidate)',
      updateProps: {
        minWidthPixels: 1
      },
      onAfterUpdate: ({subLayers}) => {
        expect(subLayers.length, 'Invalidated cached sublayers with prop change').toBe(8);
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
          expect(getTileDataCalled, 'Refetched tile data').toBe(6);
          expect(subLayers.length, 'Cached content is used to render sub layers').toBe(8);
        }
      }
    }
  ];
  await testLayerAsync({
    Layer: TileLayer,
    viewport: testViewport1,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});

test('TileLayer#MapView:repeat', async () => {
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

  expect(testViewport.subViewports!.length, 'Viewport has more than one sub viewports').toBe(3);

  const testCases = [
    {
      title: 'repeat',
      props: {
        data: DUMMY_DATA,
        renderSubLayers
      },
      onAfterUpdate: ({layer, subLayers}) => {
        if (layer.isLoaded) {
          expect(
            subLayers.filter(l => layer.filterSubLayer({layer: l})).length,
            'Should contain 4 visible tiles'
          ).toBe(4);
        }
      }
    }
  ];

  await testLayerAsync({
    Layer: TileLayer,
    viewport: testViewport,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});

test('TileLayer#AbortRequestsOnUpdateTrigger', async () => {
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
        expect(
          tileset._tiles.map(tile => tile._isCancelled).length,
          'all tiles from discarded tileset should be cancelled'
        ).toBe(4);
      }
    }
  ];

  testLayer({
    Layer: TileLayer,
    viewport: testViewport,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});

test('TileLayer#AbortRequestsOnNewLayer', async () => {
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
        expect(
          tiles.filter(tile => tile._isCancelled).length,
          'all tiles from discarded layer should be cancelled'
        ).toBe(4);
      }
    }
  ];

  testLayer({
    Layer: TileLayer,
    viewport: testViewport,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});

test('TileLayer#debounceTime', async () => {
  const testViewport = new WebMercatorViewport({width: 1200, height: 400, zoom: 8});
  const testCases = [
    {
      title: 'debounceTime = 0',
      props: {debounceTime: 0, getTileData: () => sleep(10)},
      onAfterUpdate: ({layer}) => {
        expect(layer.state.tileset.opts.debounceTime, 'assigns tileset#debounceTime = 0').toBe(0);
      }
    },
    {
      title: 'debounceTime = 25',
      props: {debounceTime: 25, getTileData: () => sleep(10)},
      onAfterUpdate: ({layer}) => {
        expect(layer.state.tileset.opts.debounceTime, 'assigns tileset#debounceTime = 25').toBe(25);
      }
    }
  ];

  testLayer({
    Layer: TileLayer,
    viewport: testViewport,
    testCases,
    onError: err => {
      throw err;
    }
  });
});

function sleep(ms) {
  return new Promise(resolve => {
    /* global setTimeout */
    setTimeout(resolve, ms);
  });
}

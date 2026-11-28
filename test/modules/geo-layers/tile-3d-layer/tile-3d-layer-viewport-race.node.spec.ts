// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Real-execution verification for the Tile3DLayer viewport race (#11365).
// No mocks: the real Tileset3D loads a real tileset.json over a local HTTP server.
// The server delays tileset.json so the test can run the layer's real
// activateViewport/updateState consumption while the load is in flight,
// reproducing the interleaved-overlay window from the issue.
// Tileset3D.prototype.selectTiles is only observed (vi.spyOn), never replaced.

import {test, expect, vi, beforeAll, afterAll} from 'vitest';
import {createServer, Server} from 'http';
import {readFile} from 'fs/promises';
import {join, extname} from 'path';

import {Tile3DLayer} from '@deck.gl/geo-layers';
import {WebMercatorViewport} from '@deck.gl/core';
import {Tileset3D} from '@loaders.gl/tiles-3d/tileset';

const DATA_ROOT = join(__dirname, '../../../data');
const TILESET_DELAY_MS = 200;

const MIME: Record<string, string> = {
  '.json': 'application/json',
  '.b3dm': 'application/octet-stream',
  '.glb': 'model/gltf-binary',
  '.bin': 'application/octet-stream'
};

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = createServer((req, res) => {
    const path = (req.url || '/').split('?')[0];
    const serve = async () => {
      try {
        const body = await readFile(join(DATA_ROOT, path));
        res.writeHead(200, {'content-type': MIME[extname(path)] || 'application/octet-stream'});
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end('not found');
      }
    };
    if (path.endsWith('tileset.json')) {
      const query = (req.url || '').split('?')[1] || '';
      const delay = query.includes('slow') ? 400 : query.includes('fast') ? 50 : TILESET_DELAY_MS;
      setTimeout(serve, delay);
    } else {
      serve();
    }
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
});

afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
});

const VIEWPORT = new WebMercatorViewport({
  width: 400,
  height: 300,
  longitude: -75.61209423,
  latitude: 40.042530625,
  zoom: 12
});

const MOVED_VIEWPORT = new WebMercatorViewport({
  width: 400,
  height: 300,
  longitude: -75.0,
  latitude: 40.5,
  zoom: 13
});

function makeLayer(data: string, extraProps: object = {}): Tile3DLayer {
  const layer = new Tile3DLayer({id: 'tile-3d-viewport-race-real', data, ...extraProps});
  layer.context = {
    timeline: {},
    layerManager: {setNeedsUpdate: () => {}},
    resourceManager: {unsubscribe: () => {}}
  } as unknown as typeof layer.context;
  layer.internalState = {
    changeFlags: {},
    setAsyncProps: () => {},
    getOldProps: () => ({}),
    refreshQueryParser: () => {},
    uniformTransitions: {clear: () => {}},
    finalize: () => {}
  } as unknown as typeof layer.internalState;
  layer.initializeState();
  return layer;
}

function spyOnSelectTiles() {
  const spy = vi.spyOn(Tileset3D.prototype, 'selectTiles');
  spy.mockClear();
  return spy;
}

// Calls from other tests' tilesets (deferred traversals fire on timers) are excluded by context
function selectTilesCallsFor(spy: ReturnType<typeof spyOnSelectTiles>, tileset3d: unknown) {
  return spy.mock.calls.filter((_, i) => spy.mock.contexts[i] === tileset3d);
}

function selectTilesCalledWith(
  spy: ReturnType<typeof spyOnSelectTiles>,
  tileset3d: unknown,
  viewport: unknown
) {
  return selectTilesCallsFor(spy, tileset3d).some(
    call => Array.isArray(call[0]) && call[0].includes(viewport)
  );
}

test('selects tiles when tileset.json resolves between the consuming update and the next draw', async () => {
  const selectSpy = spyOnSelectTiles();
  const layer = makeLayer(`${baseUrl}/3d-tiles/tileset.json`);

  // Real load starts (tileset.json held back by the server)
  // @ts-expect-error Calling the private loader for test-only validation.
  const loadPromise = layer._loadTileset(layer.props.data);

  // The real consumption path: first draw activates, next update consumes
  layer.activateViewport(VIEWPORT);
  layer.updateState({
    props: layer.props,
    oldProps: layer.props,
    changeFlags: {viewportChanged: true}
  } as never);

  expect(Object.keys(layer.state.activeViewports)).toHaveLength(0);
  expect(layer.state.lastUpdatedViewports?.[VIEWPORT.id]).toBe(VIEWPORT);

  // The real tileset.json finishes loading in the window before the next draw
  await loadPromise;

  const tileset3d = layer.state.tileset3d;
  expect(tileset3d instanceof Tileset3D, 'real Tileset3D stored in state').toBe(true);
  // Note: Tileset3D.isLoaded() additionally requires a completed traversal,
  // so it is false exactly while the bug blocks the first selection.

  expect(
    selectTilesCalledWith(selectSpy, tileset3d, VIEWPORT),
    'real Tileset3D.selectTiles received the consumed viewport'
  ).toBe(true);

  await vi.waitFor(() => expect(layer.state.frameNumber).toBeDefined(), {timeout: 10000});
  selectSpy.mockRestore();
}, 30000);

test('reloads with a static camera still select tiles', async () => {
  const selectSpy = spyOnSelectTiles();
  const layer = makeLayer(`${baseUrl}/3d-tiles/tileset.json`);

  // First load completes BEFORE any draw: the first selection takes the normal
  // updateState path, which succeeds with and without the fix. This makes the
  // reload assertion below the first point where the base code fails.
  // @ts-expect-error Calling the private loader for test-only validation.
  const firstLoad = layer._loadTileset(layer.props.data);
  await firstLoad;
  const firstTileset = layer.state.tileset3d;
  layer.activateViewport(VIEWPORT);
  layer.updateState({
    props: layer.props,
    oldProps: layer.props,
    changeFlags: {viewportChanged: true}
  } as never);
  expect(selectTilesCalledWith(selectSpy, firstTileset, VIEWPORT), 'first tileset selected').toBe(
    true
  );

  // `data` changes while the camera does not move: no new activateViewport calls.
  // The real updateState path starts the reload; the spy only captures the promise.
  // @ts-expect-error Observing the private loader for test-only validation.
  const loadSpy = vi.spyOn(layer, '_loadTileset');
  const newProps = {...layer.props, data: `${baseUrl}/3d-tiles/tileset.json?reload=1`};
  layer.updateState({props: newProps, oldProps: layer.props, changeFlags: {}} as never);
  expect(loadSpy, 'updateState started the reload').toHaveBeenCalledTimes(1);
  await loadSpy.mock.results[0].value;

  const secondTileset = layer.state.tileset3d;
  expect(secondTileset, 'a new real tileset was created').not.toBe(firstTileset);
  expect(
    selectTilesCalledWith(selectSpy, secondTileset, VIEWPORT),
    'reloaded tileset selects tiles for the unchanged viewport'
  ).toBe(true);
  selectSpy.mockRestore();
}, 30000);

test('a stale overlapping load does not select or replace the current tileset', async () => {
  const selectSpy = spyOnSelectTiles();
  const layer = makeLayer(`${baseUrl}/3d-tiles/tileset.json?slow=1`);

  // Load A starts (server holds it back for 400ms)
  // @ts-expect-error Calling the private loader for test-only validation.
  const loadA = layer._loadTileset(layer.props.data);

  // The viewports are consumed while A is in flight
  layer.activateViewport(VIEWPORT);
  layer.updateState({
    props: layer.props,
    oldProps: layer.props,
    changeFlags: {viewportChanged: true}
  } as never);

  // `data` changes: load B starts (50ms) and finishes before A (400ms)
  const newProps = {...layer.props, data: `${baseUrl}/3d-tiles/tileset.json?fast=1`};
  // @ts-expect-error Observing the private loader for test-only validation.
  const loadSpy = vi.spyOn(layer, '_loadTileset');
  layer.updateState({props: newProps, oldProps: layer.props, changeFlags: {}} as never);
  expect(loadSpy, 'updateState started load B').toHaveBeenCalledTimes(1);
  await loadSpy.mock.results[0].value;

  const tilesetB = layer.state.tileset3d;
  expect(tilesetB instanceof Tileset3D, 'load B stored its tileset').toBe(true);

  // Load A finishes last. It must not select tiles for the consumed viewport,
  // and it must not replace B. (State replacement by a stale load is the pre-existing
  // overlap race; the stale selection is what the fallback alone would newly cause.)
  const viewportSelectsBeforeA = selectSpy.mock.calls.length;
  await loadA;

  const staleViewportSelects = selectSpy.mock.calls.filter(
    (call, i) =>
      i >= viewportSelectsBeforeA &&
      selectSpy.mock.contexts[i] !== tilesetB &&
      Array.isArray(call[0]) &&
      call[0].includes(VIEWPORT)
  );
  expect(staleViewportSelects, 'stale load A did not select tiles').toHaveLength(0);
  expect(layer.state.tileset3d, 'stale load A did not replace the current tileset').toBe(tilesetB);
  selectSpy.mockRestore();
}, 30000);

test('stale detection survives layer re-creation via _transferState', async () => {
  const selectSpy = spyOnSelectTiles();
  const layer1 = makeLayer(`${baseUrl}/3d-tiles/tileset.json?slow=1`);

  // Load A starts on layer1 (server holds it back for 400ms)
  // @ts-expect-error Calling the private loader for test-only validation.
  const loadA = layer1._loadTileset(layer1.props.data);

  layer1.activateViewport(VIEWPORT);
  layer1.updateState({
    props: layer1.props,
    oldProps: layer1.props,
    changeFlags: {viewportChanged: true}
  } as never);

  // Re-render recreates the layer: layer2 receives layer1's state via _transferState
  const layer2 = new Tile3DLayer({
    id: 'tile-3d-viewport-race-real',
    data: `${baseUrl}/3d-tiles/tileset.json?fast=1`
  });
  layer2.context = layer1.context;
  layer2.internalState = layer1.internalState;
  // @ts-expect-error Driving the real lifecycle method for test-only validation.
  layer2._transferState(layer1);

  // layer2's first update starts load B on the shared state
  layer2.updateState({
    props: layer2.props,
    oldProps: {},
    changeFlags: {viewportChanged: true}
  } as never);

  // Wait until B (50ms) has stored its tileset on the shared state
  await vi.waitFor(() => expect(layer2.state.tileset3d).toBeTruthy(), {timeout: 10000});
  const tilesetB = layer2.state.tileset3d;

  // Load A (400ms) finishes last on the OLD instance; the shared counter must reject it
  const viewportSelectsBeforeA = selectSpy.mock.calls.length;
  await loadA;

  expect(layer1.state.tileset3d, 'shared state still holds load B tileset').toBe(tilesetB);
  const staleViewportSelects = selectSpy.mock.calls.filter(
    (call, i) =>
      i >= viewportSelectsBeforeA &&
      selectSpy.mock.contexts[i] !== tilesetB &&
      Array.isArray(call[0]) &&
      call[0].includes(VIEWPORT)
  );
  expect(staleViewportSelects, 'stale load A did not select tiles').toHaveLength(0);
  selectSpy.mockRestore();
}, 30000);

test('a load that resolves after finalizeState is destroyed without storing', async () => {
  const onTilesetLoad = vi.fn();
  const layer = makeLayer(`${baseUrl}/3d-tiles/tileset.json`, {onTilesetLoad});

  // @ts-expect-error Calling the private loader for test-only validation.
  const loadPromise = layer._loadTileset(layer.props.data);

  // The layer is finalized while the load is in flight
  layer.finalizeState(layer.context);

  await loadPromise;

  expect(layer.state.tileset3d, 'finalized layer did not store a tileset').toBe(null);
  expect(onTilesetLoad, 'no onTilesetLoad after finalize').not.toHaveBeenCalled();
}, 30000);

test('initial load before any draw does not select and does not crash', async () => {
  const selectSpy = spyOnSelectTiles();
  const layer = makeLayer(`${baseUrl}/3d-tiles/tileset.json`);

  // Tileset resolves before any viewport was ever activated (initial null case)
  // @ts-expect-error Calling the private loader for test-only validation.
  const loadPromise = layer._loadTileset(layer.props.data);
  expect(layer.state.lastUpdatedViewports).toBe(null);
  await loadPromise;

  expect(layer.state.tileset3d instanceof Tileset3D, 'real tileset stored in state').toBe(true);
  expect(
    selectTilesCallsFor(selectSpy, layer.state.tileset3d).length,
    'no viewports yet, nothing selected'
  ).toBe(0);

  // The first draw then selects tiles through the normal viewportChanged path
  layer.activateViewport(VIEWPORT);
  layer.updateState({
    props: layer.props,
    oldProps: layer.props,
    changeFlags: {viewportChanged: true}
  } as never);
  expect(
    selectTilesCalledWith(selectSpy, layer.state.tileset3d, VIEWPORT),
    'first draw selects tiles'
  ).toBe(true);
  selectSpy.mockRestore();
}, 30000);

test('selects again when the viewport changes after a successful selection', async () => {
  const selectSpy = spyOnSelectTiles();
  const layer = makeLayer(`${baseUrl}/3d-tiles/tileset.json`);

  // Tileset loads before any draw, so the first selection takes the normal updateState path
  // @ts-expect-error Calling the private loader for test-only validation.
  const loadPromise = layer._loadTileset(layer.props.data);
  await loadPromise;
  const tileset3d = layer.state.tileset3d;

  layer.activateViewport(VIEWPORT);
  layer.updateState({
    props: layer.props,
    oldProps: layer.props,
    changeFlags: {viewportChanged: true}
  } as never);
  expect(selectTilesCalledWith(selectSpy, tileset3d, VIEWPORT), 'initial selection happened').toBe(
    true
  );

  // Camera moves after the initial selection
  layer.activateViewport(MOVED_VIEWPORT);
  layer.updateState({
    props: layer.props,
    oldProps: layer.props,
    changeFlags: {viewportChanged: true}
  } as never);

  expect(
    selectTilesCalledWith(selectSpy, tileset3d, MOVED_VIEWPORT),
    'a viewport change triggers a new selection'
  ).toBe(true);
  selectSpy.mockRestore();
}, 30000);

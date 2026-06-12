// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Deck, log, MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {FullscreenWidget} from '@deck.gl/widgets';
import {device} from '@deck.gl/test-utils/vitest';
import type {CanvasContext, CanvasContextProps} from '@luma.gl/core';
import {sleep} from './async-iterator-test-utils';

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {promise, resolve, reject};
}

function createPickingInfo(props = {}) {
  return {
    x: 0,
    y: 0,
    coordinate: [0, 0],
    layer: null,
    viewport: null,
    ...props
  };
}

function createPointPickResult(props = {}) {
  return {
    result: [createPickingInfo(props)],
    emptyInfo: createPickingInfo()
  };
}

function createMockCanvasContext(props: Partial<CanvasContext> = {}): CanvasContext {
  const canvasContext = device.getDefaultCanvasContext();
  return {
    canvas: canvasContext.canvas,
    getCSSSize: canvasContext.getCSSSize.bind(canvasContext),
    getDrawingBufferSize: canvasContext.getDrawingBufferSize.bind(canvasContext),
    cssToDeviceRatio: canvasContext.cssToDeviceRatio.bind(canvasContext),
    cssToDevicePixels: canvasContext.cssToDevicePixels.bind(canvasContext),
    setProps: () => {},
    props: canvasContext.props as CanvasContextProps,
    ...props
  } as CanvasContext;
}

async function waitForRender(deck: Deck): Promise<void> {
  await new Promise<void>(resolve => {
    const onAfterRender = deck.props.onAfterRender;
    deck.setProps({
      onAfterRender: (...args) => {
        onAfterRender?.(...args);
        resolve();
      }
    });
  });
}

const webglTest = device.type === 'webgl' ? test : test.skip;

test('Deck#constructor', async () => {
  const callbacks = {
    onDeviceInitialized: 0,
    onWebGLInitialized: 0,
    onBeforeRender: 0,
    onResize: 0,
    onLoad: 0
  };

  await new Promise<void>((resolve, reject) => {
    const deck = new Deck({
      device,
      width: 1,
      height: 1,

      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 0
      },

      layers: [],

      onDeviceInitialized: () => callbacks.onDeviceInitialized++,
      onWebGLInitialized: () => callbacks.onWebGLInitialized++,
      onBeforeRender: () => callbacks.onBeforeRender++,
      onResize: () => callbacks.onResize++,

      onAfterRender: () => {
        try {
          expect(callbacks.onDeviceInitialized, 'onDeviceInitialized called').toBe(1);
          expect(callbacks.onWebGLInitialized, 'onWebGLInitialized called').toBe(
            device.type === 'webgl' ? 1 : 0
          );
          expect(callbacks.onLoad, 'onLoad called').toBe(1);
          expect(callbacks.onResize, 'onResize called').toBe(1);
          expect(callbacks.onBeforeRender, 'first draw').toBe(1);

          deck.finalize();
          expect(deck.layerManager, 'layerManager is finalized').toBeFalsy();
          expect(deck.viewManager, 'viewManager is finalized').toBeFalsy();
          expect(deck.deckRenderer, 'deckRenderer is finalized').toBeFalsy();
          resolve();
        } catch (error) {
          reject(error);
        }
      },

      onLoad: () => {
        try {
          callbacks.onLoad++;

          expect(deck.layerManager, 'layerManager initialized').toBeTruthy();
          expect(deck.viewManager, 'viewManager initialized').toBeTruthy();
          expect(deck.deckRenderer, 'deckRenderer initialized').toBeTruthy();
        } catch (error) {
          reject(error);
        }
      }
    });
  });

  console.log('Deck constructor did not throw');
});

test('Deck wires mjolnir requireFailure between recognizers', async () => {
  // Regression guard: deck.gl previously emitted `requestFailure` instead of
  // `requireFailure`, which mjolnir silently dropped — so pinch/pan/click no
  // longer waited for their blocking recognizer to fail.
  await new Promise<void>((resolve, reject) => {
    const deck = new Deck({
      device,
      width: 1,
      height: 1,
      viewState: {longitude: 0, latitude: 0, zoom: 0},
      layers: [],
      controller: true,
      onLoad: () => {
        try {
          const recognizers = (deck as any).eventManager?.manager?.recognizers ?? [];
          const requiredFailures = (event: string): string[] =>
            (recognizers.find(r => r.options.event === event)?.requireFail ?? []).map(
              (r: any) => r.options.event
            );

          expect(requiredFailures('pinch'), 'pinch waits for multipan').toContain('multipan');
          expect(requiredFailures('pan'), 'pan waits for multipan').toContain('multipan');
          expect(requiredFailures('click'), 'click waits for dblclick').toContain('dblclick');

          deck.finalize();
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  });
});

test('Deck#getEventManager resolves the default manager for views', async () => {
  await new Promise<void>((resolve, reject) => {
    const deck = new Deck({
      device,
      width: 1,
      height: 1,
      views: [new MapView({id: 'main'}), new MapView({id: 'overlay', canvasId: 'overlay'})],
      viewState: {
        main: {longitude: 0, latitude: 0, zoom: 0},
        overlay: {longitude: 0, latitude: 0, zoom: 0}
      },
      layers: [],
      onLoad: () => {
        try {
          const eventManager = (deck as any).eventManager;
          expect(deck.getEventManager()).toBe(eventManager);
          expect(deck.getEventManager('main')).toBe(eventManager);
          expect(deck.getEventManager('overlay')).toBe(eventManager);
          expect(Object.keys((deck as any).eventManagers)).toEqual(['default-canvas']);

          deck.finalize();
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  });
});

test('Deck#abort', async () => {
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    viewState: {longitude: 0, latitude: 0, zoom: 0},
    onError: err => {
      expect(err, 'Deck encounters error').toBeFalsy();
    }
  });

  deck.finalize();

  await sleep(50);

  console.log('Deck initialization aborted');
});

test('Deck#canvas context resize drives Deck dimensions', async () => {
  const resizeEvents: Array<{
    dimensions: {width: number; height: number};
    canvasContext?: CanvasContext;
  }> = [];
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    viewState: {longitude: 0, latitude: 0, zoom: 0},
    layers: [],
    onResize: (dimensions, canvasContext) => resizeEvents.push({dimensions, canvasContext})
  });

  await waitForRender(deck);

  const nextSize: [number, number] = [17, 19];
  const canvasContext = createMockCanvasContext({getCSSSize: () => nextSize});

  try {
    resizeEvents.length = 0;

    // Call the internal resize hook directly so the test verifies Deck's reaction to luma state.
    // @ts-expect-error testing private resize hook
    deck._onCanvasContextResize(canvasContext);

    expect(deck.width, 'Deck width comes from canvas context CSS size').toBe(nextSize[0]);
    expect(deck.height, 'Deck height comes from canvas context CSS size').toBe(nextSize[1]);
    expect(resizeEvents[0]?.dimensions, 'Deck onResize fires from canvas context resize').toEqual({
      width: nextSize[0],
      height: nextSize[1]
    });
    expect(resizeEvents[0]?.canvasContext, 'Deck onResize receives canvas context').toBe(
      canvasContext
    );
    expect(deck.needsRedraw(), 'resize invalidates redraw').toBeTruthy();
  } finally {
    deck.finalize();
  }
});

webglTest('Deck#attached gl resize syncs canvas context drawing buffer', async () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const gl = canvas.getContext('webgl2');
  expect(gl, 'WebGL2 context is created').toBeTruthy();

  const resizeEvents: Array<{
    dimensions: {width: number; height: number};
    canvasContext?: CanvasContext;
  }> = [];
  const deck = new Deck({
    gl,
    width: 1,
    height: 1,
    viewState: {longitude: 0, latitude: 0, zoom: 0},
    layers: [],
    onResize: (dimensions, canvasContext) => resizeEvents.push({dimensions, canvasContext})
  });

  await waitForRender(deck);

  const canvasContext = deck.device!.getDefaultCanvasContext();
  const originalSetDrawingBufferSize = canvasContext.setDrawingBufferSize.bind(canvasContext);
  const calls: Array<[number, number]> = [];

  try {
    canvasContext.setDrawingBufferSize = (width: number, height: number) => {
      calls.push([width, height]);
      originalSetDrawingBufferSize(width, height);
    };
    canvas.width = 37;
    canvas.height = 41;
    resizeEvents.length = 0;

    deck.device!.props.onResize?.(canvasContext, {oldPixelSize: [1, 1]});

    expect(calls, 'attached gl resize updates drawing buffer').toEqual([[37, 41]]);
    expect(canvasContext.getDrawingBufferSize(), 'drawing buffer tracks external canvas').toEqual([
      37, 41
    ]);
    expect(resizeEvents, 'Deck onResize only fires when CSS size changes').toEqual([]);
    expect(deck.needsRedraw(), 'drawing buffer resize invalidates redraw').toBeTruthy();
  } finally {
    canvasContext.setDrawingBufferSize = originalSetDrawingBufferSize;
    deck.finalize();
  }
});

test('Deck#useDevicePixels forwards to canvas context', async () => {
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    viewState: {longitude: 0, latitude: 0, zoom: 0},
    layers: []
  });

  await waitForRender(deck);

  let useDevicePixels: boolean | number | undefined;
  const canvasContext = createMockCanvasContext({
    setProps: (props: CanvasContextProps) => {
      useDevicePixels = props.useDevicePixels;
    }
  });

  try {
    // @ts-expect-error testing private canvas context setter
    deck._setCanvasContext(canvasContext);

    // Deck.setProps should only forward the preference into luma's canvas context.
    deck.setProps({useDevicePixels: false});
    expect(useDevicePixels, 'canvas context useDevicePixels updated').toBe(false);

    // Numeric overrides should flow through unchanged so luma can size the drawing buffer.
    deck.setProps({useDevicePixels: 2});
    expect(useDevicePixels, 'numeric DPR override is forwarded').toBe(2);
  } finally {
    deck.finalize();
  }
});

test('Deck#provided device resize callback drives Deck dimensions', async () => {
  const originalOnResize = device.props.onResize;
  let lowerLevelOnResizeCalls = 0;
  device.props.onResize = () => lowerLevelOnResizeCalls++;

  const resizeEvents: Array<{
    dimensions: {width: number; height: number};
    canvasContext?: CanvasContext;
  }> = [];
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    viewState: {longitude: 0, latitude: 0, zoom: 0},
    layers: [],
    onResize: (dimensions, canvasContext) => resizeEvents.push({dimensions, canvasContext})
  });

  await waitForRender(deck);

  const nextSize: [number, number] = [23, 29];
  const canvasContext = createMockCanvasContext({getCSSSize: () => nextSize});

  try {
    // @ts-expect-error testing private canvas context setter
    deck._setCanvasContext(canvasContext);
    resizeEvents.length = 0;
    lowerLevelOnResizeCalls = 0;

    deck.device!.props.onResize?.(canvasContext, {oldPixelSize: [1, 1]});

    expect(deck.width, 'Deck width is refreshed from provided device resize').toBe(nextSize[0]);
    expect(deck.height, 'Deck height is refreshed from provided device resize').toBe(nextSize[1]);
    expect(resizeEvents[0]?.dimensions, 'Deck onResize fires from provided device resize').toEqual({
      width: nextSize[0],
      height: nextSize[1]
    });
    expect(resizeEvents[0]?.canvasContext, 'Deck onResize receives canvas context').toBe(
      canvasContext
    );
    expect(
      lowerLevelOnResizeCalls,
      'Deck owns the lower-level luma onResize callback while active'
    ).toBe(0);
  } finally {
    deck.finalize();
    device.props.onResize = originalOnResize;
  }
});

test('Deck#no views', async () => {
  await new Promise<void>((resolve, reject) => {
    const deck = new Deck({
      device,
      width: 1,
      height: 1,

      viewState: {longitude: 0, latitude: 0, zoom: 0},
      views: [],
      layers: [],

      onAfterRender: () => {
        try {
          expect(deck.deckRenderer.renderCount, 'DeckRenderer did not render').toBe(0);
          deck.finalize();
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  });

  console.log('Deck constructor did not throw');
});

webglTest('Deck#rendering, picking, logging', async () => {
  // Test logging functionalities
  log.priority = 4;

  await new Promise<void>((resolve, reject) => {
    const deck = new Deck({
      device,
      width: 1,
      height: 1,

      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 12
      },

      layers: [
        new ScatterplotLayer({
          data: [{position: [0, 0]}, {position: [0, 0]}],
          radiusMinPixels: 100,
          pickable: true
        })
      ],

      onAfterRender: () => {
        try {
          const info = deck.pickObject({x: 0, y: 0});
          expect(info && info.index, 'Picked object').toBe(1);

          let infos = deck.pickMultipleObjects({x: 0, y: 0});
          expect(infos.length, 'Picked multiple objects').toBe(2);

          infos = deck.pickObjects({x: 0, y: 0, width: 1, height: 1});
          expect(infos.length, 'Picked objects').toBe(1);

          deck.finalize();
          log.priority = 0;
          resolve();
        } catch (error) {
          log.priority = 0;
          reject(error);
        }
      }
    });
  });
});

webglTest('Deck#multi-canvas presentation', async () => {
  const canvasA = document.createElement('canvas');
  canvasA.id = 'deck-test-canvas-a';
  canvasA.width = 64;
  canvasA.height = 64;
  document.body.appendChild(canvasA);

  const canvasB = document.createElement('canvas');
  canvasB.id = 'deck-test-canvas-b';
  canvasB.width = 32;
  canvasB.height = 48;
  document.body.appendChild(canvasB);

  const deck = new Deck({
    width: 64,
    height: 64,
    canvases: [canvasA, canvasB],
    initialViewState: {
      left: {longitude: 0, latitude: 0, zoom: 1},
      right: {longitude: 10, latitude: 10, zoom: 1}
    },
    views: [
      new MapView({id: 'left', canvasId: 'deck-test-canvas-a'}),
      new MapView({id: 'right', canvasId: 'deck-test-canvas-b'})
    ],
    layers: []
  });

  await waitForRender(deck);

  expect(deck.getCanvas()).toBe(canvasA);
  // @ts-expect-error testing private state
  expect(Object.keys(deck._canvasTargets)).toEqual(['deck-test-canvas-a', 'deck-test-canvas-b']);
  expect(deck.getViewports({x: 0, y: 0, canvasId: 'deck-test-canvas-a'}).map(v => v.id)).toEqual([
    'left'
  ]);
  expect(deck.getViewports({x: 0, y: 0, canvasId: 'deck-test-canvas-b'}).map(v => v.id)).toEqual([
    'right'
  ]);

  // @ts-expect-error testing private state
  const eventManagers = deck.eventManagers;
  const viewports = deck.getViewports();
  deck.setProps({canvases: [canvasA, canvasB]});
  // @ts-expect-error testing private state
  expect(deck.eventManagers).toBe(eventManagers);
  expect(deck.getViewports()).toBe(viewports);

  deck.finalize();
  canvasA.remove();
  canvasB.remove();
});

webglTest('Deck#multi-canvas picking routes by canvas', async () => {
  const canvasA = document.createElement('canvas');
  canvasA.id = 'deck-test-pick-canvas-a';
  canvasA.width = 64;
  canvasA.height = 64;
  canvasA.style.width = '64px';
  canvasA.style.height = '64px';
  document.body.appendChild(canvasA);

  const canvasB = document.createElement('canvas');
  canvasB.id = 'deck-test-pick-canvas-b';
  canvasB.width = 32;
  canvasB.height = 48;
  canvasB.style.width = '32px';
  canvasB.style.height = '48px';
  document.body.appendChild(canvasB);

  const deck = new Deck({
    width: 64,
    height: 64,
    canvases: [canvasA, canvasB],
    initialViewState: {
      left: {longitude: 0, latitude: 0, zoom: 10},
      right: {longitude: 10, latitude: 10, zoom: 10}
    },
    views: [
      new MapView({id: 'left', canvasId: 'deck-test-pick-canvas-a'}),
      new MapView({id: 'right', canvasId: 'deck-test-pick-canvas-b'})
    ],
    layers: []
  });

  await waitForRender(deck);

  const syncCalls: any[] = [];
  const asyncCalls: any[] = [];
  const rectCalls: any[] = [];

  // @ts-expect-error test override
  deck.deckPicker.pickObject = opts => {
    syncCalls.push(opts);
    return createPointPickResult({
      layer: {id: opts.canvasId === 'deck-test-pick-canvas-b' ? 'right-layer' : 'left-layer'}
    });
  };
  // @ts-expect-error test override
  deck.deckPicker.pickObjectAsync = opts => {
    asyncCalls.push(opts);
    return Promise.resolve(
      createPointPickResult({
        layer: {id: opts.canvasId === 'deck-test-pick-canvas-b' ? 'right-layer' : 'left-layer'}
      })
    );
  };
  // @ts-expect-error test override
  deck.deckPicker.pickObjects = opts => {
    rectCalls.push(opts);
    return [
      createPickingInfo({
        layer: {id: opts.canvasId === 'deck-test-pick-canvas-b' ? 'right-layer' : 'left-layer'}
      })
    ];
  };

  expect(deck.pickObject({x: 32, y: 32})?.layer?.id).toBe('left-layer');
  expect(syncCalls[0].canvasId).toBe('deck-test-pick-canvas-a');
  expect(syncCalls[0].viewports.map(viewport => viewport.id)).toEqual(['left']);

  expect(deck.pickObject({x: 16, y: 24, canvasId: 'deck-test-pick-canvas-b'})?.layer?.id).toBe(
    'right-layer'
  );
  expect(syncCalls[1].canvasId).toBe('deck-test-pick-canvas-b');
  expect(syncCalls[1].viewports.map(viewport => viewport.id)).toEqual(['right']);

  expect(
    (await deck.pickObjectAsync({x: 16, y: 24, canvasId: 'deck-test-pick-canvas-b'}))?.layer?.id
  ).toBe('right-layer');
  expect(asyncCalls[0].canvasId).toBe('deck-test-pick-canvas-b');
  expect(asyncCalls[0].viewports.map(viewport => viewport.id)).toEqual(['right']);

  expect(
    deck.pickObjects({x: 16, y: 24, width: 1, height: 1, canvasId: 'deck-test-pick-canvas-b'})[0]
      ?.layer?.id
  ).toBe('right-layer');
  expect(rectCalls[0].canvasId).toBe('deck-test-pick-canvas-b');
  expect(rectCalls[0].viewports.map(viewport => viewport.id)).toEqual(['right']);

  deck.finalize();
  canvasA.remove();
  canvasB.remove();
});

webglTest('Deck#multi-canvas mode transitions', async () => {
  const deck = new Deck({
    width: 64,
    height: 64,
    initialViewState: {longitude: 0, latitude: 0, zoom: 1},
    layers: []
  });

  await waitForRender(deck);

  const originalCanvas = deck.getCanvas();
  expect(originalCanvas).toBeTruthy();
  expect(originalCanvas?.isConnected).toBe(true);

  deck.setProps({canvases: []});
  await waitForRender(deck);

  expect(deck.getCanvas()).toBe(null);
  expect(originalCanvas?.isConnected).toBe(false);
  // @ts-expect-error testing private state
  expect(Object.keys(deck._canvasTargets)).toEqual([]);

  deck.setProps({canvases: undefined});
  await waitForRender(deck);

  const rebuiltCanvas = deck.getCanvas();
  expect(rebuiltCanvas).toBeTruthy();
  expect(rebuiltCanvas).not.toBe(originalCanvas);
  expect(rebuiltCanvas?.isConnected).toBe(true);

  deck.finalize();
});

webglTest('Deck#multi-canvas clears orphaned canvases', async () => {
  const canvasA = document.createElement('canvas');
  canvasA.id = 'deck-test-orphan-canvas-a';
  canvasA.width = 64;
  canvasA.height = 64;
  document.body.appendChild(canvasA);

  const canvasB = document.createElement('canvas');
  canvasB.id = 'deck-test-orphan-canvas-b';
  canvasB.width = 64;
  canvasB.height = 64;
  document.body.appendChild(canvasB);

  const deck = new Deck({
    width: 64,
    height: 64,
    canvases: [canvasA, canvasB],
    initialViewState: {
      left: {longitude: 0, latitude: 0, zoom: 1},
      right: {longitude: 10, latitude: 10, zoom: 1}
    },
    views: [
      new MapView({id: 'left', canvasId: 'deck-test-orphan-canvas-a'}),
      new MapView({id: 'right', canvasId: 'deck-test-orphan-canvas-b'})
    ],
    layers: []
  });

  await waitForRender(deck);

  // @ts-expect-error testing private state
  const targetA = deck._canvasTargets['deck-test-orphan-canvas-a'];
  // @ts-expect-error testing private state
  const targetB = deck._canvasTargets['deck-test-orphan-canvas-b'];
  const presentCalls = {a: 0, b: 0};
  const renderCalls: string[][] = [];
  const originalPresentA = targetA.presentationContext.present.bind(targetA.presentationContext);
  const originalPresentB = targetB.presentationContext.present.bind(targetB.presentationContext);
  const originalRenderLayers = deck.deckRenderer.renderLayers.bind(deck.deckRenderer);

  targetA.presentationContext.present = () => {
    presentCalls.a++;
    originalPresentA();
  };
  targetB.presentationContext.present = () => {
    presentCalls.b++;
    originalPresentB();
  };
  // @ts-expect-error test override
  deck.deckRenderer.renderLayers = opts => {
    renderCalls.push(opts.viewports.map(viewport => viewport.id));
    originalRenderLayers(opts);
  };

  deck.setProps({
    views: [new MapView({id: 'left', canvasId: 'deck-test-orphan-canvas-a'})]
  });
  await waitForRender(deck);

  expect(renderCalls).toEqual([['left']]);
  expect(presentCalls).toEqual({a: 1, b: 1});

  deck.finalize();
  canvasA.remove();
  canvasB.remove();
});

test('Deck#async picking', async () => {
  const deck = new Deck({
    device,
    width: 1,
    height: 1,

    viewState: {
      longitude: 0,
      latitude: 0,
      zoom: 12
    },

    layers: [
      new ScatterplotLayer({
        data: [{position: [0, 0]}, {position: [0, 0]}],
        radiusMinPixels: 100,
        pickable: true
      })
    ],
    onAfterRender: () => {}
  });

  await waitForRender(deck);
  expect(true, 'Deck rendered').toBe(true);

  const info = await deck.pickObjectAsync({x: 0, y: 0});
  expect(info && info.index, 'Async picked object').toBe(1);

  const rectInfos = await deck.pickObjectsAsync({x: 0, y: 0, width: 1, height: 1});
  expect(rectInfos.length, 'Async picked objects').toBe(1);

  deck.finalize();
});

webglTest('Deck#explicit sync picking unaffected by pickAsync', async () => {
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    pickAsync: 'async',
    viewState: {
      longitude: 0,
      latitude: 0,
      zoom: 12
    },
    layers: [
      new ScatterplotLayer({
        data: [{position: [0, 0]}, {position: [0, 0]}],
        radiusMinPixels: 100,
        pickable: true
      })
    ]
  });

  await waitForRender(deck);

  const info = deck.pickObject({x: 0, y: 0});
  expect(info && info.index, 'Explicit sync picking still uses the sync API').toBe(1);

  deck.finalize();
});

test('Deck#does not expose pickMultipleObjectsAsync', async () => {
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    viewState: {longitude: 0, latitude: 0, zoom: 12},
    layers: []
  });

  await waitForRender(deck);

  expect('pickMultipleObjectsAsync' in deck, 'Async deep-pick API is removed from Deck').toBe(
    false
  );

  deck.finalize();
});

webglTest('Deck#internal hover uses sync picking on WebGL auto mode', async () => {
  const hovered: number[] = [];
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    pickAsync: 'auto',
    viewState: {longitude: 0, latitude: 0, zoom: 12},
    layers: [],
    onHover: info => hovered.push(info.index)
  });

  await waitForRender(deck);

  let syncCalls = 0;
  let asyncCalls = 0;

  // @ts-expect-error testing private method override
  deck._pick = () => {
    syncCalls++;
    return createPointPickResult({index: 2});
  };
  // @ts-expect-error testing private method override
  deck._pickAsync = () => {
    asyncCalls++;
    return Promise.resolve(createPointPickResult({index: 3}));
  };

  // @ts-expect-error testing private state injection
  deck._pickRequest = {
    mode: 'hover',
    x: 0,
    y: 0,
    radius: 0,
    event: {type: 'pointermove', offsetCenter: {x: 0, y: 0}}
  };

  // @ts-expect-error testing private method access
  deck._pickAndCallback();

  expect(syncCalls, 'sync internal picker is used').toBe(1);
  expect(asyncCalls, 'async internal picker is not used').toBe(0);
  expect(hovered, 'hover callback fires immediately with sync picking').toEqual([2]);

  deck.finalize();
});

test('Deck#async hover ignores stale results', async () => {
  const hovered: number[] = [];
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    pickAsync: 'async',
    viewState: {longitude: 0, latitude: 0, zoom: 12},
    layers: [],
    onHover: info => hovered.push(info.index)
  });

  await waitForRender(deck);

  const firstPick = createDeferred<ReturnType<typeof createPointPickResult>>();
  const secondPick = createDeferred<ReturnType<typeof createPointPickResult>>();
  let asyncCalls = 0;

  // @ts-expect-error testing private method override
  deck._pickAsync = () => {
    asyncCalls++;
    return asyncCalls === 1 ? firstPick.promise : secondPick.promise;
  };

  // @ts-expect-error testing private state injection
  deck._pickRequest = {
    mode: 'hover',
    x: 0,
    y: 0,
    radius: 0,
    event: {type: 'pointermove', offsetCenter: {x: 0, y: 0}}
  };
  // @ts-expect-error testing private method access
  deck._pickAndCallback();

  // @ts-expect-error testing private state injection
  deck._pickRequest = {
    mode: 'hover',
    x: 1,
    y: 1,
    radius: 0,
    event: {type: 'pointermove', offsetCenter: {x: 1, y: 1}}
  };
  // @ts-expect-error testing private method access
  deck._pickAndCallback();

  secondPick.resolve(createPointPickResult({index: 22}));
  await sleep(0);
  firstPick.resolve(createPointPickResult({index: 11}));
  await sleep(0);

  expect(hovered, 'stale hover result is ignored').toEqual([22]);

  deck.finalize();
});

test('Deck#async pointerdown delays click callback until picking resolves', async () => {
  const clicked: number[] = [];
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    pickAsync: 'async',
    viewState: {longitude: 0, latitude: 0, zoom: 12},
    layers: [],
    onClick: info => clicked.push(info.index)
  });

  await waitForRender(deck);

  const pointerDownPick = createDeferred<ReturnType<typeof createPointPickResult>>();

  // @ts-expect-error testing private method override
  deck._pickAsync = () => pointerDownPick.promise;

  // @ts-expect-error testing private method access
  deck._onPointerDown({offsetCenter: {x: 0, y: 0}});
  // @ts-expect-error testing private method access
  deck._onEvent({type: 'click', offsetCenter: {x: 0, y: 0}});

  expect(clicked, 'click callback is deferred while pointerdown picking is pending').toEqual([]);

  pointerDownPick.resolve(createPointPickResult({index: 7}));
  await sleep(0);

  expect(clicked, 'click callback uses resolved pointerdown picking info').toEqual([7]);

  deck.finalize();
});

test('Deck#controller pickPosition returns null in async mode', async () => {
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    pickAsync: 'async',
    viewState: {longitude: 0, latitude: 0, zoom: 12},
    layers: []
  });

  await waitForRender(deck);

  // @ts-expect-error testing private method access
  expect(
    deck._pickPositionForController(0, 0),
    'controllers degrade gracefully in async mode'
  ).toBe(null);

  deck.finalize();
});

test('Deck#pickAsync sync on WebGPU reports an error', async () => {
  const errors: Error[] = [];
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    viewState: {longitude: 0, latitude: 0, zoom: 12},
    layers: [],
    onError: error => errors.push(error)
  });

  await waitForRender(deck);

  // @ts-expect-error testing private device override
  const fakeDevice = Object.create(deck.device);
  Object.defineProperty(fakeDevice, 'type', {value: 'webgpu'});
  Object.defineProperty(deck, 'device', {value: fakeDevice});

  deck.setProps({pickAsync: 'sync'});

  expect(errors.length, 'invalid sync-on-WebGPU configuration is reported').toBe(1);
  expect(
    errors[0].message.includes('`pickAsync: "sync"`'),
    'error message explains the invalid config'
  ).toBe(true);

  deck.finalize();
});
test('Deck#auto view state', async () => {
  let onViewStateChangeCalled = 0;

  await new Promise<void>((resolve, reject) => {
    const deck = new Deck({
      device,
      width: 1,
      height: 1,

      views: [
        new MapView({id: 'default'}),
        new MapView({id: 'map'}),
        new MapView({id: 'minimap', viewState: {id: 'map', zoom: 12, pitch: 0, bearing: 0}})
      ],

      initialViewState: {
        longitude: 0,
        latitude: 0,
        zoom: 12
      },

      onViewStateChange: ({viewId, viewState}) => {
        onViewStateChangeCalled++;
        if (viewId === 'default') {
          // block view state change from the default view
          return {longitude: 0, latitude: 0, zoom: 12};
        }
        // use default (a.k.a. viewState)
        return null;
      },

      onLoad: () => {
        try {
          deck._onViewStateChange({
            viewId: 'default',
            viewState: {longitude: 0, latitude: 0, zoom: 11}
          });
          expect(onViewStateChangeCalled, 'onViewStateChange is called').toBe(1);
          expect(deck.getViewports()[0].longitude, 'default view state should not change').toBe(0);

          deck._onViewStateChange({
            viewId: 'map',
            viewState: {longitude: 1, latitude: 1, zoom: 11}
          });
          expect(onViewStateChangeCalled, 'onViewStateChange is called').toBe(2);
          expect(deck.getViewports()[0].longitude, 'default view state should not change').toBe(0);
          expect(deck.getViewports()[1].longitude, 'map longitude is updated').toBe(1);
          expect(deck.getViewports()[1].zoom, 'map zoom is updated').toBe(11);
          expect(deck.getViewports()[2].longitude, 'minimap longitude is updated').toBe(1);
          expect(deck.getViewports()[2].zoom, 'minimap zoom should not change').toBe(12);

          deck._onViewStateChange({
            viewId: 'minimap',
            viewState: {longitude: 2, latitude: 2, zoom: 12}
          });
          expect(onViewStateChangeCalled, 'onViewStateChange is called').toBe(3);
          expect(deck.getViewports()[1].longitude, 'map state should not change').toBe(1);
          expect(deck.getViewports()[2].longitude, 'minimap state should not change').toBe(1);

          deck.setProps({viewState: {longitude: 3, latitude: 3, zoom: 12}});
          deck._onViewStateChange({
            viewId: 'map',
            viewState: {longitude: 1, latitude: 1, zoom: 11}
          });
          expect(
            deck.getViewports()[0].longitude,
            'external viewState should override internal'
          ).toBe(3);
          expect(
            deck.getViewports()[1].longitude,
            'external viewState should override internal'
          ).toBe(3);

          deck.finalize();
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  });
});

test('Deck#resourceManager', async () => {
  const layer1 = new ScatterplotLayer({
    id: 'scatterplot-global-data',
    data: 'deck://pins',
    getPosition: d => d.position
  });
  const layer2 = new ScatterplotLayer({
    id: 'scatterplot-shared-data-A',
    data: 'cities.json',
    getPosition: d => d.position
  });
  const layer3 = new ScatterplotLayer({
    id: 'scatterplot-shared-data-B',
    data: 'cities.json',
    getPosition: d => d.position
  });

  const deck = new Deck({
    device,
    width: 1,
    height: 1,

    viewState: {
      longitude: 0,
      latitude: 0,
      zoom: 0
    },

    layers: [layer1, layer2, layer3],

    onError: () => null
  });

  function update(props = {}) {
    return new Promise(resolve => {
      deck.setProps({
        ...props,
        onAfterRender: resolve
      });
    });
  }

  await update();
  // @ts-expect-error Accessing private member
  const {resourceManager} = deck.layerManager;
  expect(layer1.getNumInstances(), 'layer subscribes to global data resource').toBe(0);
  expect(resourceManager.contains('cities.json'), 'data url is cached').toBeTruthy();

  deck._addResources({
    pins: [{position: [1, 0, 0]}]
  });
  await update();
  expect(layer1.getNumInstances(), 'layer subscribes to global data resource').toBe(1);

  deck._addResources({
    pins: [{position: [1, 0, 0]}, {position: [0, 2, 0]}]
  });
  await update();
  expect(layer1.getNumInstances(), 'layer data is updated').toBe(2);

  await update({layers: []});
  await sleep(300);
  expect(resourceManager.contains('cities.json'), 'cached data is purged').toBeFalsy();

  deck._removeResources(['pins']);
  expect(resourceManager.contains('pins'), 'data resource is removed').toBeFalsy();

  deck.finalize();
});

test('Deck#getView with single view', async () => {
  await new Promise<void>((resolve, reject) => {
    const deck = new Deck({
      device,
      width: 1,
      height: 1,

      views: new MapView({id: 'map'}),

      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 12
      },

      onLoad: () => {
        try {
          const mapView = deck.getView('map');
          expect(mapView, 'getView returns a view for valid id').toBeTruthy();
          expect(mapView?.id, 'getView returns the correct view').toBe('map');

          const unknownView = deck.getView('unknown');
          expect(unknownView, 'getView returns undefined for unknown id').toBeFalsy();

          deck.finalize();
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  });
});

test('Deck#getView with multiple views', async () => {
  await new Promise<void>((resolve, reject) => {
    const deck = new Deck({
      device,
      width: 1,
      height: 1,

      views: [new MapView({id: 'map'}), new MapView({id: 'minimap'})],

      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 12
      },

      onLoad: () => {
        try {
          const mapView = deck.getView('map');
          expect(mapView, 'getView returns a view for valid id').toBeTruthy();
          expect(mapView?.id, 'getView returns the correct view').toBe('map');

          const minimapView = deck.getView('minimap');
          expect(minimapView, 'getView returns a view for second valid id').toBeTruthy();
          expect(minimapView?.id, 'getView returns the correct view').toBe('minimap');

          const unknownView = deck.getView('unknown');
          expect(unknownView, 'getView returns undefined for unknown id').toBeFalsy();

          deck.finalize();
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  });
});

test('Deck#props omitted are unchanged', async () => {
  const layer = new ScatterplotLayer({
    id: 'scatterplot-global-data',
    data: 'deck://pins',
    getPosition: d => d.position
  });

  const widget = new FullscreenWidget();

  // Initialize with widgets and layers.
  await new Promise<void>((resolve, reject) => {
    const deck = new Deck({
      device,
      width: 1,
      height: 1,

      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 0
      },

      layers: [layer],
      widgets: [widget],

      onLoad: () => {
        try {
          const {widgets, layers} = deck.props;
          expect(widgets && Array.isArray(widgets) && widgets.length, 'Widgets is set').toBe(1);
          expect(layers && Array.isArray(layers) && layers.length, 'Layers is set').toBe(1);

          // Render deck a second time without changing widget or layer props.
          deck.setProps({
            onAfterRender: () => {
              try {
                const {widgets: nextWidgets, layers: nextLayers} = deck.props;
                expect(
                  nextWidgets && Array.isArray(nextWidgets) && nextWidgets.length,
                  'Widgets remain set'
                ).toBe(1);
                expect(
                  nextLayers && Array.isArray(nextLayers) && nextLayers.length,
                  'Layers remain set'
                ).toBe(1);

                deck.finalize();
                resolve();
              } catch (error) {
                reject(error);
              }
            }
          });
        } catch (error) {
          reject(error);
        }
      }
    });
  });
});

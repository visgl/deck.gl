// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {Deck, LinearInterpolator} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {device} from '@deck.gl/test-utils/vitest';
import {sleep} from './async-iterator-test-utils';
import type {DeckProps} from '@deck.gl/core';

const VIEW_STATE = {longitude: 0, latitude: 0, zoom: 1};
const DATA = [{position: [0, 0]}];

/** Creates a Deck, waits until its loop is idle and counts the frames and draws that follow */
async function createIdleDeck(props: DeckProps = {}) {
  const draws = {count: 0};
  let deck!: Deck;
  await new Promise<void>(resolve => {
    deck = new Deck({
      device,
      width: 10,
      height: 10,
      viewState: VIEW_STATE,
      layers: [new ScatterplotLayer({id: 'points', data: DATA, getPosition: d => d.position})],
      ...props,
      onAfterRender: () => {
        draws.count++;
        resolve();
      }
    });
  });
  await sleep(100);
  // @ts-expect-error protected member
  const frames = vi.spyOn(deck.animationLoop, 'redraw');
  draws.count = 0;
  return {deck, draws, frames};
}

async function expectIdle(frames: {mockClear: () => void; mock: {calls: unknown[]}}) {
  await sleep(50);
  frames.mockClear();
  await sleep(150);
  expect(frames.mock.calls.length, 'no frames are requested while idle').toBe(0);
}

test('Deck stops requesting frames while nothing needs a redraw', async () => {
  const {deck, frames} = await createIdleDeck();
  await expectIdle(frames);
  deck.finalize();
});

test('Deck#setProps wakes the idle loop', async () => {
  const {deck, draws, frames} = await createIdleDeck();

  deck.setProps({
    layers: [
      new ScatterplotLayer({id: 'points', data: DATA, getPosition: d => d.position, radiusScale: 2})
    ]
  });
  await sleep(50);
  expect(draws.count, 'layer change is drawn').toBeGreaterThan(0);
  // @ts-expect-error protected member
  expect(deck.layerManager.getLayers()[0].props.radiusScale).toBe(2);

  await expectIdle(frames);
  deck.finalize();
});

test('Layer#setNeedsRedraw wakes the idle loop', async () => {
  const {deck, draws, frames} = await createIdleDeck();

  // @ts-expect-error protected member
  deck.layerManager.getLayers()[0].setNeedsRedraw();
  await sleep(50);
  expect(draws.count, 'layer is redrawn').toBe(1);

  await expectIdle(frames);
  deck.finalize();
});

test('Async layer data wakes the idle loop', async () => {
  let resolveData!: (data: typeof DATA) => void;
  const data = new Promise<typeof DATA>(resolve => {
    resolveData = resolve;
  });
  const {deck, draws, frames} = await createIdleDeck({
    layers: [new ScatterplotLayer({id: 'points', data, getPosition: d => d.position})]
  });

  resolveData(DATA);
  await sleep(50);
  // @ts-expect-error protected member
  const layer = deck.layerManager.getLayers()[0];
  expect(layer.getNumInstances(), 'loaded data is used').toBe(1);
  expect(draws.count, 'loaded data is drawn').toBeGreaterThan(0);

  await expectIdle(frames);
  deck.finalize();
});

test('Hover picking wakes the idle loop', async () => {
  const hovered: number[] = [];
  const {deck, frames} = await createIdleDeck({onHover: info => hovered.push(info.index)});
  const pickResult = {
    result: [{index: 2, picked: true, x: 0, y: 0}],
    emptyInfo: {index: -1, picked: false, x: 0, y: 0}
  };
  // @ts-expect-error testing private method override
  deck._pick = () => pickResult;
  // @ts-expect-error testing private method override
  deck._pickAsync = () => Promise.resolve(pickResult);

  deck._onPointerMove({type: 'pointermove', offsetCenter: {x: 1, y: 1}} as any);
  await sleep(50);
  expect(hovered, 'hover is picked on the next frame').toEqual([2]);

  await expectIdle(frames);
  deck.finalize();
});

test('Hover updates the cursor after the hover callbacks', async () => {
  let hoveredIndex = -1;
  const {deck, frames} = await createIdleDeck({
    onHover: info => {
      hoveredIndex = info.index;
    },
    getCursor: () => (hoveredIndex === 3 ? 'pointer' : 'grab')
  });
  const pickResult = {
    result: [{index: 3, picked: true, x: 0, y: 0}],
    emptyInfo: {index: -1, picked: false, x: 0, y: 0}
  };
  // @ts-expect-error testing private method override
  deck._pick = () => pickResult;
  // @ts-expect-error testing private method override
  deck._pickAsync = () => Promise.resolve(pickResult);

  deck._onPointerMove({type: 'pointermove', offsetCenter: {x: 1, y: 1}} as any);
  await sleep(50);
  expect(deck.getCanvas()!.style.cursor, 'cursor reflects the completed hover').toBe('pointer');

  await expectIdle(frames);
  deck.finalize();
});

test('Default effect and shader changes wake the idle loop', async () => {
  const {deck, draws, frames} = await createIdleDeck();
  const module = {name: 'idle-test-module'};
  // @ts-expect-error protected member
  const layerManager = deck.layerManager;

  deck._addDefaultShaderModule(module);
  await sleep(50);
  expect(layerManager.needsUpdate(), 'added module is applied').toBe(false);
  expect(draws.count, 'added module is drawn').toBeGreaterThan(0);
  await expectIdle(frames);

  draws.count = 0;
  deck._removeDefaultShaderModule(module);
  await sleep(50);
  expect(layerManager.needsUpdate(), 'removed module is applied').toBe(false);
  expect(draws.count, 'removed module is drawn').toBeGreaterThan(0);
  await expectIdle(frames);

  draws.count = 0;
  deck._addDefaultEffect({
    id: 'idle-test-effect',
    setup: () => {},
    preRender: () => {},
    cleanup: () => {}
  } as any);
  await sleep(50);
  expect(draws.count, 'added effect is drawn').toBeGreaterThan(0);

  await expectIdle(frames);
  deck.finalize();
});

test('Canvas resize wakes the idle loop', async () => {
  const {deck, draws, frames} = await createIdleDeck();

  const canvasContext = deck.device!.getDefaultCanvasContext();
  deck.device!.props.onResize?.(canvasContext, {oldPixelSize: [1, 1]});
  await sleep(50);
  expect(draws.count, 'resized canvas is drawn').toBe(1);

  await expectIdle(frames);
  deck.finalize();
});

test('A draw outside of the loop wakes it if work remains', async () => {
  const {deck, frames} = await createIdleDeck();

  // @ts-expect-error protected member
  const layer = deck.layerManager.getLayers()[0];
  // Flags set during a basemap's draw bypass Layer#setNeedsRedraw
  layer.internalState.needsRedraw = true;
  deck._drawLayers('basemap');
  await sleep(50);
  expect(frames.mock.calls.length, 'loop resumes').toBeGreaterThan(0);

  await expectIdle(frames);
  deck.finalize();
});

test('Uniform transitions keep the loop running until they end', async () => {
  const {deck, frames} = await createIdleDeck();

  deck.setProps({
    layers: [
      new ScatterplotLayer({
        id: 'points',
        data: DATA,
        getPosition: d => d.position,
        radiusScale: 2,
        transitions: {radiusScale: 150}
      })
    ]
  });
  await sleep(100);
  // @ts-expect-error protected member
  expect(deck.layerManager.getLayers()[0].hasUniformTransition(), 'in transition').toBe(true);
  expect(frames.mock.calls.length, 'frames run during the transition').toBeGreaterThan(2);

  await sleep(100);
  await expectIdle(frames);
  deck.finalize();
});

test('View state transitions run to the end while the app ignores onViewStateChange', async () => {
  const zooms: number[] = [];
  const {deck, frames} = await createIdleDeck({
    controller: true,
    onViewStateChange: ({viewState}) => {
      zooms.push(viewState.zoom);
    }
  });

  const transitionEnd = new Promise<void>(resolve => {
    deck.setProps({
      viewState: {
        ...VIEW_STATE,
        zoom: 2,
        transitionDuration: 150,
        transitionInterpolator: new LinearInterpolator(),
        onTransitionEnd: () => resolve()
      }
    });
  });
  await expect(Promise.race([transitionEnd, sleep(1000).then(() => 'timeout')])).resolves.toBe(
    undefined
  );
  const intermediateZooms = zooms.filter(zoom => zoom > 1 && zoom < 2);
  expect(intermediateZooms.length, 'transition is animated').toBeGreaterThan(2);
  expect(zooms[zooms.length - 1], 'transition ends at the target').toBe(2);

  await expectIdle(frames);
  deck.finalize();
});

test('Deck#_animate keeps requesting frames', async () => {
  const {deck, frames} = await createIdleDeck({_animate: true});

  frames.mockClear();
  await sleep(150);
  expect(frames.mock.calls.length, 'frames are requested continuously').toBeGreaterThan(2);

  deck.setProps({_animate: false});
  await expectIdle(frames);
  deck.finalize();
});

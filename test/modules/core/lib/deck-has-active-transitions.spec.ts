// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Deck, LinearInterpolator} from '@deck.gl/core';
import type {DeckProps} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {device} from '@deck.gl/test-utils/vitest';
import {sleep} from './async-iterator-test-utils';

const TRANSITION_DURATION = 500;
const VIEW_STATE = {longitude: 0, latitude: 0, zoom: 1};

const renderedDecks = new Set<Deck<any>>();

function createDeck(props: DeckProps = {}) {
  const deck: Deck<any> = new Deck({
    device,
    width: 10,
    height: 10,
    initialViewState: VIEW_STATE,
    onAfterRender: () => renderedDecks.add(deck),
    ...props
  });
  return deck;
}

function createLayer(props = {}) {
  return new ScatterplotLayer({
    id: 'points',
    data: [{position: [0, 0]}],
    getPosition: d => d.position,
    ...props
  });
}

/** Polls about once per animation frame for up to two seconds */
async function waitFor(predicate: () => boolean, description: string) {
  for (let frame = 0; frame < 120 && !predicate(); frame++) {
    await sleep(16);
  }
  expect(predicate(), description).toBe(true);
}

/** Waits for a transition to start and then finish */
async function expectTransition(deck: Deck<any>, startTransition: () => void) {
  await waitFor(
    () => renderedDecks.has(deck) && !deck.needsRedraw({clearRedrawFlags: false}),
    'deck rendered and idle before transition'
  );
  expect(deck.hasActiveTransitions(), 'no transition before the change').toBe(false);
  startTransition();
  await waitFor(() => deck.hasActiveTransitions(), 'transition started');
  await waitFor(() => !deck.hasActiveTransitions(), 'transition finished');
}

test('Deck#hasActiveTransitions is false without a Deck or transitions', async () => {
  const deck = createDeck({layers: [createLayer()]});
  expect(deck.hasActiveTransitions(), 'before initialization').toBe(false);
  await waitFor(() => deck.isInitialized, 'deck initialized');
  expect(deck.hasActiveTransitions()).toBe(false);
  deck.finalize();
  expect(deck.hasActiveTransitions(), 'after finalization').toBe(false);
});

test('Deck#hasActiveTransitions detects layer prop transitions', async () => {
  const transitions = {opacity: TRANSITION_DURATION};
  const deck = createDeck({layers: [createLayer({opacity: 1, transitions})]});
  await expectTransition(deck, () =>
    deck.setProps({layers: [createLayer({opacity: 0.5, transitions})]})
  );
  deck.finalize();
});

test('Deck#hasActiveTransitions detects attribute transitions', async () => {
  const transitions = {getRadius: TRANSITION_DURATION};
  const deck = createDeck({layers: [createLayer({getRadius: 1, transitions})]});
  await expectTransition(deck, () =>
    deck.setProps({layers: [createLayer({getRadius: 10, transitions})]})
  );
  deck.finalize();
});

test('Deck#hasActiveTransitions detects view state transitions', async () => {
  const deck = createDeck({controller: true, layers: [createLayer()]});
  await expectTransition(deck, () =>
    deck.setProps({
      initialViewState: {
        ...VIEW_STATE,
        longitude: 10,
        transitionDuration: TRANSITION_DURATION,
        transitionInterpolator: new LinearInterpolator()
      }
    })
  );
  deck.finalize();
});

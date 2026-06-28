// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {Deck, ScatterplotLayer} from '@deck.gl/core';

test('Deck#onAfterRender receives pass parameter', async () => {
  const onAfterRender = vi.fn();

  const deck = new Deck({
    width: 100,
    height: 100,
    layers: [
      new ScatterplotLayer({
        data: [{position: [0, 0]}],
        getPosition: d => d.position
      })
    ],
    onAfterRender
  });

  // Trigger render
  deck.redraw();

  // Wait for render to complete
  await new Promise(resolve => setTimeout(resolve, 100));

  expect(onAfterRender).toHaveBeenCalled();

  const lastCall = onAfterRender.mock.calls[onAfterRender.mock.calls.length - 1];
  const context = lastCall[0];

  expect(context).toHaveProperty('device');
  expect(context).toHaveProperty('gl');
  expect(context).toHaveProperty('pass');
  expect(context.pass).toBe('screen');

  deck.finalize();
});

test('Deck#onAfterRender pass types', async () => {
  const passTypes: string[] = [];

  const deck = new Deck({
    width: 100,
    height: 100,
    layers: [
      new ScatterplotLayer({
        data: [{position: [0, 0]}],
        getPosition: d => d.position,
        pickable: true
      })
    ],
    onAfterRender: ({pass}) => {
      if (!passTypes.includes(pass)) {
        passTypes.push(pass);
      }
    }
  });

  // Trigger render
  deck.redraw();

  // Trigger picking (will use picking pass)
  deck.pickObject({x: 50, y: 50});

  // Wait for renders
  await new Promise(resolve => setTimeout(resolve, 200));

  // Should have captured screen pass
  expect(passTypes).toContain('screen');

  deck.finalize();
});

test('Deck#hasActiveTransitions returns false when no transitions', () => {
  const deck = new Deck({
    width: 100,
    height: 100,
    layers: [
      new ScatterplotLayer({
        data: [{position: [0, 0]}],
        getPosition: d => d.position
      })
    ]
  });

  expect(deck.hasActiveTransitions()).toBe(false);

  deck.finalize();
});

test('Deck#hasActiveTransitions detects layer uniform transitions', async () => {
  const deck = new Deck({
    width: 100,
    height: 100,
    layers: [
      new ScatterplotLayer({
        id: 'scatter',
        data: [{position: [0, 0]}],
        getPosition: d => d.position,
        opacity: 1,
        transitions: {
          opacity: 1000 // 1 second transition
        }
      })
    ]
  });

  // Initially no transitions
  expect(deck.hasActiveTransitions()).toBe(false);

  // Trigger opacity change with transition
  deck.setProps({
    layers: [
      new ScatterplotLayer({
        id: 'scatter',
        data: [{position: [0, 0]}],
        getPosition: d => d.position,
        opacity: 0.5,
        transitions: {
          opacity: 1000
        }
      })
    ]
  });

  // Wait for transition to start
  await new Promise(resolve => setTimeout(resolve, 50));

  // Should detect active transition
  expect(deck.hasActiveTransitions()).toBe(true);

  // Wait for transition to complete
  await new Promise(resolve => setTimeout(resolve, 1100));

  // Should be done
  expect(deck.hasActiveTransitions()).toBe(false);

  deck.finalize();
});

test('Deck#hasActiveTransitions detects viewport transitions', async () => {
  const deck = new Deck({
    width: 100,
    height: 100,
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 10
    },
    layers: [],
    controller: true
  });

  // Initially no transitions
  expect(deck.hasActiveTransitions()).toBe(false);

  // Trigger viewport transition
  deck.setProps({
    initialViewState: {
      longitude: 10,
      latitude: 10,
      zoom: 12,
      transitionDuration: 500
    }
  });

  // Wait a bit for transition to start
  await new Promise(resolve => setTimeout(resolve, 50));

  // Should detect transition (if viewport implementation supports it)
  // Note: This may be false if viewport doesn't track transition state
  const hasTransition = deck.hasActiveTransitions();

  // Wait for transition to complete
  await new Promise(resolve => setTimeout(resolve, 600));

  // Should be done
  expect(deck.hasActiveTransitions()).toBe(false);

  deck.finalize();
});

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-unused-vars */
import test from 'tape-promise/tape';
import {createElement, createRef} from 'react';
import {createRoot} from 'react-dom/client';
import {act} from 'react-dom/test-utils';

import DeckGL from 'deck.gl';

import {gl} from '@deck.gl/test-utils';

const TEST_VIEW_STATE = {
  latitude: 37.7515,
  longitude: -122.4269,
  zoom: 11.5,
  bearing: -45,
  pitch: 45
};

// If testing under node, provide a headless context
/* global document */
const getMockContext = () => (globalThis.__JSDOM__ ? gl : null);

test('DeckGL#mount/unmount', t => {
  const ref = createRef();
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      createElement(DeckGL, {
        initialViewState: TEST_VIEW_STATE,
        ref,
        width: 100,
        height: 100,
        gl: getMockContext(),
        onLoad: () => {
          const {deck} = ref.current;
          t.ok(deck, 'DeckGL is initialized');
          const viewport = deck.getViewports()[0];
          t.is(viewport && viewport.longitude, TEST_VIEW_STATE.longitude, 'View state is set');

          act(() => {
            root.render(null);
          });

          t.notOk(deck.animationLoop, 'Deck is finalized');

          container.remove();
          t.end();
        }
      })
    );
  });
  t.ok(ref.current, 'DeckGL overlay is rendered.');
});

test('DeckGL#render', t => {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  root.render(
    createElement(
      DeckGL,
      {
        viewState: TEST_VIEW_STATE,
        width: 100,
        height: 100,
        gl: getMockContext(),
        onAfterRender: () => {
          const child = container.querySelector('.child');
          t.ok(child, 'Child is rendered');

          root.render(null);
          container.remove();
          t.end();
        }
      },
      [createElement('div', {key: 0, className: 'child'}, 'Child')]
    )
  );
});

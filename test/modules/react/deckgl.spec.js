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

/* eslint-disable no-unused-vars */
import test from 'tape-catch';
import {createElement} from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

import DeckGL, {ScatterplotLayer} from 'deck.gl';

import {gl} from '@deck.gl/test-utils';

const TEST_VIEW_STATE = {
  latitude: 37.7515,
  longitude: -122.4269,
  zoom: 11.5,
  bearing: -45,
  pitch: 45
};

// If testing under node, provide a headless context
/* global global, document */
const getMockContext = () => (typeof global !== 'undefined' && global.__JSDOM__ ? gl : null);

test('DeckGL#mount/unmount', t => {
  const container = document.createElement('div');
  const component = ReactDOM.render(
    createElement(DeckGL, {
      initialViewState: TEST_VIEW_STATE,
      width: 100,
      height: 100,
      gl: getMockContext(),
      onLoad: () => {
        t.ok(component.deck, 'DeckGL is initialized');
        t.is(
          component.deck.getViewports()[0].longitude,
          TEST_VIEW_STATE.longitude,
          'View state is set'
        );

        ReactDOM.unmountComponentAtNode(container);

        t.notOk(component.deck.animationLoop, 'Deck is finalized');

        t.end();
      }
    }),
    container
  );

  t.ok(component, 'DeckGL overlay is rendered.');
});

test('DeckGL#render', t => {
  const container = document.createElement('div');

  const component = ReactDOM.render(
    createElement(
      DeckGL,
      {
        viewState: TEST_VIEW_STATE,
        width: 100,
        height: 100,
        gl: getMockContext(),
        onAfterRender: () => {
          const child = ReactTestUtils.findRenderedDOMComponentWithClass(component, 'child');
          t.ok(child, 'Child is rendered');

          ReactDOM.unmountComponentAtNode(container);
          t.end();
        }
      },
      [createElement('div', {key: 0, className: 'child'}, 'Child')]
    ),
    container
  );
});

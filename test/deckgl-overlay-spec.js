/* eslint-disable no-unused-vars */
import test from 'tape-catch';
import React from 'react';

import utils from 'react-addons-test-utils';

import {
  DeckGLOverlay
} from '../src';

test('Rendering DeckGLOverlay', t => {
  const component = utils.renderIntoDocument(
    <DeckGLOverlay width={100} height={100} layers={[]} />
  );
  t.ok(component, 'WebGLOverlay is rendered.');
  t.end();
});

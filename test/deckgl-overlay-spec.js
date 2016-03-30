import test from 'tape-catch';
import utils from 'react-test-utils';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import {
  DeckGLOverlay
} from '../src';

test('Rendering DeckGLOverlay', t => {
  const component = utils.renderComponent(
    <DeckGLOverlay width={100} height={100} layers={[]} />
  );
  t.ok(component, 'WebGLOverlay is rendered.');
  t.end();
});

/* eslint-disable no-unused-vars */
import test from 'tape-catch';
import React from 'react';
import utils from 'react-addons-test-utils';

import 'luma.gl/headless';

import DeckGL from '../../../react';

test('Rendering DeckGL overlay', t => {
  const component = utils.renderIntoDocument(
    <DeckGL width={100} height={100} layers={[]} />
  );
  t.ok(component, 'WebGLOverlay is rendered.');
  t.end();
});

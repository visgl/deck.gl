import 'babel-polyfill';
/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import test from 'tape';
import utils from 'react-test-utils';

import {
  WebGLOverlay
} from '../src';

test('Test if unit test is working', assert => {
  assert.pass('yes it is');
  assert.end();
});

test('Rendering WebGLOverlay', assert => {
  const component = utils.renderComponent(
    <WebGLOverlay width={100} height={100} layers={[]} />
  );
  assert.ok(component, 'WebGLOverlay is rendered.');
  assert.end();
});

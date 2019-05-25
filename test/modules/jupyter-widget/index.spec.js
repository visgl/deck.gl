import '@jupyter-widgets/base';

import {DeckGLModel, DeckGLView} from '@deck.gl/jupyter-widget';
import {createTestModel} from './utils.spec';

import test from 'tape-catch';

test('DeckGLView should initialize', t => {
  const obj = new DeckGLView();
  t.ok(obj, 'DeckGLView initalized');
  t.end();
});

test('jupyter-widget should be createable', t => {
  const model = createTestModel(DeckGLModel);
  t.equal(typeof model, 'DeckGLModel');
  t.equal(model.get('json_input'), '');
  t.equal(model.get('mapbox_key'), '');
  t.equal(model.get('width'), 500);
  t.equal(model.get('height'), 500);
});

test('jupyter-widget should be creatable with a value', t => {
  const state = {
    mapbox_key: 'fake-key',
    json_input: '{mock_input: 1}'
  };
  const model = createTestModel(DeckGLModel, state);
  t.equal(typeof model, 'DeckGLModel');
  t.equal(model.get('json_input'), state.json_input);
  t.equal(model.get('mapbox_key'), state.mapbox_key);
  t.equal(model.get('width'), 500);
  t.equal(model.get('height'), 500);
});

import test from 'tape-catch';

function getDeckModel(state) {
  // Require at runtime, after the environment is polyfilled
  const {DeckGLModel} = require('@deck.gl/jupyter-widget');
  const {createTestModel} = require('./utils.spec');

  const model = createTestModel(DeckGLModel, state);
  return model;
}

test('jupyter-widget should be createable', t => {
  const model = getDeckModel({});
  t.deepEquals(model.get('json_input'), null, 'json_input should be null');
  t.equal(model.get('mapbox_key'), null, 'mapbox_key should be null');
  t.equal(model.get('width'), 500, 'default width should be specified');
  t.equal(model.get('height'), 500, 'default height should be specified');
  t.end();
});

test('jupyter-widget should be creatable with a value', t => {
  const state = {
    mapbox_key: 'fake-key',
    json_input: '{mock_input: 1}'
  };
  const model = getDeckModel(state);
  t.equal(model.get('json_input'), state.json_input, 'json_input should be pre-configured');
  t.equal(model.get('mapbox_key'), state.mapbox_key, 'mapbox_key should be pre-configured');
  t.equal(model.get('width'), 500, 'width should be the default');
  t.equal(model.get('height'), 500, 'height should be the default');
  t.end();
});

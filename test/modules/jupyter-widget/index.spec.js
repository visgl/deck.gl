import test from 'tape-catch';

function getDeckModel(state) {
  // Require at runtime, after the environment is polyfilled
  try {
    const {DeckGLModel} = require('@deck.gl/jupyter-widget');
    const {createTestModel} = require('./mock-widget-base');

    const model = createTestModel(DeckGLModel, state);
    return model;
  } catch (error) {
    // Work around: jupyter-widget is built as an AMD module
    // it cannot be imported under Node
    if (error.message === "Cannot read property 'widget_manager' of undefined") {
      return null;
    }
    throw error;
  }
}

// TODO re-activate test
test.skip('jupyter-widget should be createable', t => {
  const model = getDeckModel({});
  if (model) {
    t.deepEquals(model.get('json_input'), null, 'json_input should be null');
    t.equal(model.get('mapbox_key'), null, 'mapbox_key should be null');
    t.equal(model.get('width'), '100%', 'default width should be specified');
    t.equal(model.get('height'), 500, 'default height should be specified');
  } else {
    t.comment('AMD module import is skipped in dist mode');
  }
  t.end();
});

// TODO re-activate test
test.skip('jupyter-widget should be creatable with a value', t => {
  const state = {
    mapbox_key: 'fake-key',
    json_input: '{mock_input: 1}'
  };
  const model = getDeckModel(state);
  if (model) {
    t.equal(model.get('json_input'), state.json_input, 'json_input should be pre-configured');
    t.equal(model.get('mapbox_key'), state.mapbox_key, 'mapbox_key should be pre-configured');
    t.equal(model.get('width'), '100%', 'width should be the default');
    t.equal(model.get('height'), 500, 'height should be the default');
  } else {
    t.comment('AMD module import is skipped in dist mode');
  }
  t.end();
});

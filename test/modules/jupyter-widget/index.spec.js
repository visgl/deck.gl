import test from 'tape-promise/tape';

import {JupyterTransportModel} from '@deck.gl/jupyter-widget';
import {createTestModel} from './mock-widget-base';
import {VERSION} from '@deck.gl/core';

function getDeckModel(state) {
  // Require at runtime, after the environment is polyfilled
  try {
    const model = createTestModel(JupyterTransportModel, state);
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

test('jupyter-widget getters should be properly configured', t => {
  t.equal(JupyterTransportModel.model_module, '@deck.gl/jupyter-widget');
  t.equal(JupyterTransportModel.model_module_version, VERSION);
  t.equal(JupyterTransportModel.view_module, '@deck.gl/jupyter-widget');
  t.equal(JupyterTransportModel.view_module_version, VERSION);
  t.equal(JupyterTransportModel.model_name, 'JupyterTransportModel');
  t.equal(JupyterTransportModel.view_name, 'JupyterTransportView');
  t.end();
});

test('jupyter-widget should be createable', t => {
  const model = getDeckModel({});
  if (!model) {
    // Skip browser test
    t.end();
    return;
  }
  t.deepEquals(model.get('json_input'), null, 'json_input should be null');
  t.deepEquals(model.get('data_buffer'), null, 'data buffer should be null');
  t.equal(model.get('mapbox_key'), null, 'mapbox_key should be null');
  t.equal(model.get('width'), '100%', 'default width should be specified');
  t.equal(model.get('height'), 500, 'default height should be specified');
  t.deepEquals(model.get('selected_data'), [], 'default selected data should be specified');
  t.end();
});

test('jupyter-widget should be creatable with a value', t => {
  const state = {
    mapbox_key: 'fake-key',
    json_input: '{mock_input: 1}'
  };
  const model = getDeckModel(state);
  if (!model) {
    // Skip browser test
    t.end();
    return;
  }
  t.equal(model.get('json_input'), state.json_input, 'json_input should be pre-configured');
  t.equal(model.get('mapbox_key'), state.mapbox_key, 'mapbox_key should be pre-configured');
  t.equal(model.get('width'), '100%', 'width should be the default');
  t.equal(model.get('height'), 500, 'height should be the default');
  t.end();
});

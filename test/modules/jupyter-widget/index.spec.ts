// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

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

test('jupyter-widget getters should be properly configured', () => {
  expect(JupyterTransportModel.model_module).toBe('@deck.gl/jupyter-widget');
  expect(JupyterTransportModel.model_module_version).toBe(VERSION);
  expect(JupyterTransportModel.view_module).toBe('@deck.gl/jupyter-widget');
  expect(JupyterTransportModel.view_module_version).toBe(VERSION);
  expect(JupyterTransportModel.model_name).toBe('JupyterTransportModel');
  expect(JupyterTransportModel.view_name).toBe('JupyterTransportView');
});

test('jupyter-widget should be createable', () => {
  const model = getDeckModel({});
  if (!model) {
    // Skip browser test
    return;
  }
  expect(model.get('json_input'), 'json_input should be null').toEqual(null);
  expect(model.get('data_buffer'), 'data buffer should be null').toEqual(null);
  expect(model.get('mapbox_key'), 'mapbox_key should be null').toBe(null);
  expect(model.get('width'), 'default width should be specified').toBe('100%');
  expect(model.get('height'), 'default height should be specified').toBe(500);
  expect(model.get('selected_data'), 'default selected data should be specified').toEqual([]);
});

test('jupyter-widget should be creatable with a value', () => {
  const state = {
    mapbox_key: 'fake-key',
    json_input: '{mock_input: 1}'
  };
  const model = getDeckModel(state);
  if (!model) {
    // Skip browser test
    return;
  }
  expect(model.get('json_input'), 'json_input should be pre-configured').toBe(state.json_input);
  expect(model.get('mapbox_key'), 'mapbox_key should be pre-configured').toBe(state.mapbox_key);
  expect(model.get('width'), 'width should be the default').toBe('100%');
  expect(model.get('height'), 'height should be the default').toBe(500);
});

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// eslint-disable-next-line
/* global document, window, global */
import {test, expect, describe} from 'vitest';

import {CompositeLayer} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {addCustomLibraries, jsonConverter} from '@deck.gl/jupyter-widget/playground/create-deck';

class DemoCompositeLayer extends CompositeLayer {
  renderLayers() {
    return new ScatterplotLayer(this.props);
  }
}

describe('jupyter-widget: dynamic-registration', () => {
  test('null customLibrares', () => {
    const returnValue = addCustomLibraries(null, () => {});
    expect(!returnValue, 'No custom libraries returns null').toBeTruthy();
  });

  test('addCustomLibraries', () => {
    const TEST_LIBRARY_NAME = 'DemoLibrary';
    window[TEST_LIBRARY_NAME] = {DemoCompositeLayer};

    const onComplete = () => {
      const props = jsonConverter.convert({
        layers: [{'@@type': 'DemoCompositeLayer', data: []}]
      });
      expect(
        props.layers[0] instanceof DemoCompositeLayer,
        'Should add new class to the converter'
      ).toBeTruthy();
      // cleanup
      delete window[TEST_LIBRARY_NAME];
    };

    addCustomLibraries(
      [
        {
          libraryName: TEST_LIBRARY_NAME,
          resourceUri: '/index.js'
        }
      ],
      onComplete
    );
  });
});

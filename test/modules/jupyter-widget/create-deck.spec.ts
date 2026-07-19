// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// eslint-disable-next-line
/* global document, window, global */
import {test, expect, describe} from 'vitest';

import {CompositeLayer, LayerExtension, _GlobeView as GlobeView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {DataFilterExtension, MaskExtension} from '@deck.gl/extensions';
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

describe('jupyter-widget: extensions-registration', () => {
  test('resolves extension @@type to LayerExtension instances', () => {
    const props = jsonConverter.convert({
      dataFilter: {'@@type': 'DataFilterExtension', filterSize: 1},
      mask: {'@@type': 'MaskExtension'}
    });

    expect(
      props.dataFilter instanceof LayerExtension,
      'DataFilterExtension resolves to a LayerExtension'
    ).toBeTruthy();
    expect(
      props.dataFilter instanceof DataFilterExtension,
      'DataFilterExtension resolves to the concrete class'
    ).toBeTruthy();
    expect(
      props.mask instanceof LayerExtension,
      'MaskExtension resolves to a LayerExtension'
    ).toBeTruthy();
    expect(
      props.mask instanceof MaskExtension,
      'MaskExtension resolves to the concrete class'
    ).toBeTruthy();
  });

  test('layer survives and hydrates its extensions', () => {
    // Regression: adding an extension used to drop the whole layer because the
    // extension class was not registered in the widget's JSONConverter catalog.
    const props = jsonConverter.convert({
      layers: [
        {
          '@@type': 'ScatterplotLayer',
          data: [],
          extensions: [{'@@type': 'DataFilterExtension', filterSize: 1}]
        }
      ]
    });

    expect(props.layers[0] instanceof ScatterplotLayer, 'Layer is not dropped').toBeTruthy();
    const [extension] = props.layers[0].props.extensions;
    expect(
      extension instanceof DataFilterExtension,
      'Layer extension is hydrated into a class instance'
    ).toBeTruthy();
  });
});

describe('jupyter-widget: view aliases', () => {
  test('GlobeView canonical alias', () => {
    const props = jsonConverter.convert({
      views: [{'@@type': 'GlobeView', id: 'globe', controller: true}]
    });
    expect(
      props.views[0] instanceof GlobeView,
      'GlobeView @@type hydrates into a GlobeView instance'
    ).toBeTruthy();
  });

  test('_GlobeView experimental name still works', () => {
    const props = jsonConverter.convert({
      views: [{'@@type': '_GlobeView', id: 'globe', controller: true}]
    });
    expect(
      props.views[0] instanceof GlobeView,
      '_GlobeView @@type remains registered for back-compat'
    ).toBeTruthy();
  });
});

// eslint-disable-next-line
/* global document, window, global */
import test from 'tape-catch';

import {CompositeLayer} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {addCustomLibraries, jsonConverter} from '@deck.gl/jupyter-widget/playground/create-deck';

class DemoCompositeLayer extends CompositeLayer {
  renderLayers() {
    return new ScatterplotLayer(this.props);
  }
}

test('jupyter-widget: dynamic-registration', t => {
  t.test('null customLibrares', t0 => {
    const returnValue = addCustomLibraries(null, () => {});
    t0.ok(!returnValue, 'No custom libraries returns null');
    t0.end();
  });

  t.test('addCustomLibraries', t1 => {
    const TEST_LIBRARY_NAME = 'DemoLibrary';
    window[TEST_LIBRARY_NAME] = {DemoCompositeLayer};

    const onComplete = () => {
      const props = jsonConverter.convert({
        layers: [{'@@type': 'DemoCompositeLayer', data: []}]
      });
      t1.ok(props.layers[0] instanceof DemoCompositeLayer, 'Should add new class to the converter');
      // cleanup
      delete window[TEST_LIBRARY_NAME];
      t1.end();
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

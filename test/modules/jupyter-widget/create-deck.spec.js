// eslint-disable-next-line
/* global document, window, global */
import test from 'tape-catch';

import {CompositeLayer} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

class DemoCompositeLayer extends CompositeLayer {
  renderLayers() {
    return new ScatterplotLayer(this.props);
  }
}

test('jupyter-widget: dynamic-registration', t0 => {
  let module;
  try {
    module = require('@deck.gl/jupyter-widget/create-deck');
  } catch (error) {
    t0.comment('dist mode, skipping dynamic registration tests');
    t0.end();
    return;
  }

  t0.test('loadExternalLibrary', t => {
    const TEST_LIBRARY_NAME = 'DemoLibrary';
    window[TEST_LIBRARY_NAME] = {DemoCompositeLayer};
    const onComplete = () => {
      const props = module.jsonConverter.convert({
        layers: [{'@@type': 'DemoCompositeLayer', data: []}]
      });
      t.ok(props.layers[0] instanceof DemoCompositeLayer, 'Should add new class to the converter');
      // cleanup
      delete window[TEST_LIBRARY_NAME];
      t.end();
    };
    module.loadExternalLibrary(
      {
        libraryName: TEST_LIBRARY_NAME,
        resourceUri: '/index.js',
        onComplete
      },
      () => Promise.resolve()
    );
  });

  t0.end();
});

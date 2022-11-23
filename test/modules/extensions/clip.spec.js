import test from 'tape-promise/tape';
import {ClipExtension} from '@deck.gl/extensions';
import {GeoJsonLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils';

import {geojson} from 'deck.gl-test/data';

test('ClipExtension#clipByInstance', t => {
  const checkLayer = (layer, expectedClipByInstance) => {
    t.is(
      layer.state.clipByInstance,
      expectedClipByInstance,
      `${layer.constructor.layerName} clipByInstance prop: ${layer.props.clipByInstance} actual: ${expectedClipByInstance}`
    );
  };

  const testCases = [
    {
      props: {
        id: 'clipByInstance:default',
        data: geojson,
        stroked: false,
        extensions: [new ClipExtension()]
      },
      onAfterUpdate: ({subLayers}) => {
        for (const layer of subLayers) {
          if (layer.id.includes('points')) {
            checkLayer(layer, true);
          } else {
            checkLayer(layer, false);
          }
        }
      }
    },
    {
      updateProps: {
        id: 'clipByInstance:true',
        clipByInstance: true
      },
      onAfterUpdate: ({subLayers}) => {
        for (const layer of subLayers) {
          checkLayer(layer, true);
        }
      }
    },
    {
      updateProps: {
        id: 'clipByInstance:false',
        clipByInstance: false
      },
      onAfterUpdate: ({subLayers}) => {
        for (const layer of subLayers) {
          checkLayer(layer, false);
        }
      }
    }
  ];

  testLayer({Layer: GeoJsonLayer, testCases, onError: t.notOk});

  t.end();
});

// deck.gl, MIT license

import test from 'tape-promise/tape';
import {generateLayerTests, testLayerAsync} from '@deck.gl/test-utils';
import {_WMSLayer as WMSLayer} from '@deck.gl/geo-layers';

test.skip('WMSLayer', async t => {
  const testCases = generateLayerTests({
    Layer: WMSLayer,
    sampleProps: {
      data: 'https://ows.terrestris.de/osm/service',
      serviceType: 'wms',
      layers: ['OSM-WMS']
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title)
  });
  await testLayerAsync({Layer: WMSLayer, testCases, onError: t.notOk});
  t.end();
});

import test from 'tape-catch';
import {Fp64Extension} from '@deck.gl/extensions';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {testInitializeLayer} from '@deck.gl/test-utils';

test('Fp64Extension', t => {
  const layer = new ScatterplotLayer({
    id: 'fp64-test',
    data: [
      {position: [-122.453, 37.782], timestamp: 120, entry: 13567, exit: 4802},
      {position: [-122.454, 37.781], timestamp: 140, entry: 14475, exit: 5493}
    ],
    getPosition: d => d.position,
    coordinateSystem: COORDINATE_SYSTEM.LNGLAT_DEPRECATED,
    extensions: [new Fp64Extension()]
  });

  testInitializeLayer({layer, onError: t.notOk});

  layer._finalize();

  t.end();
});

import test from 'tape-promise/tape';
import spatialjsonToBinary from '@deck.gl/carto/layers/schema/spatialjson-utils';

test.only('Spatialjson to binary', async t => {
  const spatial = [
    {id: '48e62966eaffffff', properties: {stringProp: 'abc', floatProp: 123.45, intProp: 12345}}
  ];
  const expected = {
    scheme: 'h3',
    cells: {
      indices: {value: new BigUint64Array(1234n), size: 1},
      numericProps: {
        floatProp: {value: new Float32Array(123, 45), size: 1},
        intProp: {value: new Int32Array(12345), size: 1}
      },
      properties: [{data: [{key: 'stringProp', value: 'abc'}]}]
    }
  };

  t.deepEqual(spatialjsonToBinary(spatial), expected, 'Spatialjson is converted to binary');
  t.end();
});

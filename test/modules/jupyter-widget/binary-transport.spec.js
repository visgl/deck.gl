import test from 'tape-catch';
import {deserializeMatrix} from '@deck.gl/jupyter-widget/lib/utils/deserialize-matrix';
import {jsonConverter} from '@deck.gl/jupyter-widget/playground/create-deck';
import {processDataBuffer} from '@deck.gl/jupyter-widget/playground/playground';

const DEMO_ARRAY = new Uint32Array([0, 10, 2, 20]);

const DEMO_VALUE = new DataView(DEMO_ARRAY.buffer, DEMO_ARRAY.byteOffset, DEMO_ARRAY.byteLength);

const EXAMPLE_TRANSFER = {
  'layer-id': {
    length: 2,
    attributes: {
      getPosition: {
        value: DEMO_VALUE,
        size: 2,
        dtype: 'uint32'
      }
    }
  }
};

const EXPECTED_CONVERSION = {
  'layer-id': {
    length: 2,
    attributes: {
      getPosition: {
        value: DEMO_ARRAY,
        size: 2,
        dtype: 'uint32'
      }
    }
  }
};

test('jupyter-widget: binary-transport', t0 => {
  t0.test('deserializeMatrix', t => {
    const TEST_TABLE = [
      {input: null, expected: null, msg: 'Null arr should produce null output'},
      {
        input: EXAMPLE_TRANSFER,
        expected: EXPECTED_CONVERSION,
        msg: 'Should convert DataView and dtype to TypedArray'
      }
    ];

    for (const testCase of TEST_TABLE) {
      t.deepEquals(
        deserializeMatrix(testCase.input),
        testCase.expected,
        `deserializeMatrix: ${testCase.msg}`
      );
    }
    t.end();
  });

  // Test deck.gl JSON configuration
  const DEMO_JSON_PROPS = {
    viewport: null,
    description: 'Test JSON config, converted into a deck.gl Layer before testing',
    layers: [
      {
        radius: 100,
        id: 'layer-id',
        '@@type': 'ScatterplotLayer'
      }
    ]
  };

  t0.test('processDataBuffer', t => {
    const newDeckProps = processDataBuffer({
      binary: EXPECTED_CONVERSION,
      convertedJson: jsonConverter.convert(DEMO_JSON_PROPS)
    });

    t.deepEquals(
      newDeckProps.layers[0].props.data,
      EXPECTED_CONVERSION['layer-id'],
      'should convert buffer input and props to new layers'
    );
    t.end();
  });
});

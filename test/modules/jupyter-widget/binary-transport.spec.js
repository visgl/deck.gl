import test from 'tape-catch';

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

// Test deck.gl JSON configuration
const DEMO_JSON_PROPS = {
  viewport: null,
  description: 'test json config',
  layers: [
    {
      radius: 100,
      id: 'layer-id',
      '@@type': 'ScatterplotLayer'
    }
  ]
};

test('jupyter-widget: binary-transport', t0 => {
  let binaryTransportModule;
  try {
    binaryTransportModule = require('@deck.gl/jupyter-widget/binary-transport');
  } catch (error) {
    t0.comment('dist mode, skipping binary-transport tests');
    t0.end();
    return;
  }

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
        binaryTransportModule.deserializeMatrix(testCase.input),
        testCase.expected,
        `deserializeMatrix: ${testCase.msg}`
      );
    }
    t.end();
  });

  t0.test('processDataBuffer', t => {
    const newProps = binaryTransportModule.processDataBuffer({
      dataBuffer: EXPECTED_CONVERSION,
      jsonProps: DEMO_JSON_PROPS
    });

    t.deepEquals(
      EXPECTED_CONVERSION['layer-id'],
      newProps.layers[0].data,
      'should convert buffer input and props to new layers'
    );
    t.end();
  });
});

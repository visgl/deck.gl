import test from 'tape-catch';

test('jupyter-widget: binary-transport', t0 => {
  let binaryTransportModule;
  try {
    binaryTransportModule = require('@deck.gl/jupyter-widget/binary-transport');
  } catch (error) {
    t0.comment('dist mode, skipping tooltip tests');
    t0.end();
    return;
  }
  const EXPECTED_DATA_PROP = {length: 5, attributes: {value: new Int32Array(), size: 2}};

  const EXAMPLE_TRANSFER = {
    'xxxx-layer-id': {
      getPosition: {
        layer_id: 'xxxx-layer-id',
        column_name: 'dataVectorName',
        matrix: {
          data: DataView(),
          shape: [5, 2],
          dtype: 'int32'
        }
      }
    }
  };

  const EXPECTED_CONVERSION = {
    'xxxx-layer-id': {
      accessorFuncName: {
        layer_id: 'xxxx-layer-id',
        column_name: 'dataVectorName',
        matrix: {
          data: new Int32Array(),
          shape: [5, 2]
        }
      }
    }
  };

  t0.test('deserializeMatrix', t => {
    const TEST_TABLE = [
      {input: null, expected: null, msg: 'Null arr should produce null output'},
      {
        input: EXAMPLE_TRANSFER,
        expected: EXPECTED_CONVERSION,
        msg: 'Test conversion of DataView to TypedArray'
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

  t0.test('constructDataProp', t => {
    const dataProp = binaryTransportModule.constructDataProp(EXPECTED_CONVERSION, 'xxxx-layer-id');
    t.deepEquals(dataProp, EXPECTED_DATA_PROP, 'Should create properly shaped data prop');
    t.end();
  });

  t0.test('processDataBuffer', t => {
    const DEMO_PROPS = {radius: 100, '@@type': 'ScatterplotLayer'};
    const convertedJsonProps = binaryTransportModule.processDataBuffer({
      dataBuffer: EXPECTED_CONVERSION,
      jsonProps: DEMO_PROPS
    });
    t.deepEquals(
      convertedJsonProps.layers[0].data,
      EXPECTED_DATA_PROP,
      'should convert buffer input and props to new layers'
    );
    t.deepEquals(convertedJsonProps.layers[0].id, 'xxxx-layer-id', 'should use specified layer ID');
    t.end();
  });
});

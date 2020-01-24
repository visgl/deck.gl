import test from 'tape-catch';

function getDataView() {
  const t = new Uint32Array([0, 10, 2, 20]);
  const dv = new DataView(t.buffer, t.byteOffset, t.byteLength);
  return dv;
}

test('jupyter-widget: binary-transport', t0 => {
  let binaryTransportModule;
  try {
    binaryTransportModule = require('@deck.gl/jupyter-widget/binary-transport');
  } catch (error) {
    t0.comment('dist mode, skipping binary-transport tests');
    t0.end();
    return;
  }
  const EXPECTED_DATA_PROP = {
    length: 2,
    attributes: {getPosition: {size: 2, value: new Uint32Array([0, 10, 2, 20])}}
  };

  const EXAMPLE_TRANSFER = {
    payload: [
      {
        layer_id: 'testing-layer-id',
        column_name: 'dataVectorName',
        accessor_name: 'getPosition',
        matrix: {
          data: getDataView(),
          shape: [2, 2],
          dtype: 'uint32'
        }
      }
    ]
  };

  const EXPECTED_CONVERSION = {
    'testing-layer-id': {
      getPosition: {
        layerId: 'testing-layer-id',
        accessorName: 'getPosition',
        columnName: 'dataVectorName',
        matrix: {
          data: new Uint32Array([0, 10, 2, 20]),
          shape: [2, 2]
        }
      }
    }
  };

  const DEMO_JSON_PROPS = {
    layers: [{radius: 100, id: 'testing-layer-id', '@@type': 'ScatterplotLayer'}]
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

  t0.test('processDataBuffer', t => {
    const convertedJsonProps = binaryTransportModule.processDataBuffer({
      dataBuffer: EXPECTED_CONVERSION,
      jsonProps: DEMO_JSON_PROPS
    });
    t.deepEquals(
      convertedJsonProps.layers[0].props.data,
      EXPECTED_DATA_PROP,
      'should convert buffer input and props to new layers'
    );
    t.deepEquals(
      convertedJsonProps.layers[0].id,
      'testing-layer-id',
      'Should create specified layer'
    );
    t.end();
  });
});

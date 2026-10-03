// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {deserializeMatrix} from '@deck.gl/jupyter-widget/lib/utils/deserialize-matrix';
import {jsonConverter} from '@deck.gl/jupyter-widget/playground/create-deck';
import {processDataBuffer} from '@deck.gl/jupyter-widget/lib/widget-utils';

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

describe('jupyter-widget: binary-transport', () => {
  test('deserializeMatrix', () => {
    const TEST_TABLE = [
      {input: null, expected: null, msg: 'Null arr should produce null output'},
      {
        input: EXAMPLE_TRANSFER,
        expected: EXPECTED_CONVERSION,
        msg: 'Should convert DataView and dtype to TypedArray'
      }
    ];

    for (const testCase of TEST_TABLE) {
      expect(deserializeMatrix(testCase.input), `deserializeMatrix: ${testCase.msg}`).toEqual(
        testCase.expected
      );
    }
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

  test('processDataBuffer', () => {
    const newDeckProps = processDataBuffer({
      binary: EXPECTED_CONVERSION,
      convertedJson: jsonConverter.convert(DEMO_JSON_PROPS)
    });

    expect(
      newDeckProps.layers[0].props.data,
      'should convert buffer input and props to new layers'
    ).toEqual(EXPECTED_CONVERSION['layer-id']);
  });

  test('deserializeMatrix honors DataView byteOffset', () => {
    const buffer = new ArrayBuffer(8 + 16);
    new Float32Array(buffer, 8, 4).set([1, 2, 3, 4]);
    const converted = deserializeMatrix({
      'layer-id': {
        length: 2,
        attributes: {getPosition: {value: new DataView(buffer, 8, 16), size: 2, dtype: 'float32'}}
      }
    });
    const {value} = converted['layer-id'].attributes.getPosition;
    expect(value).toBeInstanceOf(Float32Array);
    expect(Array.from(value)).toEqual([1, 2, 3, 4]);
  });

  test('deserializeMatrix does not mutate its input and is idempotent', () => {
    const input = {
      'layer-id': {
        length: 2,
        attributes: {getPosition: {value: DEMO_VALUE, size: 2, dtype: 'uint32'}}
      }
    };
    const first = deserializeMatrix(input);
    expect(input['layer-id'].attributes.getPosition.value).toBe(DEMO_VALUE);
    const again = deserializeMatrix(first);
    expect(again).toEqual(EXPECTED_CONVERSION);
  });

  test('processDataBuffer keeps layers without binary data', () => {
    const props = processDataBuffer({
      binary: EXPECTED_CONVERSION,
      convertedJson: jsonConverter.convert({
        layers: [
          {id: 'layer-id', '@@type': 'ScatterplotLayer'},
          {id: 'other-layer', '@@type': 'ScatterplotLayer', data: [{position: [0, 0]}]}
        ]
      })
    });
    expect(props.layers[0].props.data).toEqual(EXPECTED_CONVERSION['layer-id']);
    expect(props.layers[1].props.data).toEqual([{position: [0, 0]}]);
  });
});

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
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
});

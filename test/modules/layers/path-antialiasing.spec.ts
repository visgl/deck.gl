// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer} from '@deck.gl/test-utils/vitest';
import {PathLayer} from '@deck.gl/layers';

const PATH_DATA = [
  {
    path: [
      [-122.45, 37.78],
      [-122.44, 37.79],
      [-122.43, 37.78]
    ]
  }
];

test('PathLayer#antialiasing uniform', () => {
  testLayer({
    Layer: PathLayer,
    onError: error => expect(error, error?.message).toBeFalsy(),
    testCases: [
      {
        props: {
          data: PATH_DATA,
          getPath: d => d.path
        },
        onAfterUpdate: ({layer}) => {
          const {path} = layer.getModels()[0].shaderInputs.getUniformValues();
          expect(path.antialiasing, 'antialiasing defaults to false').toBeFalsy();
        }
      },
      {
        updateProps: {antialiasing: true},
        onAfterUpdate: ({layer}) => {
          const {path} = layer.getModels()[0].shaderInputs.getUniformValues();
          expect(path.antialiasing, 'antialiasing is passed to the shader').toBe(true);
        }
      },
      {
        updateProps: {antialiasing: false},
        onAfterUpdate: ({layer}) => {
          const {path} = layer.getModels()[0].shaderInputs.getUniformValues();
          expect(path.antialiasing, 'antialiasing can be turned back off').toBeFalsy();
        }
      }
    ]
  });
});

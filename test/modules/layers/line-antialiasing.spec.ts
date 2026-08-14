// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer} from '@deck.gl/test-utils/vitest';
import {LineLayer} from '@deck.gl/layers';

const LINE_DATA = [{sourcePosition: [-122.45, 37.78], targetPosition: [-122.44, 37.79]}];

test('LineLayer#antialiasing uniform', () => {
  testLayer({
    Layer: LineLayer,
    onError: error => expect(error, error?.message).toBeFalsy(),
    testCases: [
      {
        props: {data: LINE_DATA},
        onAfterUpdate: ({layer}) => {
          const {line} = layer.getModels()[0].shaderInputs.getUniformValues();
          expect(line.antialiasing, 'antialiasing defaults to false').toBeFalsy();
        }
      },
      {
        updateProps: {antialiasing: true},
        onAfterUpdate: ({layer}) => {
          const {line} = layer.getModels()[0].shaderInputs.getUniformValues();
          expect(line.antialiasing, 'antialiasing is passed to the shader').toBeTruthy();
        }
      },
      {
        // wrapLongitude issues a second draw call with useShortestPath: -1 - make sure the
        // antialiasing flag survives that prop override
        updateProps: {wrapLongitude: true},
        onAfterUpdate: ({layer}) => {
          const {line} = layer.getModels()[0].shaderInputs.getUniformValues();
          expect(line.antialiasing, 'antialiasing survives the wrapLongitude draw').toBeTruthy();
        }
      }
    ]
  });
});

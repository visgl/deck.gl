// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer} from '@deck.gl/test-utils/vitest';
import {ArcLayer} from '@deck.gl/layers';

const ARC_DATA = [{sourcePosition: [-122.45, 37.78], targetPosition: [-122.44, 37.79]}];

test('ArcLayer#antialiasing uniform', () => {
  testLayer({
    Layer: ArcLayer,
    onError: error => expect(error, error?.message).toBeFalsy(),
    testCases: [
      {
        props: {data: ARC_DATA},
        onAfterUpdate: ({layer}) => {
          const {arc} = layer.getModels()[0].shaderInputs.getUniformValues();
          expect(arc.antialiasing, 'antialiasing defaults to false').toBeFalsy();
        }
      },
      {
        updateProps: {antialiasing: true},
        onAfterUpdate: ({layer}) => {
          const {arc} = layer.getModels()[0].shaderInputs.getUniformValues();
          expect(arc.antialiasing, 'antialiasing is passed to the shader').toBeTruthy();
        }
      }
    ]
  });
});

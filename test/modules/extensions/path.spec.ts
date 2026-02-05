// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {PathStyleExtension} from '@deck.gl/extensions';
import {PathLayer, PolygonLayer} from '@deck.gl/layers';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils/vitest';

import * as FIXTURES from 'deck.gl-test/data';

test('PathStyleExtension#PathLayer', () => {
  const testCases = [
    {
      props: {
        id: 'path-extension-test',
        data: FIXTURES.zigzag,
        getPath: d => d.path,
        getDashArray: [0, 0],
        getOffset: 0,
        extensions: [new PathStyleExtension({highPrecisionDash: true, offset: true})]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.dashAlignMode, 'has dashAlignMode uniform').toBe(0);
        const attributes = layer.getAttributeManager().getAttributes();
        expect(
          attributes.instanceDashArrays.value,
          'instanceDashArrays attribute is populated'
        ).toEqual([0, 0]);
        expect(attributes.instanceOffsets.value, 'instanceOffsets attribute is populated').toEqual([
          0
        ]);

        let dashOffsetValid = true;
        let i;
        for (i = 0; i < FIXTURES.zigzag[0].path.length - 2; i++) {
          dashOffsetValid =
            dashOffsetValid &&
            attributes.instanceDashOffsets.value[i] <= attributes.instanceDashOffsets.value[i + 1];
        }
        dashOffsetValid = dashOffsetValid && attributes.instanceDashOffsets.value[i + 1] === 0;

        expect(dashOffsetValid, 'instanceDashOffsets attribute is populated').toBeTruthy();
      }
    },
    {
      updateProps: {
        dashJustified: true,
        getDashArray: d => [3, 1],
        getOffset: d => 0.5,
        updateTriggers: {
          getDashArray: 1,
          getOffset: 1
        }
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.dashAlignMode, 'has dashAlignMode uniform').toBe(1);
        const attributes = layer.getAttributeManager().getAttributes();
        expect(
          attributes.instanceDashArrays.value.slice(0, 4),
          'instanceDashArrays attribute is populated'
        ).toEqual([3, 1, 3, 1]);
        expect(
          attributes.instanceOffsets.value.slice(0, 4),
          'instanceOffsets attribute is populated'
        ).toEqual([0.5, 0.5, 0.5, 0.5]);
      }
    }
  ];

  testLayer({Layer: PathLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('PathStyleExtension#PolygonLayer', () => {
  const testCases = [
    {
      props: {
        id: 'path-extension-test',
        data: FIXTURES.polygons,
        getPolygon: d => d,
        stroke: true,
        getDashArray: [0, 0],
        extensions: [new PathStyleExtension({dash: true})]
      },
      onAfterUpdate: ({subLayers}) => {
        const pathLayer = subLayers.find(l => l.id.endsWith('stroke'));
        const uniforms = getLayerUniforms(pathLayer);
        expect(uniforms.dashAlignMode, 'has dashAlignMode uniform').toBe(0);
        expect(
          pathLayer.getAttributeManager().getAttributes().instanceDashArrays.value,
          'instanceDashArrays attribute is populated'
        ).toBeTruthy();
      }
    },
    {
      updateProps: {
        dashJustified: true,
        getDashArray: d => [3, 1]
      },
      onAfterUpdate: ({subLayers}) => {
        const pathLayer = subLayers.find(l => l.id.endsWith('stroke'));
        const uniforms = getLayerUniforms(pathLayer);
        expect(uniforms.dashAlignMode, 'has dashAlignMode uniform').toBe(1);
        expect(
          pathLayer.getAttributeManager().getAttributes().instanceDashArrays.value,
          'instanceDashArrays attribute is populated'
        ).toBeTruthy();
      }
    }
  ];

  testLayer({Layer: PolygonLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

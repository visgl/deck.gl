// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {PathStyleExtension} from '@deck.gl/extensions';
import {
  PathLayer,
  PolygonLayer,
  ScatterplotLayer,
  _TextBackgroundLayer as TextBackgroundLayer
} from '@deck.gl/layers';
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

test('PathStyleExtension#ScatterplotLayer', () => {
  const testCases = [
    {
      props: {
        id: 'scatterplot-extension-test',
        data: FIXTURES.points.slice(0, 3),
        getPosition: d => d.COORDINATES,
        getRadius: 10,
        stroked: true,
        filled: true,
        getDashArray: d => [3, 2],
        extensions: [new PathStyleExtension({dash: true})]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.dashGapPickable, 'has dashGapPickable uniform').toBeFalsy();
        const attributes = layer.getAttributeManager().getAttributes();
        expect(attributes.instanceDashArrays, 'instanceDashArrays attribute exists').toBeTruthy();
        expect(
          attributes.instanceDashArrays.value.slice(0, 4),
          'instanceDashArrays attribute is populated'
        ).toEqual([3, 2, 3, 2]);
      }
    },
    {
      updateProps: {
        dashGapPickable: true,
        getDashArray: d => [5, 1],
        updateTriggers: {
          getDashArray: 1
        }
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.dashGapPickable, 'dashGapPickable is true').toBeTruthy();
        const attributes = layer.getAttributeManager().getAttributes();
        expect(
          attributes.instanceDashArrays.value.slice(0, 4),
          'instanceDashArrays attribute updated'
        ).toEqual([5, 1, 5, 1]);
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('PathStyleExtension#TextBackgroundLayer', () => {
  const TEXT_BG_DATA = [
    {position: [0, 0], bounds: [-50, -25, 100, 50], dashArray: [4, 2]},
    {position: [1, 1], bounds: [-30, -15, 60, 30], dashArray: [4, 2]}
  ];

  const testCases = [
    {
      props: {
        id: 'text-bg-extension-test',
        data: TEXT_BG_DATA,
        getPosition: d => d.position,
        getBoundingRect: d => d.bounds,
        getLineWidth: 2,
        getDashArray: d => d.dashArray,
        extensions: [new PathStyleExtension({dash: true})]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.dashGapPickable, 'has dashGapPickable uniform').toBeFalsy();
        const attributes = layer.getAttributeManager().getAttributes();
        expect(attributes.instanceDashArrays, 'instanceDashArrays attribute exists').toBeTruthy();
        expect(
          attributes.instanceDashArrays.value.slice(0, 4),
          'instanceDashArrays attribute is populated'
        ).toEqual([4, 2, 4, 2]);
      }
    },
    {
      updateProps: {
        dashGapPickable: true,
        getDashArray: d => [2, 3],
        updateTriggers: {
          getDashArray: 1
        }
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.dashGapPickable, 'dashGapPickable is true').toBeTruthy();
        const attributes = layer.getAttributeManager().getAttributes();
        expect(
          attributes.instanceDashArrays.value.slice(0, 4),
          'instanceDashArrays attribute updated'
        ).toEqual([2, 3, 2, 3]);
      }
    }
  ];

  testLayer({Layer: TextBackgroundLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

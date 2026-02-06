// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {StrokeStyleExtension} from '@deck.gl/extensions';
import {ScatterplotLayer, TextBackgroundLayer} from '@deck.gl/layers';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils';

import * as FIXTURES from 'deck.gl-test/data';

test('StrokeStyleExtension#ScatterplotLayer', t => {
  const testCases = [
    {
      props: {
        id: 'stroke-style-extension-test',
        data: FIXTURES.points,
        getPosition: d => d.COORDINATES,
        getRadius: d => d.SPACES || 1,
        stroked: true,
        filled: true,
        getDashArray: [0, 0],
        extensions: [new StrokeStyleExtension({dash: true})]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        t.is(uniforms.dashGapPickable, false, 'has dashGapPickable uniform');
        const attributes = layer.getAttributeManager().getAttributes();
        t.ok(attributes.instanceDashArrays, 'instanceDashArrays attribute exists');
        t.deepEqual(
          attributes.instanceDashArrays.value.slice(0, 2),
          [0, 0],
          'instanceDashArrays attribute is populated'
        );
      }
    },
    {
      updateProps: {
        dashGapPickable: true,
        getDashArray: d => [3, 1],
        updateTriggers: {
          getDashArray: 1
        }
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        t.is(uniforms.dashGapPickable, true, 'dashGapPickable uniform is updated');
        const attributes = layer.getAttributeManager().getAttributes();
        t.deepEqual(
          attributes.instanceDashArrays.value.slice(0, 2),
          [3, 1],
          'instanceDashArrays attribute is updated'
        );
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: t.notOk});

  t.end();
});

test('StrokeStyleExtension#TextBackgroundLayer', t => {
  const textBackgroundData = [
    {position: [0, 0], text: 'Hello'},
    {position: [1, 1], text: 'World'}
  ];

  const testCases = [
    {
      props: {
        id: 'stroke-style-text-background-test',
        data: textBackgroundData,
        getPosition: d => d.position,
        getBoundingRect: () => [0, 0, 100, 20],
        getLineWidth: 2,
        getDashArray: [4, 2],
        extensions: [new StrokeStyleExtension({dash: true})]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        t.is(uniforms.dashGapPickable, false, 'has dashGapPickable uniform');
        const attributes = layer.getAttributeManager().getAttributes();
        t.ok(attributes.instanceDashArrays, 'instanceDashArrays attribute exists');
        t.deepEqual(
          attributes.instanceDashArrays.value.slice(0, 2),
          [4, 2],
          'instanceDashArrays attribute is populated'
        );
      }
    },
    {
      updateProps: {
        dashGapPickable: true,
        getDashArray: d => [2, 1],
        updateTriggers: {
          getDashArray: 1
        }
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        t.is(uniforms.dashGapPickable, true, 'dashGapPickable uniform is updated');
        const attributes = layer.getAttributeManager().getAttributes();
        t.deepEqual(
          attributes.instanceDashArrays.value.slice(0, 2),
          [2, 1],
          'instanceDashArrays attribute is updated'
        );
      }
    }
  ];

  testLayer({Layer: TextBackgroundLayer, testCases, onError: t.notOk});

  t.end();
});

test('StrokeStyleExtension#layer type detection', t => {
  const extension = new StrokeStyleExtension({dash: true});

  // Create mock layer objects
  const scatterplotLayer = {
    constructor: {name: 'ScatterplotLayer'},
    props: {radiusScale: 1}
  };

  const textBackgroundLayer = {
    constructor: {name: 'TextBackgroundLayer'},
    props: {getBoundingRect: () => [0, 0, 100, 20]}
  };

  const unsupportedLayer = {
    constructor: {name: 'OtherLayer'},
    props: {someOtherProp: true}
  };

  t.is(
    extension.isEnabled(scatterplotLayer as any),
    true,
    'isEnabled returns true for ScatterplotLayer'
  );
  t.is(
    extension.isEnabled(textBackgroundLayer as any),
    true,
    'isEnabled returns true for TextBackgroundLayer'
  );
  t.is(
    extension.isEnabled(unsupportedLayer as any),
    false,
    'isEnabled returns false for unsupported layers'
  );

  t.end();
});

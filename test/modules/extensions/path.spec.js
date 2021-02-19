import test from 'tape-catch';
import {PathStyleExtension} from '@deck.gl/extensions';
import {PathLayer, PolygonLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils';

import * as FIXTURES from 'deck.gl-test/data';

test('PathStyleExtension#PathLayer', t => {
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
        const uniforms = layer.state.model.getUniforms();
        t.is(uniforms.dashAlignMode, 0, 'has dashAlignMode uniform');
        const attributes = layer.getAttributeManager().getAttributes();
        t.deepEqual(
          attributes.instanceDashArrays.value,
          [0, 0],
          'instanceDashArrays attribute is populated'
        );
        t.deepEqual(
          attributes.instanceOffsets.value,
          [0],
          'instanceOffsets attribute is populated'
        );

        let dashOffsetValid = true;
        let i;
        for (i = 0; i < FIXTURES.zigzag[0].path.length - 2; i++) {
          dashOffsetValid =
            dashOffsetValid &&
            attributes.instanceDashOffsets.value[i] <= attributes.instanceDashOffsets.value[i + 1];
        }
        dashOffsetValid = dashOffsetValid && attributes.instanceDashOffsets.value[i + 1] === 0;

        t.ok(dashOffsetValid, 'instanceDashOffsets attribute is populated');
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
        const uniforms = layer.state.model.getUniforms();
        t.is(uniforms.dashAlignMode, 1, 'has dashAlignMode uniform');
        const attributes = layer.getAttributeManager().getAttributes();
        t.deepEqual(
          attributes.instanceDashArrays.value.slice(0, 4),
          [3, 1, 3, 1],
          'instanceDashArrays attribute is populated'
        );
        t.deepEqual(
          attributes.instanceOffsets.value.slice(0, 4),
          [0.5, 0.5, 0.5, 0.5],
          'instanceOffsets attribute is populated'
        );
      }
    }
  ];

  testLayer({Layer: PathLayer, testCases, onError: t.notOk});

  t.end();
});

test('PathStyleExtension#PolygonLayer', t => {
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
        const uniforms = pathLayer.state.model.getUniforms();
        t.is(uniforms.dashAlignMode, 0, 'has dashAlignMode uniform');
        t.ok(
          pathLayer.getAttributeManager().getAttributes().instanceDashArrays.value,
          'instanceDashArrays attribute is populated'
        );
      }
    },
    {
      updateProps: {
        dashJustified: true,
        getDashArray: d => [3, 1]
      },
      onAfterUpdate: ({subLayers}) => {
        const pathLayer = subLayers.find(l => l.id.endsWith('stroke'));
        const uniforms = pathLayer.state.model.getUniforms();
        t.is(uniforms.dashAlignMode, 1, 'has dashAlignMode uniform');
        t.ok(
          pathLayer.getAttributeManager().getAttributes().instanceDashArrays.value,
          'instanceDashArrays attribute is populated'
        );
      }
    }
  ];

  testLayer({Layer: PolygonLayer, testCases, onError: t.notOk});

  t.end();
});

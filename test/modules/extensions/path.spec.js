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
        extensions: [new PathStyleExtension({dash: true})]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = layer.state.model.getUniforms();
        t.is(uniforms.dashAlignMode, 0, 'has dashAlignMode uniform');
        t.ok(
          layer.getAttributeManager().getAttributes().instanceDashArrays.value,
          'instanceDashArrays attribute is populated'
        );
      }
    },
    {
      updateProps: {
        dashJustified: true,
        getDashArray: d => [3, 1]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = layer.state.model.getUniforms();
        t.is(uniforms.dashAlignMode, 1, 'has dashAlignMode uniform');
        t.ok(
          layer.getAttributeManager().getAttributes().instanceDashArrays.value,
          'instanceDashArrays attribute is populated'
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

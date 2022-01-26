import test from 'tape-promise/tape';
import {MaskExtension} from '@deck.gl/extensions';
import {ScatterplotLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils';

test('MaskExtension', t => {
  const testCases = [
    {
      props: {
        id: 'mask-extension-test',
        data: [],
        stroked: true,
        filled: true,
        extensions: [new MaskExtension()],
        maskId: 'mask',

        // simulate MaskEffect parameters
        maskMap: {},
        maskChannels: {
          mask: {
            index: 0,
            bounds: [0, 10, 5, 20]
          }
        }
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = layer.getModels()[0].getUniforms();
        t.ok(uniforms.mask_enabled, 'mask_enabled in uniforms');
        t.ok(uniforms.mask_maskByInstance, 'mask_maskByInstance in uniforms');
        t.ok(uniforms.mask_bounds.every(Number.isFinite), 'mask_bounds in uniforms');
      }
    },
    {
      updateProps: {
        maskId: 'mask2'
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = layer.getModels()[0].getUniforms();
        t.notOk(uniforms.mask_enabled, 'mask disabled for invalid maskId');
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: t.notOk});

  t.end();
});

test('MaskExtension#maskByInstance', t => {
  // ScatterPlot infers maskByInstance to true, SolidPolygonLayer to false
  const testCases = [
    {Layer: ScatterplotLayer, expectedMaskByInstance: true},
    {Layer: ScatterplotLayer, props: {maskByInstance: true}, expectedMaskByInstance: true},
    {Layer: ScatterplotLayer, props: {maskByInstance: false}, expectedMaskByInstance: false},
    {Layer: SolidPolygonLayer, expectedMaskByInstance: false},
    {Layer: SolidPolygonLayer, props: {maskByInstance: true}, expectedMaskByInstance: true},
    {Layer: SolidPolygonLayer, props: {maskByInstance: false}, expectedMaskByInstance: false}
  ];

  for (const {Layer, props, expectedMaskByInstance} of testCases) {
    const testCase = {
      props: {
        id: 'mask-extension-test',
        data: [],
        extensions: [new MaskExtension()],
        maskMap: {},
        maskBounds: [0, 10, 5, 20],
        ...props
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = layer.getModels()[0].getUniforms();
        t.is(
          uniforms.mask_maskByInstance,
          expectedMaskByInstance,
          `${Layer.layerName}(${
            props ? JSON.stringify(props) : ''
          }) mask_maskByInstance set correctly`
        );
      }
    };
    testLayer({Layer, testCases: [testCase], onError: t.notOk});
  }

  t.end();
});

// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {MaskExtension} from '@deck.gl/extensions';
import {ScatterplotLayer, GeoJsonLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils';

import {geojson} from 'deck.gl-test/data';

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
            bounds: [0, 10, 5, 20],
            coordinateOrigin: [0, 0, 0],
            coordinateSystem: -1
          }
        }
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = layer.getModels()[0].uniforms;
        t.ok(uniforms.mask_enabled, 'mask_enabled in uniforms');
        t.equal(uniforms.mask_inverted, false, 'mask_inverted defaults to false in uniforms');
        t.ok(uniforms.mask_maskByInstance, 'mask_maskByInstance in uniforms');
        t.ok(uniforms.mask_bounds.every(Number.isFinite), 'mask_bounds in uniforms');
      }
    },
    {
      updateProps: {
        maskInverted: true
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = layer.getModels()[0].uniforms;
        t.ok(uniforms.mask_inverted, 'mask_inverted true in uniforms');
      }
    },
    {
      updateProps: {
        maskId: 'mask2'
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = layer.getModels()[0].uniforms;
        t.notOk(uniforms.mask_enabled, 'mask disabled for invalid maskId');
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: t.notOk});

  t.end();
});

test('MaskExtension#maskByInstance', t => {
  const checkLayer = (layer, expectedMaskByInstance) => {
    const uniforms = layer.getModels()[0].uniforms;
    t.is(
      uniforms.mask_maskByInstance,
      expectedMaskByInstance,
      `${layer.constructor.layerName} maskByInstance prop: ${layer.props.maskByInstance} actual: ${expectedMaskByInstance}`
    );
  };

  const testCases = [
    {
      props: {
        id: 'maskByInstance:default',
        data: geojson,
        stroked: false,
        extensions: [new MaskExtension()]
      },
      onAfterUpdate: ({subLayers}) => {
        for (const layer of subLayers) {
          if (layer.id.includes('points')) {
            checkLayer(layer, true);
          } else {
            checkLayer(layer, false);
          }
        }
      }
    },
    {
      updateProps: {
        id: 'maskByInstance:true',
        maskByInstance: true
      },
      onAfterUpdate: ({subLayers}) => {
        for (const layer of subLayers) {
          checkLayer(layer, true);
        }
      }
    },
    {
      updateProps: {
        id: 'maskByInstance:false',
        maskByInstance: false
      },
      onAfterUpdate: ({subLayers}) => {
        for (const layer of subLayers) {
          checkLayer(layer, false);
        }
      }
    }
  ];

  testLayer({Layer: GeoJsonLayer, testCases, onError: t.notOk});

  t.end();
});

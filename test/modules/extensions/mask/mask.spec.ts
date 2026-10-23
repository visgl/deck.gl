// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {LayerManager, WebMercatorViewport} from '@deck.gl/core';
import {Matrix4} from '@math.gl/core';
import {createTestViewport} from '../../core/viewports/test-crs';
import {MaskExtension} from '@deck.gl/extensions';
import {ScatterplotLayer, GeoJsonLayer} from '@deck.gl/layers';
import {testLayer, device} from '@deck.gl/test-utils/vitest';

import {geojson} from 'deck.gl-test/data';

test('MaskExtension', () => {
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
        const uniforms = layer.getModels()[0].uniforms;
        expect(uniforms.mask_enabled, 'mask_enabled in uniforms').toBeTruthy();
        expect(uniforms.mask_inverted, 'mask_inverted defaults to false in uniforms').toBe(false);
        expect(uniforms.mask_maskByInstance, 'mask_maskByInstance in uniforms').toBeTruthy();
        expect(uniforms.mask_bounds.every(Number.isFinite), 'mask_bounds in uniforms').toBeTruthy();
      }
    },
    {
      updateProps: {
        maskInverted: true
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = layer.getModels()[0].uniforms;
        expect(uniforms.mask_inverted, 'mask_inverted true in uniforms').toBeTruthy();
      }
    },
    {
      updateProps: {
        maskId: 'mask2'
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = layer.getModels()[0].uniforms;
        expect(uniforms.mask_enabled, 'mask disabled for invalid maskId').toBeFalsy();
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('MaskExtension#maskByInstance', () => {
  const checkLayer = (layer, expectedMaskByInstance) => {
    const uniforms = layer.getModels()[0].uniforms;
    expect(
      uniforms.mask_maskByInstance,
      `${layer.constructor.layerName} maskByInstance prop: ${layer.props.maskByInstance} actual: ${expectedMaskByInstance}`
    ).toBe(expectedMaskByInstance);
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

  testLayer({Layer: GeoJsonLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test.each([
  new WebMercatorViewport({longitude: 30, latitude: 40, zoom: 8}),
  new WebMercatorViewport({longitude: 30, latitude: 40, zoom: 14}),
  createTestViewport({longitude: 30, latitude: 40, zoom: 4})
])('MaskExtension aligns viewport bounds with the receiving shader', viewport => {
  const manager = new LayerManager(device, {viewport});
  const layer = new ScatterplotLayer({
    data: [],
    maskId: 'mask',
    coordinateSystem: 'meter-offsets',
    coordinateOrigin: [10, 20, 0],
    modelMatrix: new Matrix4().scale([2, 3, 4])
  });
  try {
    manager.setLayers([layer]);
    const setProps = vi.spyOn(layer, 'setShaderModuleProps');
    new MaskExtension().draw.call(layer, {
      context: layer.context,
      shaderModuleProps: {
        project: {viewport, ...layer.props, sourceCrs: layer.internalState!.sourceCrs},
        mask: {maskChannels: {mask: {index: 0, bounds: [11, 21, 12, 22]}}}
      }
    });
    const origin = viewport.projectPosition([10, 20, 0]);
    const lower = viewport.projectPosition([11, 21, 0]);
    const upper = viewport.projectPosition([12, 22, 0]);
    expect(setProps.mock.lastCall![0].mask.bounds).toEqual([
      lower[0] - origin[0],
      lower[1] - origin[1],
      upper[0] - origin[0],
      upper[1] - origin[1]
    ]);
  } finally {
    manager.finalize();
    vi.restoreAllMocks();
  }
});

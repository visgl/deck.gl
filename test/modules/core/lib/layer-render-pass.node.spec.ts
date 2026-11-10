// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {Layer, LayerExtension, LayerManager, Viewport} from '@deck.gl/core';
import {NullDevice} from '@luma.gl/core/test-utils';

class TestLayer extends Layer {
  static layerName = 'TestLayer';
  initializeState() {}
}

for (const failure of [null, 'extension', 'layer']) {
  test(`Layer restores render-pass parameters after ${failure || 'successful'} draw`, () => {
    const device = new NullDevice({});
    const manager = new LayerManager(device, {viewport: new Viewport()});
    const renderPass = device.beginRenderPass({
      parameters: {blendConstant: [0.1, 0.2, 0.3, 0.4], viewport: [0, 0, 10, 10]}
    });
    const original = renderPass.getParameters();
    const blendConstant: [number, number, number, number] = [1, 0, 0, 1];
    const extension = new LayerExtension();
    const extensionDraw = vi.spyOn(extension, 'draw').mockImplementation(() => {
      expect(renderPass.getParameters().blendConstant).toEqual(blendConstant);
      renderPass.setParameters({scissorRect: [1, 1, 2, 2]});
      if (failure === 'extension') throw new Error('draw failed');
    });
    const layer = new TestLayer({extensions: [extension]});
    const layerDraw = vi.spyOn(layer, 'draw').mockImplementation(() => {
      expect(renderPass.getParameters().blendConstant).toEqual(blendConstant);
      renderPass.setParameters({viewport: [1, 1, 2, 2]});
      if (failure === 'layer') throw new Error('draw failed');
    });
    try {
      manager.setLayers([layer]);
      const originalProps = layer.props;
      const draw = () =>
        layer._drawLayer({
          renderPass,
          shaderModuleProps: null,
          uniforms: {},
          parameters: {blendConstant}
        });
      if (failure) {
        expect(draw).toThrow('draw failed');
      } else {
        draw();
      }
      expect(extensionDraw).toHaveBeenCalledOnce();
      expect(layerDraw).toHaveBeenCalledTimes(failure === 'extension' ? 0 : 1);
      expect(renderPass.getParameters()).toEqual(original);
      expect(layer.props).toBe(originalProps);
    } finally {
      manager.finalize();
      renderPass.end();
      device.destroy();
    }
  });
}

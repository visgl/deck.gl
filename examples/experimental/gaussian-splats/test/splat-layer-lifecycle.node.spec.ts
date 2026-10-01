// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {beforeEach, describe, expect, it, vi} from 'vitest';
import {OrbitViewport, WebMercatorViewport} from '@deck.gl/core';

const sceneMocks = vi.hoisted(() => ({
  construct: vi.fn(),
  update: vi.fn(),
  destroy: vi.fn(),
  prepare: vi.fn(),
  draw: vi.fn()
}));

vi.mock('../splat-layer/rad-scene', () => ({
  RADScene: class {
    renderer = {
      prepare: sceneMocks.prepare,
      draw: sceneMocks.draw,
      stats: {activeRowCount: 0}
    };
    update = sceneMocks.update;
    destroy = sceneMocks.destroy;

    constructor(device: object, options: object) {
      sceneMocks.construct(device, options);
    }
  }
}));

import SplatLayer from '../splat-layer/splat-layer';

function makeLayer(
  props: Partial<ConstructorParameters<typeof SplatLayer>[0]> = {},
  deviceType = 'webgpu'
) {
  const layer = new SplatLayer({id: 'splats', data: 'scene.rad', ...props});
  const viewport = new OrbitViewport({id: 'main', width: 800, height: 600});
  const addDefaultEffect = vi.fn();
  const unsubscribe = vi.fn();
  const commandEncoder = {};
  const device = {
    type: deviceType,
    commandEncoder,
    canvasContext: {cssToDeviceRatio: () => 1.5}
  };
  layer.context = {
    device,
    viewport,
    deck: {_addDefaultEffect: addDefaultEffect},
    resourceManager: {unsubscribe}
  } as never;
  layer.state = {};
  return {layer, viewport, device, commandEncoder, addDefaultEffect, unsubscribe};
}

describe('SplatLayer host lifecycle', () => {
  beforeEach(() => {
    for (const mock of Object.values(sceneMocks)) mock.mockReset();
    sceneMocks.prepare.mockReturnValue(false);
  });

  it('requires WebGPU, registers preparation, and rejects unsupported layer props', () => {
    const unsupportedDevice = makeLayer({}, 'webgl').layer;
    expect(() => unsupportedDevice.initializeState()).toThrow('SplatLayer requires WebGPU.');

    const {layer, addDefaultEffect} = makeLayer();
    layer.initializeState();
    expect(addDefaultEffect).toHaveBeenCalledWith(
      expect.objectContaining({id: 'splat-preparation', useInPicking: false})
    );
    const currentProps = {...layer.props, coordinateSystem: 'default', extensions: []};

    for (const props of [
      {...currentProps, pickable: true},
      {...currentProps, extensions: [{}]},
      {...currentProps, coordinateSystem: 'lnglat'}
    ]) {
      expect(() => layer.updateState({props, oldProps: currentProps} as never)).toThrow(
        'Prototype SplatLayer supports Cartesian drawing without picking or extensions.'
      );
    }
    expect(sceneMocks.construct).not.toHaveBeenCalled();
  });

  it('constructs, reuses, replaces, and finalizes its RAD scene with host budgets', () => {
    const {layer, device, unsubscribe} = makeLayer({
      maxActiveSplats: 100,
      maxResidentSplats: 400,
      maxConcurrentLoads: 2
    });
    const currentProps = {...layer.props, coordinateSystem: 'default', extensions: []};
    layer.updateState({props: currentProps, oldProps: {...currentProps, data: ''}} as never);
    expect(sceneMocks.construct).toHaveBeenCalledWith(
      device,
      expect.objectContaining({
        data: 'scene.rad',
        maxActiveSplats: 100,
        maxResidentSplats: 400,
        maxConcurrentLoads: 2
      })
    );

    layer.updateState({props: currentProps, oldProps: currentProps} as never);
    expect(sceneMocks.construct).toHaveBeenCalledTimes(1);
    expect(sceneMocks.destroy).not.toHaveBeenCalled();

    const nextProps = {...currentProps, maxResidentSplats: 800};
    layer.updateState({props: nextProps, oldProps: currentProps} as never);
    expect(sceneMocks.destroy).toHaveBeenCalledTimes(1);
    expect(sceneMocks.construct).toHaveBeenCalledTimes(2);
    expect(sceneMocks.construct).toHaveBeenLastCalledWith(
      device,
      expect.objectContaining({maxResidentSplats: 800})
    );

    layer.finalizeState();
    expect(sceneMocks.destroy).toHaveBeenCalledTimes(2);
    expect(unsubscribe).toHaveBeenCalledWith({consumerId: 'splats'});
  });

  it('prepares once per viewport and draws only into the matching render pass', () => {
    const {layer, viewport, commandEncoder} = makeLayer();
    const currentProps = {...layer.props, coordinateSystem: 'default', extensions: []};
    layer.updateState({props: currentProps, oldProps: {...currentProps, data: ''}} as never);
    layer.prepare(viewport, 2);
    expect(sceneMocks.update).toHaveBeenCalledWith(
      expect.objectContaining({viewportSize: [1600, 1200]}),
      1,
      expect.any(Number)
    );
    expect(sceneMocks.prepare).toHaveBeenCalledWith(commandEncoder);
    expect(layer.state.preparedViewportId).toBe('main');

    const renderPass = {};
    layer.draw({renderPass} as never);
    expect(sceneMocks.draw).toHaveBeenCalledWith(renderPass);
    layer.context.viewport = new OrbitViewport({id: 'other', width: 800, height: 600});
    layer.draw({renderPass} as never);
    expect(sceneMocks.draw).toHaveBeenCalledTimes(1);

    const geospatial = new WebMercatorViewport({id: 'map', width: 800, height: 600});
    expect(() => layer.prepare(geospatial, 1)).toThrow(
      'Prototype SplatLayer requires a Cartesian viewport.'
    );
  });

  it('skips picking and filtered layers, uses the canvas ratio, and rejects multiple viewports', () => {
    const {layer, viewport, addDefaultEffect} = makeLayer();
    layer.initializeState();
    const effect = addDefaultEffect.mock.calls[0][0] as {
      preRender: (options: object) => void;
    };
    const prepare = vi.spyOn(layer, 'prepare').mockImplementation(() => {});
    const baseOptions = {
      layers: [layer],
      viewports: [viewport],
      canvasContext: {cssToDeviceRatio: () => 2.5}
    };

    effect.preRender({...baseOptions, isPicking: true});
    effect.preRender({...baseOptions, isPicking: false, layerFilter: () => false});
    expect(prepare).not.toHaveBeenCalled();

    effect.preRender({...baseOptions, isPicking: false, layerFilter: () => true});
    expect(prepare).toHaveBeenCalledWith(viewport, 2.5);

    const second = new OrbitViewport({id: 'second', width: 400, height: 300});
    expect(() =>
      effect.preRender({
        ...baseOptions,
        isPicking: false,
        layerFilter: () => true,
        viewports: [viewport, second]
      })
    ).toThrow('Prototype SplatLayer supports one viewport per layer.');
  });
});

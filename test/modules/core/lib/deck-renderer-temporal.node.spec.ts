// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {NullDevice} from '@luma.gl/core/test-utils';
import {Texture} from '@luma.gl/core';
import type {CanvasContext} from '@luma.gl/core';
import {Viewport, log} from '@deck.gl/core';
import DeckRenderer from '@deck.gl/core/lib/deck-renderer';
import type {Effect} from '@deck.gl/core/lib/effect';
import type {LayersPassRenderOptions} from '@deck.gl/core/passes/layers-pass';

test('DeckRenderer temporal activation, history, picking and buffer reuse', () => {
  const device = new NullDevice({});
  const createFramebuffer = device.createFramebuffer.bind(device);
  vi.spyOn(device, 'createFramebuffer').mockImplementation(props => {
    const framebuffer = createFramebuffer(props);
    // NullDevice does not initialize attachments; exercise the shared framebuffer implementation.
    (framebuffer as any).autoCreateAttachmentTextures();
    return framebuffer;
  });
  const renderer = new DeckRenderer(device);
  vi.spyOn(renderer.drawLayersPass, 'render').mockReturnValue([]);
  vi.spyOn(renderer.pickLayersPass, 'render').mockReturnValue({
    stats: [],
    decodePickingColor: null
  });
  const frames: LayersPassRenderOptions[] = [];
  const effect: Effect = {
    id: 'temporal-test',
    props: {},
    setup() {},
    cleanup() {},
    preRender(opts) {
      expect(opts.temporal?.depthTexture ?? null).toBeNull();
      expect(opts.temporal?.velocityTexture ?? null).toBeNull();
    },
    postRender(opts) {
      frames.push(opts);
      return opts.inputBuffer;
    }
  };
  const canvasContext = {
    getDrawingBufferSize: () => [80, 40],
    cssToDeviceRatio: () => 2,
    getCurrentFramebuffer: () => null
  } as unknown as CanvasContext;
  const options = {
    pass: 'screen',
    layers: [],
    viewports: [new Viewport({id: 'main', width: 40, height: 20})],
    views: {},
    effects: [effect],
    onViewportActive() {},
    canvasContext
  };
  const props = {layerFilter: null, drawPickingColors: false};
  renderer.renderLayers(options);
  expect(frames[0].temporal).toBeUndefined();
  expect(frames[0].shaderModuleProps).toBeUndefined();
  const oldBuffer = (frames[0] as any).inputBuffer;
  expect(oldBuffer.width).toBe(80);
  expect(oldBuffer.depthStencilAttachment).toBeFalsy();
  renderer.setProps({...props, _temporal: {renderScale: 0.5}});
  expect(renderer.needsRedraw()).toBe('_temporal changed');
  renderer.renderLayers(options);
  const frame = frames[1].temporal!;
  expect(frame.renderSize).toEqual([40, 20]);
  expect(frame.outputSize).toEqual([80, 40]);
  expect(frame.phaseCount).toBe(32);
  expect(frame.reset).toBe(true);
  expect(frame.depthTexture!.props.usage & Texture.SAMPLE).toBeTruthy();
  expect(frame.velocityTexture).toBeNull();
  // The scene passes read `temporal`. The shared module props stay as they were, so that
  // auxiliary passes of effects do not inherit the jitter or the render scale.
  expect(frames[1].shaderModuleProps).toBeUndefined();
  expect(frame.jitterClip[0]).toBeCloseTo((2 * frame.jitter[0]) / 40, 15);
  expect(frame.jitterClip[1]).toBeCloseTo((-2 * frame.jitter[1]) / 20, 15);
  renderer.renderLayers(options);
  expect(frames[2].temporal!.reset).toBe(false);
  expect(frames[2].temporal!.jitter).not.toEqual(frame.jitter);
  expect(frames[2].temporal!.frameIndex).toBe(1);
  renderer.renderLayers({...options, isPicking: true});
  expect(frames[3].temporal).toBeUndefined();
  expect(frames[3].shaderModuleProps).toBeUndefined();
  expect((frames[3] as any).inputBuffer.width).toBe(80);
  renderer.renderLayers(options);
  expect(frames[4].temporal!.reset).toBe(true);
  renderer.setProps({...props, _temporal: {jitter: false, velocity: false}});
  renderer.renderLayers(options);
  expect(frames[5].temporal!.jitter).toEqual([0, 0]);
  expect(frames[5].temporal!.frameIndex).toBe(0);
  renderer.setProps({...props, _temporal: {jitter: false, velocity: false}});
  renderer.renderLayers(options);
  expect(frames[6].temporal!.reset).toBe(true);
  renderer.setProps({...props, _temporal: null});
  renderer.renderLayers(options);
  expect(frames[7].temporal).toBeUndefined();
  renderer.finalize();
  device.destroy();
});

test('DeckRenderer reuses sampleable external buffers and replaces unsampleable depth', () => {
  const device = new NullDevice({});
  const createFramebuffer = device.createFramebuffer.bind(device);
  vi.spyOn(device, 'createFramebuffer').mockImplementation(props => {
    const framebuffer = createFramebuffer(props);
    (framebuffer as any).autoCreateAttachmentTextures();
    return framebuffer;
  });
  const renderer = new DeckRenderer(device);
  vi.spyOn(renderer.drawLayersPass, 'render').mockReturnValue([]);
  const buffers = [0, 1].map(() =>
    device.createFramebuffer({
      width: 80,
      height: 40,
      colorAttachments: ['rgba8unorm'],
      depthStencilAttachment: device.preferredDepthFormat
    })
  );
  (renderer as any).renderBuffers = buffers;
  const frames: any[] = [];
  const effect: Effect = {
    id: 'test',
    props: {},
    setup() {},
    cleanup() {},
    preRender() {},
    postRender(opts) {
      frames.push(opts);
      return opts.inputBuffer;
    }
  };
  let width = 80;
  const options = {
    pass: 'screen',
    layers: [],
    viewports: [new Viewport({id: 'main', width: 80, height: 40})],
    views: {},
    effects: [effect],
    onViewportActive() {},
    canvasContext: {
      getDrawingBufferSize: () => [width, 40],
      cssToDeviceRatio: () => 1,
      getCurrentFramebuffer: () => null
    } as unknown as CanvasContext
  };
  renderer.setProps({layerFilter: null, drawPickingColors: false, _temporal: {renderScale: 0.5}});
  renderer.renderLayers(options);
  expect(frames[0].inputBuffer).toBe(buffers[0]);
  expect(buffers[0].width).toBe(40);
  expect(buffers[0].depthStencilAttachment!.texture.props.usage & Texture.SAMPLE).toBeTruthy();
  width = 100;
  renderer.renderLayers(options);
  expect(frames[1].temporal.reset).toBe(true);
  expect(frames[1].temporal.renderSize).toEqual([50, 20]);
  renderer.renderLayers({
    ...options,
    viewports: [new Viewport({id: 'other', width: 80, height: 40})]
  });
  expect(frames[2].temporal.reset).toBe(true);
  const unsampleable = device.createTexture({format: 'depth24plus', usage: Texture.RENDER});
  buffers[0].depthStencilAttachment = unsampleable.view;
  renderer.renderLayers(options);
  expect(frames[3].inputBuffer).not.toBe(frames[0].inputBuffer);
  renderer.finalize();
  unsampleable.destroy();
  device.destroy();
});

test('DeckRenderer requires post processing and viewports for temporal activation', () => {
  const device = new NullDevice({});
  const renderer = new DeckRenderer(device);
  const render = vi.spyOn(renderer.drawLayersPass, 'render').mockReturnValue([]);
  renderer.setProps({layerFilter: null, drawPickingColors: false, _temporal: {}});
  const options = {
    pass: 'screen',
    layers: [],
    viewports: [new Viewport({width: 80, height: 40})],
    views: {},
    effects: [],
    onViewportActive() {}
  };
  renderer.renderLayers(options);
  expect(render.mock.calls[0][0].temporal).toBeUndefined();
  renderer.renderLayers({...options, viewports: []});
  expect(render.mock.calls[1][0].temporal).toBeUndefined();
  renderer.finalize();
  device.destroy();
});

test('DeckRenderer temporal sizes follow an explicit target and round up', () => {
  const device = new NullDevice({});
  const createFramebuffer = device.createFramebuffer.bind(device);
  vi.spyOn(device, 'createFramebuffer').mockImplementation(props => {
    const framebuffer = createFramebuffer(props);
    (framebuffer as any).autoCreateAttachmentTextures();
    return framebuffer;
  });
  const renderer = new DeckRenderer(device);
  vi.spyOn(renderer.drawLayersPass, 'render').mockReturnValue([]);
  const frames: LayersPassRenderOptions[] = [];
  const effect: Effect = {
    id: 'test',
    props: {},
    setup() {},
    cleanup() {},
    preRender() {},
    postRender(opts) {
      frames.push(opts);
      return opts.inputBuffer;
    }
  };
  const options = {
    pass: 'screen',
    layers: [],
    viewports: [new Viewport({id: 'main', width: 81, height: 41})],
    views: {},
    effects: [effect],
    onViewportActive() {},
    canvasContext: {
      getDrawingBufferSize: () => [81, 41],
      cssToDeviceRatio: () => 1,
      getCurrentFramebuffer: () => null
    } as unknown as CanvasContext
  };
  renderer.setProps({layerFilter: null, drawPickingColors: false, _temporal: {renderScale: 0.75}});
  renderer.renderLayers(options);
  // 81 * 0.75 = 60.75 and 41 * 0.75 = 30.75: the target must contain the scaled viewport.
  expect(frames[0].temporal!.renderSize).toEqual([61, 31]);
  expect(frames[0].temporal!.outputSize).toEqual([81, 41]);
  const target = device.createFramebuffer({
    width: 200,
    height: 100,
    colorAttachments: ['rgba8unorm']
  });
  renderer.renderLayers({...options, target});
  expect(frames[1].temporal!.outputSize).toEqual([200, 100]);
  expect(frames[1].temporal!.renderSize).toEqual([150, 75]);
  renderer.finalize();
  device.destroy();
});

test('temporal targets retain independent counters, buffers, resize and overlap recovery', () => {
  const device = new NullDevice({});
  const renderer = new DeckRenderer(device);
  vi.spyOn(renderer.drawLayersPass, 'render').mockReturnValue([]);
  const createFramebuffer = device.createFramebuffer.bind(device);
  vi.spyOn(device, 'createFramebuffer').mockImplementation(props => {
    const buffer = createFramebuffer(props);
    (buffer as any).autoCreateAttachmentTextures();
    return buffer;
  });
  let width = 80;
  const context = () =>
    ({
      getDrawingBufferSize: () => [width, 40],
      cssToDeviceRatio: () => 1,
      getCurrentFramebuffer: () => null
    }) as unknown as CanvasContext;
  const a = context();
  const b = {...context(), getDrawingBufferSize: () => [120, 60]} as CanvasContext;
  const frames: any[] = [];
  const options = {
    pass: 'screen',
    layers: [],
    views: {},
    viewports: [new Viewport({id: 'main', width: 40, height: 20})],
    onViewportActive() {},
    effects: [
      {
        id: 'test',
        props: {},
        setup() {},
        cleanup() {},
        preRender() {},
        postRender(opts) {
          frames.push(opts);
          return opts.inputBuffer;
        }
      } as Effect
    ]
  };
  renderer.setProps({layerFilter: null, drawPickingColors: false, _temporal: {}});
  for (const canvasContext of [a, b, a, b]) renderer.renderLayers({...options, canvasContext});
  expect(frames.map(f => f.temporal.frameIndex)).toEqual([0, 0, 1, 1]);
  expect(frames.map(f => f.temporal.reset)).toEqual([true, true, false, false]);
  expect(frames[0].temporal.targetId).toBe(frames[2].temporal.targetId);
  expect(frames[0].temporal.targetId).not.toBe(frames[1].temporal.targetId);
  expect(frames[0].inputBuffer).toBe(frames[2].inputBuffer);
  expect(frames[0].inputBuffer).not.toBe(frames[1].inputBuffer);
  width = 100;
  renderer.renderLayers({...options, canvasContext: a});
  renderer.renderLayers({...options, canvasContext: b});
  expect(frames[4].temporal.reset).toBe(true);
  expect(frames[5].temporal.reset).toBe(false);
  const warn = vi.spyOn(log, 'warn');
  renderer.renderLayers({
    ...options,
    canvasContext: a,
    viewports: [...options.viewports, new Viewport({id: 'inset', x: 1, y: 1, width: 5, height: 5})]
  });
  expect(frames[6].temporal).toBeUndefined();
  // The same overlap in the next frame gives no second warning.
  renderer.renderLayers({
    ...options,
    canvasContext: a,
    viewports: [...options.viewports, new Viewport({id: 'inset', x: 1, y: 1, width: 5, height: 5})]
  });
  expect(frames[7].temporal).toBeUndefined();
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn.mock.calls[0][0]).toContain('main');
  expect(warn.mock.calls[0][0]).toContain('inset');
  warn.mockRestore();
  renderer.renderLayers({...options, canvasContext: a});
  expect(frames[8].temporal.reset).toBe(true);
  expect(frames[8].temporal.frameIndex).toBe(0);
  renderer.finalize();
  device.destroy();
});

test('default targets share canvas-sized buffers; picking never creates temporal state', () => {
  const device = new NullDevice({});
  const renderer = new DeckRenderer(device);
  vi.spyOn(renderer.drawLayersPass, 'render').mockReturnValue([]);
  vi.spyOn(renderer.pickLayersPass, 'render').mockReturnValue({
    stats: [],
    decodePickingColor: null
  });
  let width = 80;
  const pairs: any[] = [];
  const options = {
    pass: 'screen',
    layers: [],
    views: {},
    viewports: [new Viewport({width: 40, height: 20})],
    onViewportActive() {},
    canvasContext: {
      getDrawingBufferSize: () => [width, 40],
      cssToDeviceRatio: () => 1,
      getCurrentFramebuffer: () => null
    } as unknown as CanvasContext,
    effects: [
      {
        id: 'test',
        props: {},
        setup() {},
        cleanup() {},
        preRender() {},
        postRender(opts) {
          pairs.push([opts.inputBuffer, opts.swapBuffer]);
          expect([opts.inputBuffer.width, opts.inputBuffer.height]).toEqual([width, 40]);
          return opts.inputBuffer;
        }
      } as Effect
    ]
  };
  const targets = [20, 30].map(size =>
    device.createFramebuffer({
      width: size,
      height: size,
      colorAttachments: ['rgba8unorm']
    })
  );
  for (const target of [targets[0], targets[1], undefined, targets[0], undefined]) {
    renderer.renderLayers({...options, target});
    width += 10;
  }
  for (const pair of pairs) {
    expect(pair[0]).toBe(pairs[0][0]);
    expect(pair[1]).toBe(pairs[0][1]);
  }
  expect((renderer as any).targetStates.size).toBe(0);
  renderer.setProps({layerFilter: null, drawPickingColors: false, _temporal: {}});
  renderer.renderLayers({...options, target: targets[0], isPicking: true});
  expect((renderer as any).targetStates.size).toBe(0);
  renderer.setProps({layerFilter: null, drawPickingColors: true, _temporal: {}});
  renderer.renderLayers({...options, target: targets[1]});
  expect((renderer as any).targetStates.size).toBe(0);
  renderer.finalize();
  targets.forEach(target => target.destroy());
  device.destroy();
});

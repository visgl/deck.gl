// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {NullDevice} from '@luma.gl/core/test-utils';
import {Matrix4} from '@math.gl/core';
import {Viewport} from '@deck.gl/core';
import type {TemporalFrame} from '@deck.gl/core';
import VelocityPass from '@deck.gl/core/passes/velocity-pass';

test('VelocityPass assembles WGSL and updates per-viewport history and resources', () => {
  const device = new NullDevice({});
  // Exercise shader assembly and pass orchestration without a native GPU.
  Object.defineProperty(device, 'type', {value: 'webgpu'});
  Object.defineProperty(device, 'info', {value: {...device.info, shadingLanguage: 'wgsl'}});
  const createFramebuffer = device.createFramebuffer.bind(device);
  vi.spyOn(device, 'createFramebuffer').mockImplementation(props => {
    const framebuffer = createFramebuffer(props);
    (framebuffer as any).autoCreateAttachmentTextures();
    return framebuffer;
  });
  const depth = device.createTexture({format: 'depth32float', width: 8, height: 8});
  const frame: TemporalFrame = {
    frameIndex: 0,
    renderScale: 1,
    renderSize: [8, 8],
    outputSize: [8, 8],
    jitter: [0.25, -0.125],
    jitterClip: [0.0625, 0.03125],
    phaseCount: 8,
    depthTexture: depth,
    velocityTexture: null,
    reset: true
  };
  const viewports = [new Viewport({id: 'main', width: 8, height: 8})];
  const pass = new VelocityPass(device);
  const texture = pass.render(frame, viewports, 1)!;
  expect(texture.format).toBe('rgba16float');
  expect(texture.width).toBe(8);
  const setProps = vi.spyOn((pass as any).model.shaderInputs, 'setProps');
  frame.reset = false;
  pass.render(frame, viewports, 1);
  expect(setProps.mock.calls[0][0]).toMatchObject({
    velocity: {valid: 1, reprojection: new Matrix4()}
  });
  pass.render(frame, [new Viewport({id: 'main', width: 4, height: 8})], 1);
  expect(setProps.mock.calls[1][0]).toMatchObject({velocity: {valid: 0}});
  frame.reset = true;
  pass.render(frame, viewports, 1);
  expect(setProps.mock.calls[2][0]).toMatchObject({velocity: {valid: 0}});
  pass.delete();
  expect(texture.destroyed).toBe(true);
  depth.destroy();
  device.destroy();
});

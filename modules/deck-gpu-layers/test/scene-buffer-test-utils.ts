// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Layer, type LayerProps, type LayerContext} from '@deck.gl/core';
import {surfaceBuffer, type SceneBufferEffect} from '@deck.gl-community/gpu-layers';
import {Buffer, Texture, type Device, type RenderPass} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {expect} from 'vitest';

export class CaptureTestLayer extends Layer<LayerProps & {transparent?: boolean}> {
  static override layerName = 'CaptureTestLayer';
  declare state: {model: Model};
  override getAttributeManager() {
    return null;
  }
  override initializeState(): void {
    this.setState({
      model: new Model(this.context.device, {
        ...this.getShaders({
          source: this.props.transparent
            ? SOURCE.replace('0.3, 1.0', '0.1, 1.0').replace(
                '4.0, 0.5, 0.25, 1.0',
                '0.0, 0.5, 0.0, 0.5'
              )
            : SOURCE,
          modules: [surfaceBuffer]
        }),
        vertexCount: 3,
        parameters: {depthCompare: 'less-equal', depthWriteEnabled: true}
      })
    });
  }
  override getModels(): Model[] {
    return [this.state.model];
  }
  override draw({renderPass}: {renderPass: RenderPass}): void {
    this.state.model.draw(renderPass);
  }
  override finalizeState(context: LayerContext): void {
    this.state.model.destroy();
    super.finalizeState(context);
  }
}
const SOURCE = /* wgsl */ `
@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4<f32> {
  let positions = array<vec2<f32>, 3>(vec2<f32>(-1.0, -1.0), vec2<f32>(3.0, -1.0), vec2<f32>(-1.0, 3.0));
  return vec4<f32>(positions[index], 0.3, 1.0);
}
@fragment fn fragmentMain() -> @location(0) vec4<f32> {
  if (surfaceBuffer.enabled != 0) { return surfaceBuffer_encode(vec3<f32>(0.0, 0.0, 1.0), 0.25); }
  return vec4<f32>(4.0, 0.5, 0.25, 1.0);
}
`;

export async function waitUntil(
  predicate: () => boolean,
  errors: string[],
  progress?: () => void
): Promise<void> {
  const deadline = Date.now() + 10_000;
  while (!predicate() && Date.now() < deadline) {
    if (errors.length) throw new Error(errors.join('\n'));
    progress?.();
    await new Promise(resolve => requestAnimationFrame(resolve));
  }
  expect(predicate()).toBe(true);
  expect(errors).toEqual([]);
}

export async function readCapture(
  device: Device,
  effect: SceneBufferEffect,
  id: string,
  coordinate = [32, 32],
  velocity = false
): Promise<Float32Array> {
  const frame = effect.getFrame(id)!;
  const selection = effect.props.selection;
  const texture = device.createTexture({
    width: 1,
    height: 1,
    format: 'rgba32float',
    usage: Texture.RENDER | Texture.COPY_SRC
  });
  const framebuffer = device.createFramebuffer({width: 1, height: 1, colorAttachments: [texture]});
  const buffer = device.createBuffer({byteLength: 256, usage: Buffer.COPY_DST | Buffer.MAP_READ});
  const model = new Model(device, {
    source: /* wgsl */ `
@group(0) @binding(auto) var colorTexture: texture_2d<f32>;
@group(0) @binding(auto) var normalTexture: texture_2d<f32>;
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
${selection ? '@group(0) @binding(auto) var selectionTexture: texture_2d<f32>;' : ''}
${velocity ? '@group(0) @binding(auto) var velocityTexture: texture_2d<f32>;' : ''}
@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4<f32> {
  let positions = array<vec2<f32>, 3>(vec2<f32>(-1.0, -1.0), vec2<f32>(3.0, -1.0), vec2<f32>(-1.0, 3.0));
  return vec4<f32>(positions[index], 0.0, 1.0);
}
@fragment fn fragmentMain() -> @location(0) vec4<f32> {
  let coordinate = vec2<i32>(${coordinate[0]}, ${coordinate[1]});
  ${
    velocity
      ? 'return vec4f(textureLoad(velocityTexture, coordinate, 0).xy, 0.0, 1.0);'
      : `return vec4<f32>(textureLoad(colorTexture, coordinate, 0).r,
    textureLoad(normalTexture, coordinate, 0).a, textureLoad(depthTexture, coordinate, 0),
    ${selection ? 'textureLoad(selectionTexture, coordinate, 0).r' : '0.0'});`
  }

}
`,
    vertexCount: 3,
    bindings: {
      colorTexture: frame.buffer.colorTexture,
      normalTexture: frame.buffer.normalRoughnessTexture,
      depthTexture: frame.buffer.depthTexture,
      ...(velocity ? {velocityTexture: frame.buffer.velocityTexture} : {}),
      ...(selection ? {selectionTexture: frame.buffer.getExtraColorTexture('selection')} : {})
    }
  });
  try {
    const pass = device.beginRenderPass({framebuffer, clearColor: [0, 0, 0, 0]});
    expect(model.draw(pass)).toBe(true);
    pass.end();
    device.submit();
    pass.destroy();
    texture.readBuffer({width: 1, height: 1}, buffer);
    const values = await buffer.readAsync();
    return new Float32Array(values.buffer, values.byteOffset, 4).slice();
  } finally {
    model.destroy();
    framebuffer.destroy();
    texture.destroy();
    buffer.destroy();
  }
}

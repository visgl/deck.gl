// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device, RenderPass} from '@luma.gl/core';
import {ClipSpace} from '@luma.gl/engine';
import type {ShaderModule} from '@luma.gl/shaders';
import type {NumberArray4} from '@math.gl/core';

const maskedClear = {
  name: 'maskedClear',
  source: /* wgsl */ `
struct MaskedClearUniforms {
  color: vec4<f32>,
};
@group(0) @binding(auto) var<uniform> maskedClear: MaskedClearUniforms;
`,
  uniformTypes: {color: 'vec4<f32>'}
} as const satisfies ShaderModule<{color: NumberArray4}>;

/** Clears selected WebGPU color channels inside a caller-owned render pass. */
export class MaskedColorClear {
  private readonly model: ClipSpace;

  constructor(device: Device, color: NumberArray4) {
    this.model = new ClipSpace(device, {
      id: 'masked-color-clear',
      geometryType: 'triangle',
      modules: [maskedClear],
      source: /* wgsl */ `
@fragment
fn fragmentMain() -> @location(0) vec4<f32> {
  return maskedClear.color;
}
`
    });
    this.model.shaderInputs.setProps({maskedClear: {color: [...color]}});
  }

  /** Draws over the pass viewport and scissor, preserving unselected color channels. */
  draw(pass: RenderPass, colorMask: number): void {
    this.model.setParameters({
      colorMask,
      blend: false,
      depthWriteEnabled: false,
      depthCompare: 'always'
    });
    this.model.draw(pass);
  }

  destroy(): void {
    this.model.destroy();
  }
}

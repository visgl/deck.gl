import type {Device} from '@luma.gl/api';
import type {Framebuffer} from '@luma.gl/gltools';
import {normalizeShaderModule} from '@luma.gl/core';

import ScreenPass from '../passes/screen-pass';

import type {Effect, PostRenderOptions} from '../lib/effect';
import type {ShaderModule} from '../types/types';

export default class PostProcessEffect implements Effect {
  id: string;
  props: any;
  module: ShaderModule;
  passes?: ScreenPass[];

  constructor(module: ShaderModule, props: any = {}) {
    this.id = `${module.name}-pass`;
    this.props = props;
    normalizeShaderModule(module);
    this.module = module;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  preRender(): void {}

  postRender(device: Device, params: PostRenderOptions): Framebuffer {
    const passes = this.passes || createPasses(device, this.module, this.id, this.props);
    this.passes = passes;

    const {target} = params;
    let inputBuffer = params.inputBuffer;
    let outputBuffer = params.swapBuffer;

    for (let index = 0; index < this.passes.length; index++) {
      if (target && index === this.passes.length - 1) {
        outputBuffer = target;
      }
      this.passes[index].render({inputBuffer, outputBuffer});
      const switchBuffer = outputBuffer;
      outputBuffer = inputBuffer;
      inputBuffer = switchBuffer;
    }
    return inputBuffer;
  }

  cleanup(): void {
    if (this.passes) {
      for (const pass of this.passes) {
        pass.delete();
      }
      this.passes = undefined;
    }
  }
}

function createPasses(
  device: Device,
  module: ShaderModule,
  id: string,
  moduleSettings: any
): ScreenPass[] {
  if (!module.passes) {
    const fs = getFragmentShaderForRenderPass(module);
    const pass = new ScreenPass(device, {
      id,
      module,
      fs,
      moduleSettings
    });
    return [pass];
  }

  return module.passes.map((pass, index) => {
    const fs = getFragmentShaderForRenderPass(module, pass);
    const idn = `${id}-${index}`;

    return new ScreenPass(device, {
      id: idn,
      module,
      fs,
      moduleSettings
    });
  });
}

const FILTER_FS_TEMPLATE = func => `\
uniform sampler2D texture;
uniform vec2 texSize;

varying vec2 position;
varying vec2 coordinate;
varying vec2 uv;

void main() {
  vec2 texCoord = coordinate;

  gl_FragColor = texture2D(texture, texCoord);
  gl_FragColor = ${func}(gl_FragColor, texSize, texCoord);
}
`;

const SAMPLER_FS_TEMPLATE = func => `\
uniform sampler2D texture;
uniform vec2 texSize;

varying vec2 position;
varying vec2 coordinate;
varying vec2 uv;

void main() {
  vec2 texCoord = coordinate;

  gl_FragColor = ${func}(texture, texSize, texCoord);
}
`;

function getFragmentShaderForRenderPass(module, pass = module): string {
  if (pass.filter) {
    const func = typeof pass.filter === 'string' ? pass.filter : `${module.name}_filterColor`;
    return FILTER_FS_TEMPLATE(func);
  }

  if (pass.sampler) {
    const func = typeof pass.sampler === 'string' ? pass.sampler : `${module.name}_sampleColor`;
    return SAMPLER_FS_TEMPLATE(func);
  }

  // console.error(`${module.name} no fragment shader generated`);
  return undefined;
}

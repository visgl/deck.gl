import type {Device, Framebuffer} from '@luma.gl/core';
import {normalizeShaderModule, ShaderPass} from '@luma.gl/shadertools';

import ScreenPass from '../passes/screen-pass';

import type {Effect, PostRenderOptions} from '../lib/effect';

export default class PostProcessEffect implements Effect {
  id: string;
  props: any;
  module: ShaderPass;
  passes?: ScreenPass[];

  constructor(module: ShaderPass, props: any = {}) {
    this.id = `${module.name}-pass`;
    this.props = props;
    normalizeShaderModule(module);
    this.module = module;
  }

  setProps(props: any) {
    this.props = props;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  preRender(): void {}

  postRender(device: Device, params: PostRenderOptions): Framebuffer {
    const passes = this.passes || createPasses(device, this.module, this.id);
    this.passes = passes;

    const {target} = params;
    let inputBuffer = params.inputBuffer;
    let outputBuffer = params.swapBuffer;

    for (let index = 0; index < this.passes.length; index++) {
      // if (target && index === this.passes.length - 1) {
      if (target !== undefined && index === this.passes.length - 1) {
        outputBuffer = target;
      }
      this.passes[index].render({inputBuffer, outputBuffer, moduleSettings: this.props});
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

function createPasses(device: Device, module: ShaderPass, id: string): ScreenPass[] {
  if (!module.passes) {
    const fs = getFragmentShaderForRenderPass(module);
    const pass = new ScreenPass(device, {
      id,
      module,
      fs
    });
    return [pass];
  }

  return module.passes.map((pass, index) => {
    const fs = getFragmentShaderForRenderPass(module, pass);
    const idn = `${id}-${index}`;

    return new ScreenPass(device, {
      id: idn,
      module,
      fs
    });
  });
}

const FILTER_FS_TEMPLATE = func => `\
#version 300 es
uniform sampler2D texSrc;
uniform vec2 texSize;

in vec2 position;
in vec2 coordinate;
in vec2 uv;

out vec4 fragColor;

void main() {
  vec2 texCoord = coordinate;

  fragColor = texture(texSrc, texCoord);
  fragColor = ${func}(fragColor, texSize, texCoord);
}
`;

const SAMPLER_FS_TEMPLATE = func => `\
#version 300 es
uniform sampler2D texSrc;
uniform vec2 texSize;

in vec2 position;
in vec2 coordinate;
in vec2 uv;

out vec4 fragColor;

void main() {
  vec2 texCoord = coordinate;

  fragColor = ${func}(texSrc, texSize, texCoord);
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
  return '';
}

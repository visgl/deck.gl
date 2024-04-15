import type {Device, Framebuffer} from '@luma.gl/core';
import {normalizeShaderModule, ShaderPass} from '@luma.gl/shadertools';

import ScreenPass from '../passes/screen-pass';

import type {Effect, EffectContext, PostRenderOptions} from '../lib/effect';

export default class PostProcessEffect<ShaderPassT extends ShaderPass> implements Effect {
  id: string;
  props: ShaderPassT['props'];
  module: ShaderPassT;
  passes?: ScreenPass[];

  constructor(module: ShaderPassT, props: ShaderPassT['props']) {
    this.id = `${module.name}-pass`;
    this.props = props;
    normalizeShaderModule(module);
    this.module = module;
  }

  setup({device}: EffectContext) {
    this.passes = createPasses(device, this.module, this.id);
  }

  setProps(props: ShaderPassT['props']) {
    this.props = props;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  preRender(): void {}

  postRender(params: PostRenderOptions): Framebuffer {
    const passes = this.passes!;

    const {target} = params;
    let inputBuffer = params.inputBuffer;
    let outputBuffer: Framebuffer | null = params.swapBuffer;

    for (let index = 0; index < passes.length; index++) {
      const isLastPass = index === passes.length - 1;
      const renderToTarget = target !== undefined && isLastPass;
      if (renderToTarget) {
        outputBuffer = target;
      }
      const clearCanvas = !renderToTarget || Boolean(params.clearCanvas);
      const moduleSettings = {};
      moduleSettings[this.module.name] = this.props;
      passes[index].render({clearCanvas, inputBuffer, outputBuffer, moduleSettings});

      const switchBuffer = outputBuffer as Framebuffer;
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
  return module.passes.map((pass, index) => {
    const fs = getFragmentShaderForRenderPass(module, pass);
    const idn = `${id}-${index}`;
    return new ScreenPass(device, {id: idn, module, fs});
  });
}

const FS_TEMPLATE_INPUTS = `\
#version 300 es
uniform sampler2D texSrc;
uniform vec2 texSize;

in vec2 position;
in vec2 coordinate;
in vec2 uv;

out vec4 fragColor;
`;

const FILTER_FS_TEMPLATE = (func: string) => `\
${FS_TEMPLATE_INPUTS}
void main() {
  fragColor = texture(texSrc, coordinate);
  fragColor = ${func}(fragColor, texSize, coordinate);
}
`;

const SAMPLER_FS_TEMPLATE = (func: string) => `\
${FS_TEMPLATE_INPUTS}
void main() {
  fragColor = ${func}(texSrc, texSize, coordinate);
}
`;

function getFragmentShaderForRenderPass(module: ShaderPass, pass: ShaderPass['passes'][0]): string {
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

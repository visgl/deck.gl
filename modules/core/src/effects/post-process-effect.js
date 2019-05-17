import Effect from '../lib/effect';
import ScreenPass from '../passes/screen-pass';
/* eslint-disable import/no-extraneous-dependencies */
import {normalizeShaderModule} from '@luma.gl/shadertools';
import {ClipSpace} from '@luma.gl/core';

export default class PostProcessEffect extends Effect {
  constructor(module, props = {}) {
    super(props);
    this.id = `${module.name}-pass`;
    normalizeShaderModule(module);
    this.module = module;
  }

  prepare(gl) {
    if (!this.passes) {
      this.passes = createPasses(gl, this.module, this.id, this.props);
    }
  }

  render(params) {
    const {target = null} = params;
    let switchBuffer = false;
    for (let index = 0; index < this.passes.length; index++) {
      const inputBuffer = switchBuffer ? params.outputBuffer : params.inputBuffer;
      let outputBuffer = switchBuffer ? params.inputBuffer : params.outputBuffer;
      if (target && index === this.passes.length - 1) {
        outputBuffer = target;
      }
      this.passes[index].render({inputBuffer, outputBuffer});
      switchBuffer = !switchBuffer;
    }
    return {
      inputBuffer: switchBuffer ? params.outputBuffer : params.inputBuffer,
      outputBuffer: switchBuffer ? params.inputBuffer : params.outputBuffer
    };
  }

  finalize() {
    if (this.passes) {
      for (const pass of this.passes) {
        pass.finalize();
      }
    }
  }
}

function createPasses(gl, module, id, props) {
  if (module.filter || module.sampler) {
    const fs = getFragmentShaderForRenderPass(module);
    const pass = new ScreenPass(gl, {
      id,
      model: getModel(gl, module, fs, id, props)
    });
    return [pass];
  }

  const passes = module.passes || [];
  return passes.map((pass, index) => {
    const fs = getFragmentShaderForRenderPass(module, pass);
    const idn = `${id}-${index}`;

    return new ScreenPass(
      gl,
      Object.assign({
        id: idn,
        model: getModel(gl, module, fs, idn, props)
      })
    );
  });
}

function getModel(gl, module, fs, id, props) {
  const model = new ClipSpace(gl, {id, fs, modules: [module]});

  const uniforms = Object.assign(module.getUniforms(), module.getUniforms(props));

  model.setUniforms(uniforms);
  return model;
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
  gl_FragColor = ${func}(texture, texSize, texCoord);
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

function getFragmentShaderForRenderPass(module, pass = module) {
  if (pass.filter) {
    const func = typeof pass.filter === 'string' ? pass.filter : `${module.name}_filterColor`;
    return FILTER_FS_TEMPLATE(func);
  }

  if (pass.sampler) {
    const func = typeof pass.sampler === 'string' ? pass.sampler : `${module.name}_sampleColor`;
    return SAMPLER_FS_TEMPLATE(func);
  }

  // console.error(`${module.name} no fragment shader generated`);
  return null;
}

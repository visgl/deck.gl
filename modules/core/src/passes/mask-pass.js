import {default as LayersPass} from './layers-pass';
import {Framebuffer, Texture2D, withParameters} from '@luma.gl/core';

export default class MaskPass extends LayersPass {
  constructor(gl, props) {
    super(gl, props);

    const size = 2048;
    this.maskMap = new Texture2D(gl, {
      width: size,
      height: size,
      parameters: {
        [gl.TEXTURE_MIN_FILTER]: gl.LINEAR,
        [gl.TEXTURE_MAG_FILTER]: gl.LINEAR,
        [gl.TEXTURE_WRAP_S]: gl.CLAMP_TO_EDGE,
        [gl.TEXTURE_WRAP_T]: gl.CLAMP_TO_EDGE
      }
    });

    this.fbo = new Framebuffer(gl, {
      id: 'maskmap',
      width: size,
      height: size,
      attachments: {
        [gl.COLOR_ATTACHMENT0]: this.maskMap
      }
    });
  }

  render(params) {
    console.log('Render MaskPass');
    const target = this.fbo;

    withParameters(
      this.gl,
      {
        framebuffer: this.fbo
      },
      () => {
        super.render({...params, target, pass: 'mask'});
      }
    );
  }

  shouldDrawLayer(layer) {
    return layer.props.operation === 'mask';
  }

  getModuleParameters() {
    return {
      drawToMaskMap: true
    };
  }

  delete() {
    if (this.fbo) {
      this.fbo.delete();
      this.fbo = null;
    }

    if (this.maskMap) {
      this.maskMap.delete();
      this.maskMap = null;
    }
  }
}

import {Framebuffer, Texture2D, withParameters} from '@luma.gl/core';
import {OPERATION} from '../lib/constants';
import LayersPass from './layers-pass';

export default class MaskPass extends LayersPass {
  shadowMap: Texture2D;
  fbo: Framebuffer;

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
    const target = this.fbo;

    withParameters(
      this.gl,
      {
        framebuffer: this.fbo,
        clearColor: [0, 0, 0, 0],
        blend: false,
        depthTest: false
      },
      () => {
        super.render({...params, target, pass: 'mask'});
      }
    );
  }

  shouldDrawLayer(layer) {
    return layer.props.operation === OPERATION.MASK;
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

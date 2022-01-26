import {Framebuffer, Texture2D, withParameters} from '@luma.gl/core';
import {OPERATION} from '../lib/constants';
import LayersPass from './layers-pass';
import GL from '@luma.gl/constants';

export default class MaskPass extends LayersPass {
  maskMap: Texture2D;
  fbo: Framebuffer;

  constructor(gl, props = {}) {
    super(gl, props);

    const {mapSize = 2048} = props;

    this.maskMap = new Texture2D(gl, {
      width: mapSize,
      height: mapSize,
      parameters: {
        [gl.TEXTURE_MIN_FILTER]: gl.LINEAR,
        [gl.TEXTURE_MAG_FILTER]: gl.LINEAR,
        [gl.TEXTURE_WRAP_S]: gl.CLAMP_TO_EDGE,
        [gl.TEXTURE_WRAP_T]: gl.CLAMP_TO_EDGE
      }
    });

    this.fbo = new Framebuffer(gl, {
      id: 'maskmap',
      width: mapSize,
      height: mapSize,
      attachments: {
        [gl.COLOR_ATTACHMENT0]: this.maskMap
      }
    });
  }

  render(params) {
    const {width, height} = this.fbo;
    const padding = 1;

    return withParameters(
      this.gl,
      {
        clearColor: [0, 0, 0, 0],
        blend: false,
        depthTest: false,

        // Prevent mask bleeding over edge by adding transparent padding
        scissorTest: true,
        scissor: [padding, padding, width - 2 * padding, height - 2 * padding]
      },
      () => super.render({...params, target: this.fbo, pass: 'mask'})
    );
  }

  shouldDrawLayer(layer) {
    return layer.props.operation === OPERATION.MASK;
  }

  delete() {
    this.fbo.delete();
    this.maskMap.delete();
  }
}

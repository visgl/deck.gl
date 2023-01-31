import {Framebuffer, Texture2D, withParameters} from '@luma.gl/core';
import {_LayersPass as LayersPass, LayersPassRenderOptions} from '@deck.gl/core';

type MaskPassRenderOptions = LayersPassRenderOptions & {
  /** The channel to render into, 0:red, 1:green, 2:blue, 3:alpha */
  channel: number;
};

export default class MaskPass extends LayersPass {
  maskMap: Texture2D;
  fbo: Framebuffer;

  constructor(gl, props: {id: string; mapSize?: number}) {
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

  render(options: MaskPassRenderOptions) {
    const gl = this.gl;

    const colorMask = [false, false, false, false];
    colorMask[options.channel] = true;

    return withParameters(
      gl,
      {
        clearColor: [255, 255, 255, 255],
        blend: true,
        blendFunc: [gl.ZERO, gl.ONE],
        blendEquation: gl.FUNC_SUBTRACT,
        colorMask,
        depthTest: false
      },
      () => super.render({...options, target: this.fbo, pass: 'mask'})
    );
  }

  shouldDrawLayer(layer) {
    return layer.props.operation.includes('mask');
  }

  delete() {
    this.fbo.delete();
    this.maskMap.delete();
  }
}

import type {Device} from '@luma.gl/api';
import {GL, Framebuffer, Texture2D, withParameters} from '@luma.gl/webgl-legacy';
import {_LayersPass as LayersPass, LayersPassRenderOptions} from '@deck.gl/core';

type MaskPassRenderOptions = LayersPassRenderOptions & {
  /** The channel to render into, 0:red, 1:green, 2:blue, 3:alpha */
  channel: number;
};

export default class MaskPass extends LayersPass {
  maskMap: Texture2D;
  fbo: Framebuffer;

  constructor(device: Device, props: {id: string; mapSize?: number}) {
    super(device, props);

    const {mapSize = 2048} = props;

    this.maskMap = new Texture2D(device, {
      width: mapSize,
      height: mapSize,
      parameters: {
        [GL.TEXTURE_MIN_FILTER]: GL.LINEAR,
        [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
        [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
        [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
      }
    });

    this.fbo = new Framebuffer(device, {
      id: 'maskmap',
      width: mapSize,
      height: mapSize,
      attachments: {
        [GL.COLOR_ATTACHMENT0]: this.maskMap
      }
    });
  }

  render(options: MaskPassRenderOptions) {
    const colorMask = [false, false, false, false];
    colorMask[options.channel] = true;

    return withParameters(
      this.device,
      {
        clearColor: [255, 255, 255, 255],
        blend: true,
        blendFunc: [GL.ZERO, GL.ONE],
        blendEquation: GL.FUNC_SUBTRACT,
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

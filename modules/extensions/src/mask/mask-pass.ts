import type {Device, Framebuffer, Texture} from '@luma.gl/core';
import {withGLParameters} from '@luma.gl/webgl';
import {GL} from '@luma.gl/constants';
import {_LayersPass as LayersPass, LayersPassRenderOptions} from '@deck.gl/core';

type MaskPassRenderOptions = LayersPassRenderOptions & {
  /** The channel to render into, 0:red, 1:green, 2:blue, 3:alpha */
  channel: number;
};

export default class MaskPass extends LayersPass {
  maskMap: Texture;
  fbo: Framebuffer;

  constructor(device: Device, props: {id: string; mapSize?: number}) {
    super(device, props);

    const {mapSize = 2048} = props;

    this.maskMap = device.createTexture({
      format: 'rgba8unorm',
      width: mapSize,
      height: mapSize,
      sampler: {
        minFilter: 'linear',
        magFilter: 'linear',
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge'
      }
    });

    this.fbo = device.createFramebuffer({
      id: 'maskmap',
      width: mapSize,
      height: mapSize,
      colorAttachments: [this.maskMap]
    });
  }

  render(options: MaskPassRenderOptions) {
    const colorMask = [false, false, false, false];
    colorMask[options.channel] = true;

    return withGLParameters(
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

import {Framebuffer, Renderbuffer, Texture2D, withParameters} from '@luma.gl/core';
import {OPERATION, _LayersPass as LayersPass, LayersPassRenderOptions} from '@deck.gl/core';

type CollidePassRenderOptions = LayersPassRenderOptions & {};

export default class CollidePass extends LayersPass {
  dummyCollideMap: Texture2D;

  constructor(gl, props: {id: string; dummyCollideMap: Texture2D}) {
    super(gl, props);

    this.dummyCollideMap = props.dummyCollideMap;
  }

  renderCollideMap(target: Framebuffer, options: CollidePassRenderOptions) {
    const gl = this.gl;

    const colorMask = [true, true, true, true];
    const padding = 1;

    return withParameters(
      gl,
      {
        scissorTest: true,
        scissor: [padding, padding, target.width - 2 * padding, target.height - 2 * padding],
        clearColor: [0, 0, 0, 0],
        blend: false,
        colorMask,
        depthTest: true,
        depthRange: [0, 1]
      },
      () => this.render({...options, target, pass: 'collide'})
    );
  }

  shouldDrawLayer(layer) {
    return Boolean(
      layer.props.extensions.find(e => e.constructor.extensionName === 'CollideExtension')
    );
  }

  getModuleParameters() {
    // Draw picking colors into collide FBO
    return {
      drawToCollideMap: true,
      // To avoid feedback loop forming between Framebuffer and active Texture.
      dummyCollideMap: this.dummyCollideMap,
      pickingActive: 1,
      pickingAttribute: false,
      lightSources: {}
    };
  }
}

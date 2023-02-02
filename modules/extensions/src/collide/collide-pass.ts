import {Framebuffer, Renderbuffer, Texture2D, withParameters} from '@luma.gl/core';
import {OPERATION, _LayersPass as LayersPass, LayersPassRenderOptions} from '@deck.gl/core';

type CollidePassRenderOptions = LayersPassRenderOptions & {};

export default class CollidePass extends LayersPass {
  collideMap: Texture2D;
  depthBuffer: Renderbuffer;
  dummyCollideMap: Texture2D;
  fbo: Framebuffer;

  constructor(gl, props: {id: string; dummyCollideMap: Texture2D}) {
    super(gl, props);

    const {width, height} = gl.canvas;

    this.collideMap = new Texture2D(gl, {
      width,
      height,
      parameters: {
        [gl.TEXTURE_MIN_FILTER]: gl.NEAREST,
        [gl.TEXTURE_MAG_FILTER]: gl.NEAREST,
        [gl.TEXTURE_WRAP_S]: gl.CLAMP_TO_EDGE,
        [gl.TEXTURE_WRAP_T]: gl.CLAMP_TO_EDGE
      }
    });

    this.depthBuffer = new Renderbuffer(gl, {format: gl.DEPTH_COMPONENT16, width, height});
    this.dummyCollideMap = props.dummyCollideMap;

    this.fbo = new Framebuffer(gl, {
      id: `Collide-${props.id}`,
      width,
      height,
      attachments: {
        [gl.COLOR_ATTACHMENT0]: this.collideMap,
        [gl.DEPTH_ATTACHMENT]: this.depthBuffer
      }
    });
  }

  render(options: CollidePassRenderOptions) {
    const gl = this.gl;

    const colorMask = [true, true, true, true];
    const padding = 1;

    return withParameters(
      gl,
      {
        scissorTest: true,
        scissor: [padding, padding, this.fbo.width - 2 * padding, this.fbo.height - 2 * padding],
        clearColor: [0, 0, 0, 0],
        blend: false,
        colorMask,
        depthTest: true,
        depthRange: [0, 1]
      },
      () => super.render({...options, target: this.fbo, pass: 'collide'})
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

  delete() {
    this.fbo.delete();
    this.fbo = null;
    this.collideMap.delete();
    this.collideMap = null;
    this.depthBuffer.delete();
    this.depthBuffer = null;
  }
}

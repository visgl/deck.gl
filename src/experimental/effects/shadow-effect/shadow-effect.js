import {GL, Framebuffer, Model, Geometry, Texture2D} from 'luma.gl';
import {Effect} from '../../lib';
import {assembleShaders} from '../../../shader-utils';
import {readFileSync} from 'fs';
import {join} from 'path';

export default class ShadowEffect extends Effect {
  constructor() {
    super();
    this.setNeedsRedraw();
  }

  getShaders() {
    return {
      vs: readFileSync(join(__dirname, './shadow-effect-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './shadow-effect-fragment.glsl'), 'utf8')
    };
  }

  initialize({gl, layerManager}) {
    //we'll need a framebuffer for each lightsource;
    //do this once depth rendering works
    this.depthTextureExtension = gl.getExtension('WEBGL_depth_texture');
    if (!this.depthTextureExtension) {
      this.enabled = false;
    }
    this.framebuffer = new Framebuffer(gl, {
      width: 800,
      height: 600
    });
    this.depthTexture = new Texture2D(gl, {
      width: 800,
      height: 600,
      format: gl.DEPTH_COMPONENT,
      type: gl.UNSIGNED_INT
    });
    this.framebuffer.attachTexture({
      texture: this.depthTexture,
      attachment: GL.DEPTH_ATTACHMENT
    });
    this.model = new Model({
      gl,
      ...assembleShaders(gl, this.getShaders()),
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0])
      })
    });
  }

  preDraw({gl, layerManager}) {
    const dpi = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    this.framebuffer.bind();
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    //change to depth rendering
    layerManager.drawLayers();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /*
  draw({gl, layerManager}) {
    this.model.render({
      depthTexture: this.depthTexture,
    });
  }
  */
  
}


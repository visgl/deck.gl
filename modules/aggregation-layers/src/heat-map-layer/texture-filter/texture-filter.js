import GL from '@luma.gl/constants';
// import {log, assert} from '../utils';
import {Model, Geometry, Framebuffer, cloneTextureFrom} from '@luma.gl/core';

const SRC_TEX_PARAMETER_OVERRIDES = {
  [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
  [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
};

const PASSTHROUGH_VS = `
#define SHADER_NAME texture-filter-vertex

attribute vec2 positions;
attribute vec2 texCoords;

varying vec2 vTexCoords;

void main(void) {

  gl_Position = vec4(positions, 0., 1.);
  vTexCoords = texCoords;
}
`;

export default class TextureFilter {
  constructor(gl, props = {}) {
    this.gl = gl;
    this.id = props.id || 'texture-filter';
    this.model = null;
    this.source = null;
    this.destination = null;
    this.framebuffer = null;
    this.fs = null;
    this.createdTexture = null;
    this.initialize(props);
    this.update(props);
  }

  createDestination(source) {
    this.destination = cloneTextureFrom(source);
    if (this._createdTexture) {
      this._createdTexture.delete();
    }
    this._createdTexture = this.destination;
    this.updateFramebuffer();
  }

  initialize(props) {
    const {fs} = props;
    this.model = new Model(this.gl, {
      id: `${this.id}-model`,
      vs: PASSTHROUGH_VS,
      fs,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        vertexCount: 4,
        attributes: {
          positions: {size: 2, value: new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1])},
          texCoords: {size: 2, value: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1])}
        }
      })
    });
    this.framebuffers = new Framebuffer(this.gl, {
      id: `${this.id}-model`,
      depth: false
    });
  }

  delete() {
    this.model.delete();
    this.framebuffer.delete();
    if (this._createdTexture) {
      this._createdTexture.delete();
    }
  }

  getResult() {
    return this.destination;
  }

  run() {
    this.setupTextures();
    this.model.setUniforms({
      sourceTexture: this.source
    }).draw();
  }

  setupTextures() {
    this.source.setParameters(SRC_TEX_PARAMETER_OVERRIDES);
    if (!this.destination) {
      this.createDestination();
    }
  }

  updateFramebuffer() {
    if (!this.destination) {
      return;
    }
    const {width, height} = this.destination;
    this.framebuffer.update({
      attachments: {[GL.COLOR_ATTACHMENT0]: this.destination},
      resizeAttachments: false
    });
    this.framebuffer.resize({
      width,
      height
    });
  }

  update(props = {}){
    const {source, destination} = props;
    if (source) {
      this.source  = source;
    }
    if (destination) {
      this.destination = destination;
      this.updateFramebuffer(destination);
    }
    // TODO: option update fs
  }
};

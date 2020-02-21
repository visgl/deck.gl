/* eslint-disable no-invalid-this */

import {Deck} from '@deck.gl/core';
import {Model, Buffer, Framebuffer, instrumentGLContext} from '@luma.gl/core';

export function initializeResources(gl) {
  instrumentGLContext(gl);

  this.buffer = new Buffer(gl, new Int8Array([-1, -1, 1, -1, -1, 1, 1, 1]));

  this.model = new Model(gl, {
    vs: `
      attribute vec2 a_pos;
      varying vec2 v_texcoord;
      void main(void) {
          gl_Position = vec4(a_pos, 0.0, 1.0);
          v_texcoord = (a_pos + 1.0) / 2.0;
      }
    `,
    fs: `
      precision mediump float;
      uniform sampler2D u_texture;
      varying vec2 v_texcoord;
      void main(void) {
          vec4 rgba = texture2D(u_texture, v_texcoord);
          rgba.rgb *= rgba.a;
          gl_FragColor = rgba;
      }
    `,
    attributes: {
      a_pos: this.buffer
    },
    vertexCount: 4,
    drawMode: gl.TRIANGLE_STRIP
  });
}

export function createOrResizeFramebuffer(gl, width, height) {
  if (!this.deckFbo) {
    this.createFramebuffer(gl, width, height);
    return;
  }

  if (this.fboWidth === width && this.fboHeight === height) {
    return;
  }

  this.destroyFramebuffer(gl);
  this.createFramebuffer(gl, width, height);

  this.deckgl.setProps({
    _framebuffer: this.deckFbo
  });
}

export function createFramebuffer(gl, width, height) {
  // Create auxiliary FBO
  this.deckFbo = new Framebuffer(gl, {width, height});
}

export function destroyFramebuffer(gl) {
  this.deckFbo.delete();
}

export function initializeDeckGL(gl) {
  this.deckgl = new Deck({
    // The view state will be set dynamically to track the MapView current extent.
    initialViewState: {},

    // Input is handled by the ArcGIS API for JavaScript.
    controller: false,

    // We use the same WebGL context as the ArcGIS API for JavaScript.
    gl,

    // This deck renders into an auxiliary framebuffer.
    _framebuffer: this.deckFbo
  });
}

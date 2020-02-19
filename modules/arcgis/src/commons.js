/* eslint-disable no-invalid-this */

import {Deck} from '@deck.gl/core';

export function initializeResources(gl) {
  // Vertex shader
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(
    vs,
    `
  attribute vec2 a_pos;
  varying vec2 v_texcoord;
  void main(void) {
      gl_Position = vec4(a_pos, 0.0, 1.0);
      v_texcoord = (a_pos + 1.0) / 2.0;
  }
  `
  );
  gl.compileShader(vs);

  // Fragment shader
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(
    fs,
    `
  precision mediump float;
  uniform sampler2D u_texture;
  varying vec2 v_texcoord;
  void main(void) {
      vec4 rgba = texture2D(u_texture, v_texcoord);
      rgba.rgb *= rgba.a;
      gl_FragColor = rgba;
  }
  `
  );
  gl.compileShader(fs);

  // Shader program
  this.program = gl.createProgram();
  gl.attachShader(this.program, vs);
  gl.attachShader(this.program, fs);
  gl.linkProgram(this.program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  // Uniform locations
  this.uTexture = gl.getUniformLocation(this.program, 'u_texture');

  // Full screen quad
  this.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Int8Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
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
  // Create offscreen texture
  this.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  this.fboWidth = width;
  this.fboHeight = height;
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    this.fboWidth,
    this.fboHeight,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array(this.fboWidth * this.fboHeight * 4)
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);

  // Create auxiliary FBO
  this.deckFbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.deckFbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

export function destroyFramebuffer(gl) {
  gl.deleteFramebuffer(this.deckFbo);
  this.deckFbo = null;

  gl.deleteTexture(this.texture);
  this.texture = null;

  this.fboWidth = null;
  this.fboHeight = null;
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

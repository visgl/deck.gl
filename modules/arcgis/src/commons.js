/* eslint-disable no-invalid-this */

import {Deck} from '@deck.gl/core';
import {Model, Buffer, Framebuffer, instrumentGLContext, withParameters} from '@luma.gl/core';

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

  this.deckFbo = new Framebuffer(gl, {width: 1, height: 1});

  this.deckInstance = new Deck({
    // The view state will be set dynamically to track the MapView current extent.
    viewState: {},

    // Input is handled by the ArcGIS API for JavaScript.
    controller: false,

    // We use the same WebGL context as the ArcGIS API for JavaScript.
    gl,

    // We need depth testing in general; we don't know what layers might be added to the deck.
    parameters: {
      depthTest: true
    },

    // This deck renders into an auxiliary framebuffer.
    _framebuffer: this.deckFbo,

    // To disable canvas resizing, since the FBO is owned by the ArcGIS API for JavaScript.
    width: null,
    height: null,

    _customRender: redrawReason => {
      if (redrawReason === 'arcgis') {
        this.deckInstance._drawLayers(redrawReason);
      } else {
        this.redraw();
      }
    }
  });
}

export function render({gl, width, height, viewState}) {
  const screenFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);

  /* global window */
  const dpr = window.devicePixelRatio;
  width = Math.round(width * dpr);
  height = Math.round(height * dpr);

  this.deckFbo.resize({width, height});

  this.deckInstance.setProps({viewState});
  // redraw deck immediately into deckFbo
  this.deckInstance.redraw('arcgis');

  // We overlay the texture on top of the map using the full-screen quad.
  withParameters(
    gl,
    {
      blend: true,
      blendFunc: [gl.ONE, gl.ONE_MINUS_SRC_ALPHA],
      framebuffer: screenFbo,
      viewport: [0, 0, width, height]
    },
    () => {
      this.model.setUniforms({u_texture: this.deckFbo}).draw();
    }
  );
}

export function finalizeResources() {
  this.deckInstance?.finalize();
  this.deckInstance = null;

  this.model?.delete();
  this.buffer?.delete();
  this.deckFbo?.delete();
}

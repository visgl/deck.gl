/* eslint-disable no-invalid-this */

import type {Device} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {GL} from '@luma.gl/constants';

import {Deck} from '@deck.gl/core';

export function initializeResources(device: Device) {
  // What is `this` referring to this function???
  this.buffer = device.createBuffer(new Int8Array([-1, -1, 1, -1, -1, 1, 1, 1]));

  this.model = new Model(device, {
    vs: `\
#version 300 es
in vec2 a_pos;
out vec2 v_texcoord;
void main(void) {
    gl_Position = vec4(a_pos, 0.0, 1.0);
    v_texcoord = (a_pos + 1.0) / 2.0;
}
    `,
    fs: `\
#version 300 es
precision mediump float;
uniform sampler2D u_texture;
in vec2 v_texcoord;
out vec4 fragColor;
void main(void) {
    vec4 rgba = texture(u_texture, v_texcoord);
    rgba.rgb *= rgba.a;
    fragColor = rgba;
}
    `,
    attributes: {
      // eslint-disable-next-line camelcase
      a_pos: this.buffer
    },
    vertexCount: 4,
    drawMode: GL.TRIANGLE_STRIP
  });

  this.deckFbo = device.createFramebuffer({width: 1, height: 1});

  this.deckInstance = new Deck({
    // The view state will be set dynamically to track the MapView current extent.
    viewState: {},

    // Input is handled by the ArcGIS API for JavaScript.
    controller: false,

    // We use the same WebGL context as the ArcGIS API for JavaScript.
    gl: device.gl,

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
  const device: Device = this.deckInstance.deck.device;
  device.withParametersWebGL(
    {
      blend: true,
      blendFunc: [gl.ONE, gl.ONE_MINUS_SRC_ALPHA],
      framebuffer: screenFbo,
      viewport: [0, 0, width, height]
    },
    () => {
      // eslint-disable-next-line camelcase
      this.model.setUniforms({u_texture: this.deckFbo}).draw(this.context.renderPass);
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

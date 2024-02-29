/* eslint-disable no-invalid-this */

import type {Device} from '@luma.gl/core';
import {loadImageBitmap} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {GL} from '@luma.gl/constants';
import {Deck} from '@deck.gl/core';
import {WebGLDevice} from '@luma.gl/webgl';

export function initializeResources(this: any, device: Device) {
  // What is `this` referring to this function???
  const deckglTexture = device.createTexture({ width: 1, height: 1 });
  const imageTexture = device.createTexture({data: loadImageBitmap('https://as2.ftcdn.net/jpg/02/25/74/91/500_F_225749110_EF3DzP1hwjPyalkJkVRHAS8vggkM4Z19.jpg')});

  this.imageTexture = imageTexture;
  this.buffer = device.createBuffer(new Int8Array([
    // Triangle 1
    -1, -1, // bottom left
    1, -1, // bottom right
    -1, 1, // top left
    // Triangle 2
    -1, 1,
    1, 1,
    1, -1
  ]));

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
uniform sampler2D deckglTexture;
uniform sampler2D imageTexture;
in vec2 v_texcoord;
out vec4 fragColor;

void main(void) {
    vec4 imageColor = texture(imageTexture, v_texcoord);
    fragColor += imageColor;
    
    vec4 deckglColor = texture(deckglTexture, v_texcoord);
    deckglColor.rbg *= deckglColor.a;
    fragColor = deckglColor;
    // this gives the gradient
    // fragColor += vec4(v_texcoord.x, v_texcoord.y, 0.0, 1.0);
    
    // directly render textured data
    // fragColor = vec4(imageColor.r, imageColor.g, imageColor.b,  1.0);
    
    fragColor = texture(deckglTexture, v_texcoord);
}
    `,

    bufferLayout: [{name: 'a_pos', format: 'sint8x2'}],
    bindings: {
      deckglTexture,
      imageTexture
    },
    parameters: {
      depthWriteEnabled: true,
      depthCompare: 'less-equal'
    },
    attributes: {
      // eslint-disable-next-line camelcase
      a_pos: this.buffer
    },
    vertexCount: 6,
    drawMode: GL.TRIANGLE_STRIP,
  });

  this.deckFbo = device.createFramebuffer({
    id: 'deckfbo',
    width: 100,
    height: 100,
    colorAttachments: [ deckglTexture ]
  });

  this.deckInstance = new Deck({
    // The view state will be set dynamically to track the MapView current extent.
    viewState: {},

    // Input is handled by the ArcGIS API for JavaScript.
    controller: false,

    // We use the same WebGL context as the ArcGIS API for JavaScript.
    gl: device.props.gl,
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
export function render(this: any, {gl, width, height, viewState}) {
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
  const device: WebGLDevice = this.deckInstance.device;

  const renderPass = device.beginRenderPass({
    framebuffer: screenFbo,
    parameters: {viewport: [0, 0, width, height]},
    clearColor: [0, 0, 0, 0],
    clearDepth: 1
  });

  device.withParametersWebGL(
    {
      blend: true,
      blendFunc: [gl.ONE, gl.ONE_MINUS_SRC_ALPHA],
      framebuffer: screenFbo,
      viewport: [0, 0, width, height]
    },
    () => {
      // eslint-disable-next-line camelcase
      this.model.setBindings({
        'deckglTexture': this.deckFbo.colorAttachments[0],
        'imageTexture': this.imageTexture,
      });
      this.model.draw(renderPass);
    }
  );
}

export function finalizeResources(this: any) {
  this.deckInstance?.finalize();
  this.deckInstance = null;

  this.model?.delete();
  this.buffer?.delete();
  this.deckFbo?.delete();
}

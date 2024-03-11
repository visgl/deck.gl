/* eslint-disable no-invalid-this */

import {GL} from '@luma.gl/constants';
import {Model, Geometry} from '@luma.gl/engine';
import {Deck} from '@deck.gl/core';
import type {Device, Texture, Framebuffer} from '@luma.gl/core';
import type {WebGLDevice} from '@luma.gl/webgl';

interface Renderer {
  redraw: () => void;
}

export type RenderResources = {
  deck: Deck;
  texture: Texture;
  model: Model;
  fbo: Framebuffer;
};

export function initializeResources(this: Renderer, device: Device): RenderResources {
  const texture = device.createTexture({
    format: 'rgba8unorm',
    width: 1,
    height: 1,
    sampler: {
      minFilter: 'linear',
      magFilter: 'linear',
      addressModeU: 'clamp-to-edge',
      addressModeV: 'clamp-to-edge'
    }
  });

  const model = new Model(device, {
    vs: `\
#version 300 es
in vec2 pos;
out vec2 v_texcoord;
void main(void) {
    gl_Position = vec4(pos, 0.0, 1.0);
    v_texcoord = (pos + 1.0) / 2.0;
}
    `,
    fs: `\
#version 300 es
precision mediump float;
uniform sampler2D deckglTexture;
in vec2 v_texcoord;
out vec4 fragColor;

void main(void) {
    vec4 imageColor = texture(deckglTexture, v_texcoord);
    imageColor.rgb *= imageColor.a;
    fragColor = imageColor;
}
    `,
    bindings: {
      deckglTexture: texture
    },
    parameters: {
      depthWriteEnabled: true,
      depthCompare: 'less-equal'
    },
    geometry: new Geometry({
      topology: 'triangle-strip',
      attributes: {
        pos: {size: 2, value: new Int8Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, 1, 1, -1])}
      }
    }),
    vertexCount: 6
  });

  const fbo = device.createFramebuffer({
    id: 'deckfbo',
    width: 1,
    height: 1,
    colorAttachments: [texture]
  });

  const deckInstance = new Deck({
    // The view state will be set dynamically to track the MapView current extent.
    viewState: {},

    // Input is handled by the ArcGIS API for JavaScript.
    controller: false,

    // We use the same WebGL context as the ArcGIS API for JavaScript.
    device,

    // We need depth testing in general; we don't know what layers might be added to the deck.
    parameters: {
      depthTest: true
    },

    // This deck renders into an auxiliary framebuffer.
    _framebuffer: fbo,

    // To disable canvas resizing, since the FBO is owned by the ArcGIS API for JavaScript.
    width: null,
    height: null,

    _customRender: redrawReason => {
      if (redrawReason === 'arcgis') {
        deckInstance._drawLayers(redrawReason);
      } else {
        this.redraw();
      }
    }
  });

  return {deck: deckInstance, texture, fbo, model};
}

export function render(
  resources: RenderResources,
  viewport: {
    width: number;
    height: number;
    longitude: number;
    latitude: number;
    zoom: number;
    altitude?: number;
    pitch: number;
    bearing: number;
  }
) {
  const {model, deck, fbo} = resources;
  const device = model.device;
  const screenFbo = (device as WebGLDevice).getParametersWebGL(GL.FRAMEBUFFER_BINDING);
  const {width, height, ...viewState} = viewport;

  /* global window */
  const dpr = window.devicePixelRatio;
  const pixelWidth = Math.round(width * dpr);
  const pixelHeight = Math.round(height * dpr);

  fbo.resize({width: pixelWidth, height: pixelHeight});

  deck.setProps({viewState});
  // redraw deck immediately into deckFbo
  deck.redraw('arcgis');

  // We overlay the texture on top of the map using the full-screen quad.

  const textureToScreenPass = device.beginRenderPass({
    framebuffer: screenFbo,
    parameters: {viewport: [0, 0, pixelWidth, pixelHeight]},
    clearColor: [0, 0, 0, 0],
    clearDepth: 1
  });

  device.withParametersWebGL(
    {
      blend: true,
      blendFunc: [GL.ONE, GL.ONE_MINUS_SRC_ALPHA]
    },
    () => {
      model.draw(textureToScreenPass);
    }
  );
}

export function finalizeResources(resources: RenderResources) {
  resources.deck.finalize();
  resources.model.destroy();
  resources.fbo.destroy();
  resources.texture.destroy();
}

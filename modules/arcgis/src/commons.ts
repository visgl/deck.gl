// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-invalid-this */

import {GL} from '@luma.gl/constants';
import type {Device, Texture, Framebuffer} from '@luma.gl/core';
import {Deck} from '@deck.gl/core';
import {Model, Geometry} from '@luma.gl/engine';
import {WebGLDevice} from '@luma.gl/webgl';

interface Renderer {
  redraw: () => void;
}

export type RenderResources = {
  deck: Deck;
  texture: Texture;
  model: Model;
  fbo: Framebuffer;
};

async function createDeckInstance(gl: WebGL2RenderingContext): Promise<{
  deckInstance: Deck;
  device: Device;
}> {
  return new Promise(resolve => {
    const deckInstance = new Deck({
      // Input is handled by the ArcGIS API for JavaScript.
      controller: false,

      // We use the same WebGL context as the ArcGIS API for JavaScript.
      gl,

      // We need depth testing in general; we don't know what layers might be added to the deck.
      parameters: {
        depthCompare: 'less-equal'
      },

      // To disable canvas resizing, since the FBO is owned by the ArcGIS API for JavaScript.
      width: null,
      height: null,

      onDeviceInitialized: (device: Device) => {
        resolve({deckInstance, device});
      }
    });
  });
}

export async function initializeResources(
  this: Renderer,
  gl: WebGL2RenderingContext
): Promise<RenderResources> {
  const {deckInstance, device} = await createDeckInstance(gl);

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
      depthCompare: 'less-equal',
      blendColorSrcFactor: 'one',
      blendColorDstFactor: 'one-minus-src-alpha',
      blendAlphaSrcFactor: 'one',
      blendAlphaDstFactor: 'one-minus-src-alpha',
      blendColorOperation: 'add',
      blendAlphaOperation: 'add'
    },
    geometry: new Geometry({
      topology: 'triangle-strip',
      attributes: {
        pos: {size: 2, value: new Int8Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, 1, 1, -1])}
      }
    }),
    vertexCount: 6,
    disableWarnings: true
  });

  const fbo = device.createFramebuffer({
    id: 'deckfbo',
    width: 1,
    height: 1,
    colorAttachments: [texture],
    depthStencilAttachment: 'depth16unorm'
  });

  deckInstance.setProps({
    // This deck renders into an auxiliary framebuffer.
    _framebuffer: fbo,

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
  if (device instanceof WebGLDevice) {
    // @ts-ignore device.getParametersWebGL should return `any` not `void`?
    const screenFbo: Framebuffer = device.getParametersWebGL(GL.FRAMEBUFFER_BINDING);
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
      clearColor: false,
      clearDepth: false
    });
    try {
      model.draw(textureToScreenPass);
    } finally {
      textureToScreenPass.end();
    }
  }
}

export function finalizeResources(resources: RenderResources) {
  resources.deck.finalize();
  resources.model.destroy();
  resources.fbo.destroy();
  resources.texture.destroy();
}

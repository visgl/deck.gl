// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-invalid-this */

import type {Device, Texture, Framebuffer} from '@luma.gl/core';
import {Deck} from '@deck.gl/core';
import {Model, Geometry} from '@luma.gl/engine';
import {GL} from '@luma.gl/webgl/constants';
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
    // FBO stores premultiplied RGBA (rgb already multiplied by alpha).
    // The composite blend (ONE, ONE_MINUS_SRC_ALPHA) handles premultiplied
    // input correctly; multiplying again here would darken overlays.
    fragColor = imageColor;
}
    `,
    bindings: {
      deckglTexture: texture
    },
    parameters: {
      depthWriteEnabled: false,
      depthCompare: 'always',
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
        // ArcGIS renders with alphaSrc=ZERO (preserves destination alpha for its
        // own compositing pipeline). Without resetting this, deck layers inherit
        // that blend state and write alpha=0 into the FBO, making the composite
        // shader output (0,0,0,0) everywhere. Reset to standard premultiplied-alpha
        // blend so the FBO stores correct RGBA for the composite pass.
        const glCtx = (device as WebGLDevice).gl;
        glCtx.blendFuncSeparate(
          glCtx.ONE,
          glCtx.ONE_MINUS_SRC_ALPHA,
          glCtx.ONE,
          glCtx.ONE_MINUS_SRC_ALPHA
        );
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
    views?: unknown;
    viewState?: unknown;
  }
) {
  const {model, deck, fbo} = resources;
  const device = model.device;
  if (device instanceof WebGLDevice) {
    // @ts-ignore device.getParametersWebGL should return `any` not `void`?
    const rawScreenFbo: WebGLFramebuffer | null = device.getParametersWebGL(GL.FRAMEBUFFER_BINDING);
    const {width, height, views, viewState, ...defaultViewState} = viewport;

    /* global window */
    const dpr = window.devicePixelRatio;
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);

    fbo.resize({width: pixelWidth, height: pixelHeight});

    // luma's Framebuffer.resize() clones and destroys the color attachment texture when
    // dimensions change, leaving the cached texture reference and the model sampler binding
    // pointing at a destroyed GPU handle. Re-sync if the attachment was replaced.
    const currentTexture =
      (fbo.colorAttachments[0] as any).texture ?? (fbo.colorAttachments[0] as unknown as Texture);
    if (currentTexture !== resources.texture) {
      resources.texture = currentTexture;
      (model as any).setBindings({deckglTexture: currentTexture});
    }

    // Pass CSS pixel dimensions — deck handles DPR internally. Passing physical
    // pixels would double-apply DPR and project layer geometry off-screen.
    // Without width/height, deck's viewport aspect diverges from ArcGIS's,
    // causing the overlay to drift off the ground plane under tilt/rotation.
    const deckProps: any = {
      width,
      height,
      viewState: viewState || defaultViewState
    };
    if (views) {
      deckProps.views = views;
    }
    deck.setProps(deckProps);
    // redraw deck immediately into deckFbo
    deck.redraw('arcgis');

    // We overlay the texture on top of the map using the full-screen quad.
    const {gl} = device;

    // drawBuffers is per-FBO state not tracked by luma's state cache;
    // restore it for the screen FBO after rendering to the offscreen FBO.
    if (rawScreenFbo) {
      gl.bindFramebuffer(GL.FRAMEBUFFER, rawScreenFbo);
      gl.drawBuffers([GL.COLOR_ATTACHMENT0]);
    } else {
      gl.drawBuffers([GL.BACK]);
    }

    // The model sets blend factors but not blend:true, so
    // setDeviceParameters won't enable blending on its own.
    gl.enable(GL.BLEND);
    gl.blendFuncSeparate(GL.ONE, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
    gl.blendEquationSeparate(GL.FUNC_ADD, GL.FUNC_ADD);

    // luma's WEBGLRenderPass duck-types the framebuffer prop, reading `.handle`, `.width`,
    // `.height`, and `.colorAttachments`. A raw WebGLFramebuffer has none of those, which
    // breaks viewport auto-setup and draw-buffer selection. Build a minimal adapter that
    // luma's state tracker accepts; `'handle' in obj` is true, so the raw FBO is bound.
    const screenFboAdapter = {
      handle: rawScreenFbo,
      width: pixelWidth,
      height: pixelHeight,
      colorAttachments: [null]
    };

    const textureToScreenPass = device.beginRenderPass({
      framebuffer: screenFboAdapter as any,
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

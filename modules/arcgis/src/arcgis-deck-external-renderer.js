/* eslint-disable no-invalid-this */

import {initializeResources, createOrResizeFramebuffer, initializeDeckGL} from './commons';

import {withParameters, Framebuffer} from '@luma.gl/core';

export default function loadArcGISDeckExternalRenderer(externalRenderers, Collection) {
  function ArcGISDeckExternalRenderer(view, conf) {
    this.view = view;
    this.deckLayers = new Collection();
    this.deckLayers.addMany(conf.deckLayers);
  }
  ArcGISDeckExternalRenderer.prototype.initializeResources = initializeResources;
  ArcGISDeckExternalRenderer.prototype.createOrResizeFramebuffer = createOrResizeFramebuffer;
  ArcGISDeckExternalRenderer.prototype.initializeDeckGL = initializeDeckGL;

  function setup(context) {
    const gl = context.gl;
    this.initializeResources(gl);
    // eslint-disable-next-line
    const dpr = window.devicePixelRatio;
    this.deckFbo = new Framebuffer(gl, {
      width: Math.round(this.view.state.size[0] * dpr),
      height: Math.round(this.view.state.size[1] * dpr)
    });
    this.initializeDeckGL(gl);
    this.deckLayers.on('change', () => {
      externalRenderers.requestRender(this.view);
    });
  }

  ArcGISDeckExternalRenderer.prototype.setup = setup;

  function render(renderParameters) {
    const gl = renderParameters.context;
    const screenFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    // eslint-disable-next-line
    const dpr = window.devicePixelRatio;
    this.createOrResizeFramebuffer(
      gl,
      Math.round(this.view.state.size[0] * dpr),
      Math.round(this.view.state.size[1] * dpr)
    );

    this.deckgl.setProps({
      layers: this.deckLayers.items.slice(),
      viewState: {
        latitude: this.view.center.latitude,
        longitude: this.view.center.longitude,
        zoom: this.view.zoom,
        bearing: this.view.camera.heading,
        pitch: this.view.camera.tilt
      }
    });

    // We redraw the deck immediately.
    this.deckgl.redraw(true);

    // We overlay the texture on top of the map using the full-screen quad.
    withParameters(
      gl,
      {
        blend: true,
        blendFunc: [gl.ONE, gl.ONE_MINUS_SRC_ALPHA],
        framebuffer: screenFbo,
        viewport: [
          0,
          0,
          Math.round(this.view.state.size[0] * dpr),
          Math.round(this.view.state.size[1] * dpr)
        ]
      },
      () => {
        this.model.setUniforms({u_texture: this.deckFbo}).draw();
      }
    );
  }

  ArcGISDeckExternalRenderer.prototype.render = render;

  return ArcGISDeckExternalRenderer;
}

/* eslint-disable no-invalid-this */

import {initializeResources, createOrResizeFramebuffer, initializeDeckGL} from './commons';

import {withParameters} from '@luma.gl/core';

export default function loadArcGISDeckExternalRenderer(DeckProps, externalRenderers) {
  class ArcGISDeckExternalRenderer {
    constructor(view, props) {
      this.view = view;
      this.deck = new DeckProps(props);

      this.initializeResources = initializeResources;
      this.createOrResizeFramebuffer = createOrResizeFramebuffer;
      this.initializeDeckGL = initializeDeckGL;
    }

    setup(context) {
      const gl = context.gl;
      this.initializeResources(gl);

      this.initializeDeckGL(gl);

      this.deck.watch(Object.keys(this.deck.properties), (newValue, oldValue, propName) => {
        this.deckgl.setProps({[propName]: newValue});
      });

      this.deckgl.setProps(this.deck.toJSON());
    }

    setProps(props) {
      this.deck.set(props);
    }

    redraw() {
      externalRenderers.requestRender(this.view);
    }

    render(context) {
      const gl = context.gl;
      const screenFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
      // eslint-disable-next-line
      const dpr = window.devicePixelRatio;
      const width = Math.round(this.view.size[0] * dpr);
      const height = Math.round(this.view.size[1] * dpr);
      this.createOrResizeFramebuffer(gl, width, height);

      this.deckgl.setProps({
        viewState: {
          latitude: this.view.center.latitude,
          longitude: this.view.center.longitude,
          zoom: this.view.zoom,
          bearing: this.view.camera.heading,
          pitch: this.view.camera.tilt
        }
      });

      // We redraw the deck immediately.
      this.deckgl.redraw('arcgis');

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
  }

  return ArcGISDeckExternalRenderer;
}

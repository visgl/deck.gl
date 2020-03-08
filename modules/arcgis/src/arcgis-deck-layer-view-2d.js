import {initializeResources, createOrResizeFramebuffer, initializeDeckGL} from './commons';

import {withParameters} from '@luma.gl/core';

export default function loadArcGISDeckLayerView2D(BaseLayerViewGL2D) {
  return BaseLayerViewGL2D.createSubclass({
    properties: {
      deckgl: {},
      deckFbo: {},
      model: {},
      buffer: {}
    },

    initializeResources,
    createOrResizeFramebuffer,
    initializeDeckGL,

    // Attach is called as soon as the layer view is ready to start rendering.
    attach() {
      // We use a full-screen quad and shaders to composite the frame rendered
      // with deck.gl on top of the MapView. Composition uses the MapView context.
      const gl = this.context;

      this.initializeResources(gl);

      this.initializeDeckGL(gl);

      // Update deck props
      this.layer.on('deckpropchanged', props => this.deckgl.setProps(props));

      // We need to start drawing the deck.gl layer immediately.
      this.deckgl.setProps(this.layer.deck.toJSON());
    },

    redraw() {
      this.requestRender();
    },

    // Called when the layer must be destroyed.
    detach() {
      this.handles.removeAll();

      this.deckgl.finalize();
      this.deckgl = null;

      if (this.model) {
        this.model.delete();
      }

      if (this.buffer) {
        this.buffer.delete();
      }

      if (this.deckFbo) {
        this.deckFbo.delete();
      }
    },

    // Called every time that the layer view must be rendered.
    render(renderParameters) {
      const gl = renderParameters.context;
      const screenFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
      // eslint-disable-next-line
      const dpr = window.devicePixelRatio;
      const width = Math.round(this.view.state.size[0] * dpr);
      const height = Math.round(this.view.state.size[1] * dpr);
      this.createOrResizeFramebuffer(gl, width, height);

      // The view state must be kept in-sync with the MapView of the ArcGIS API.
      const state = renderParameters.state;

      this.deckgl.setProps({
        viewState: {
          latitude: this.view.center.latitude,
          longitude: this.view.center.longitude,
          zoom: this.view.featuresTilingScheme.scaleToLevel(state.scale),
          bearing: -state.rotation,
          pitch: 0
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
  });
}

import {initializeResources, render, finalizeResources} from './commons';

export default function createDeckLayerView2D(BaseLayerViewGL2D) {
  return BaseLayerViewGL2D.createSubclass({
    properties: {
      deckgl: {},
      deckFbo: {},
      model: {},
      buffer: {}
    },

    // Attach is called as soon as the layer view is ready to start rendering.
    attach() {
      // We use a full-screen quad and shaders to composite the frame rendered
      // with deck.gl on top of the MapView. Composition uses the MapView context.
      const gl = this.context;
      initializeResources.call(this, gl);

      // Update deck props
      this.layer.deck.on('change', props => this.deckInstance.setProps(props));

      // We need to start drawing the deck.gl layer immediately.
      this.deckInstance.setProps(this.layer.deck.toJSON());
    },

    redraw() {
      this.requestRender();
    },

    // Called when the layer must be destroyed.
    detach() {
      finalizeResources.call(this);
    },

    // Called every time that the layer view must be rendered.
    render(renderParameters) {
      const [width, height] = this.view.state.size;
      // The view state must be kept in-sync with the MapView of the ArcGIS API.
      const state = renderParameters.state;

      render.call(this, {
        gl: renderParameters.context,
        width,
        height,
        viewState: {
          latitude: this.view.center.latitude,
          longitude: this.view.center.longitude,
          zoom: this.view.featuresTilingScheme.scaleToLevel(state.scale),
          bearing: -state.rotation,
          pitch: 0
        }
      });
    }
  });
}

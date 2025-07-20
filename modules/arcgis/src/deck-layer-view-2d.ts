// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {initializeResources, render, finalizeResources} from './commons';

export default function createDeckLayerView2D(BaseLayerViewGL2D) {
  return BaseLayerViewGL2D.createSubclass({
    properties: {
      cancelInitialization: null,
      resources: null
    },

    // Attach is called as soon as the layer view is ready to start rendering.
    async attach() {
      // We use a full-screen quad and shaders to composite the frame rendered
      // with deck.gl on top of the MapView. Composition uses the MapView context.
      const gl = this.context;

      let cancelled = false;
      this.cancelInitialization = () => (cancelled = true);
      const resources = await initializeResources.call(this, gl);
      // If the layer got detached while awaiting, do not proceed
      if (cancelled) {
        finalizeResources(resources);
        return;
      }
      this.resources = resources;

      // Update deck props
      this.layer.deck.on('change', props => resources.deck.setProps(props));

      // We need to start drawing the deck.gl layer immediately.
      resources.deck.setProps(this.layer.deck.toJSON());
    },

    redraw() {
      this.requestRender();
    },

    // Called when the layer must be destroyed.
    detach() {
      this.cancelInitialization?.();
      if (this.resources) {
        finalizeResources(this.resources);
        this.resources = null;
      }
    },

    // Called every time that the layer view must be rendered.
    render(renderParameters) {
      if (!this.resources) {
        return;
      }

      const [width, height] = this.view.state.size;
      // The view state must be kept in-sync with the MapView of the ArcGIS API.
      const state = renderParameters.state;

      render(this.resources, {
        width,
        height,
        latitude: this.view.center.latitude,
        longitude: this.view.center.longitude,
        zoom: this.view.featuresTilingScheme.scaleToLevel(state.scale),
        bearing: -state.rotation,
        pitch: 0
      });
    }
  });
}

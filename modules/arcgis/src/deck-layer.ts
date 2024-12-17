// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default function createDeckLayer(DeckProps, Layer, DeckLayerView2D) {
  // A layer that displays inside a MapView using an instance
  // of the layer view defined above.
  return Layer.createSubclass({
    properties: {
      deck: {},
      blendMode: {},
      effect: {}
    },

    constructor() {
      this.deck = new DeckProps();
    },

    // Called by the MapView whenever a layer view
    // needs to be created for a given layer.
    createLayerView(view) {
      if (view.type === '2d') {
        return new DeckLayerView2D({
          view,
          layer: this
        });
      }

      // eslint-disable-next-line
      console.error(
        'DeckLayer does not support SceneView at the moment. Use DeckRenderer instead.'
      );

      return null;
    }
  });
}

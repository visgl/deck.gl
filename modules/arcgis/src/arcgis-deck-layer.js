export default function loadArcGISDeckLayer(Layer, Collection, ArcGISDeckLayerView2D) {
  // A layer that displays inside a MapView using an instance
  // of the layer view defined above.
  return Layer.createSubclass({
    properties: {
      deckLayers: {
        type: Collection
      }
    },

    constructor() {
      this.deckLayers = new Collection();
    },

    // Called by the MapView whenever a layer view
    // needs to be created for a given layer.
    createLayerView(view) {
      if (view.type === '2d') {
        return new ArcGISDeckLayerView2D({
          view,
          layer: this
        });
      }

      // ArcGISDeckLayer does not support SceneView at the moment
      return null;
    }
  });
}

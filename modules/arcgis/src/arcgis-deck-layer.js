import Layer from "esri/layers/Layer";
import ArcGISDeckLayerView2D from './arcgis-deck-layer-view-2d';

// A layer that displays inside a MapView using an instance
// of the layer view defined above.
export default Layer.createSubclass({
  properties: {
    getDeckLayer: {}
  },

  constructor: function () {
    this.getDeckLayer = null;
  },

  // Calling redraw() on the layer causes redraw() to
  // be called on the layer view.
  redraw() {
    this.emit("redraw");
  },

  // Called by the MapView whenever a layer view
  // needs to be created for a given layer.
  createLayerView(view) {
    if (view.type === "2d") {
      return new ArcGISDeckLayerView2D({
        view,
        layer: this
      });
    }
  }
});
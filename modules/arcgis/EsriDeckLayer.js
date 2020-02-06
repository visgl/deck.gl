import Layer from "esri/layers/Layer";
import MapView from "esri/views/MapView";
import EsriDeckLayerView2D from './EsriDeckLayerView2D';

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
      return new EsriDeckLayerView2D({
        view,
        layer: this
      });
    }
  }
});
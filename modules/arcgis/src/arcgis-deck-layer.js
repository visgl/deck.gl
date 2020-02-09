import Layer from 'esri/layers/Layer';
import Collection from 'esri/core/Collection';
import ArcGISDeckLayerView2D from './arcgis-deck-layer-view-2d';

// A layer that displays inside a MapView using an instance
// of the layer view defined above.
export default Layer.createSubclass({
  properties: {
    deckLayers: {
      type: Collection
    }
  },

  constructor: function() {
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
    } else {
      console.error('ArcGISDeckLayer does not support SceneView at the moment.');
      return null;
    }
  }
});

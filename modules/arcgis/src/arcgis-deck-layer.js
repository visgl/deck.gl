export default function loadArcGISDeckLayer(DeckProps, Layer, ArcGISDeckLayerView2D) {
  // A layer that displays inside a MapView using an instance
  // of the layer view defined above.
  const ArcGISDeckLayer = Layer.createSubclass({
    properties: {
      deck: {}
    },

    constructor() {
      const deckProps = new DeckProps();

      deckProps.watch(Object.keys(deckProps.properties), (newValue, oldValue, propName) => {
        this.emit('deckpropchanged', {[propName]: newValue});
      });

      this.deck = deckProps;
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

      // eslint-disable-next-line
      console.error(
        'ArcGISDeckLayer does not support SceneView at the moment. Use ArcGISDeckExternalRenderer instead.'
      );

      return null;
    }
  });

  return ArcGISDeckLayer;
}

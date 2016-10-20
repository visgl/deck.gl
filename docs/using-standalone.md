# Using deck.gl Standalone (without React and MapboxGL)

The deck.gl core library and layers have no dependecies on React or
Mapbox GL and can be used by any JavaScript application.

## LayerManager class

The `LayerManager` class handles updates, drawing and picking for a set of
layers.

* Use the `setContext` method to update viewport.
* Use the `updateLayers` method to update the list of layers with a
  freshly rendered list.
* You can use the `drawLayers` method to draw the layers - it will only
  draw if some layer (some prop in some layer) has actually changed.
* Call the `getPickingModels` method to implement picking.
  TODO - this requires too much work for the app, provide better support.

## Notes

This is a very brief introduction to how an application might do a standalone
integration with deck.gl. In lieu of better documentation, the React
integration in `src/react/deckgl.js` uses the `LayerManager` class to render
the layers, so looking at that code can be a good reference.

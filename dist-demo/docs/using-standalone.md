# Using deck.gl Standalone

The deck.gl core library and layers have no dependencies on React or
Mapbox GL and can be used by any JavaScript application.

Note: This is a brief introduction to how an application might
do a standalone integration with deck.gl. Using deck.gl this way will
likely involve extra effort and is not recommended for casual
applications.

## LayerManager class

The deck.gl `LayerManager` class handles updates, drawing and picking
for a set of layers.

* Use the `setContext` method to update viewport.
* Use the `updateLayers` method to update the list of layers with a
  freshly rendered list.
* You can use the `drawLayers` method to draw the layers - it will only
  draw if some layer (some prop in some layer) has actually changed.
* Call the `pickLayers` method on mouse and touch events to implement
  picking.

## Using deck.gl without react-map-gl

It is possible to use deck.gl without react-map-gl. In this case
the application will have to implement its own event handling
(to zoom and pan the viewport, and forward hover and click events to deck.gl.
Note that all deck.gl examples currently rely on react-map-gl's event
handling.


## Using deck.gl without React

In lieu of better documentation, the React integration in
`src/react/deckgl.js` uses the `LayerManager` class to render
the layers, so looking at that code can be a good reference
for how to use the `LayerManager` class.


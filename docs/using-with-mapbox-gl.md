# Using deck.gl with mapbox-gl

While a deck.gl application could choose to render on top of any JavaScript
Map component (or even render without an underlying map),
deck.gl has been developed (and extensively tested) with
the [react-map-gl](https://uber.github.io/react-map-gl/#/) component,
which is a React wrapper around mapbox-gl.

## About react-map-gl

As shown in the examples, the DeckGL component works especially well as
the child of a React component that displays a map using parameters similar
to the deck.gl Viewport (i.e. latitude, longitude, zoom etc). In this
configuration your layers will render a geospatial overlay over the underlying
map.

# Using deck.gl without react-map-gl

It is possible to use deck.gl without react-map-gl, but the application
would have to implement its own event handling as all deck.gl examples
currently relies on react-map-gl in that regard.

Note: The deck.gl roadmap includes providing a map independent event handling
solution.

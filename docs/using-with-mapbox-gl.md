# Using deck.gl with mapbox-gl

While a deck.gl application could choose to render on top of any JavaScript
Map component (or even render without an underlying map),
deck.gl has been developed in parallel with
the [react-map-gl](https://uber.github.io/react-map-gl/#/) component,
which is a React wrapper around mapbox-gl, and is the recommended companion
to use deck.gl for most applications.


## About react-map-gl

As shown in the examples, the `DeckGL` React component works especially
well as the child of a React component such as react-map-gl that displays
a map using parameters similar to the deck.gl Viewport (i.e. latitude,
longitude, zoom etc). In this configuration your deck.gl layers will
render as a perfectly synchronized geospatial overlay over the underlying map.

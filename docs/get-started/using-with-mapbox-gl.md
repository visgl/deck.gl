# Using deck.gl with Mapbox GL

While a deck.gl application could choose to render on top of any JavaScript
Map component (or even render without an underlying map),
deck.gl has been developed in parallel with
the [react-map-gl](https://github.com/uber/react-map-gl) component,
which is a React wrapper around mapbox-gl, and is the recommended companion
to use deck.gl for most applications.

## About react-map-gl

As shown in the [examples](https://github.com/uber/deck.gl/tree/4.0-release/examples/), the `DeckGL` React component works especially
well as the child of a React component such as react-map-gl that displays
a map using parameters similar to the deck.gl Viewport (i.e. latitude,
longitude, zoom etc). In this configuration your deck.gl layers will
render as a perfectly synchronized geospatial overlay over the underlying map.

## About Mapbox Tokens

To show maps from a service such as Mapbox you will need to register with
Mapbox and get a "token" that you need to provide to your map component.
The map component will use the token to identify itself to the mapbox service
which then will start serving up map tiles.

To get a token, you typically need to register (create an account)
with the map data provider (mapbox), and apply for a token.
The token will usually be free until a certain level of traffic is exceeded.

While the token will need to be hard-coded into your application in
production, there are several ways to provide a token during development:
* Modify file to specify your Mapbox token,
* Set an environment variable (MapboxAccessToken) - through the use of a
  webpack loader or browserify transform, see the hello-world examples
  for details.
* Provide a token in the URL. See documentation of react-map-gl.

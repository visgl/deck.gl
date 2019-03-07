# Using deck.gl with Mapbox GL

While a deck.gl application could choose to render on top of any JavaScript Map component (or even render without an underlying map), deck.gl has been developed in parallel with the [react-map-gl](https://github.com/uber/react-map-gl) component, which is a React wrapper around mapbox-gl, and is the recommended companion to use deck.gl for most applications.

## About react-map-gl

As shown in the [examples](https://github.com/uber/deck.gl/tree/master/examples/), the `DeckGL` React component works especially well as the child of a React component such as react-map-gl that displays a map using parameters similar to the deck.gl Viewport (i.e. latitude, longitude, zoom etc). In this configuration your deck.gl layers will render as a perfectly synchronized geospatial overlay over the underlying map.

## About Mapbox Tokens

react-map-gl and the underlying Mapbox GL JS libraries are open source and free to use. However, to load the map styles and tiles from Mapbox's data service, you will need to register on their website in order to retrieve an [access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/) required by the map component, which will be used to identify you and start serving up map tiles. The service will be free until a certain level of traffic is exceeded.

If you are using mapbox-gl without React, check out [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/#accesstoken) for how to apply the token.

If you are using react-map-gl, there are several ways to provide a token to your app:

* Set the `MapboxAccessToken` environment variable
* Provide it in the URL, e.g `?access_token=TOKEN`
* Pass it as a prop to the ReactMapGL instance `<ReactMapGL mapboxApiAccessToken={TOKEN} />`

But we would recommend using something like [dotenv](https://github.com/motdotla/dotenv) and put your key in an untracked `.env` file, that will then expose it as a `process.env` variable, with much less leaking risks.

### Display Maps Without A Mapbox Token

It is possible to use the map component without the Mapbox service, if you use another tile source (for example, if you host your own map tiles). You will need a custom Mapbox GL style that points to your own [vector tile source](https://www.mapbox.com/mapbox-gl-js/style-spec/), and pass it to `ReactMapGL` using the `mapStyle` prop. This custom style must match the schema of your tile source. 

Open source tile schemas include: 

- [TileZen schema](https://tilezen.readthedocs.io/en/latest/layers/)
- [OpenMapTiles schema ](https://openmaptiles.org/schema/)

Some useful resources for creating your own map service:

- [Mapbox Vector Tile Spec](https://www.mapbox.com/developers/vector-tiles/)
- [Open source tools](https://github.com/mapbox/awesome-vector-tiles)


## Mixing deck.gl and mapbox Layers

An experimental module ` @deck.gl/mapbox` enables seamless interleaving of mapbox and deck.gl layers.

<img src="https://raw.github.com/uber-common/deck.gl-data/master/images/whats-new/mapbox-layers.jpg" />

See [module documentation](/docs/api-reference/mapbox/overview.md) for examples and limitations.

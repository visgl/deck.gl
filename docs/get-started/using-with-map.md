# Using deck.gl with a Base Map

While deck.gl works independently without any map component, when visualizing geographic datasets, a base map could offer the invaluable context for understanding the overlay layers.

deck.gl has been designed to work in tandem with popular JavaScript base map providers, especially Mapbox. Depending on your tech stack, deck.gl's support for a particular base map solution may come with different level of compatibility and limitations.

## Using deck.gl with Mapbox GL JS

[mapbox-gl](https://github.com/mapbox/mapbox-gl-js) is a powerful open-source map renderer from [Mapbox](https://mapbox.com). deck.gl's `MapView` is designed to sync perfectly with the camera of Mapbox, at every zoom level and rotation angle.

When using deck.gl and Mapbox, there are two options you can choose from:

- Using the Deck canvas as a overlay on top of the Mapbox map, in [pure JS](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/mapbox) or [React](https://github.com/visgl/deck.gl/tree/master/examples/get-started/react/mapbox). This is the most tested and robust use case.
- Using deck.gl layers as custom Mapbox layers, using the [@deck.gl/mapbox](/docs/api-reference/mapbox/overview.md) module. This allows you to interleave deck.gl layers with base map layers, e.g. below text labels or occlude each other correctly in 3D. Be cautious that this feature is experimental: we are working closely with Mapbox to evolve the API.

<img src="https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/mapbox-layers.jpg" />


### react-map-gl

[react-map-gl](https://github.com/visgl/react-map-gl) is a React wrapper around mapbox-gl. If you'd like to use deck.gl with React, this component is the recommended companion.

All the [examples on this website](https://github.com/visgl/deck.gl/tree/master/examples/website) are implemented using the React integration. The `DeckGL` React component works especially well as the parent of a react-map-gl [StaticMap](https://visgl.github.io/react-map-gl/docs/api-reference/static-map), which automatically interprets the deck.gl view state (i.e. latitude, longitude, zoom etc). In this configuration your deck.gl layers will render as a perfectly synchronized geospatial overlay over the underlying map.

### About Mapbox Tokens

The mapbox-gl library is open source and free to use. However, to load the map styles and tiles from Mapbox's data service, you will need to register on their website in order to retrieve an [access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/) required by the map component, which will be used to identify you and start serving up map tiles. The service will be free until a certain level of traffic is exceeded.

If you are using mapbox-gl without React, check out [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/#accesstoken) for how to apply the token.

If you are using react-map-gl, there are several ways to provide a token to your app:

* Set the `MapboxAccessToken` environment variable. You may need to add additional set up to the bundler ([example](https://webpack.js.org/plugins/environment-plugin/)) so that `process.env.MapboxAccessToekn` is accessible at runtime.
* Provide it in the URL, e.g `?access_token=TOKEN`
* Pass it as a prop to the ReactMapGL instance `<ReactMapGL mapboxApiAccessToken={TOKEN} />`


### Display Maps Without A Mapbox Token

It is possible to use the map component without the Mapbox service, if you use another tile source (for example, if you host your own map tiles). You will need a custom Mapbox GL style that points to your own [vector tile source](https://www.mapbox.com/mapbox-gl-js/style-spec/), and pass it to `ReactMapGL` using the `mapStyle` prop. This custom style must match the schema of your tile source. 

Open source tile schemas include: 

- [TileZen schema](https://tilezen.readthedocs.io/en/latest/layers/)
- [OpenMapTiles schema ](https://openmaptiles.org/schema/)

Some useful resources for creating your own map service:

- [Mapbox Vector Tile Spec](https://www.mapbox.com/developers/vector-tiles/)
- [Open source tools](https://github.com/mapbox/awesome-vector-tiles)


## Using deck.gl with Google Maps

Starting v7.0, deck.gl has experimental support for Google Maps with the [@deck.gl/google-maps](/docs/api-reference/google-maps/overview.md) module. It allows you to construct a Deck instance as a custom Google Maps [OverlayView](https://developers.google.com/maps/documentation/javascript/reference/#OverlayView).

<img src="https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/google-maps.jpg" />

The Deck canvas can only be used as a overlay on top of Google Maps, see [pure JS example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/google-maps). Tilting is not supported due to Google Maps API restrictions. See module documentation page for a full list of features.

Note that to run the examples, you need a [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key).


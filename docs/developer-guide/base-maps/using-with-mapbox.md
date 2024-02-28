# Using with Mapbox

| Pure JS | React | Overlaid | Interleaved |
| ----- | ----- | ----- | ----- |
|  ✓ | ✓ | [example](https://github.com/visgl/deck.gl/tree/8.9-release/examples/get-started/pure-js/mapbox) | [example](https://deck.gl/gallery/mapbox-layer) |

[Mapbox GL JS](https://github.com/mapbox/mapbox-gl-js) is a powerful open-source map renderer from [Mapbox](https://mapbox.com). deck.gl's `MapView` is designed to sync perfectly with the camera of Mapbox, at every zoom level and rotation angle.

When using deck.gl and Mapbox, there are three options you can choose from:

- Using the Deck canvas as a overlay on top of the Mapbox map, and Deck as the root element. In this option, deck.gl handles all user input, and holds the source of truth of the camera state. The [React get-started example](https://github.com/visgl/deck.gl/tree/8.9-release/examples/get-started/react/mapbox/) illustrates the basic pattern. This is the most tested and robust use case, as you can find in all the [examples on this website](https://deck.gl/examples/website). It supports all the features of Deck.
- Using the Deck canvas as a overlay on top of the Mapbox map, and Mapbox as the root element. In this option, mapbox-gl handles all user input, and holds the source of truth of the camera state. The [vanilla JS get-started example](https://github.com/visgl/deck.gl/tree/8.9-release/examples/get-started/pure-js/mapbox/) illustrates this pattern. The `MapboxOverlay` class in [@deck.gl/mapbox](../../api-reference/mapbox/overview.md) implements the mapbox-gl control interface to insert deck into the map container. This is favorable if you need to use other mapbox-gl controls and plugins in addition to deck.gl.
- Using deck.gl layers interleaved with Mapbox layers in the same WebGL context, using either the `MapboxOverlay` or `MapboxLayer` from the [@deck.gl/mapbox](../../api-reference/mapbox/overview.md) module. This allows you to mix deck.gl layers with base map layers, e.g. below text labels or occlude each other correctly in 3D. Be cautious that this feature subjects to bugs and limitations of mapbox-gl's custom layer interface.

![deck.gl interleaved with Mapbox layers](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/mapbox-layers.jpg)

## react-map-gl

[react-map-gl](https://github.com/visgl/react-map-gl) is a React wrapper around mapbox-gl. If you'd like to use deck.gl with React, this component is the recommended companion.

All the [examples on this website](https://github.com/visgl/deck.gl/tree/8.9-release/examples/website) are implemented using the React integration. The `DeckGL` React component works especially well as the parent of a react-map-gl [Map](https://visgl.github.io/react-map-gl/docs/api-reference/map), which automatically interprets the deck.gl view state (i.e. latitude, longitude, zoom etc). In this configuration your deck.gl layers will render as a perfectly synchronized geospatial overlay over the underlying map.

> `react-map-gl` v5 and v6 exports React controls (`NavigationControl`, `GeolocateControl` etc.) that can be used with `DeckGL` with or without a base map. See [ContextProvider](../../api-reference/react/deckgl.md#contextprovider) for an example.

> To use deck.gl with `react-map-gl` v7's controls, you must use [MapboxOverlay](https://deck.gl/docs/api-reference/mapbox/mapbox-overlay#using-with-react-map-gl).

## Using Mapbox basemap service (with Mapbox token)

The mapbox-gl library is open source and free to use. However, to load the map styles and tiles from Mapbox's data service, you will need to register on their website in order to retrieve an [access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/) required by the map component, which will be used to identify you and start serving up map tiles. The service will be free until a [certain level](https://www.mapbox.com/pricing/) of traffic is exceeded.

If you are using mapbox-gl without React, check out [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/#accesstoken) for how to apply the token.

If you are using react-map-gl, there are several ways to provide a token to your app:

* Set the `MapboxAccessToken` environment variable. You may need to add additional set up to the bundler ([example](https://webpack.js.org/plugins/environment-plugin/)) so that `process.env.MapboxAccessToekn` is accessible at runtime.
* Provide it in the URL, e.g `?access_token=TOKEN`
* Pass it as a prop to the ReactMapGL instance `<ReactMapGL mapboxAccessToken={TOKEN} />`

## Compatibility with Mapbox GL JS forks

As of v2.0, Mapbox GL JS [went proprietary](https://github.com/mapbox/mapbox-gl-js/blob/main/CHANGELOG.md#200) and requires a Mapbox account to use even if you don't load tiles from the Mapbox data service. Community forks of the v1 code base such as [MapLibre GL JS](https://maplibre.org) can generally be used as a drop-in replacement of mapbox-gl. If you are using react-map-gl, see [their Get Started guide](http://visgl.github.io/react-map-gl/docs/get-started) for more details.

If the forked libraries and Mapbox API diverge in the future, compatibility issues may arise. deck.gl intends to support open source efforts wherever reasonable. Please report any issue on GitHub.

## Using with other basemap services

It is possible to use the map component without the Mapbox service, you need a URL that conforms to the [Mapbox Style Specification](https://www.mapbox.com/mapbox-gl-js/style-spec) and pass it to `ReactMapGL` using the `mapStyle` prop.

You can use existing free vector tile services:

- [CARTO free basemaps](https://carto.com/basemaps) for non commercial applications. Checkout [this guide](../../api-reference/carto/basemap.md) to start using it.

### Hosting your own basemap service

If you host your own map tiles, you will need a custom Mapbox GL style that points to your own [vector tile source](https://www.mapbox.com/mapbox-gl-js/style-spec/), this custom style must match the schema of your tile source.

Open source tile schemas include:

- [TileZen schema](https://tilezen.readthedocs.io/en/latest/layers/)
- [OpenMapTiles schema ](https://openmaptiles.org/schema/)

Some useful resources for creating your own map service:

- [Mapbox Vector Tile Spec](https://www.mapbox.com/developers/vector-tiles/)
- [Open source tools](https://github.com/mapbox/awesome-vector-tiles)
- [Maputnik Style editor](https://maputnik.github.io)
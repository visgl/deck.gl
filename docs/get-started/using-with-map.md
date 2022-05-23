# Using deck.gl with a Base Map

While deck.gl works independently without any map component, when visualizing geospatial datasets, a base map can offer the invaluable context for understanding the overlay layers.

deck.gl has been designed to work in tandem with popular JavaScript base map providers. Depending on your tech stack, deck.gl's support for a particular base map solution may come with different level of compatibility and limitations.

There are two types of integration between deck.gl and a base map solution:

- **Overlaid**: the Deck canvas is rendered over the base map as a separate DOM element. Deck's camera and the camera of the base map are synchronized so they pan/zoom together. This is the more robust option since the two libraries manage their renderings independently from each other. It is usually sufficient if the base map is 2D.

![Deck as overlay on top of the base map](https://miro.medium.com/max/1600/0*K3DVssEhnv5VaDCp)

- **Interleaved**: Deck renders into the WebGL context of the base map. This allows for occlusion between deck.gl layers and the base map's labels and/or 3D features. The availability of this option depends on whether the base map solution exposes certain developer APIs, and may subject the user to bugs/limitations associated with such APIs.

![Deck interleaved with base map layers](https://miro.medium.com/max/1600/0*faYL1UbVD4af5qzy)


| Library | Pure JS | React | Overlaid | Interleaved |
| ----- | ----- | ----- | ----- | ----- |
| [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/latest/) | ✓ | ✓ | | [example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/arcgis) |
| [Google Maps JS API](https://developers.google.com/maps/documentation/javascript/overview) | ✓ | | | [example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/google-maps) | 
| [harp.gl](https://www.harp.gl/) | ✓ | | [example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/harp.gl) |  |
| [Leaflet](https://leafletjs.com/) | ✓ | | [example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/leaflet) |  |
| [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/) | ✓ | ✓ | [example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/mapbox) | [example](https://deck.gl/gallery/mapbox-layer) |
| [MapLibre GL JS](https://maplibre.org/maplibre-gl-js-docs/api/) | ✓ | ✓ | [example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/mapbox) | [example](https://deck.gl/gallery/mapbox-layer) |

It is also important to understand the difference between the JS library that renders the map and the map data provider. For example, you can use Mapbox GL JS with the Mapbox service, but also with any other service that hosts Mapbox Vector Tiles. When using a base map, be sure to follow the terms and conditions, as well as the attribution requirements of both the JS library and the data provider.

Read on for notes on provider-specific support.

## Using deck.gl with Mapbox GL JS

[mapbox-gl](https://github.com/mapbox/mapbox-gl-js) is a powerful open-source map renderer from [Mapbox](https://mapbox.com). deck.gl's `MapView` is designed to sync perfectly with the camera of Mapbox, at every zoom level and rotation angle.

When using deck.gl and Mapbox, there are two options you can choose from:

- Using the Deck canvas as a overlay on top of the Mapbox map, in [pure JS](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/mapbox) or [React](https://github.com/visgl/deck.gl/tree/master/examples/get-started/react/mapbox). This is the most tested and robust use case.
- Using deck.gl layers as custom Mapbox layers, using the [@deck.gl/mapbox](/docs/api-reference/mapbox/overview.md) module. This allows you to interleave deck.gl layers with base map layers, e.g. below text labels or occlude each other correctly in 3D. Be cautious that this feature is experimental: we are working closely with Mapbox to evolve the API.

![deck.gl interleaved with Mapbox layers](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/mapbox-layers.jpg)

### react-map-gl

[react-map-gl](https://github.com/visgl/react-map-gl) is a React wrapper around mapbox-gl. If you'd like to use deck.gl with React, this component is the recommended companion.

All the [examples on this website](https://github.com/visgl/deck.gl/tree/master/examples/website) are implemented using the React integration. The `DeckGL` React component works especially well as the parent of a react-map-gl [StaticMap](https://visgl.github.io/react-map-gl/docs/api-reference/static-map), which automatically interprets the deck.gl view state (i.e. latitude, longitude, zoom etc). In this configuration your deck.gl layers will render as a perfectly synchronized geospatial overlay over the underlying map.

### Using Mapbox basemap service (with Mapbox token)

The mapbox-gl library is open source and free to use. However, to load the map styles and tiles from Mapbox's data service, you will need to register on their website in order to retrieve an [access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/) required by the map component, which will be used to identify you and start serving up map tiles. The service will be free until a [certain level](https://www.mapbox.com/pricing/) of traffic is exceeded.

If you are using mapbox-gl without React, check out [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/#accesstoken) for how to apply the token.

If you are using react-map-gl, there are several ways to provide a token to your app:

* Set the `MapboxAccessToken` environment variable. You may need to add additional set up to the bundler ([example](https://webpack.js.org/plugins/environment-plugin/)) so that `process.env.MapboxAccessToken` is accessible at runtime.
* Provide it in the URL, e.g `?access_token=TOKEN`
* Pass it as a prop to the ReactMapGL instance `<ReactMapGL mapboxApiAccessToken={TOKEN} />`


### Using other basemap services

It is possible to use the map component without the Mapbox service, you need a URL that conforms to the [Mapbox Style Specification](https://www.mapbox.com/mapbox-gl-js/style-spec) and pass it to `ReactMapGL` using the `mapStyle` prop.

You can use existing free vector tile services:

- [CARTO free basemaps](https://carto.com/basemaps) for non commercial applications. Checkout [this guide](/docs/api-reference/carto/basemap.md) to start using it.

### Hosting your own basemap service

If you host your own map tiles, you will need a custom Mapbox GL style that points to your own [vector tile source](https://www.mapbox.com/mapbox-gl-js/style-spec/), this custom style must match the schema of your tile source.

Open source tile schemas include:

- [TileZen schema](https://tilezen.readthedocs.io/en/latest/layers/)
- [OpenMapTiles schema ](https://openmaptiles.org/schema/)

Some useful resources for creating your own map service:

- [Mapbox Vector Tile Spec](https://www.mapbox.com/developers/vector-tiles/)
- [Open source tools](https://github.com/mapbox/awesome-vector-tiles)
- [Maputnik Style editor](https://maputnik.github.io)

### Compatibility with Mapbox GL JS forks

As of v2.0, Mapbox GL JS [went proprietary](https://github.com/mapbox/mapbox-gl-js/blob/main/CHANGELOG.md#200) and requires a Mapbox account to use even if you don't load tiles from the Mapbox data service. Community forks of the v1 code base such as [MapLibre GL JS](https://maplibre.org) can generally be used as a drop-in replacement of mapbox-gl. If you are using react-map-gl, follow [these instructions](http://visgl.github.io/react-map-gl/docs/get-started/get-started#using-with-a-mapbox-gl-fork).

If the forked libraries and Mapbox API diverge in the future, compatibility issues may arise. deck.gl intends to support open source efforts wherever reasonable. Please report any issue on GitHub.


## Using deck.gl with Google Maps

Starting with v7.0, deck.gl has support for Google Maps with the [@deck.gl/google-maps](/docs/api-reference/google-maps/overview.md) module. It allows you to construct a Deck instance as a custom Google Maps [OverlayView](https://developers.google.com/maps/documentation/javascript/reference/#OverlayView).

![deck.gl as a Google Maps overlay](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/google-maps.jpg)

The Deck canvas can only be used as a overlay on top of Google Maps, see [pure JS example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/google-maps). Tilting is not supported due to Google Maps API restrictions. See module documentation page for a full list of features.

Note that to run the examples, you need a [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key).


## Using deck.gl with ArcGIS

Starting with v8.1, deck.gl has support for ArcGIS with the [@deck.gl/arcgis](/docs/api-reference/arcgis/overview.md) module.

![deck.gl as a ArcGIS map layer](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/arcgis.jpg)

2D integration with `MapView` is supported by the [DeckLayer](/docs/api-reference/arcgis/deck-layer.md) class, see [pure JS example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/arcgis).

3D integration with `SceneView` is experimental: see the [DeckRenderer](/docs/api-reference/arcgis/deck-renderer.md) class.

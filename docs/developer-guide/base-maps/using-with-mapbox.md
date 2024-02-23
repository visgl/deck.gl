# Using with Mapbox

| Pure JS | React | Overlaid | Interleaved |
| ----- | ----- | ----- | ----- |
|  ✓ | ✓ | [example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/mapbox) | [example](https://deck.gl/gallery/mapbox-layer) |

[Mapbox GL JS](https://github.com/mapbox/mapbox-gl-js) is a powerful open-source map renderer from [Mapbox](https://mapbox.com). deck.gl's `MapView` is designed to sync perfectly with the camera of Mapbox, at every zoom level and rotation angle.

When using deck.gl and Mapbox, there are three options you can choose from, first based on which library handles all user input and holds the source of truth of the camera state (dictating which is the root component), and second how the content from both libraries interact (allowing simple overlaying or requiring complex interleaving and gl context sharing).

- If you don't use the most advanced features of Deck, such as multi-view and effects, and want to use all the features of mapbox-gl, such as controls like `NavigationControl` or plugins, then you have to use Mapbox as the root element. The recommended approach is then to use the Deck canvas as an overlay on top of the basemap, inserted into the map container using [MapboxOverlay](../../api-reference/mapbox/mapbox-overlay#using-with-react-map-gl) from the [@deck.gl/mapbox](../../api-reference/mapbox/overview.md) module in its default mode (overlaid, which corresponds to `interleaved: false`). The [react get-started example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/react/mapbox/) illustrates this pattern.
- Otherwise, if you need the more advanced features of Deck, then the recommended approach is to use Deck as the root element with its canvas as an overlay on top of the child Mapbox map. The [Minimap example](https://deck.gl/examples/multi-view) illustrates the basic pattern. This is the most tested and robust use case with respect to Deck's functionality, as you can find it in most of the [layer examples on this website](https://deck.gl/examples). You can't use all the features of mapbox-gl like controls (e.g. `NavigationControl`) and plugins, but you can instead use [@deck.gl/widgets](../../api-reference/widgets/overview). 
- Finally, if you need to mix deck.gl layers with base map layers, e.g. having deck.gl surfaces below text labels or objects occluding each other correctly in 3D, then you have to use deck.gl layers interleaved with Mapbox layers in the same WebGL context. In addition to using Mapbox as the root element (option 1), you have to use [MapboxOverlay](../../api-reference/mapbox/mapbox-overlay#using-with-react-map-gl) in interleaved mode (`interleaved: true`). Be cautious that this feature subjects to bugs and limitations of mapbox-gl's custom layer interface, and is only compatible with WebGL2 (See [compatibility](../../api-reference/mapbox/overview#compatibility)). Here's an [interactive example](https://deck.gl/examples/mapbox), and in the following image, notice that the yellow circles (first deck.gl layer) are between the ground (first mapbox layer) and the labels (second mapbox layer) and also below the buildings (third mapbox layer) which correctly occlude the arcs (second deck.gl layer)

![deck.gl interleaved with Mapbox layers](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/mapbox-layers.jpg)

## react-map-gl

[react-map-gl](https://github.com/visgl/react-map-gl) is a React wrapper around mapbox-gl. If you'd like to use deck.gl with React, this component is the recommended companion.

All the [examples on this website](https://github.com/visgl/deck.gl/tree/master/examples/website) are implemented using the React integration.

When you choose the react-map-gl `Map` React component as the root component, using [MapboxOverlay](../../api-reference/mapbox/mapbox-overlay#using-with-react-map-gl) with react-map-gl `useControl` works especially well to insert perfectly synchronized deckgl layers in the map container.

When you choose the `DeckGL` React component as the root component, react-map-gl [Map](https://visgl.github.io/react-map-gl/docs/api-reference/map) as a child automatically interprets the deck.gl view state (i.e. latitude, longitude, zoom etc). In this configuration your deck.gl layers will still render as a perfectly synchronized geospatial overlay over the underlying map.

> Unfortunately, as noted at the begining of this page, using `DeckGL` as the root component is not compatible with `react-map-gl` controls (`NavigationControl`, `GeolocateControl` etc.) because of `react-map-gl` decisions to prioritize its own maintainability, performance, and compatibility when used standalone.

> If you are constrained to using mapbox layers instead of a mapbox control, you can use [MapboxLayer](../../api-reference/mapbox/mapbox-layer#example) but in the general use case it is no longer recommended. Its functionality can be fully replaced by [MapboxOverlay](../../api-reference/mapbox/mapbox-overlay#using-with-react-map-gl) with interleaved: true

## Using Mapbox basemap service (with Mapbox token)

The mapbox-gl library is open source and free to use. However, to load the map styles and tiles from Mapbox's data service, you will need to register on their website in order to retrieve an [access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/) required by the map component, which will be used to identify you and start serving up map tiles. The service will be free until a [certain level](https://www.mapbox.com/pricing/) of traffic is exceeded.

If you are using mapbox-gl without React, check out [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/#accesstoken) for how to apply the token.

If you are using react-map-gl, there are several ways to provide a token to your app:

* Set the `MapboxAccessToken` environment variable. You may need to add additional set up to the bundler ([example](https://webpack.js.org/plugins/environment-plugin/)) so that `process.env.MapboxAccessToekn` is accessible at runtime.
* Provide it in the URL, e.g `?access_token=TOKEN`
* Pass it as a prop to the ReactMapGL instance `<ReactMapGL mapboxAccessToken={TOKEN} />`

## Compatibility with Mapbox GL JS forks

As of v2.0, Mapbox GL JS [went proprietary](https://github.com/mapbox/mapbox-gl-js/blob/main/CHANGELOG.md#200) and requires a Mapbox account to use even if you don't load tiles from the Mapbox data service. Community forks of the v1 code base such as [MapLibre GL JS](https://maplibre.org) can generally be used as a drop-in replacement of mapbox-gl. If you are using react-map-gl, follow [these instructions](http://visgl.github.io/react-map-gl/docs/get-started/get-started#using-with-a-mapbox-gl-fork).

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

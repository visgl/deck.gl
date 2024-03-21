# Using with Mapbox

| Pure JS | React | Overlaid | Interleaved |
| ----- | ----- | ----- | ----- |
|  ✓ | ✓ | [example](https://github.com/visgl/deck.gl/tree/9.0-release/examples/get-started/pure-js/mapbox) | [example](https://deck.gl/gallery/mapbox-overlay) |

![deck.gl interleaved with Mapbox layers](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/mapbox-layers.jpg)

[Mapbox GL JS](https://github.com/mapbox/mapbox-gl-js) is a powerful open-source map renderer from [Mapbox](https://mapbox.com). deck.gl's `MapView` is designed to sync perfectly with the camera of Mapbox, at every zoom level and rotation angle.

When using deck.gl and Mapbox, there are three options you can choose from:

1. All deck.gl environments support deep integration with Mapbox features using the [@deck.gl/mapbox](../../api-reference/mapbox/overview.md) module. This is recommended approach as it supports interleaved and overlaid rendering, as well as Mapbox controls and plugins. See [Inserting deck.gl into the Mapbox container](#inserting-deckgl-into-the-mapbox-container).
2. The deck.gl React API supports an additional configuration when you just need a map backdrop and prefer to use the Deck API for [interactivity](../../developer-guide/interactivity.md). See [Inserting Mapbox into the deck.gl container](#inserting-mapbox-into-the-deckgl-container).
3. Finally, deck.gl offers out-of-the-box integration with Mapbox when using the [Scripting API](https://deck.gl/docs/get-started/using-standalone#using-the-scripting-api).

## Inserting deck.gl into the Mapbox container

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="environment">
  <TabItem value="react" label="React">

```jsx
import Map, {useControl} from 'react-map-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';

function DeckGLOverlay(props) {
  const overlay = useControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

<Map 
  initialViewState={{
    latitude: 40,
    longitude: -74.5,
    zoom: 12
  }}
>
  <DeckGLOverlay interleaved={true}/>
</Map>
```

  </TabItem>
  <TabItem value="pure-js" label="Pure JS">

```js
import mapboxgl from 'mapbox-gl';
import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox';

const map = new mapboxgl.Map({
    center: [-74.5, 40],
    zoom: 12
})
map.addControl(new DeckOverlay({ interleaved: true, layers: [] }))
```

  </TabItem>
</Tabs>

If you want to use features of mapbox-gl, such as controls like `NavigationControl` or plugins, then need to insert Deck into the Mapbox map container using [MapboxOverlay](../../api-reference/mapbox/mapbox-overlay) from the [@deck.gl/mapbox](../../api-reference/mapbox/overview.md) module, which allows you to construct a Deck instance and apply it to a map using the [IControl](https://docs.mapbox.com/mapbox-gl-js/api/markers/#icontrol) API. In this configuration mapbox-gl handles all user input, holds the source of truth of the camera state, and is the root HTML element of your map.

There are two renderers to pick from, overlaid or interleaved.

### Overlaid

If want to use the base map as a backdrop, the recommended approach is to use the Deck canvas as a overlay on top of the Mapbox map using [MapboxOverlay](../../api-reference/mapbox/mapbox-overlay) in its default mode (overlaid, which corresponds to `interleaved: false`). The [react get-started example](https://github.com/visgl/deck.gl/tree/9.0-release/examples/get-started/react/mapbox/) and [pure js get-started example](https://github.com/visgl/deck.gl/tree/9.0-release/examples/get-started/pure-js/mapbox/) illustrates this pattern.

### Interleaved

If you also need to mix deck.gl layers with base map layers, e.g. having deck.gl surfaces below text labels or objects occluding each other correctly in 3D, then you have to use deck.gl layers interleaved with Mapbox layers in the same WebGL2 context. In addition to using [MapboxOverlay](../../api-reference/mapbox/mapbox-overlay#using-with-react-map-gl) to insert Deck into the map container, you have to use interleaved mode (`interleaved: true`). Be cautious that this feature subjects to bugs and limitations of mapbox-gl's custom layer interface, and is only compatible with WebGL2 (See [interleaved renderer compatibility](../../api-reference/mapbox/overview#interleaved-renderer-compatibility)). The [pure js gallery example](https://github.com/visgl/deck.gl/tree/9.0-release/examples/gallery/src/mapbox-overlay.html) illustrates this pattern.

## Inserting Mapbox into the deck.gl container

```jsx
import DeckGL from '@deck.gl/react';
import Map from 'react-map-gl';

<DeckGL 
  initialViewState={{
    latitude: 40,
    longitude: -74.5,
    zoom: 12
  }}
>
  <Map/>
</DeckGL>
```

If you're using deck.gl in a React environment and just need a map backdrop, then you may use Deck as the root HTML element with its canvas as an overlay on top of the child Mapbox map. The [Minimap example](https://deck.gl/examples/multi-view) illustrates the basic pattern. This is a well tested and robust use case with respect to Deck's functionality, as you can find it in most of the [layer examples on this website](https://deck.gl/examples). You can't use all the features of mapbox-gl like controls (e.g. `NavigationControl`) and plugins, but you can instead use [@deck.gl/widgets](../../api-reference/widgets/overview). 

> Note: This usage is not supported in the Pure JS environment.

## react-map-gl

[react-map-gl](https://github.com/visgl/react-map-gl) is a React wrapper around mapbox-gl. If you'd like to use deck.gl with React, this component is the recommended companion.

All the [examples on this website](https://github.com/visgl/deck.gl/tree/9.0-release/examples/website) are implemented using the React integration.

When you choose the react-map-gl `Map` React component as the root component, using [MapboxOverlay](../../api-reference/mapbox/mapbox-overlay#using-with-react-map-gl) with react-map-gl `useControl` works especially well to insert perfectly synchronized deck.gl layers in the map container. 

When you choose the `DeckGL` React component as the root component, react-map-gl [Map](https://visgl.github.io/react-map-gl/docs/api-reference/map) as a child automatically interprets the deck.gl view state (i.e. latitude, longitude, zoom etc). In this configuration your deck.gl layers will still render as a synchronized geospatial overlay over the underlying map.

> Using `DeckGL` as the root component is not compatible with `react-map-gl` controls (`NavigationControl`, `GeolocateControl` etc.) because of `react-map-gl` decisions to prioritize its own maintainability, performance, and compatibility when used standalone.

## Using Mapbox basemap service (with Mapbox token)

The mapbox-gl library is a popular commercial basemap with a free tier. To use Mapbox, you will need to register on their website in order to retrieve an [access token](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/) required by the map component, which will be used to identify you and start serving up map tiles. The service will be free until a [certain level](https://www.mapbox.com/pricing/) of traffic is exceeded.

If you are using mapbox-gl without React, check out [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/#accesstoken) for how to apply the token.

If you are using react-map-gl, there are several ways to provide a token to your app:

* Set the `MapboxAccessToken` environment variable. You may need to add additional set up to the bundler ([example](https://webpack.js.org/plugins/environment-plugin/)) so that `process.env.MapboxAccessToken` is accessible at runtime.
* Provide it in the URL, e.g `?access_token=TOKEN`
* Pass it as a prop to the react-map-gl `Map` instance `<Map mapboxAccessToken={TOKEN} />`

## Compatibility with Mapbox GL JS forks

As of v2.0, Mapbox GL JS [went proprietary](https://github.com/mapbox/mapbox-gl-js/blob/main/CHANGELOG.md#200) and requires a Mapbox account to use even if you don't load tiles from the Mapbox data service. Community forks of the v1 code base such as [MapLibre GL JS](https://maplibre.org) can generally be used as a drop-in replacement of mapbox-gl. If you are using react-map-gl, see [their Get Started guide](http://visgl.github.io/react-map-gl/docs/get-started) for more details.

We provide get-started examples with Maplibre GL JS for [pure js](https://github.com/visgl/deck.gl/tree/9.0-release/examples/get-started/pure-js/maplibre/) and [react](https://github.com/visgl/deck.gl/tree/9.0-release/examples/get-started/react/maplibre/), and an interleaved rendering example in our [gallery](https://github.com/visgl/deck.gl/tree/9.0-release/examples/gallery/src/maplibre-overlay.html).

If the forked libraries and Mapbox API diverge in the future, compatibility issues may arise. deck.gl intends to support open source efforts wherever reasonable. Please report any issue on GitHub.

## Using with other basemap services

It is possible to use the map component without the Mapbox service, you need a URL that conforms to the [Mapbox Style Specification](https://www.mapbox.com/mapbox-gl-js/style-spec) and pass it to the `mapStyle` prop in mapbox-gl `Map` constructor or react-map-gl `Map` component.

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

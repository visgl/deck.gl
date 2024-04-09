# Using with MapTiler

| Pure JS | React | Overlaid | Interleaved |
| ----- | ----- | ----- | ----- |
|  ✓ | ✓ | [example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/maptiler) | [example](https://deck.gl/gallery/maptiler-overlay) |

[MapTiler SDK JS](https://docs.maptiler.com/sdk-js/) is a powerful open-source map renderer from [MapTiler](https://www.maptiler.com/). deck.gl's `MapView` is designed to sync perfectly with the camera, at every zoom level and rotation angle.

All deck.gl environments support deep integration with Vector tiles features using the [@deck.gl/mapbox](../../api-reference/mapbox/overview.md) module. This is recommended approach as it supports interleaved and overlaid rendering, as well as MapTiler SDK JS controls and plugins. See [Inserting deck.gl into the MapTiler SDK container](#inserting-deckgl-into-the-maptiler-container).

## Inserting deck.gl into the MapTiler SDK container

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="environment">
  <TabItem value="react" label="React">

```jsx
import Map, {useControl} from 'react-map-gl';
import * as maptilersdk from '@maptiler/sdk';
import {MapboxOverlay as DeckOverlay} from '@deck.gl/mapbox';

import '@maptiler/sdk/dist/maptiler-sdk.css';

maptilersdk.config.apiKey = 'YOUR_MAPTILER_API_KEY_HERE';

function DeckGLOverlay(props) {
  const overlay = useControl(() => new DeckOverlay(props));
  overlay.setProps(props);
  return null;
}

<Map 
  initialViewState={{
    latitude: 40,
    longitude: -74.5,
    zoom: 12
  }}
  mapLib={maptilersdk}
  mapStyle={maptilersdk.MapStyle.STREETS}
>
  <DeckGLOverlay interleaved={true}/>
</Map>
```

  </TabItem>
  <TabItem value="pure-js" label="Pure JS">

```js
import * as maptilersdk from '@maptiler/sdk';
import { MapboxOverlay as DeckOverlay } from '@deck.gl/mapbox';

const map = new maptilersdk.Map({
    center: [-74.5, 40],
    zoom: 12
})
map.addControl(new DeckOverlay({ interleaved: true, layers: [] }))
```

  </TabItem>
</Tabs>

If you want to use features of MapTiler SDK JS, such as controls like `NavigationControl` or plugins, then need to insert Deck into the MapTiler map container using [MapboxOverlay](../../api-reference/mapbox/mapbox-overlay) from the [@deck.gl/mapbox](../../api-reference/mapbox/overview.md) module, which allows you to construct a Deck instance and apply it to a map using the [IControl](https://docs.mapbox.com/mapbox-gl-js/api/markers/#icontrol) API. In this configuration MapTiler SDK JS handles all user input, holds the source of truth of the camera state, and is the root HTML element of your map.

There are two renderers to pick from, overlaid or interleaved.

### Overlaid

If want to use the base map as a backdrop, the recommended approach is to use the Deck canvas as an overlay on top of the MapTiler map using [MapboxOverlay](../../api-reference/mapbox/mapbox-overlay) in its default mode (overlaid, which corresponds to `interleaved: false`). The [react get-started example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/react/maptiler/) and [pure js get-started example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/maptiler/) illustrates this pattern.

### Interleaved

If you also need to mix deck.gl layers with base map layers, e.g. having deck.gl surfaces below text labels or objects occluding each other correctly in 3D, then you have to use deck.gl layers interleaved with Mapbox layers in the same WebGL2 context. In addition to using [MapboxOverlay](../../api-reference/mapbox/mapbox-overlay#using-with-react-map-gl) to insert Deck into the map container, you have to use interleaved mode (`interleaved: true`). Be cautious that this feature subjects to bugs and limitations of mapbox-gl's custom layer interface, and is only compatible with WebGL2 (See [interleaved renderer compatibility](../../api-reference/mapbox/overview#interleaved-renderer-compatibility)). The [pure js gallery example](https://github.com/visgl/deck.gl/blob/master/examples/gallery/src/mapbox-overlay.html) illustrates this pattern.

## react-map-gl

[react-map-gl](https://github.com/visgl/react-map-gl) is a React wrapper around mapbox-gl. If you'd like to use deck.gl with React, this component is the recommended companion.

All the [examples on this website](https://github.com/visgl/deck.gl/tree/master/examples/website) are implemented using the React integration.

When you choose the react-map-gl `Map` React component as the root component, using [MapboxOverlay](../../api-reference/mapbox/mapbox-overlay#using-with-react-map-gl) with react-map-gl `useControl` works especially well to insert a perfectly synchronized deck.gl layers in the map container. 

To use the MapTiler SDK together with react-map-gl, you must use the `maplib` option. You must specify to use `maptilersdk` to construct the underlying `Map` instance.

```jsx
<Map 
  initialViewState={{
    latitude: 40,
    longitude: -74.5,
    zoom: 12
  }}
  mapLib={maptilersdk}
  mapStyle={maptilersdk.MapStyle.STREETS}
/>
```

## Using MapTiler basemap service (with MapTiler API key)

The MapTiler Cloud maps are a widely used commercial basemap, offering a free tier for users. To use MapTiler, you will need to register on their website to get an [API key](https://cloud.maptiler.com/account/keys/) required by the map component, which will be used to identify you and start serving up map tiles. The service will be free until a [certain threshold](https://www.maptiler.com/cloud/pricing/) of traffic is exceeded.

Once you have the API key you have to use it in the [MapTiler SDK config](https://docs.maptiler.com/sdk-js/api/config/) object.

```jsx
maptilersdk.config.apiKey = 'YOUR_MAPTILER_API_KEY_HERE';
```

## Compatibility with Map GL JS libraries

You have the flexibility to utilize MapTiler maps in conjunction with any map library that is compatible with the Vector Tiles specification, such as MapLibre GL JS or Mapbox GL JS. All you need to do is specify the URL of your map in the style property. As shown in the following example:

```js
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://api.maptiler.com/maps/{mapId}/style.json?key=YOUR_MAPTILER_API_KEY',
  center: [0.45, 51.47],
  zoom: 4,
  bearing: 0,
  pitch: 30
});
```

You can easily incorporate MapTiler's raster tiles into your maps by utilizing a [`TileLayer`](../../api-reference/geo-layers/tile-layer).

### Hosting your own basemap service

If you host your own map tiles, you will need a custom Mapbox GL style that points to your [vector tile source](https://www.mapbox.com/mapbox-gl-js/style-spec/), this custom style must match the schema of your tile source.

Open source tile schemas include:

- [TileZen schema](https://tilezen.readthedocs.io/en/latest/layers/)
- [OpenMapTiles schema ](https://openmaptiles.org/schema/)

Some useful resources for creating your own map service:

- [Mapbox Vector Tile Spec](https://www.mapbox.com/developers/vector-tiles/)
- [Open source tools](https://github.com/mapbox/awesome-vector-tiles)
- [Maputnik Style editor](https://maputnik.github.io)
- [MapTiler Server](https://www.maptiler.com/server/)

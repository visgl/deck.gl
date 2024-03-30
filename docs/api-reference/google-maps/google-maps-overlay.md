# GoogleMapsOverlay

This class implements the [OverlayView](https://developers.google.com/maps/documentation/javascript/reference/overlay-view#OverlayView)/[WebGLOverlayView](https://developers.google.com/maps/documentation/javascript/reference/webgl#WebGLOverlayView) (depending on map rendering type) interface and can be used as any other Google Maps overlay.

## Vector/Raster maps

As detailed in the [overview](./overview.md), the overlay supports both Vector and Raster Google map rendering. Depending on the Google Map configuration, the correct deck.gl overlay rendering method will be chosen at runtime.

## Usage

```js
  import {GoogleMapsOverlay as DeckOverlay} from '@deck.gl/google-maps';
  import {GeoJsonLayer} from '@deck.gl/layers';

  // Create map
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 40, lng: -100 },
    zoom: 5,
    mapId: GOOGLE_MAP_ID // Only required for Vector maps
  });

  // Create overlay instance
  const overlay = new DeckOverlay({
    layers: [
      new GeoJsonLayer({
        ...
      })
    ]
  });
  // Add overlay to map
  overlay.setMap(map);
```


## Constructor

```js
const overlay = new GoogleMapsOverlay(props)
```

`props` are forwarded to a `Deck` instance. The following [Deck](../core/deck.md) props are supported:

- `style`
- `layers`
- `effects`
- `parameters`
- `pickingRadius`
- `useDevicePixels`
- `onWebGLInitialized`
- `onBeforeRender`
- `onAfterRender`
- `onLoad`

The constructor additionally accepts the following option:

- `interleaved` (boolean) - When set to `false`, a dedicated deck.gl canvas is layered on top of the base map. If set to `true` and the Google Map is configured for Vector rendering, deck.gl layers are inserted into the Google Maps layer stack, sharing the same WebGL2RenderingContext. Default is `true`.

## Methods

##### `setMap` {#setmap}

```js
overlay.setMap(map);
```

Add/remove the overlay from a map. An overlay can be temporarily hidden from a map by calling `setMap(null)`. Removing an overlay does not destroy the WebGL2 context; use `finalize()` if the overlay should be permanently removed.

##### `setProps` {#setprops}

```js
overlay.setProps(props);
```

Update (partial) props.

##### `pickObject` {#pickobject}

Equivalent of [deck.pickObject](../core/deck.md).

##### `pickObjects` {#pickobjects}

Equivalent of [deck.pickObjects](../core/deck.md).

##### `pickMultipleObjects` {#pickmultipleobjects}

Equivalent of [deck.pickMultipleObjects](../core/deck.md).

##### `finalize` {#finalize}

```js
overlay.finalize();
```

Remove the overlay and release all underlying resources.

##### getCanvas

See [Deck.getCanvas](../core/deck.md#getcanvas). When using `interleaved: true`, returns the base map's `canvas`.
# GoogleMapsOverlay

This class implements the [OverlayView](https://developers.google.com/maps/documentation/javascript/reference/overlay-view#OverlayView)/[WebGLOverlayView](https://developers.google.com/maps/documentation/javascript/reference/webgl#WebGLOverlayView) (depending on map rendering type) interface and can be used as any other Google Maps overlay.

## Vector/Raster maps

As detailed in the [overview](/docs/api-reference/google-maps/overview.md), the overlay supports both Vector and Raster Google map rendering. Depending on the Google Map configuration, the correct deck.gl overlay rendering method will be chosen at runtime.

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

`props` are forwarded to a `Deck` instance. The following [Deck](/docs/api-reference/core/deck.md) props are supported:

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

## Methods

##### `setMap`

```js
overlay.setMap(map);
```

Add/remove the overlay from a map. An overlay can be temporarily hidden from a map by calling `setMap(null)`. Removing an overlay does not destroy the WebGL context; use `finalize()` if the overlay should be permanently removed.

##### `setProps`

```js
overlay.setProps(props);
```

Update (partial) props.

##### `pickObject`

Equivalent of [deck.pickObject](/docs/api-reference/core/deck.md).

##### `pickObjects`

Equivalent of [deck.pickObjects](/docs/api-reference/core/deck.md).

##### `pickMultipleObjects`

Equivalent of [deck.pickMultipleObjects](/docs/api-reference/core/deck.md).

##### `finalize`

```js
overlay.finalize();
```

Remove the overlay and release all underlying resources.

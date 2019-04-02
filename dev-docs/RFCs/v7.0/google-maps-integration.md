# RFC: Google Maps Integration

* **Authors**: Xiaoji Chen
* **Date**: April 2019
* **Status**: Draft

## Overview

deck.gl was initially designed to work with mapbox-gl. Its MapView is implemented to precisely match the camera behavior of Mapbox. So far, Mapbox has been the only base map solution for deck.gl. There has been multiple attempts from external developers to use deck.gl with Google Maps API. It is no trivial task, because Google Maps is much more opaque comparing to mapbox-gl.

This RFC proposes a new module `@deck.gl/google-maps` that handles the synchronization between Deck and Google Maps. This offering will make it a lot easier for Google Maps devlopers to leverage deck.gl for data visualization.

## Proposal

### DeckOverlay

The proposed `@deck.gl/google-maps` module will have a single export `DeckOverlay`. This class implements the [OverlayView](https://developers.google.com/maps/documentation/javascript/reference/#OverlayView) interface and can be used as any other Google Maps overlay:

```js
  import DeckOverlay from '@deck.gl/google-maps';
  import {GeoJsonLayer} from '@deck.gl/layers';

  // Create map
  const map = new google.maps.Map(document.getElementById('map'), {
    mapTypeId: 'hybrid',
    center: { lat: 40, lng: -100 },
    zoom: 5,
    tilt: 0
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

##### `Constructor`

`const deckOverlay = new DeckOverlay(props)`

Parameters:

* `props.api` - the `google.maps` client, from which we pull the Maps API classes
* The following [Deck](/docs/api-reference/deck.md) props are supported:
  - `layers`
  - `layerFilter`
  - `effects`
  - `parameters`
  - `pickingRadius`
  - `useDevicePixels`
  - `onWebGLInitialized`
  - `onBeforeRender`
  - `onAfterRender`
  - `onLoad`


##### `setMap`

`deckOverlay.setMap(map)`

Add/remove the overlay from a map.

##### `setProps`

`deckOverlay.setProps(props)`

Update (partial) props.


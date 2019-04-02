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

* `props.api` - the client from which we pull the Maps API classes. Default `google.maps`.
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

##### `pickObject`

Equivalent of `deck.pickObject`.

##### `pickObjects`

Equivalent of `deck.pickObjects`.

##### `pickMultipleObjects`

Equivalent of `deck.pickMultipleObjects`.

##### `finalize`

Remove the overlay and release all resources.


## Cost, Risks, Open Questions

### How aligned should the API be with the mapbox module?

While `MapboxLayer` from `@deck.gl/mapbox` is a wrapper of a single layer, the `DeckOverlay` class is a wrapper of `Deck`. The `DeckOverlay` API is designed to align with 1) the Google Maps overlay API, and 2) the Deck class. 

This module will be much simpler than `@deck.gl/mapbox`. Because there is no context sharing, there is no need for WebGL state management, custom rendering order, etc. All layers are rendered once the overlay is redrawn.

### What Deck features are supported?

Supported features:

- Layers
- Effects
- Auto-highliting
- Transitions / Animations
- Interaction callbacks

Not supported features:

- Multi view
- Controller
- React integration (there is no official React wrapper of Google Maps)

### How do we test these features?

We do not have any internal application that uses Google Maps, so there is always a risk of breakage in a future release.

As a start, we can set up automated render tests with CI to ensure that the basic functionalities continue to work. Bugs in the interaction features will be harder to catch. We will work with partners at Google to improve the CI process.

# RFC: Google Maps Integration

* **Authors**: Xiaoji Chen, Don McCurdy
* **Date**: April 2019
* **Status**: Draft

## Overview

deck.gl was initially designed to work with mapbox-gl. Its MapView is implemented to precisely match the camera behavior of Mapbox. So far, Mapbox has been the only base map solution for deck.gl. There has been multiple attempts from external developers to use deck.gl with Google Maps API. It is no trivial task, because Google Maps is much more opaque comparing to mapbox-gl.

This RFC proposes a new module `@deck.gl/google-maps` that handles the synchronization between Deck and Google Maps. This offering will make it a lot easier for Google Maps devlopers to leverage deck.gl for data visualization.

## Proposal

### GoogleMapsOverlay

The proposed `@deck.gl/google-maps` module will have a single export `GoogleMapsOverlay`. This class implements the [OverlayView](https://developers.google.com/maps/documentation/javascript/reference/#OverlayView) interface and can be used as any other Google Maps overlay:

```js
  import {GoogleMapsOverlay} from '@deck.gl/google-maps';
  import {GeoJsonLayer} from '@deck.gl/layers';

  // Create map
  const map = new google.maps.Map(document.getElementById('map'), {
    mapTypeId: 'hybrid',
    center: { lat: 40, lng: -100 },
    zoom: 5,
    tilt: 0
  });

  // Create overlay instance
  const overlay = new GoogleMapsOverlay({
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

`const deckOverlay = new GoogleMapsOverlay(props)`

`props` are forwarded to a `Deck` instance. The following [Deck](/docs/api-reference/deck.md) props are supported:

- `layers`
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

Add/remove the overlay from a map. An overlay can be temporarily hidden from a map by calling `setMap(null)`. Removing an overlay does not destroy the WebGL context; use `finalize()` if the overlay should be permanently removed.

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

While `MapboxLayer` from `@deck.gl/mapbox` is a wrapper of a single layer, the `GoogleMapsOverlay` class is a wrapper of `Deck`. The `GoogleMapsOverlay` API is designed to align with 1) the Google Maps overlay API, and 2) the Deck class. 

This module will be much simpler than `@deck.gl/mapbox`. Because there is no context sharing, there is no need for WebGL state management, custom rendering order, etc. All layers are rendered once the overlay is redrawn.

### What Deck features are supported?

Supported features:

- Layers
- Effects
- Auto-highlighting
- Transitions / Animations
- `onHover` and `onClick` callbacks

Not supported features:

- Multi view
- Controller
- React integration (there is no official React wrapper of Google Maps)
- Gesture event callbacks (e.g. `onDrag*`)

### Support tilting?

According to official docs:

> Controls the automatic switching behavior for the angle of incidence of the map. The only allowed values are 0 and 45. The value 0 causes the map to always use a 0° overhead view regardless of the zoom level and viewport. The value 45 causes the tilt angle to automatically switch to 45 whenever 45° imagery is available for the current zoom level and viewport, and switch back to 0 whenever 45° imagery is not available (this is the default behavior). 45° imagery is only available for satellite and hybrid map types, within some locations, and at some zoom levels.

There is no obvious way to get the fractional tilting of the base map. We will hide the deck.gl layers when tilt is larger than 0.

### How do we test these features?

We do not have any internal application that uses Google Maps, so there is always a risk of breakage in a future release.

As a start, we can set up automated render tests with CI to ensure that the basic functionalities continue to work. Bugs in the interaction features will be harder to catch. We will work with partners at Google to improve the CI process.

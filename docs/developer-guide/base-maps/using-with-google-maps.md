# Using with Google Maps Platform

| Pure JS | React | Overlaid | Interleaved |
| ----- | ----- | ----- | ----- |
| ✓ | ✓ | [example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/google-maps) | [example](https://developers.google.com/maps/documentation/javascript/examples/deckgl-tripslayer) |

![deck.gl as a Google Maps overlay](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/google-maps.jpg)

Deck.gl has interleaved and overlaid support for Google Maps with the [@deck.gl/google-maps](../../api-reference/google-maps/overview.md) module. It allows you to construct a Deck instance and apply it to a map using the Maps JavaScript API.

See [Google Maps documentation](../../api-reference/google-maps/overview.md) page for a full list of features.

## Google Maps Platform API key

Note that to use deck.gl with the Google's basemap, you must load the Maps JavaScript API using a valid API key. For more information on getting an API key, see the [Google Maps Platform API key documentation](https://developers.google.com/maps/documentation/javascript/get-api-key) for the Maps JavaScript API.

## Using interleaved

Starting with v8.6, deck.gl added interleaving support on Google's vector map, using the Maps JavaScript API [WebGLOverlayView class](https://developers.google.com/maps/documentation/javascript/webgl/webgl-overlay-view).

When a Deck instance is applied to the map, deck.gl detects whether it is an instance of the vector map, then automatically enables interleaving. For information on how to enable the Google's vector map for the web, see the [Maps JavaScript API documentation](https://developers.google.com/maps/documentation/javascript/vector-map). 

By default, when a Deck instance is added to the map, deck.gl will detect if the map is an instance of the vector map and enable interleaved mode. If the vector map is not detected or the user's device does not support WebGL2, deck.gl will automatically fallback to overlaid mode.

## Using overlaid

Starting with v7.0, deck.gl added support to overlay visualizations on Google's raster map using the Maps JavaScript API [OverlayView class](https://developers.google.com/maps/documentation/javascript/reference/#OverlayView).

In this mode, the Deck canvas can only be used as a overlay on top of Google Maps, see [pure JS example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/google-maps), and 3D features like tilt, rotation, and interleaving are not supported.

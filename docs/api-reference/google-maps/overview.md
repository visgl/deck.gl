# @deck.gl/google-maps

Use deck.gl layers as a custom Google Maps overlay.

## Installation

### Include the Standalone Bundle

```html
<script src="https://unpkg.com/deck.gl@^7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/google-maps@^7.0.0/dist.min.js"></script>
<!-- usage -->
<script type="text/javascript">
  const {GoogleMapsOverlay} = deck;
</script>
```

### Install from NPM

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/google-maps
```

```js
import {GoogleMapsOverlay} from '@deck.gl/google-maps';
```

## Vector/Raster maps

Starting with Google Maps v3.45 there are two modes of rendering [Vector and Raster](https://developers.google.com/maps/documentation/javascript/vector-map). To control which rendering mode is used, you need to configure the Google Map using the [Google Cloud Platform](https://developers.google.com/maps/documentation/javascript/webgl).

From v8.6, the `GoogleMapsOverlay` class automatically detects at runtime which rendering type is used. The Vector rendering mode is in general more performant, and the `GoogleMapsOverlay` class offers several features not available when using Raster rendering:

- Shared 3D space: objects drawn by the `GoogleMapsOverlay` class appear inside the Google Maps scene, correctly intersecting with 3D buildings and behind the contextual labels drawn by Google Maps
- Tilting and rotating the view is supported
- Rendering uses the same WebGL2 context as Google Maps, improving performance

## Supported Features and Limitations

Supported deck.gl features:

- Layers
- Effects
- Auto-highlighting
- Attribute transitions
- `onHover` and `onClick` callbacks
- Tooltip
- Tilting & Rotation (Vector maps only)

Not supported features:

- Views
- Controller
- React integration
- Gesture event callbacks (e.g. `onDrag*`)

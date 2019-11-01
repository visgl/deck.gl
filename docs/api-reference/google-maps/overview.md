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

## Supported Features and Limitations

Supported deck.gl features:

- Layers
- Effects
- Auto-highlighting
- Attribute transitions
- `onHover` and `onClick` callbacks

Not supported features:

- Tilting
- Views
- Controller
- React integration
- Gesture event callbacks (e.g. `onDrag*`)

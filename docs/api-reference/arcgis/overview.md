# @deck.gl/arcgis

Use deck.gl layers with thw ArcGIS API for JavaScript.

## Installation

### Include the Standalone Bundle

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/arcgis@^1.0.0/dist.min.js"></script>
<!-- usage -->
<script type="text/javascript">
  const {ArcGISDeckLayer} = deck;
</script>
```

### Install from NPM

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/arcgis
```

```js
import {ArcGISDeckLayer} from '@deck.gl/arcgis';
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

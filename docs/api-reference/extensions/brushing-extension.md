
# BrushingExtension (experimental)

The `BrushingExtension` adds GPU-based data brushing functionalities to layers. It allows the layer to show/hide objects based on the current pointer position.

```js
import {ScatterplotLayer} from '@deck.gl/layers';
import {BrushingExtension} from '@deck.gl/extensions';

const layer = new ScatterplotLayer({
  id: 'points',
  data: POINTS,

  // props from ScatterplotLayer
  getPosition: d => d.position,
  getRadius: d => d.radius,

  // props added by BrushingExtension
  brushingEnabled: true,
  brushingRadius: 100000,

  // Define extensions
  extensions: [new BrushingExtension()]
});
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/extensions
```

```js
import {BrushingExtension} from '@deck.gl/extensions';
new BrushingExtension();
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/extensions@^7.0.0/dist.min.js"></script>
```

```js
new deck.BrushingExtension();
```

## Constructor

```js
new BrushingExtension();
```


## Layer Properties

When added to a layer via the `extensions` prop, the `BrushingExtension` adds the following properties to the layer:


##### `brushingRadius` (Number)

The brushing radius centered at the pointer, in meters. If a data object is within this circle, it is rendered; otherwise it is hidden.


##### `brushingEnabled` (Boolean, optional)

* Default: `true`

Enable/disable brushing. If brushing is disabled, all objects are rendered.

Brushing is always disabled when the pointer leaves the current viewport.


##### `brushingTarget` (Enum, optional)

* Default: `source`

The position used to filter each object by. One of the following:

- `'source'`: Use the primary position for each object. This can mean different things depending on the layer. It usually refers to the coordinates returned by `getPosition` or `getSourcePosition` accessors.
- `'target'`: Use the secondary position for each object. This may not be available in some layers. It usually refers to the coordinates returned by `getTargetPosition` accessors.
- `'custom'`: Some layers may not describe their data objects with one or two coordinates, for example `PathLayer` and `PolygonLayer`. Use this option with the `getBrushingTarget` prop to provide a custom position that each object should be filtered by.


##### `getBrushingTarget` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

* Default: `null`

Called to retrieve an arbitrary position for each object that it will be filtered by. Returns an array `[x, y]`. Only effective if `brushingTarget` is set to `custom`.


## Source

[modules/extensions/src/brushing](https://github.com/uber/deck.gl/tree/master/modules/extensions/src/brushing)

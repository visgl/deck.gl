# BrushingExtension

The `BrushingExtension` adds GPU-based data brushing functionalities to layers. It allows the layer to show/hide objects based on the current pointer position.

[deck.gl BrushingExtension](https://codepen.io/vis-gl/embed/NWbxdKP?height=450\&theme-id=light\&default-tab=result)

```
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

## Installation[​](#installation "Direct link to Installation")

To install the dependencies from NPM:

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/layers @deck.gl/extensions
```

```
import {BrushingExtension} from '@deck.gl/extensions';

new BrushingExtension();
```

To use pre-bundled scripts:

```
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>

<!-- or -->

<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/extensions@^9.0.0/dist.min.js"></script>
```

```
new deck.BrushingExtension();
```

## Constructor[​](#constructor "Direct link to Constructor")

```
new BrushingExtension();
```

## Layer Properties[​](#layer-properties "Direct link to Layer Properties")

When added to a layer via the `extensions` prop, the `BrushingExtension` adds the following properties to the layer:

#### `brushingRadius` (number)[​](#brushingradius "Direct link to brushingradius")

The brushing radius centered at the pointer, in meters. If a data object is within this circle, it is rendered; otherwise it is hidden.

#### `brushingEnabled` (boolean, optional)[​](#brushingenabled "Direct link to brushingenabled")

* Default: `true`

Enable/disable brushing. If brushing is disabled, all objects are rendered.

Brushing is always disabled when the pointer leaves the current viewport.

#### `brushingTarget` (string, optional)[​](#brushingtarget "Direct link to brushingtarget")

* Default: `source`

The position used to filter each object by. One of the following:

* `'source'`: Use the primary position for each object. This can mean different things depending on the layer. It usually refers to the coordinates returned by `getPosition` or `getSourcePosition` accessors.
* `'target'`: Use the secondary position for each object. This may not be available in some layers. It usually refers to the coordinates returned by `getTargetPosition` accessors.
* `'source_target'`: Use both the primary position and secondary position for each object. Show objet if either is in brushing range.
* `'custom'`: Some layers may not describe their data objects with one or two coordinates, for example `PathLayer` and `PolygonLayer`. Use this option with the `getBrushingTarget` prop to provide a custom position that each object should be filtered by.

#### `getBrushingTarget` ([Accessor\<Position>](https://deck.gl/docs/developer-guide/using-layers.md#accessors), optional)[​](#getbrushingtarget "Direct link to getbrushingtarget")

* Default: `null`

Called to retrieve an arbitrary position for each object that it will be filtered by. Returns an array `[x, y]`. Only effective if `brushingTarget` is set to `custom`.

## Source[​](#source "Direct link to Source")

[modules/extensions/src/brushing](https://github.com/visgl/deck.gl/tree/9.4-release/modules/extensions/src/brushing)

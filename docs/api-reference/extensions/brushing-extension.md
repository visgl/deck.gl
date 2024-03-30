
# BrushingExtension

The `BrushingExtension` adds GPU-based data brushing functionalities to layers. It allows the layer to show/hide objects based on the current pointer position.

<div style={{position:'relative',height:450}}></div>
<div style={{position:'absolute',transform:'translateY(-450px)',paddingLeft:'inherit',paddingRight:'inherit',left:0,right:0}}>
  <iframe height="450" style={{width:'100%'}} scrolling="no" title="deck.gl BrushingExtension" src="https://codepen.io/vis-gl/embed/NWbxdKP?height=450&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
    See the Pen <a href='https://codepen.io/vis-gl/pen/NWbxdKP'>deck.gl BrushingExtension</a> by vis.gl
    (<a href='https://codepen.io/vis-gl'>@vis-gl</a>) on <a href='https://codepen.io'>CodePen</a>.
  </iframe>
</div>


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


##### `brushingRadius` (number) {#brushingradius}

The brushing radius centered at the pointer, in meters. If a data object is within this circle, it is rendered; otherwise it is hidden.


##### `brushingEnabled` (boolean, optional) {#brushingenabled}

* Default: `true`

Enable/disable brushing. If brushing is disabled, all objects are rendered.

Brushing is always disabled when the pointer leaves the current viewport.


##### `brushingTarget` (string, optional) {#brushingtarget}

* Default: `source`

The position used to filter each object by. One of the following:

- `'source'`: Use the primary position for each object. This can mean different things depending on the layer. It usually refers to the coordinates returned by `getPosition` or `getSourcePosition` accessors.
- `'target'`: Use the secondary position for each object. This may not be available in some layers. It usually refers to the coordinates returned by `getTargetPosition` accessors.
- `'source_target'`: Use both the primary position and secondary position for each object. Show objet if either is in brushing range.
- `'custom'`: Some layers may not describe their data objects with one or two coordinates, for example `PathLayer` and `PolygonLayer`. Use this option with the `getBrushingTarget` prop to provide a custom position that each object should be filtered by.


##### `getBrushingTarget` ([Accessor&lt;Position&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getbrushingtarget}

* Default: `null`

Called to retrieve an arbitrary position for each object that it will be filtered by. Returns an array `[x, y]`. Only effective if `brushingTarget` is set to `custom`.


## Source

[modules/extensions/src/brushing](https://github.com/visgl/deck.gl/tree/master/modules/extensions/src/brushing)

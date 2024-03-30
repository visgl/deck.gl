
# MaskExtension

The `MaskExtension` allows layers to show/hide objects by a geofence. For example, a map may filter a list of user locations by the boundaries of a given country, or highlight part of a base map that is inside a user-drawn circle or lasso area. This extension provides a significantly more performant alternative to testing the data array against a bounding geometry on the CPU.

To use this extension, first define a mask layer with the prop `operation: 'mask'`. A mask layer is not rendered to screen; it defines the geometry of the mask. If the layer renders 3D objects, its footprint on the XY plane is used.

For each layer that should be masked, add the `MaskExtension` to its `extensions` prop, and set the `maskId` prop to the id of the mask layer. A masked layer only renders data objects that fall inside the mask.


> Note: This extension does not work with all deck.gl layers. See "limitations" below.

<div style={{position:'relative',height:450}}></div>
<div style={{position:'absolute',transform:'translateY(-450px)',paddingLeft:'inherit',paddingRight:'inherit',left:0,right:0}}>
  <iframe height="450" style={{width:'100%'}} scrolling="no" title="deck.gl MaskExtension" src="https://codepen.io/vis-gl/embed/ExbKoYg?height=450&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
    See the Pen <a href='https://codepen.io/vis-gl/pen/ExbKoYg'>deck.gl MaskFilterExtension</a> by vis.gl
    (<a href='https://codepen.io/vis-gl'>@vis-gl</a>) on <a href='https://codepen.io'>CodePen</a>.
  </iframe>
</div>


```js
import {GeoJsonLayer, ScatterplotLayer} from '@deck.gl/layers';
import {MaskExtension} from '@deck.gl/extensions';

const layers = [
  new GeoJsonLayer({
    id: 'geofence',
    data: POLYGON_FEATURE,
    operation: 'mask'
  }),
  new ScatterplotLayer({
    id: 'pickups',
    data: PICKUP_LOCATIONS,
    getPosition: d => [d.lng, d.lat],
    getRadius: 50,
    // only render points that are inside the geofence
    extensions: [new MaskExtension()],
    maskId: 'geofence'
  })
];
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/extensions
```

```js
import {MaskExtension} from '@deck.gl/extensions';
new MaskExtension();
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.7.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.7.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/extensions@^8.7.0/dist.min.js"></script>
```

```js
new deck.MaskExtension();
```

## Constructor

```js
new MaskExtension();
```

## Layer Properties

When added to a layer via the `extensions` prop, the `MaskExtension` adds the following properties to the layer:

##### `maskId` (string) {#maskid}

Id of the layer that defines the mask. The mask layer must use the prop `operation: 'mask'`. Masking is disabled if `maskId` is empty or no valid mask layer with the specified id is found.

##### `maskByInstance` (boolean, optional) {#maskbyinstance}

`maskByInstance` controls whether an object is clipped by its anchor (usually defined by an accessor called `getPosition`, e.g. icon, scatterplot) or by its geometry (e.g. path, polygon). If not specified, it is automatically deduced from the layer type.

![maskByInstance](https://raw.githubusercontent.com/visgl/deck.gl-data/master/images/docs/mask-by-instance.png)

##### `maskInverted` (boolean, optional) {#maskinverted}

When `maskInverted` is true the result of the masking operation is inverted. Inversion is applied when reading the mask, thus it is possible to use the same mask normally on some layers and inverted on other layers. Defaults to `false`.

## Limitations

- The current implementation supports up to 4 masks at the same time.
- Given that masking is performed on the GPU, the layers of `@deck.gl/aggregation-layers` module that does aggregation on the CPU, for example `CPUGridLayer` and `HexagonLayer`, are not supported.
- Masking is not supported in [GlobeView](../core/globe-view.md)

## Source

[modules/extensions/src/mask](https://github.com/visgl/deck.gl/tree/8.6-release/modules/extensions/src/mask)

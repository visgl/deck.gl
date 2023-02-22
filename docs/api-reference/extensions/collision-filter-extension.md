
# CollideExtension

The `CollideExtension` allows layers to hide features which overlap with other features. An example is a dense `ScatterplotLayer` with many points which overlap: by using this extension points that collide with others are hidden such that only one of the colliding points is shown. The collisions are computed on the GPU in realtime, allowing the collisions to be updated smoothly on every frame.

To use this extension on a layer, add the `CollideExtension` to the layer's `extensions` prop.

<!-- TODO: Codepen demo -->
<div style={{position:'relative',height:450}}></div>

```js
import {ScatterplotLayer} from '@deck.gl/layers';
import {CollideExtension} from '@deck.gl/extensions';

const layer = new ScatterplotLayer({
  id: 'points',
  data: points,
  extensions: [new CollideExtension()],
  getPosition: d => d.COORDINATES,
  getRadius: 10,
  radiusUnits: 'pixels'
})
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/extensions
```

```js
import {CollideExtension} from '@deck.gl/extensions';
new CollideExtension();
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.9.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.9.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/extensions@^8.9.0/dist.min.js"></script>
```

```js
new deck.CollideExtension();
```

## Constructor

```js
new CollideExtension();
```

## Layer Properties

When added to a layer via the `extensions` prop, the `CollideExtension` adds the following properties to the layer:

##### `collideEnabled` (Boolean, optional) {#collideenabled}

Enable/disable collisions. If collisions are disabled, all objects are rendered. Defaults to `true`.

##### `collideGroup` (string, optional) {#collidegroup}

Collision group this layer belongs to. If it is not set, the 'default' collision group is used. Two (or more) layers that share the same `collideGroup` will be considered together when calculating collisions.

For example, here the icon and text features will avoid colliding with each other, but permits collisions with the scatterplot features.

```js
const layers = [
  new ScatterplotLayer({
    ...,
    extensions: [new CollideExtension()],
    collideGroup: 'visualization'
  }),
  new IconLayer({
    ...,
    extensions: [new CollideExtension()],
    collideGroup: 'legend'
  }),
  new TextLayer({
    ...,
    extensions: [new CollideExtension()],
    collideGroup: 'legend'
  })
];
  ```

##### `collideTestProps` (Object, optional) {#collidetestprops}

Props to override when computing collisions. A common use case is to increase the size of the features when computing collisions to provide greater spacing between visible features. For the `ScatterplotLayer` this would be done by:

```js
collideTestProps: {radiusScale: 2}
```

##### `getCollidePriority` ([Function](../../developer-guide/using-layers.md#accessors), optional) {#getcollidepriority}

The collision priority of each object. Features with higher values are shown preferentially.
The priority is a number in the range -1000 -> 1000, values outside will be clamped. 

* If a number is provided, it is used for all objects in the layer.
* If a function is provided, it is called on each object to retrieve its priority.


## Limitations

- Accessors are not supported in `collideTestProps`
- Given that collisions is performed on the GPU, the layers of `@deck.gl/aggregation-layers` module that does aggregation on the CPU, for example `CPUGridLayer` and `HexagonLayer`, are not supported.
- The collision is point-in-polygon, specifically is computed by comparing the anchor point of a feature with the rasterized screen-space areas of other features. While good for realtime applications, generally this will not give the same results as a full collision test would.

## Source

[modules/extensions/src/collide](https://github.com/visgl/deck.gl/tree/8.9-release/modules/extensions/src/collide)

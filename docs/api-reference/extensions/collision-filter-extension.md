
# CollisionFilterExtension

The `CollisionFilterExtension` allows layers to hide features which overlap with other features. An example is a dense `ScatterplotLayer` with many points which overlap: by using this extension points that collide with others are hidden such that only one of the colliding points is shown. The collisions are computed on the GPU in realtime, allowing the collisions to be updated smoothly on every frame.

To use this extension on a layer, add the `CollisionFilterExtension` to the layer's `extensions` prop.

<div style={{position:'relative',height:450}}></div>
<div style={{position:'absolute',transform:'translateY(-450px)',paddingLeft:'inherit',paddingRight:'inherit',left:0,right:0}}>
  <iframe height="450" style={{width: '100%'}} scrolling="no" title="deck.gl CollideExtension" src="https://codepen.io/vis-gl/embed/oNPXXzm?height=450&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
    See the Pen <a href='https://codepen.io/vis-gl/pen/oNPXXzm'>deck.gl CollideExtension</a> by vis.gl
    (<a href='https://codepen.io/vis-gl'>@vis-gl</a>) on <a href='https://codepen.io'>CodePen</a>.
  </iframe>
</div>


```js
import {ScatterplotLayer} from '@deck.gl/layers';
import {CollisionFilterExtension} from '@deck.gl/extensions';

const layer = new ScatterplotLayer({
  id: 'points',
  data: points,
  extensions: [new CollisionFilterExtension()],
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
import {CollisionFilterExtension} from '@deck.gl/extensions';
new CollisionFilterExtension();
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.9.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.9.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/extensions@^8.9.0/dist.min.js"></script>
```

```js
new deck.CollisionFilterExtension();
```

## Constructor

```js
new CollisionFilterExtension();
```

## Layer Properties

When added to a layer via the `extensions` prop, the `CollisionFilterExtension` adds the following properties to the layer:

##### `collisionEnabled` (Boolean, optional) {#collisionenabled}

Enable/disable collisions. If collisions are disabled, all objects are rendered. Defaults to `true`.

##### `collisionGroup` (string, optional) {#collisiongroup}

Collision group this layer belongs to. If it is not set, the 'default' collision group is used. Two (or more) layers that share the same `collisionGroup` will be considered together when calculating collisions.

For example, here the icon and text features will avoid colliding with each other, but permits collisions with the scatterplot features.

```js
const layers = [
  new ScatterplotLayer({
    ...,
    extensions: [new CollisionFilterExtension()],
    collisionGroup: 'visualization'
  }),
  new IconLayer({
    ...,
    extensions: [new CollisionFilterExtension()],
    collisionGroup: 'legend'
  }),
  new TextLayer({
    ...,
    extensions: [new CollisionFilterExtension()],
    collisionGroup: 'legend'
  })
];
  ```

##### `collisionTestProps` (Object, optional) {#collisiontestprops}

Props to override when computing collisions. A common use case is to increase the size of the features when computing collisions to provide greater spacing between visible features. For the `ScatterplotLayer` this would be done by:

```js
collisionTestProps: {radiusScale: 2}
```

##### `getCollisionPriority` ([Function](../../developer-guide/using-layers.md#accessors), optional) {#getcollisionpriority}

The collision priority of each object. Features with higher values are shown preferentially.
The priority is a number in the range -1000 -> 1000, values outside will be clamped. 

* If a number is provided, it is used for all objects in the layer.
* If a function is provided, it is called on each object to retrieve its priority.

## Using with transparent layers

The `CollisionFilterExtension` samples at the anchor point of a feature when calculating collisions. Layers must ensure that a pixel is rendered at this location when the picking pass is drawn.

A common issue is with the `IconLayer`, which [discards transparent pixels](https://deck.gl/docs/api-reference/layers/icon-layer#alphacutoff). To avoid this, use `alphaCutoff: -1`. A similar issue occurs when the anchor point of the `IconLayer` is too close to the edge of the image, to be safe include a few pixels of padding, e.g.

```js
iconMapping: {
  marker: {x: 0, y: 0, width: 128, height: 128, anchorY: 124}
}
```

## Limitations

- Accessors are not supported in `collisionTestProps`
- Given that collisions is performed on the GPU, the layers of `@deck.gl/aggregation-layers` module that does aggregation on the CPU, for example `CPUGridLayer` and `HexagonLayer`, are not supported.
- The collision is point-in-polygon, specifically is computed by comparing the anchor point of a feature with the rasterized screen-space areas of other features. While good for realtime applications, generally this will not give the same results as a full collision test would.

## Source

[modules/extensions/src/collision-filter](https://github.com/visgl/deck.gl/tree/8.9-release/modules/extensions/src/collision-filter)

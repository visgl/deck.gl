
# CollisionFilterExtension

The `CollisionFilterExtension` allows layers to hide features which overlap with other features. An example is a dense `ScatterplotLayer` with many points which overlap: by using this extension points that collide with others are hidden such that only one of the colliding points is shown. Collisions update as the viewport and layer data change. Layers use a GPU collision map by default; text can opt into priority-ordered placement with `collisionGreedy`.

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
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/extensions@^9.0.0/dist.min.js"></script>
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

#### `collisionEnabled` (boolean, optional) {#collisionenabled}

Enable/disable collisions. If collisions are disabled, all objects are rendered. Defaults to `true`.

#### `collisionGreedy` (boolean, optional) {#collisiongreedy}

Enable priority-ordered text placement. Defaults to `false`.

* `false`: use GPU-only collision filtering for the lowest overhead. All candidates participate in the collision map, so rejected labels can still hide other labels in an overlap chain.
* `true`: place text labels in descending priority and reserve space only for accepted labels. This can display more labels in dense scenes, at the cost of GPU readback and CPU placement when collisions update.

Enabling this on any TextLayer (including GeoJSON text) applies to all text layers in its `collisionGroup`. Groups without text are unaffected. Use separate groups when independent placement modes are needed.

```js
new TextLayer({
  ...,
  extensions: [new CollisionFilterExtension()],
  collisionGreedy: true
})
```

#### `collisionGroup` (string, optional) {#collisiongroup}

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

#### `collisionTestProps` (object, optional) {#collisiontestprops}

Props to override when computing collisions. A common use case is to increase the size of the features when computing collisions to provide greater spacing between visible features. For the `ScatterplotLayer` this would be done by:

```js
collisionTestProps: {radiusScale: 2}
```

#### `getCollisionPriority` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getcollisionpriority}

The collision priority of each object. Features with higher values are shown preferentially.
The priority is a number in the range -1000 -> 1000, values outside will be clamped. 

* If a number is provided, it is used for all objects in the layer.
* If a function is provided, it is called on each object to retrieve its priority.

## Using with TextLayer

Text labels are tested over their entire projected glyph bounds, after applying `getPixelOffset`, `getTextAnchor`, `getAlignmentBaseline`, `getAngle`, and the layer's size settings. Every character in a label shares the same visibility. This also applies to `GeoJsonLayer` with `pointType: 'text'` and its corresponding text accessors.

TextLayer projects a rectangle covering each label. Whitespace and empty lines do not enlarge the glyph bounds. When `background: true`, the background rectangle, including `backgroundPadding`, is used instead. No visible background or `alphaCutoff` override is required for text collision filtering.

Use `collisionTestProps: {sizeScale: 1.5}` to enlarge the collision rectangles. The tested bounds follow the overridden size settings, including `sizeMinPixels` and `sizeMaxPixels`, so labels remain visible when using a non-centered anchor.

With `collisionGreedy: true`, text labels are placed in descending priority, with later source draw order breaking ties. A label is accepted if its projected rectangle does not overlap an already accepted label. Rejected labels do not reserve space, so a chain of overlapping candidates can display several separated labels. This is greedy placement: it fills available space while honoring priority, rather than guaranteeing the mathematically largest number of labels.

In greedy mode, the GPU supplies projected bounds to a CPU spatial grid, which checks nearby accepted labels and uploads their visibility. This requires a compact GPU readback when collisions update. Labels in the same group as non-text geometry also test that geometry at the collision map's pixel resolution. Non-text features retain their anchor-based filtering and can still conservatively block labels even if another feature hides them.

The rectangles include the spaces between lines, so labels may hide before their visible glyphs touch. Multiline edge overlaps and smaller labels contained inside larger ones are both detected.

## Using with transparent layers

For layers other than TextLayer, the `CollisionFilterExtension` samples at the anchor point of a feature when calculating collisions. Layers must ensure that a pixel is rendered at this location when the picking pass is drawn.

A common issue is with the `IconLayer`, which [discards transparent pixels](https://deck.gl/docs/api-reference/layers/icon-layer#alphacutoff). To avoid this, use `alphaCutoff: -1`. A similar issue occurs when the anchor point of the `IconLayer` is too close to the edge of the image, to be safe include a few pixels of padding, e.g.

```js
iconMapping: {
  marker: {x: 0, y: 0, width: 128, height: 128, anchorY: 124}
}
```

## Limitations

- Accessors are not supported in `collisionTestProps`
- The layers of `@deck.gl/aggregation-layers` module that does aggregation on the CPU, for example `CPUGridLayer` and `HexagonLayer`, are not supported.
- Non-text layers use point-in-polygon collision tests: the feature's anchor is compared with the rasterized areas of other features. TextLayer tests full projected rectangles at the collision map’s pixel resolution by default. In greedy mode, it compares projected rectangles with other text and tests non-text geometry at the collision map’s pixel resolution.

## Source

[modules/extensions/src/collision-filter](https://github.com/visgl/deck.gl/tree/8.9-release/modules/extensions/src/collision-filter)

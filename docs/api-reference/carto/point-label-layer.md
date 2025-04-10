# PointLabelLayer

`PointLabelLayer` is a layer for rendering text labels with optional secondary labels around points. It extends the capabilities of deck.gl's `TextLayer` with features like automatic label positioning, collision detection, and support for dual-label layouts.

## Usage 

```tsx
import {DeckGL} from '@deck.gl/react';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import {PointLabelLayer} from '@deck.gl/carto';

type Airport = {
  coordinates: [longitude: number, latitude: number];
  name: string;
  abbrev: string;
};
const AIRPORTS = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/line/airports.json'


function App({viewState}) {
  const layers = [
    new ScatterplotLayer({
      data: AIRPORTS,
      getPosition: d => d.coordinates,
      radiusMinPixels: 2
    }),
    new PointLabelLayer({
      data: AIRPORTS,
      extensions: [new CollisionFilterExtension()],
      getPosition: d => d.coordinates,
      getText: d => d.name,
      getSecondaryText: d => d.abbrev,

      getColor: d => [2, 5, 11],
      sizeScale: 13,
      getSecondaryColor: d => [102, 105, 111],
      secondarySizeScale: 10,

      getTextAnchor: 'start',
      fontSettings: {sdf: true},
      outlineColor: [255, 255, 255],
      outlineWidth: 2
    }),
  ];

  return <DeckGL viewState={viewState} layers={[ayers} />;
}
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/carto
```

```js
import {PointLabelLayer} from '@deck.gl/carto';
new PointLabelLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/carto@^9.0.0/dist.min.js"></script>

<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/carto@^9.0.0/dist.min.js"></script>
```

```js
new deck.carto.PointLabelLayer({});
```

## Properties

Inherits all properties from [`TextLayer`](../layers/text-layer.md), with additional properties noted below.

### Label Positioning

#### `getRadius` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getradius}

* Default: `1`

The radius around the point where the label should be positioned. This value is used in conjunction with `radiusScale`, `getTextAnchor`, and `getAlignmentBaseline` to determine the final label position.

#### `radiusScale` (Number, optional) {#radiusscale}

* Default: `1`

A multiplier to scale all radii. Useful for adjusting all label positions uniformly.

### Secondary Label Properties

#### `getSecondaryText` ([Accessor&lt;string&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getsecondarytext}

The text to display as a secondary label. If not provided, no secondary label is shown.

#### `getSecondaryColor` ([Accessor&lt;Color&gt;](../../developer-guide/using-layers.md#accessors), optional) {#getsecondarycolor}

* Default: `[0, 0, 0, 255]`

The color of the secondary text, in `[r, g, b, [a]]` format. Each channel is a number between 0-255 and `a` is 255 if not supplied.

#### `secondaryOutlineColor` (Array, optional) {#secondaryoutlinecolor}

* Default: `[0, 0, 0, 255]`

The outline color for the secondary text, in `[r, g, b, [a]]` format. Each channel is a number between 0-255 and `a` is 255 if not supplied.

#### `secondarySizeScale` (Number, optional) {#secondarysizescale}

* Default: `1`

Text size multiplier for the secondary label relative to the primary label size.

### Label Layout

The layer automatically positions labels based on the following properties:

- `getTextAnchor`: Controls horizontal positioning ('start', 'middle', 'end')
- `getAlignmentBaseline`: Controls vertical positioning ('top', 'center', 'bottom')
- `getRadius`: Determines distance from the point
- Background padding is automatically adjusted based on the anchor and alignment

Example layouts:
```js
// Right-aligned labels
{
  getTextAnchor: 'start',
  getAlignmentBaseline: 'center'
}

// Labels above points
{
  getTextAnchor: 'middle',
  getAlignmentBaseline: 'bottom'
}

// Labels with secondary text below
{
  getTextAnchor: 'start',
  getAlignmentBaseline: 'center',
  getSecondaryText: d => d.subtitle
}
```

### Collision Detection

The layer includes built-in collision detection that:
- Uses an enhanced background layer for collision testing
- Only renders visible labels in collision pass
- Maintains visual hierarchy between primary and secondary labels


## Source

[modules/carto/src/layers/point-label-layer.ts](https://github.com/visgl/deck.gl/tree/9.1-release/modules/carto/src/layers/point-label-layer.ts) 
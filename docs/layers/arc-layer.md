<!-- INJECT:"ArcLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/layers-lightgrey.svg?style=flat-square" alt="@deck.gl/layers" />
</p>

# ArcLayer

The Arc Layer renders raised arcs joining pairs of source and target points,
specified as latitude/longitude coordinates.

```js
import DeckGL from '@deck.gl/react';
import {ArcLayer} from '@deck.gl/layers';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {
   *     inbound: 72633,
   *     outbound: 74735,
   *     from: {
   *       name: '19th St. Oakland (19TH)',
   *       coordinates: [-122.269029, 37.80787]
   *     },
   *     to: {
   *       name: '12th St. Oakland City Center (12TH)',
   *       coordinates: [-122.271604, 37.803664]
   *   },
   *   ...
   * ]
   */
  const layer = new ArcLayer({
    id: 'arc-layer',
    data,
    pickable: true,
    getWidth: 12,
    getSourcePosition: d => d.from.coordinates,
    getTargetPosition: d => d.to.coordinates,
    getSourceColor: d => [Math.sqrt(d.inbound), 140, 0],
    getTargetColor: d => [Math.sqrt(d.outbound), 140, 0],
    onHover: ({object, x, y}) => {
      const tooltip = `${object.from.name} to ${object.to.name}`;
      /* Update tooltip
         http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
      */
    }
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers
```

```js
import {ArcLayer} from '@deck.gl/layers';
new ArcLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^7.0.0/dist.min.js"></script>
```

```js
new deck.ArcLayer({});
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

### Render Options

##### `widthUnits` (String, optional)

* Default: `'pixels'`

The units of the line width, one of `'meters'`, `'pixels'`. When zooming in and out, meter sizes scale with the base map, and pixel sizes remain the same on screen.

##### `widthScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

The scaling multiplier for the width of each line. This prop is a very efficient way to change the width of all objects, comparing to recalculating the width for each object with `getWidth`.

##### `widthMinPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0`

The minimum line width in pixels. This prop can be used to prevent the line from getting too thin when zoomed out.

##### `widthMaxPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `Number.MAX_SAFE_INTEGER`

The maximum line width in pixels. This prop can be used to prevent the line from getting too thick when zoomed in.


### Data Accessors

##### `getSourcePosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `object => object.sourcePosition`

Method called to retrieve the source position of each object.

##### `getTargetPosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `object => object.targetPosition`

Method called to retrieve the target position of each object.

##### `getSourceColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The rgba color at the source, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the source color for all objects.
* If a function is provided, it is called on each object to retrieve its source color.

##### `getTargetColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default `[0, 0, 0, 255]`

The rgba color at the target, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the target color for all objects.
* If a function is provided, it is called on each object to retrieve its target color.

##### `getWidth` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

The line width of each object, in units specified by `widthUnits` (default pixels).

* If a number is provided, it is used as the line width for all objects.
* If a function is provided, it is called on each object to retrieve its line width.

##### `getHeight` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

Multiplier of layer height. `0` will make the layer flat.

##### `getTilt` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0`

Use to tilt the arc to the side if you have multiple arcs with the same source and target positions.
In degrees, can be positive or negative (`-90 to +90`).

## Source

[modules/layers/src/arc-layer](https://github.com/uber/deck.gl/tree/master/modules/layers/src/arc-layer)

# LineLayer

import {LineLayerDemo} from '@site/src/doc-demos/layers';

<LineLayerDemo />

The `LineLayer` renders straight lines joining pairs of source and target coordinates.

```js
import DeckGL from '@deck.gl/react';
import {LineLayer} from '@deck.gl/layers';

function App({data, viewState}) {
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
  const layer = new LineLayer({
    id: 'line-layer',
    data,
    pickable: true,
    getWidth: 50,
    getSourcePosition: d => d.from.coordinates,
    getTargetPosition: d => d.to.coordinates,
    getColor: d => [Math.sqrt(d.inbound + d.outbound), 140, 0]
  });

  return <DeckGL viewState={viewState}
    layers={[layer]}
    getTooltip={({object}) => object && `${object.from.name} to ${object.to.name}`} />;
}
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers
```

```js
import {LineLayer} from '@deck.gl/layers';
new LineLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.LineLayer({});
```

## Properties

Inherits from all [Base Layer](../core/layer.md) properties.

### Render Options

The width used to draw each line. Unit is pixels.

##### `widthUnits` (String, optional) {#widthunits}

* Default: `'pixels'`

The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](../../developer-guide/coordinate-systems.md#supported-units).

##### `widthScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#widthscale}

* Default: `1`

The scaling multiplier for the width of each line. This prop is a very efficient way to change the width of all objects, comparing to recalculating the width for each object with `getWidth`.

##### `widthMinPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#widthminpixels}

* Default: `0`

The minimum line width in pixels. This prop can be used to prevent the line from getting to thin when zoomed out.

##### `widthMaxPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#widthmaxpixels}

* Default: `Number.MAX_SAFE_INTEGER`

The maximum line width in pixels. This prop can be used to prevent the line from getting to thick when zoomed in.


### Data Accessors

##### `getSourcePosition` ([Function](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getsourceposition}

* Default: `object => object.sourcePosition`

Method called to retrieve the source position of each object.

##### `getTargetPosition` ([Function](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#gettargetposition}

* Default: `object => object.targetPosition`

Method called to retrieve the target position of each object.

##### `getColor` ([Function](../../developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getcolor}

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

##### `getWidth` ([Function](../../developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getwidth}

* Default: `1`

The line width of each object, in units specified by `widthUnits` (default pixels).

* If a number is provided, it is used as the line width for all objects.
* If a function is provided, it is called on each object to retrieve its line width.

## Source

[modules/layers/src/line-layer](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/line-layer)

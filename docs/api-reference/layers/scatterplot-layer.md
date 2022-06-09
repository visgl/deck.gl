import {ScatterplotLayerDemo} from 'website-components/doc-demos/layers';

<ScatterplotLayerDemo />

# ScatterplotLayer

The Scatterplot Layer takes in paired latitude and longitude coordinated
points and renders them as circles with a certain radius.

```js
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';

function App({data, viewState}) {
  /**
   * Data format:
   * [
   *   {name: 'Colma (COLM)', code:'CM', address: '365 D Street, Colma CA 94014', exits: 4214, coordinates: [-122.466233, 37.684638]},
   *   ...
   * ]
   */
  const layer = new ScatterplotLayer({
    id: 'scatterplot-layer',
    data,
    pickable: true,
    opacity: 0.8,
    stroked: true,
    filled: true,
    radiusScale: 6,
    radiusMinPixels: 1,
    radiusMaxPixels: 100,
    lineWidthMinPixels: 1,
    getPosition: d => d.coordinates,
    getRadius: d => Math.sqrt(d.exits),
    getFillColor: d => [255, 140, 0],
    getLineColor: d => [0, 0, 0]
  });

  return <DeckGL viewState={viewState}
    layers={[layer]}
    getTooltip={({object}) => object && `${object.name}\n${object.address}`} />;
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
import {ScatterplotLayer} from '@deck.gl/layers';
new ScatterplotLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.ScatterplotLayer({});
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/core/layer.md) properties.

### Render Options

##### `radiusUnits` (String, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `'meters'`

The units of the radius, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](/docs/developer-guide/coordinate-systems.md#supported-units).

##### `radiusScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

A global radius multiplier for all points.

##### `lineWidthUnits` (String, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `'meters'`

The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](/docs/developer-guide/coordinate-systems.md#supported-units).

##### `lineWidthScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

A global line width multiplier for all points.

##### `stroked` (Boolean, optional)

* Default: `false`

Draw the outline of points.

##### `filled` (Boolean, optional)

* Default: `true`

Draw the filled area of points.

##### `radiusMinPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0`

The minimum radius in pixels. This prop can be used to prevent the circle from getting too small when zoomed out.

##### `radiusMaxPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `Number.MAX_SAFE_INTEGER`

The maximum radius in pixels. This prop can be used to prevent the circle from getting too big when zoomed in.

##### `lineWidthMinPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0`

The minimum line width in pixels. This prop can be used to prevent the stroke from getting too thin when zoomed out.

##### `lineWidthMaxPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `Number.MAX_SAFE_INTEGER`

The maximum line width in pixels. This prop can be used to prevent the path from getting too thick when zoomed in.

##### `billboard` (Boolean, optional)

- Default: `false`

If `true`, rendered circles always face the camera. If `false` circles face up (i.e. are parallel with the ground plane).

##### `antialiasing` (Boolean, optional)

- Default: `true`

If `true`, circles are rendered with smoothed edges. If `false`, circles are rendered with rough edges. Antialiasing can cause artifacts on edges of overlapping circles. Also, antialiasing isn't supported in FirstPersonView. 

### Data Accessors

##### `getPosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `object => object.position`

Method called to retrieve the position of each object.

##### `getRadius` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

The radius of each object, in units specified by `radiusUnits` (default meters).

* If a number is provided, it is used as the radius for all objects.
* If a function is provided, it is called on each object to retrieve its radius.

##### `getColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

It will be overridden by `getLineColor` and `getFillColor` if these new accessors are specified.

##### `getFillColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the filled color for all objects.
* If a function is provided, it is called on each object to retrieve its color.
* If not provided, it falls back to `getColor`.

##### `getLineColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the outline color for all objects.
* If a function is provided, it is called on each object to retrieve its color.
* If not provided, it falls back to `getColor`.

##### `getLineWidth` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

The width of the outline of each object, in units specified by `lineWidthUnits` (default meters).

* If a number is provided, it is used as the outline width for all objects.
* If a function is provided, it is called on each object to retrieve its outline width.
* If not provided, it falls back to `strokeWidth`.

## Source

[modules/layers/src/scatterplot-layer](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/scatterplot-layer)

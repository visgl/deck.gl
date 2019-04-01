<!-- INJECT:"PolygonLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/geo--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/geo-layers" />
  <img src="https://img.shields.io/badge/fp64-yes-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# H3HexagonLayer

The `H3HexagonLayer` renders hexagons from the [H3](https://uber.github.io/h3/) geospatial indexing system.

`H3HexagonLayer` is a [CompositeLayer](/docs/api-reference/composite-layer.md).

```js
import DeckGL from '@deck.gl/react';
import {H3HexagonLayer} from '@deck.gl/geo-layers';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {
   *     hexagonId: '882830829bfffff',
   *     eventCount: 14030
   *   },
   *   ...
   * ]
   */
  const layer = new H3HexagonLayer({
    id: 'h3-hexagon-layer',
    data,
    extruded: true,
    pickable: true,
    getHexagon: d => d.hexagonId,
    getElevation: d => d.eventCount / 3,
    getColor: d => [255, (1 - d.eventCount / 20000) * 255, 0],
    onHover: ({object, x, y}) => {
      const tooltip = `${object.hexagonId}\nEvents: ${object.eventCount}`;
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
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```js
import {H3HexagonLayer} from '@deck.gl/geo-layers';
new H3HexagonLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/@deck.gl@~7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@~7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@~7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@~7.0.0/dist.min.js"></script>
```

```js
new deck.H3HexagonLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) and [CompositeLayer](/docs/api-reference/composite-layer.md) properties.

### Render Options

##### `highPrecision` (Boolean, optional)

* Default: `false`

Each hexagon in the H3 indexing system is [slightly different in shape](https://uber.github.io/h3/#/documentation/core-library/coordinate-systems).
To draw a large number of hexagons efficiently, the `H3HexagonLayer` may choose to use instanced drawing by assuming that all hexagons within the current viewport have the same shape as the one at the center of the current viewport. The discrepancy is usually too small to be visible.

However, there are 12 pentagons world wide at each resolution. The hexagons at and around these odd geolocations cannot be correctly rendered using the above approximation. In this case, `H3HexagonLayer` may choose to switch to high-precision mode, where it trades performance for accuracy.

* if `false`, the layer chooses the mode automatically. High-precision rendering is only used if resolution is at or below `5`, or if a pentagon is found in the data.
* if `true`, always use high-precision rendering.


##### `coverage` (Number, optional)

* Default: `1`

Hexagon size multiplier, between 0 - 1. When a number smaller than `1` is provided, the hexagon is scaled down around the centroid.

##### `elevationScale` (Number, optional)

* Default: `1`

Column elevation multiplier. The elevation of column is calculated by
`elevationScale * getElevation(d)`. `elevationScale` is a handy property
to scale all hexagon elevations without updating the data.

##### `extruded` (Boolean, optional)

* Default: `true`

Whether to extrude hexagon. If set to false, all hexagons will be set to flat.

##### `fp64` (Boolean, optional)

* Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode. Note that since deck.gl v6.1, the default 32-bit projection uses a hybrid mode that matches 64-bit precision with significantly better performance.

##### `material` (Object, optional)

* Default: `new PhongMaterial()`

This is an object that contains material props for [lighting effect](/docs/effects/lighting-effect.md) applied on extruded polygons.


### Data Accessors

##### `getHexagon` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

* Default: `object => object.hexagon`

Method called to retrieve the [H3](https://uber.github.io/h3/) hexagon index of each object. Note that all hexagons within one `H3HexagonLayer` must use the same [resolution](https://uber.github.io/h3/#/documentation/core-library/resolution-table).

##### `getColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[255, 0, 255, 255]`

The rgba color of each object, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

##### `getElevation` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1000`

The elevation of each cell in meters.

* If a number is provided, it is used as the elevation for all objects.
* If a function is provided, it is called on each object to retrieve its elevation.


## Sub Layers

The `H3HexagonLayer` renders the following sublayers:

* `hexagon-cell` - a [ColumnLayer](/docs/layers/column-layer.md) rendering all hexagons.



## Source

[modules/geo-layers/src/h3-layers/h3-hexagon-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/h3-layers/h3-hexagon-layer.js)


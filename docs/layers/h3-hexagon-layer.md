<!-- INJECT:"H3HexagonLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/geo--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/geo-layers" />
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
   *     hex: '88283082b9fffff',
   *     count: 96
   *   },
   *   ...
   * ]
   */
  const layer = new H3HexagonLayer({
    id: 'h3-hexagon-layer',
    data,
    pickable: true,
    wireframe: false,
    filled: true,
    extruded: true,
    elevationScale: 20,
    getHexagon: d => d.hex,
    getFillColor: d => [255, (1 - d.count / 500) * 255, 0],
    getElevation: d => d.count,
    onHover: ({object, x, y}) => {
      const tooltip = `${object.hex} count: ${object.count}`;
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
<script src="https://unpkg.com/h3-js"></script>
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.H3HexagonLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md), [CompositeLayer](/docs/api-reference/composite-layer.md), and [PolygonLayer](/docs/layers/polygon-layer.md) properties, plus the following:


### Render Options

##### `highPrecision` (Boolean, optional)

* Default: `false`

Each hexagon in the H3 indexing system is [slightly different in shape](https://uber.github.io/h3/#/documentation/core-library/coordinate-systems).
To draw a large number of hexagons efficiently, the `H3HexagonLayer` may choose to use instanced drawing by assuming that all hexagons within the current viewport have the same shape as the one at the center of the current viewport. The discrepancy is usually too small to be visible.

However, there are 12 pentagons world wide at each resolution. The hexagons at and around these odd geolocations cannot be correctly rendered using the above approximation. In this case, `H3HexagonLayer` may choose to switch to high-precision mode, where it trades performance for accuracy.

* if `false`, the layer chooses the mode automatically. High-precision rendering is only used if resolution is at or below `5`, or if a pentagon is found in the data.
* if `true`, always use high-precision rendering.

##### `coverage` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

Hexagon radius multiplier, between 0 - 1. When `coverage` = 1, hexagon is rendered with actual size, by specifying a different value (between 0 and 1) hexagon can be scaled down.


### Data Accessors

##### `getHexagon` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

* Default: `object => object.hexagon`

Method called to retrieve the [H3](https://uber.github.io/h3/) hexagon index of each object. Note that all hexagons within one `H3HexagonLayer` must use the same [resolution](https://uber.github.io/h3/#/documentation/core-library/resolution-table).


## Sub Layers

The `H3HexagonLayer` renders the following sublayers:

* `hexagon-cell-hifi` - On `highPrecision` mode, rendered by [SolidPolygonLayer](/docs/layers/solid-polygon-layer.md)
* `hexagon-cell` - On non `highPrecision` mode, rendered by [ColumnLayer](/docs/layers/column-layer.md)



## Source

[modules/geo-layers/src/h3-layers/h3-hexagon-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/h3-layers/h3-hexagon-layer.js)

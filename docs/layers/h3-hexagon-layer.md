<!-- INJECT:"PolygonLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="extruded" />
</p>

# H3HexagonLayer

The `H3HexagonLayer` renders hexagons from the [H3](https://uber.github.io/h3/) geospatial indexing system.

`H3HexagonLayer` is a [CompositeLayer](/docs/api-reference/composite-layer.md).

```js
import DeckGL, {H3HexagonLayer} from 'deck.gl';
import * as h3 from 'h3-js';

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
    h3,
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

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) and [CompositeLayer](/docs/api-reference/composite-layer.md) properties.

### H3

##### `h3` (Object)

The H3 interface. This allows users to use a version of the [H3 Core Library](https://github.com/uber/h3) that matches the source data.
The `h3` object is expected to contain the following methods:

* `h3GetResolution`
* `h3ToGeo`
* `geoToH3`
* `h3ToGeoBoundary`

### Render Options

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

##### `getHexagon` (Function, optional)

* Default: `object => object.hexagon`

Method called to retrieve the [H3](https://uber.github.io/h3/) hexagon index of each object. Note that all hexagons within one `H3HexagonLayer` must use the same [resolution](https://uber.github.io/h3/#/documentation/core-library/resolution-table).

##### `getColor` (Function|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[255, 0, 255, 255]`

The rgba color of each object, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

##### `getElevation` (Function|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1000`

The elevation of each cell in meters.

* If a number is provided, it is used as the elevation for all objects.
* If a function is provided, it is called on each object to retrieve its elevation.


## Sub Layers

The `H3HexagonLayer` renders the following sublayers:

* `hexagon-cell` - a [ColumnLayer](/docs/layers/column-layer.md) rendering all hexagons.


## Remarks

* Each hexagon in the H3 indexing system is [slightly different in shape](https://uber.github.io/h3/#/documentation/core-library/coordinate-systems). To draw a large number of hexagons efficiently, the `H3HexagonLayer` assumes that all hexagons within the current viewport have the same shape as the one at the center of the current viewport. This strategy is usually sufficient. However, the discrepancy may become visually significant at rare geolocations. In that case, the [H3ClusterLayer] can be used as an alternative by trading performance for accuracy.


## Source

[modules/geo-layers/src/h3-layers/h3-hexagon-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/h3-layers/h3-hexagon-layer.js)


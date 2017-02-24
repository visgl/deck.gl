# ScreenGridLayer

The ScreenGridLayer takes in an array of latitude and longitude
coordinated points, aggregates them into histogram bins and
renders as a grid.

Note: The aggregation is done in screen space, so the data prop
needs to be reaggregated by the layer whenever the map is zoomed or panned.
This means that this layer is best used with small data set, however the
visuals when used with the right data set can be quite effective.

<div align="center">
  <img height="300" src="/demo/src/static/images/demo-thumb-screengrid.jpg" />
</div>

    import {ScreenGridLayer} from 'deck.gl';

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

## Layer-specific Properties

##### `unitWidth` (Number, optional)

- Default: `100`

Unit width of the bins.

##### `unitHeight` (Number, optional)

- Default: `100`

Unit height of the bins.

#### `minColor` (Number[4], optional)

- Default: `[0, 0, 0, 255]`

Expressed as an rgba array, minimal color that could be rendered by a tile.

#### `maxColor` (Number[4], optional)

- Default: `[0, 255, 0, 255]`

Expressed as an rgba array, maximal color that could be rendered by a tile.

#### `getPosition` (Function, optional)

- Default: `object => object.position`

Method called to retrieve the position of each object.

#### `getWeight` (Function, optional)

- Default: `object => 1`

Method called to retrieve the weight of each object.

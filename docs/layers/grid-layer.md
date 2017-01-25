# GridLayer

The GridLayer is a generic layer that can render heatmap. It takes latitude longitude delta
of the cells, and the top left coordinate each cells. grid can be 3d when pass in a height
and set enable3d to true

<div align="center">
  <img height="300" src="/demo/src/static/images/grid-layer.png" />
</div>

    import {GridLayer} from 'deck.gl';
    
Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

## Layer-specific Properties

##### `latDelta` (Number, optional)

- Default: `0.0089`

Latitude increment of each cell

##### `lngDelta` (Number, optional)

- Default: `0.0113`

Longitude increment of each cell

##### `enable3d` (Boolean, optional)

- Default: `true`

Whether to enable grid elevation. If se to false, all grid will be flat.

##### `opacity` (Number, optional)

- Default: `0.6`

##### `getPosition` (Function, optional)

- Default: `cell => cell.position`

Method called to retrieve the top left corner of each cell. 
Expecting [lon, lat].

##### `getElevation` (Function, optional)

- Default: `cell => cell.elevation`

Method called to retrieve the elevation of each cell. 
Expecting a number, 1 unit approximate to 100 meter

##### `getColor` (Function, optional)

- Default: `cell => cell.color`

Method called to retrieve the rgba color of each cell. ExpectingIf the alpha parameter
is not provided, it will be set to `255`.

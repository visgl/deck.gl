# Icon Layer

The Icon Layer renders raster icons at given coordinates.

  <div align="center">
    <img height="300" src="/demo/src/static/images/demo-thumb-icon.jpg" />
  </div>

    import {IconLayer} from 'deck.gl';

## Properties

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

##### `iconAtlas` (Texture2D | String, required)

Atlas image url or texture

##### `iconMapping` (Object, required)

Icon names mapped to icon definitions. Each icon is defined with the following values:

  - `x`: x position of icon on the atlas image
  - `y`: y position of icon on the atlas image
  - `width`: width of icon on the atlas image
  - `height`: height of icon on the atlas image
  - `anchorX`: horizontal position of icon anchor. Default: half width.
  - `anchorY`: vertical position of icon anchor. Default: half height.
  - `mask`: whether icon is treated as a transparency mask.
  If `true`, user defined color is applied.
  If `false`, pixel color from the image is applied.
  Default: `false`

##### `sizeScale` (Number, optional)

- Default: `1`

Icon size multiplier.

##### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode

## Accessors

##### `getPosition` (Function, optional)

- Default: `d => d.position`

Method called to retrieve the position of each object, returns `[lng, lat, z]`.

##### `getIcon` (Function, optional)

- Default: `d => d.icon`

Method called to retrieve the icon name of each object, returns string.

##### `getSize` (Function, optional)

- Default: `d => d.size || 1`

Method called to retrieve the height of each icon, returns a number. Unit is pixels.

##### `getColor` (Function, optional)

- Default: `d => d.color || [0, 0, 0, 255]`

Method called to retrieve the color of each object, returns `[r, g, b, a]`.
If the alpha component is not supplied, it is set to `255`.

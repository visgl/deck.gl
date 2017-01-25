# Icon Layer

The Icon Layer renders raster icons at given latitude/longitude coordinates.

    import {IconLayer} from 'deck.gl';

Inherits from all [Base Layer](/docs/layers/base-layer.md) properties.

## Layer-specific Properties

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

##### `size` (Number, optional)

- Default: `30`

Icon size in pixels

##### `getPosition` (Function, optional)

- Default: `d => d.position`

Method called to retrieve the position of each object, returns `[lng, lat, z]`.

##### `getIcon` (Function, optional)

- Default: `d => d.icon`

Method called to retrieve the icon name of each object, returns string.

##### `getScale` (Function, optional)

- Default: `d => d.size`

Method called to retrieve the size multiplier of each object, returns a number.

##### `getColor` (Function, optional)

- Default: `d => d.color`

Method called to retrieve the color of each object, returns `[r, g, b, a]`.

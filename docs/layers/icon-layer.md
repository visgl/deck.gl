<!-- INJECT:"IconLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
</p>

# IconLayer

The Icon Layer renders raster icons at given coordinates.

```js
import DeckGL, {ArcLayer} from 'deck.gl';

const ICON_MAPPING = {
  marker: {x: 0, y: 0, width: 32, height: 32, mask: true}
};

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {position: [-122.4, 37.7], icon: 'marker', size: 24, color: [255, 0, 0]},
   *   ...
   * ]
   */
  const layer = new IconLayer({
    id: 'icon-layer',
    data,
    iconAtlas: '/path/to/image.png',
    iconMapping: ICON_MAPPING
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/base-layer.md) properties.

### Render Options

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

### Data Accessors

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

## Source

[src/layers/core/icon-layer](https://github.com/uber/deck.gl/tree/4.0-release/src/layers/core/icon-layer)


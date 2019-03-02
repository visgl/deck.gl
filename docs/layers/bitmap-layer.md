# BitmapLayer

The BitmapLayer renders a bitmap at specified boundaries.

```js
import {BitmapLayer} from '@deck.gl/experimental-layers';

const App = ({data, viewport}) => {

  const layer = new BitmapLayer({
    id: 'bitmap-layer',
    bitmap: 'https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif',
    bounds: [
      [-71.516, 37.936],
      [-80.425, 37.936],
      [-80.425, 46.437],
      [-71.516, 46.437]
    ],
    desaturate: 0,
    transparentColor: [0, 0, 0, 0],
    tintColor: [255, 255, 255]
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
}
```

## Properties

### Data

##### `bitmap` (String|Texture2D|Image|HTMLCanvasElement)

- Default `null`.

##### `bounds` (Array)

Supported formats:

- Coordinates of the bounding box of the bitmap `[left, bottom, right, top]`
- Coordinates of four corners of the bitmap, should follow the sequence of `[[left, bottom], [left, top], [right, top], [right, bottom]]`. Each position could optionally contain a third component `z`.

`left`, `bottom`, `right`, `top` refers to the coordinate of the corresponding side of the image.

### Render Options

##### `desaturate` (Number)

- Default `0`

The desaturation of the bitmap. Between `[0, 1]`. `0` being the original color and `1` being grayscale.

##### `transparentColor` (Array)

- Default `[0, 0, 0, 0]`

The color to use for transparent pixels, in `[r, g, b, a]`. Each component is in the `[0, 255]` range.

##### `tintColor` (Array)

- Default `[255, 255, 255]`

The color to tint the bitmap by, in `[r, g, b]`. Each component is in the `[0, 255]` range.


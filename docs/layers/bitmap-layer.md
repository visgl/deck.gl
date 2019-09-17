<!-- INJECT:"BitmapLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/layers-lightgrey.svg?style=flat-square" alt="@deck.gl/layers" />
</p>

# BitmapLayer

The BitmapLayer renders a bitmap at specified boundaries.

```js
import DeckGL from '@deck.gl/react';
import {BitmapLayer} from '@deck.gl/layers';

const App = ({data, viewport}) => {

  const layer = new BitmapLayer({
    id: 'bitmap-layer',
    bounds: [-122.5190, 37.7045, -122.355, 37.829],
    image: 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/website/sf-districts.png'
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
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
import {BitmapLayer} from '@deck.gl/layers';
new BitmapLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^7.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^7.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^7.0.0/dist.min.js"></script>
```

```js
new deck.BitmapLayer({});
```


## Properties

### Data

##### `bitmap` (String|Texture2D|Image|HTMLCanvasElement|HTMLVideoElement)

- Default `null`.

##### `bounds` (Array)

Supported formats:

- Coordinates of the bounding box of the bitmap `[left, bottom, right, top]`
- Coordinates of four corners of the bitmap, should follow the sequence of `[[left, bottom], [left, top], [right, top], [right, bottom]]`. Each position could optionally contain a third component `z`.

`left`, `bottom`, `right`, `top` refers to the coordinate of the corresponding side of the image.

### Render Options

##### `desaturate` (Number) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default `0`

The desaturation of the bitmap. Between `[0, 1]`. `0` being the original color and `1` being grayscale.

##### `transparentColor` (Array) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default `[0, 0, 0, 0]`

The color to use for transparent pixels, in `[r, g, b, a]`. Each component is in the `[0, 255]` range.

##### `tintColor` (Array) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default `[255, 255, 255]`

The color to tint the bitmap by, in `[r, g, b]`. Each component is in the `[0, 255]` range.


## Source

[modules/layers/src/bitmap-layer](https://github.com/uber/deck.gl/tree/master/modules/layers/src/bitmap-layer)

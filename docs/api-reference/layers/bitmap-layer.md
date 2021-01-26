import {BitmapLayerDemo} from 'website-components/doc-demos/layers';

<BitmapLayerDemo />

# BitmapLayer

The BitmapLayer renders a bitmap at specified boundaries.

```js
import DeckGL from '@deck.gl/react';
import {BitmapLayer} from '@deck.gl/layers';

function App({data, viewState}) {
  const layer = new BitmapLayer({
    id: 'bitmap-layer',
    bounds: [-122.5190, 37.7045, -122.355, 37.829],
    image: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-districts.png'
  });

  return <DeckGL viewState={viewState} layers={[layer]} />;
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
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.BitmapLayer({});
```


## Properties

### Data

##### `image` (String|Texture2D|Image|ImageData|HTMLCanvasElement|HTMLVideoElement|ImageBitmap|Object)

- Default `null`.

The image to display.

- If a string is supplied, it is interpreted as a URL or a [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs).
- One of the valid [pixel sources for WebGL texture](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D)
- A luma.gl [Texture2D](https://luma.gl/docs/api-reference/webgl/texture-2d) instance
- A plain object that can be passed to the `Texture2D` constructor, e.g. `{width: <number>, height: <number>, data: <Uint8Array>}`. Note that whenever this object shallowly changes, a new texture will be created.

The image data will be converted to a [Texture2D](https://luma.gl/docs/api-reference/webgl/texture-2d) object. See `textureParameters` prop for advanced customization.

##### `bounds` (Array)

Supported formats:

- Coordinates of the bounding box of the bitmap `[left, bottom, right, top]`
- Coordinates of four corners of the bitmap, should follow the sequence of `[[left, bottom], [left, top], [right, top], [right, bottom]]`. Each position could optionally contain a third component `z`.

`left` and `right` refers to the world longitude/x at the corresponding side of the image.
`top` and `bottom` refers to the world latitude/y at the corresponding side of the image.

##### `loadOptions` (Object, optional)

On top of the [default options](/docs/api-reference/core/layer.md#loadoptions), also accepts options for the following loaders:

- [ImageLoader](https://loaders.gl/modules/images/docs/api-reference/image-loader) if the `image` prop is an URL

##### `textureParameters` (Object)

Customize the [texture parameters](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter).

If not specified, the layer uses the following defaults to create a linearly smoothed texture from `image`:

```js
{
  [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
  [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
}
```

For example, to remove smoothing and achieve a pixelated appearance:

```js
import GL from '@luma.gl/constants';

new BitmapLayer({
  ...
  textureParameters: {
    [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
    [GL.TEXTURE_MAG_FILTER]: GL.NEAREST
  }
})
```

This prop is only used when `image` initially loads or changes.

##### `_imageCoordinateSystem` (Number, optional)

> Note: this prop is experimental.

Specifies how image coordinates should be geographically interpreted.

By default, the image is uniformly stretched to fill the geometry defined by `bounds`. This might not be desirable if the image is encoded in a different coordinate system from the projection that the layer is using. For example, a [satellite image encoded in longitude/latitude](https://en.wikipedia.org/wiki/File:Whole_world_-_land_and_oceans_12000.jpg) should not be interpreted linearly when placed in a Web Mercator visualization.

This prop allows you to explicitly inform the layer of the coordinate system of the image:

- `COORDINATE_SYSTEM.LNGLAT` if x-axis maps to longitude and y-axis maps to latitude
- `COORDINATE_SYSTEM.CARTESIAN` if the image is pre-projected into the Web Mercator plane.

This option only works with geospatial views and `bounds` that is orthogonal (`[left, bottom, right, top]`).

See the article on [Coordinate Systems](/docs/developer-guide/coordinate-systems.md) for more information.


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

## Pixel Picking

(From v8.4) The [picking info](/docs/developer-guide/interactivity.md#the-picking-info-object) passed to callbacks (`onHover`, `onClick`, etc.) provides information on which pixel was picked. It contains an additional `bitmap` field if applicable:

- `bitmap`
  + `pixel` ([number, number])  Integer coordinates into the bitmap
  + `size` ({width: number; height: number})  Size of bitmap in pixels
  + `uv` ([number, number]) Normalized (0-1) floating point coordinates

Note that the `bitmap` field can be `null` if on mouse leave or if the bitmap has not yet loaded.

The following code reads the picked pixel color from the bitmap when the layer is clicked:

```js
import {readPixelsToArray} from '@luma.gl/core';

new BitmapLayer({
  image: './my-image.png',
  bounds: [-122.45, 37.75, -122.43, 37.78],
  pickable: true,
  onClick: ({bitmap, layer}) => {
    if (bitmap) {
      const pixelColor = readPixelsToArray(layer.props.image, {
        sourceX: bitmap.pixel[0],
        sourceY: bitmap.pixel[1],
        sourceWidth: 1,
        sourceHeight: 1
      })
      console.log('Color at picked pixel:', pixelColor)
    }
  }
})
```

## Source

[modules/layers/src/bitmap-layer](https://github.com/visgl/deck.gl/tree/master/modules/layers/src/bitmap-layer)

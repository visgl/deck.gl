# BitmapLayer

<!-- -->

Edit on Codepen

The `BitmapLayer` renders a bitmap at specified boundaries.

<!-- -->

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {BitmapLayer} from '@deck.gl/layers';



const layer = new BitmapLayer({

  id: 'BitmapLayer',

  bounds: [-122.519, 37.7045, -122.355, 37.829],

  image: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-districts.png',

  pickable: true

});



new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.74,

    zoom: 11

  },

  controller: true,

  getTooltip: ({bitmap}) => bitmap && `${bitmap.pixel}`,

  layers: [layer]

});
```

```
import {Deck} from '@deck.gl/core';

import {BitmapLayer, BitmapLayerPickingInfo} from '@deck.gl/layers';



const layer = new BitmapLayer({

  id: 'BitmapLayer',

  bounds: [-122.519, 37.7045, -122.355, 37.829],

  image: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-districts.png',

  pickable: true

});



new Deck({

  initialViewState: {

    longitude: -122.4,

    latitude: 37.74,

    zoom: 11

  },

  controller: true,

  getTooltip: ({bitmap}: BitmapLayerPickingInfo) => bitmap && `${bitmap.pixel}`,

  layers: [layer]

});
```

```
import React from 'react';

import {DeckGL} from '@deck.gl/react';

import {BitmapLayer} from '@deck.gl/layers';

import type {BitmapLayerPickingInfo} from '@deck.gl/layers';



function App() {

  const layer = new BitmapLayer({

    id: 'BitmapLayer',

    bounds: [-122.519, 37.7045, -122.355, 37.829],

    image: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-districts.png',

    pickable: true

  });



  return <DeckGL

    initialViewState={{

      longitude: -122.4,

      latitude: 37.74,

      zoom: 11

    }}

    controller

    getTooltip={({bitmap}: BitmapLayerPickingInfo) => bitmap && `${bitmap.pixel}`}

    layers={[layer]}

  />;

}
```

## Installation[​](#installation "Direct link to Installation")

To install the dependencies from NPM:

```
npm install deck.gl

# or

npm install @deck.gl/core @deck.gl/layers
```

```
import {BitmapLayer} from '@deck.gl/layers';

import type {BitmapLayerProps, BitmapLayerPickingInfo} from '@deck.gl/layers';



new BitmapLayer(...props: BitmapLayerProps);
```

To use pre-bundled scripts:

```
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>

<!-- or -->

<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>

<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
```

```
new deck.BitmapLayer({});
```

## Properties[​](#properties "Direct link to Properties")

### Data[​](#data "Direct link to Data")

#### `image` (string | Texture | Image | ImageData | HTMLCanvasElement | HTMLVideoElement | ImageBitmap | Promise | object)[​](#image "Direct link to image")

* Default `null`.

The image to display.

* If a string is supplied, it is interpreted as a URL or a [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs).

* One of the following, or a Promise that resolves to one of the following:

  <!-- -->

  * One of the valid [pixel sources for WebGL2 texture](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D)
  * A luma.gl [Texture](https://luma.gl/docs/api-reference/core/resources/texture) instance
  * A plain object that can be passed to the `Texture` constructor, e.g. `{width: <number>, height: <number>, data: <Uint8Array>}`. Note that whenever this object shallowly changes, a new texture will be created.

The image data will be converted to a [Texture](https://luma.gl/docs/api-reference/core/resources/texture) object. See `textureParameters` prop for advanced customization.

#### `bounds` (number\[4] | Position\[4])[​](#bounds "Direct link to bounds")

Supported formats:

* Coordinates of the bounding box of the bitmap `[left, bottom, right, top]`
* Coordinates of four corners of the bitmap, should follow the sequence of `[[left, bottom], [left, top], [right, top], [right, bottom]]`. Each position could optionally contain a third component `z`.

`left` and `right` refers to the world longitude/x at the corresponding side of the image. `top` and `bottom` refers to the world latitude/y at the corresponding side of the image.

#### `loadOptions` (object, optional)[​](#loadoptions "Direct link to loadoptions")

On top of the [default options](https://deck.gl/docs/api-reference/core/layer.md#loadoptions), also accepts options for the following loaders:

* [ImageLoader](https://loaders.gl/modules/images/docs/api-reference/image-loader) if the `image` prop is an URL

#### `textureParameters` (object)[​](#textureparameters "Direct link to textureparameters")

Customize the [texture parameters](https://luma.gl/docs/api-reference/core/resources/sampler#samplerprops).

If not specified, the layer uses the following defaults to create a linearly smoothed texture from `image`:

```
{

  minFilter: 'linear',

  magFilter: 'linear',

  mipmapFilter: 'linear',

  addressModeU: 'clamp-to-edge',

  addressModeV: 'clamp-to-edge'

}
```

For example, to remove smoothing and achieve a pixelated appearance:

```
new BitmapLayer({

  // ...

  textureParameters: {

    minFilter: 'nearest',

    magFilter: 'nearest'

  }

})
```

This prop is only used when `image` initially loads or changes.

#### `_imageCoordinateSystem` (string, optional)[​](#_imagecoordinatesystem "Direct link to _imagecoordinatesystem")

> Note: this prop is experimental.

Specifies how image coordinates should be geographically interpreted.

By default, the image is uniformly stretched to fill the geometry defined by `bounds`. This might not be desirable if the image is encoded in a different coordinate system from the projection that the layer is using. For example, a [satellite image encoded in longitude/latitude](https://en.wikipedia.org/wiki/File:Whole_world_-_land_and_oceans_12000.jpg) should not be interpreted linearly when placed in a Web Mercator visualization.

This prop allows you to explicitly inform the layer of the coordinate system of the image:

* `'default'` to use the layer's default image interpretation
* `'lnglat'` if x-axis maps to longitude and y-axis maps to latitude
* `'cartesian'` if the image is pre-projected into the Web Mercator plane.

This option only works with geospatial views and `bounds` that is orthogonal (`[left, bottom, right, top]`).

See the article on [Coordinate Systems](https://deck.gl/docs/developer-guide/coordinate-systems.md) for more information.

### Render Options[​](#render-options "Direct link to Render Options")

#### `desaturate` (number) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#desaturate "Direct link to desaturate")

* Default `0`

The desaturation of the bitmap. Between `[0, 1]`. `0` being the original color and `1` being grayscale.

#### `transparentColor` (Color) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#transparentcolor "Direct link to transparentcolor")

* Default `[0, 0, 0, 0]`

The color to use for transparent pixels, in `[r, g, b, a]`. Each component is in the `[0, 255]` range. Equivalent to overlaying the image over a background in this color.

#### `tintColor` (Color) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square%22)[​](#tintcolor "Direct link to tintcolor")

* Default `[255, 255, 255]`

The color to tint the bitmap by, in `[r, g, b]`. Each component is in the `[0, 255]` range.

## Pixel Picking[​](#pixel-picking "Direct link to Pixel Picking")

The [picking info](https://deck.gl/docs/developer-guide/interactivity.md#the-pickinginfo-object) passed to callbacks (`onHover`, `onClick`, etc.) provides information on which pixel was picked. It contains an additional `bitmap` field if applicable:

* `bitmap`

  * `pixel` (`[x: number, y: number]`) Integer coordinates into the bitmap
  * `size` (`{width: number; height: number}`) Size of bitmap in pixels
  * `uv` (`[u: number, v: number]`) Normalized (0-1) floating point coordinates

Note that the `bitmap` field can be `null` if on mouse leave or if the bitmap has not yet loaded.

The following code reads the picked pixel color from the bitmap when the layer is clicked:

```
new BitmapLayer({

  image: './my-image.png',

  bounds: [-122.45, 37.75, -122.43, 37.78],

  pickable: true,

  onClick: ({bitmap, layer}) => {

    if (bitmap) {

      const {device} = layer.context;

      const pixelColor = device.readPixelsToArrayWebGL(layer.props.image, {

        sourceX: bitmap.pixel[0],

        sourceY: bitmap.pixel[1],

        sourceWidth: 1,

        sourceHeight: 1

      });

      console.log('Color at picked pixel:', pixelColor);

    }

  }

})
```

## Source[​](#source "Direct link to Source")

[modules/layers/src/bitmap-layer](https://github.com/visgl/deck.gl/tree/9.4-release/modules/layers/src/bitmap-layer)

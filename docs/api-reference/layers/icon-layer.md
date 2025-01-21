# IconLayer

import {IconLayerDemo} from '@site/src/doc-demos/layers';

<IconLayerDemo />

The `IconLayer` renders raster icons at given coordinates.

There are two approaches to load icons. You can pre-generated a sprite image (`iconAtlas`), which packs all your icons
into one layout, and a JSON descriptor (`iconMapping`), which describes the position and size of each icon in the `iconAtlas`.
You can create sprite images with tools such as [TexturePacker](https://www.codeandweb.com/texturepacker). This is the
most efficient way to load icons.

It is also possible to ask `IconLayer` to generate `iconAtlas` dynamically. This is slower but might be useful in certain
use cases.

## Example: pre-packed iconAtlas

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {IconLayer} from '@deck.gl/layers';

const layer = new IconLayer({
  id: 'IconLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',
  getColor: d => [Math.sqrt(d.exits), 140, 0],
  getIcon: d => 'marker',
  getPosition: d => d.coordinates,
  getSize: 40,
  iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
  iconMapping: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json',
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}) => object && object.name,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, PickingInfo} from '@deck.gl/core';
import {IconLayer} from '@deck.gl/layers';

type BartStation = {
  name: string;
  entries: number;
  exits: number;
  coordinates: [longitude: number, latitude: number];
};

const layer = new IconLayer<BartStation>({
  id: 'IconLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',
  getColor: (d: BartStation) => [Math.sqrt(d.exits), 140, 0],
  getIcon: (d: BartStation) => 'marker',
  getPosition: (d: BartStation) => d.coordinates,
  getSize: 40,
  iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
  iconMapping: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json',
  pickable: true
});

new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.74,
    zoom: 11
  },
  controller: true,
  getTooltip: ({object}: PickingInfo<BartStation>) => object && object.name,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL from '@deck.gl/react';
import {IconLayer} from '@deck.gl/layers';
import type {PickingInfo} from '@deck.gl/core';

type BartStation = {
  name: string;
  entries: number;
  exits: number;
  coordinates: [longitude: number, latitude: number];
};

function App() {
  const layer = new IconLayer<BartStation>({
    id: 'IconLayer',
    data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',
    getColor: (d: BartStation) => [Math.sqrt(d.exits), 140, 0],
    getIcon: (d: BartStation) => 'marker',
    getPosition: (d: BartStation) => d.coordinates,
    getSize: 40,
    iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
    iconMapping: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json',
    pickable: true
  });

  return <DeckGL
    initialViewState={{
      longitude: -122.4,
      latitude: 37.74,
      zoom: 11
    }}
    controller
    getTooltip={({object}: PickingInfo<BartStation>) => object && object.name}
    layers={[layer]}
  />;
}
```

  </TabItem>
</Tabs>


## Example: auto packing iconAtlas

In some use cases, it is not possible to know the icons that will be used. Instead, each icon needs to be fetched from
a programmatically generated URL at runtime. For example, if you want to visualize avatars of github contributors for
a project on a map, it is not convenient for you to generate the `iconAtlas` with all the contributors' avatars.
In this case, you can follow this example. Auto packing icons is less efficient than pre-packed.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {IconLayer} from '@deck.gl/layers';
import {Octokit} from '@octokit/rest';
const octokit = new Octokit();

const layer = new IconLayer<User>({
  id: 'IconLayer',
  data: octokit.repos.getContributors({owner: 'visgl', repo: 'deck.gl'}),
  dataTransform: result => result.data,
  getIcon: d => ({
    url: d.avatar_url,
    width: 128,
    height: 128
  }),
  getPosition: (d, {index}) => [index * 100, Math.sqrt(d.contributions) * 10, 0],
  getSize: 40,
  pickable: true
});

new Deck({
  views: new OrthographicView(),
  initialViewState: {
    target: [0, 0, 0],
    zoom: 0
  },
  controller: true,
  getTooltip: ({object}) => object && `${object.login}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck, OrthographicView, PickingInfo} from '@deck.gl/core';
import {IconLayer} from '@deck.gl/layers';
import {Octokit} from '@octokit/rest';
const octokit = new Octokit();

// https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-repository-contributors
type User = {
  id: number;
  login: string;
  avatar_url: string;
  contributions: number;
};

const layer = new IconLayer<User>({
  id: 'IconLayer',
  data: octokit.repos.getContributors({owner: 'visgl', repo: 'deck.gl'}),
  dataTransform: result => result.data,
  getIcon: (d: User) => ({
    url: d.avatar_url,
    width: 128,
    height: 128
  }),
  getPosition: (d: User, {index}) => [index * 100, Math.sqrt(d.contributions) * 10, 0],
  getSize: 40,
  pickable: true
});

new Deck({
  views: new OrthographicView(),
  initialViewState: {
    target: [0, 0, 0],
    zoom: 0
  },
  controller: true,
  getTooltip: ({object}: PickingInfo<User>) => object && `${object.login}`,
  layers: [layer]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import DeckGL from '@deck.gl/react';
import {IconLayer} from '@deck.gl/layers';
import type {PickingInfo} from '@deck.gl/core';
import {Octokit} from '@octokit/rest';
const octokit = new Octokit();

// https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-repository-contributors
type User = {
  id: number;
  login: string;
  avatar_url: string;
  contributions: number;
};

function App() {
  const layer = new IconLayer<User>({
    id: 'IconLayer',
    data: octokit.repos.getContributors({owner: 'visgl', repo: 'deck.gl'}),
    dataTransform: result => result.data,
    getIcon: (d: User) => ({
      url: d.avatar_url,
      width: 128,
      height: 128
    }),
    getPosition: (d: User, {index}) => [index * 100, Math.sqrt(d.contributions) * 10, 0],
    getSize: 40,
    pickable: true
  });

  return <DeckGL
    initialViewState={{
      longitude: -122.4,
      latitude: 37.74,
      zoom: 11
    }}
    controller
    getTooltip={({object}: PickingInfo<User>) => object && `${object.login}`}
    layers={[layer]}
  />;
}
```

  </TabItem>
</Tabs>


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers
```

```ts
import {IconLayer} from '@deck.gl/layers';
import type {IconLayerProps} from '@deck.gl/layers';

new IconLayer<DataT>(...props: IconLayerProps<DataT>[]);
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.IconLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md) properties.

#### `iconAtlas` (string | Texture | Image | ImageData | HTMLCanvasElement | HTMLVideoElement | ImageBitmap | Promise | object, optional) {#iconatlas}

A pre-packed image that contains all icons.

- If a string is supplied, it is interpreted as a URL or a [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs).
- One of the following, or a Promise that resolves to one of the following:
  + One of the valid [pixel sources for WebGL2 texture](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D)
  + A luma.gl [Texture](https://luma.gl/docs/api-reference/core/resources/texture/) instance
  + A plain object that can be passed to the `Texture` constructor, e.g. `{width: <number>, height: <number>, data: <Uint8Array>}`. Note that whenever this object shallowly changes, a new texture will be created.

The image data will be converted to a [Texture](https://luma.gl/docs/api-reference/core/resources/texture) object. See `textureParameters` prop for advanced customization.

If you go with pre-packed strategy, this prop is required.

If you choose to use auto packing, this prop should be left empty.

#### `iconMapping` (object | string, optional) {#iconmapping}

Icon names mapped to icon definitions, or a URL to load such mapping from a JSON file. Each icon is defined with the following values:

- `x` (number, required): x position of icon on the atlas image
- `y` (number, required): y position of icon on the atlas image
- `width` (number, required): width of icon on the atlas image
- `height` (number, required): height of icon on the atlas image
- `anchorX` (number, optional): horizontal position of icon anchor. Default: half width.
- `anchorY` (number, optional): vertical position of icon anchor. Default: half height.
- `mask` (boolean, optional): whether icon is treated as a transparency mask.
  If `true`, user defined color is applied.
  If `false`, pixel color from the image is applied. User still can specify the opacity through getColor.
  Default: `false`

If you go with pre-packed strategy, this prop is required.

If you choose to use auto packing, this prop should be left empty.

#### `sizeScale` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#sizescale}

- Default: `1`

Icon size multiplier.

#### `sizeUnits` (string, optional) {#sizeunits}

* Default: `pixels`

The units of the size, one of `'meters'`, `'common'`, and `'pixels'`. See [unit system](../../developer-guide/coordinate-systems.md#supported-units).

#### `sizeMinPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#sizeminpixels}

* Default: `0`

The minimum size in pixels. When using non-pixel `sizeUnits`, this prop can be used to prevent the icon from getting too small when zoomed out.

#### `sizeMaxPixels` (number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#sizemaxpixels}

* Default: `Number.MAX_SAFE_INTEGER`

The maximum size in pixels. When using non-pixel `sizeUnits`, this prop can be used to prevent the icon from getting too big when zoomed in.

#### `billboard` (boolean, optional) {#billboard}

- Default: `true`

If `true`, the icon always faces camera. Otherwise the icon faces up (z).

#### `alphaCutoff` (number, optional) {#alphacutoff}

- Default: `0.05`

Discard pixels whose opacity is below this threshold. A discarded pixel would create a "hole" in the icon that is not considered part of the object. This is useful for customizing picking behavior, e.g. setting `alphaCutoff: 0, autoHighlight` will highlight an object whenever the cursor moves into its bounding box, instead of over the visible pixels.


#### `loadOptions` (object, optional) {#loadoptions}

On top of the [default options](../core/layer.md#loadoptions), also accepts options for the following loaders:

- [ImageLoader](https://loaders.gl/modules/images/docs/api-reference/image-loader) if the `iconAtlas` prop is an URL, or if `getIcon` returns URLs for auto-packing


#### `textureParameters` (object) {#textureparameters}

Customize the [texture parameters](https://luma.gl/docs/api-reference/core/resources/sampler#samplerprops).

If not specified, the layer uses the following defaults to create a linearly smoothed texture from `iconAtlas`:

```ts
{
  minFilter: 'linear',
  magFilter: 'linear',
  mipmapFilter: 'linear',
  addressModeU: 'clamp-to-edge',
  addressModeV: 'clamp-to-edge'
}
```

### Data Accessors

#### `getIcon` ([Accessor&lt;string&gt;](../../developer-guide/using-layers.md#accessors), optional) {#geticon}

- Default: `d => d.icon`

Method called to retrieve the icon name of each object, returns string or object.

If you go with pre-packed strategy, then `getIcon` should return a string representing name of the icon,
used to retrieve icon definition from given `iconMapping`.

If you choose to use auto packing, then `getIcon` should return an object which contains
the following properties.

- `url` (string, required): url to fetch the icon
- `height` (number, required): max height of icon
- `width` (number, required): max width of icon
- `id`: (string, optional): unique identifier of the icon, fall back to `url` if not specified
- `anchorX`, `anchorY`, `mask` are the same as mentioned in `iconMapping`

`IconLayer` uses `id` (fallback to `url`) to dedupe icons. For icons with the same id, even if their sizes differ, `IconLayer` will only define one icon according to the first occurrence and ignore the rest of them. Vice versa, for icons with different ids, even if `url`s are the same, the image will be fetched again to create a new definition with different size, anchor, etc.

The image loaded from `url` is always resized to fit the box defined by `[width, height]` while preserving its aspect ratio.


#### `getPosition` ([Accessor&lt;Position&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getposition}

- Default: `d => d.position`

Method called to retrieve the position of each object, returns `[lng, lat, z]`.


#### `getSize` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getsize}

- Default: `1`

The height of each object, in units specified by `sizeUnits` (default pixels).

- If a number is provided, it is used as the size for all objects.
- If a function is provided, it is called on each object to retrieve its size.


#### `getColor` ([Accessor&lt;Color&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getcolor}

- Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

- If an array is provided, it is used as the color for all objects.
- If a function is provided, it is called on each object to retrieve its color.
- If `mask` = false, only the alpha component will be used to control the opacity of the icon.

#### `getAngle` ([Accessor&lt;number&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getangle}

- Default: `0`

The rotating angle  of each object, in degrees.

- If a number is provided, it is used as the angle for all objects.
- If a function is provided, it is called on each object to retrieve its angle.

#### `getPixelOffset` ([Accessor&lt;number[2]&gt;](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getpixeloffset}

- Default: `[0, 0]`

Screen space offset relative to the `coordinates` in pixel unit.

* If an array is provided, it is used as the offset for all objects.
* If a function is provided, it is called on each object to retrieve its offset.

### Callbacks

#### `onIconError` (Function) {#oniconerror}

* Default: `null`

Only used when using auto-packing. If the attempt to fetch an icon returned by `getIcon` fails, this callback is called with the following arguments:

- `event` (object)
  + `url` (string) - the URL that was trying to fetch
  + `loadOptions` (object) - the load options used for the fetch
  + `source` (object) - the original data object that requested this icon
  + `sourceIndex` (object) - the index of the original data object that requested this icon
  + `error` (Error)


## Use binary attributes

This section is about the special requirements when [supplying attributes directly](../../developer-guide/performance.md#supply-attributes-directly) to an `IconLayer`.

If `data.attributes.getIcon` is supplied, since its value can only be a typed array, `iconMapping` can only use integers as keys.


## Source

[modules/layers/src/icon-layer](https://github.com/visgl/deck.gl/tree/9.1-release/modules/layers/src/icon-layer)

<!-- INJECT:"IconLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/layers-lightgrey.svg?style=flat-square" alt="@deck.gl/layers" />
</p>

# IconLayer

The Icon Layer renders raster icons at given coordinates.

There are two approaches to load icons. You can pre-generated a sprite image (`iconAtlas`), which packs all your icons
into one layout, and a JSON descriptor (`iconMapping`), which describes the position and size of each icon in the `iconAtlas`.
You can create sprite images with tools such as [TexturePacker](https://www.codeandweb.com/texturepacker). This is the
most efficient way to load icons.

It is also possible to ask `IconLayer` to generate `iconAtlas` dynamically. This is slower but might be useful in certain
use cases.

## Example: pre-packed iconAtlas

```js
import DeckGL from '@deck.gl/react';
import {IconLayer} from '@deck.gl/layers';

const ICON_MAPPING = {
  marker: {x: 0, y: 0, width: 32, height: 32, mask: true}
};

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {name: 'Colma (COLM)', address: '365 D Street, Colma CA 94014', exits: 4214, coordinates: [-122.466233, 37.684638]},
   *   ...
   * ]
   */
  const layer = new IconLayer({
    id: 'icon-layer',
    data,
    pickable: true,
    // iconAtlas and iconMapping are required
    // getIcon: return a string
    iconAtlas: 'images/icon-atlas.png',
    iconMapping: ICON_MAPPING,
    getIcon: d => 'marker',

    sizeScale: 15,
    getPosition: d => d.coordinates,
    getSize: d => 5,
    getColor: d => [Math.sqrt(d.exits), 140, 0],
    onHover: ({object, x, y}) => {
      const tooltip = `${object.name}\n${object.address}`;
      /* Update tooltip
         http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
      */
    }
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Example: auto packing iconAtlas

In some use cases, it is not possible to know the icons that will be used. Instead, each icon needs to be fetched from
a programmatically generated URL at runtime. For example, if you want to visualize avatars of github contributors for
a project on a map, it is not convenient for you to generate the `iconAtlas` with all the contributors' avatars.
In this case, you can follow the example. Auto packing icons is less efficient than pre-packed.

```js
import DeckGL, {IconLayer} from 'deck.gl';
import Octokit from '@octokit/rest';
const octokit = new Octokit()

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {
   *     avatar_url: "https://avatars1.githubusercontent.com/u/7025232?v=4",
   *     contributions: 620,
   *     id: 7025232,
   *     login: "ibgreen",
   *     type: "User",
   *     ...
   *   }
   * ]
   */
  const layer = new IconLayer({
    id: 'icon-layer',
    data: octokit.repos.getContributors({
      owner: 'uber',
      repo: 'deck.gl'
    }).then(result => result.data),
    // iconAtlas and iconMapping should not be provided
    // getIcon return an object which contains url to fetch icon of each data point
    getIcon: d => ({
      url: d.avatar_url,
      width: 128,
      height: 128,
      anchorY: 128
    }),
    // icon size is based on data point's contributions, between 2 - 25
    getSize: d => Math.max(2, Math.min(d.contributions / 1000 * 25, 25)),
    pickable: true,
    sizeScale: 15,
    getPosition: d => d.coordinates,
    onHover: ({object, x, y}) => {
      const tooltip = `${object.login}\n${object.contributions}`;
      /* Update tooltip
         http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
      */
    }
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers
```

```js
import {IconLayer} from '@deck.gl/layers';
new IconLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.IconLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

##### `iconAtlas` (Texture2D | String)

Atlas image url or texture

##### `iconMapping` (Object | String)

Icon names mapped to icon definitions. Each icon is defined with the following values:

- `x` (Number, required): x position of icon on the atlas image
- `y` (Number, required): y position of icon on the atlas image
- `width` (Number, required): width of icon on the atlas image
- `height` (Number, required): height of icon on the atlas image
- `anchorX` (Number, optional): horizontal position of icon anchor. Default: half width.
- `anchorY` (Number, optional): vertical position of icon anchor. Default: half height.
- `mask` (Boolean, optional): whether icon is treated as a transparency mask.
  If `true`, user defined color is applied.
  If `false`, pixel color from the image is applied. User still can specify the opacity through getColor.
  Default: `false`

If you go with pre-packed strategy, both `iconAtlas` and `iconMapping` are required.

If you choose to use auto packing, then `iconAtlas` and `iconMapping` should not be provided,
otherwise it causes error since `IconLayer` will attempt to retrieve icons from
given pre-packed `iconAtlas`.

##### `sizeScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `1`

Icon size multiplier.

##### `sizeUnits` (String, optional)

* Default: `pixels`

The units of the size specified by `getSize`, one of `'meters'`, `'pixels'`. When zooming in and out, meter sizes scale with the base map, and pixel sizes remain the same on screen.

##### `sizeMinPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0`

The minimum size in pixels.

##### `sizeMaxPixels` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `Number.MAX_SAFE_INTEGER`

The maximum size in pixels.

##### `billboard` (Boolean, optional)

- Default: `true`

If on, the icon always faces camera. Otherwise the icon faces up (z)

##### `alphaCutoff` (Number, optional)

- Default: `0.05`

Discard pixels whose opacity is below this threshold. A discarded pixel would create a "hole" in the icon that is not considered part of the object. This is useful for customizing picking behavior, e.g. setting `alphaCutoff: 0, autoHighlight` will highlight an object whenever the cursor moves into its bounding box, instead of over the visible pixels.


### Data Accessors

##### `getIcon` ([Function](/docs/developer-guide/using-layers.md#accessors), optional)

- Default: `d => d.icon`

Method called to retrieve the icon name of each object, returns string or object.

If you go with pre-packed strategy, then `getIcon` should return a string representing name of the icon,
used to retrieve icon definition from given `iconMapping`.

If you choose to use auto packing, then `getIcon` should return an object which contains
the following properties.

- `url` (String, required): url to fetch the icon
- `height` (Number, required): height of icon
- `width` (Number, required): width of icon
- `id`: (String, optional): unique identifier of the icon, fall back to `url` if not specified
- `anchorX`, `anchorY`, `mask` are the same as mentioned in `iconMapping`

`IconLayer` use `id` (fallback to `url`) to dedupe icons. If for the same icon identifier, `getIcon` returns different `width` or `height`, `IconLayer` will only apply the first occurrence and ignore the rest of them.

##### `getPosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `d => d.position`

Method called to retrieve the position of each object, returns `[lng, lat, z]`.


##### `getSize` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `1`

The height of each object, in units specified by `sizeUnits` (default pixels).

- If a number is provided, it is used as the size for all objects.
- If a function is provided, it is called on each object to retrieve its size.


##### `getColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

- If an array is provided, it is used as the color for all objects.
- If a function is provided, it is called on each object to retrieve its color.
- If `mask` = false, only the alpha component will be used to control the opacity of the icon.

##### `getAngle` ([Function](/docs/developer-guide/using-layers.md#accessors)|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `0`

The rotating angle  of each object, in degrees.

- If a number is provided, it is used as the angle for all objects.
- If a function is provided, it is called on each object to retrieve its angle.


## Use binary attributes

This section is about the special requirements when [supplying attributes directly](/docs/developer-guide/performance.md#supply-attributes-directly) to an `IconLayer`.

If `data.attributes.getIcon` is supplied, since its value can only be a typed array, `iconMapping` can only use integers as keys.


## Source

[modules/layers/src/icon-layer](https://github.com/uber/deck.gl/tree/master/modules/layers/src/icon-layer)

<!-- INJECT:"IconLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
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
import DeckGL, {IconLayer} from 'deck.gl';

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
    data: octokit.repos.listContributors({
      owner: 'uber',
      repo: 'deck.gl' 
    }).then(result => result.data),
    // iconAtlas and iconMapping should not be provided
    // getIcon return an object which contains url to fetch icon of each data point
    getIcon: d => ({
      url: d.avatar_url,
      width: 128,
      height: 128,
      anchorY: 128,
      mask: true
    }),
    // icon size is based on data point's contributions, between 2 - 25 
    getSize: d => Math.max(2, Math.min(d.contributions / 1000 * 25, 25)),

    pickable: true,
    sizeScale: 15,
    getPosition: d => d.coordinates,
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

##### `sizeScale` (Number, optional)

- Default: `1`

Icon size multiplier.

##### `sizeUnits` (String, optional)

* Default: `pixels` 

One of `pixels` or `meters`.

##### `sizeMinPixels` (Number, optional)

* Default: `1`

The minimum size in pixels.

##### `sizeMaxPixels` (Number, optional)

* Default: `Number.MAX_SAFE_INTEGER`

The maximum size in pixels.

##### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode. Note that since deck.gl v6.1, the default 32-bit projection uses a hybrid mode that matches 64-bit precision with significantly better performance.

### Data Accessors

##### `getIcon` (Function, optional)

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

##### `getPosition` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `d => d.position`

Method called to retrieve the position of each object, returns `[lng, lat, z]`.


##### `getSize` (Function|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `1`

The height of each object, in pixels.

- If a number is provided, it is used as the size for all objects.
- If a function is provided, it is called on each object to retrieve its size.


##### `getColor` (Function|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `[0, 0, 0, 255]`

The rgba color of each object, in `r, g, b, [a]`. Each component is in the 0-255 range.

- If an array is provided, it is used as the color for all objects.
- If a function is provided, it is called on each object to retrieve its color.
- If `mask` = false, only the alpha component will be used to control the opacity of the icon.

##### `getAngle` (Function|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `0`

The rotating angle  of each object, in degrees.

- If a number is provided, it is used as the angle for all objects.
- If a function is provided, it is called on each object to retrieve its angle.


## Source

[modules/layers/src/icon-layer](https://github.com/uber/deck.gl/tree/master/modules/layers/src/icon-layer)


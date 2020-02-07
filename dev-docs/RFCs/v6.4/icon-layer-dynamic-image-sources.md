# RFC: Icon Manager 

* **Authors**: Xintong Xia 
* **Date**: December 2018
* **Status**: Draft 

## Abstract

This RFC proposes a way to allow `IconLayer` to load image sources dynamically. 

## Motivation 

[IconLayer](/docs/layers/icon-layer.md) currently requires all icons pre-packed into a sprite image (`iconAtlas`) and a JSON descriptor (`iconMapping`). 
In some use cases, it is not possible to know the icons that will be used. Instead, each icon needs to be fetched from
a programmatically generated URL at runtime.
 
## Proposal - Extend `getIcon` API to support auto packing

Change the `getIcon` API to allow user to return either a `string` or an `object`.

- **Prepacked iconAtlas**, `getIcon` return a `string`:
  - the behavior should be the same as before, return the icon name of each data point, 
which is used to get icon descriptor from `iconMapping` and then to retrieve icon from `iconAtlas`. 
  -  when constructing a `IconLayer`, `iconMppping` and `iconAtlas` are required as before.

- **Auto packing iconAtlas**, `getIcon` return an `object`:
  -  when constructing a `IconLayer`, `iconMppping` and `iconAtlas` are not needed. 
  - The expected `object` should include:
    * `url`: url to fetch the icon
    * `height`: height of icon
    * `width`: width of icon
    * `anchorX`: horizontal position of icon anchor. Default: half width.
    * `anchorY`: vertical position of icon anchor. Default: half height.
    * `mask`: whether icon is treated as a transparency mask.
       - If `true`, user defined color is applied.
       - If `false`, pixel color from the image is applied. User still can specify the opacity through getColor.
      Default: `false`
 
## Code examples 

- **Prepacked icon atlas**, `getIcon` return a string, `iconAtlas` and `iconMapping` are also required when constructing `IconLayer`
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

    // `iconAtlas` and `iconMapping` are required
    iconAtlas: 'images/icon-atlas.png',
    iconMapping: {
      marker: {
        x: 0,
        y: 0,
        width: 128,
        height: 128,
        anchorY: 128,
        mask: true
      }
    },
    // return a string
    getIcon: d => 'marker',
    
    sizeScale: 15,
    getPosition: d => d.coordinates,
    getSize: d => 5,
    getColor: d => [Math.sqrt(d.exits), 140, 0]
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

- **Auto packing iconAtlas**, `getIcon` return an object
```js
import DeckGL, {IconLayer} from 'deck.gl';

const ICON_MAPPING = {
  marker: {x: 0, y: 0, width: 32, height: 32, mask: true}
};

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {name: 'Colma (COLM)', avatar_url: 'https://data/colma_avatar.png', address: '365 D Street, Colma CA 94014', exits: 4214, coordinates: [-122.466233, 37.684638]},
   *   ...
   * ]
   */
  const layer = new IconLayer({
    id: 'icon-layer',
    data,
    pickable: true,
    sizeScale: 15,
    getPosition: d => d.coordinates,
    
    // `iconAtlas` and `iconMapping` are not needed
    // return an object 
    getIcon: d => ({
      url: d.avatar_url,
      width: 128,
      height: 128,
      anchorY: 128,
      mask: true
    }),
    
    getSize: d => 5,
    getColor: d => [Math.sqrt(d.exits), 140, 0]
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Cost and Impact

The proposal will require the following changes:
- `IconManager` class: add a new class to help fetch icons and manage `iconMapping` and `iconAltas` from 
dynamically fetched icons. 
- `IconLayer` needs update to handle both pre-packed sprite image and auto packing icons.

If implemented:
- Existing applications should not need change.
- Existing applications should not see visible difference in terms of behavior or performance.
- Auto packing icons is less efficient than pre-packed because 
the former needs go through all the icons to calculate `iconMapping` 
and update texture data when each icon fetched.

## More Advanced Features - Support mix pre-packed and dynamic URLs 

For the same `IconLayer`, `getIcon` could return `string` (name used to retrieve icon from pre-packed `iconAtlas`) 
for some data points, but return `object` (containing a url to fetch the icon) for others.

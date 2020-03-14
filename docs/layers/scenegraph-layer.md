
<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/mesh--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/mesh-layers" />
</p>

# ScenegraphLayer

The `ScenegraphLayer` renders a number of instances of a complete luma.gl scenegraph. While scenegraphs can be created programmatically, they are typically obtained by loading glTF files.

```js
import DeckGL from '@deck.gl/react';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import {registerLoaders} from '@loaders.gl/core';
import {GLTFScenegraphLoader} from '@luma.gl/experimental';

// Register the proper loader for scenegraph.gltf
registerLoaders([GLTFScenegraphLoader]);

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {
   *     position: [-122.45, 37.7],
   *     color: [255, 0, 0]
   *   },
   *   {
   *     position: [-122.46, 37.73],
   *     color: [0, 255, 0]
   *   },
   *   ...
   * ]
   */
  const layer = new ScenegraphLayer({
    id: 'scenegraph-layer',
    data,
    scenegraph:
      'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb'
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Installation

To install the dependencies from NPM:

```bash
npm install @deck.gl/mesh-layers
```

```js
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
new ScenegraphLayer({});
```


## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.


### Mesh

##### `scenegraph` (URL|Object|Promise)

The geometry to render for each data object.
Can be a URL of an object. You need to provide the `fetch` function to load the object.
Can also be a luma.gl [ScenegraphNode](https://luma.gl/docs/api-reference/experimental/scenegraph/scenegraph-node), or a `Promise` that resolves to one.
The layer calls _delete()_ on _scenegraph_ when a new one is provided or the layer is finalized.


### Render Options

##### `sizeScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default `1`.

Multiplier to scale each geometry by.

##### `_animations` (Object, optional)

- Default `undefined`. (No animations are running).

An object used to configure animations playing. _keys_ can be one of the following:
- _number_ for index number
- _name_ for animation name
- `*` to affect all animations
Each value is an object with:
- `playing`: _true_ or _false_
- `speed`: number, `1` for default speed.
Animations are parsed automatically from `glTF` files. Requires `_animate` on deck object.

##### `getScene` (Function, optional)

- Default: `scenegraph => (scenegraph && scenegraph.scenes ? scenegraph.scenes[0] : scenegraph)`

If you have multiple scenes you can select the scene you want to use.
Only triggers when scenegraph property changes.

##### `getAnimator` (Function, optional)

- Default: `scenegraph => scenegraph && scenegraph.animator`

Return `null` to disable animation or provide your custom animator.
Only triggers when scenegraph property changes.

##### `_lighting` (String, optional)

- Default: `flat`

**Experimental** lighting support, can be:
- `flat`: No light calculation. Works well with any textured object.
- `pbr` Uses `glTF` PBR model. Works well with `glTF` models.

Only read when scenegraph property changes.
Uses [global light configuration](/docs/developer-guide/using-lighting.md) from deck.

##### `_imageBasedLightingEnvironment` (Function or GLTFEnvironment, optional)

- Default: `null`

**Experimental** Can be:
- A `GLTFEnvironment` object.
- A function that takes `{gl, layer}` as first argument and returns a `GLTFEnvironment`.

Only read when scenegraph property changes.

### Data Accessors


##### `getPosition` ([Function](/docs/developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `object => object.position`

Method called to retrieve the center position for each object in the `data` stream.


##### `getColor` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

- Default: `[0, 0, 0, 255]`

The rgba color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied. Only used if `texture` is empty.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

##### `getOrientation` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional)

- Default: `[0, 0, 0]`

Object orientation defined as a vec3 of Euler angles, `[pitch, yaw, roll]` in degrees. This will be composed with layer's [`modelMatrix`](https://github.com/uber/deck.gl/blob/master/docs/api-reference/layer.md#modelmatrix-number16-optional).

* If an array is provided, it is used as the orientation for all objects.
* If a function is provided, it is called on each object to retrieve its orientation.

##### `getScale` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional)

- Default: `[1, 1, 1]`

Scaling factor on the mesh along each axis.

* If an array is provided, it is used as the scale for all objects.
* If a function is provided, it is called on each object to retrieve its scale.

##### `getTranslation` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional)

- Default: `[0, 0, 0]`

Translation of the mesh along each axis. Offset from the center position given by `getPosition`. `[x, y, z]` in meters.

* If an array is provided, it is used as the offset for all objects.
* If a function is provided, it is called on each object to retrieve its offset.

##### `getTransformMatrix` ([Function](/docs/developer-guide/using-layers.md#accessors)|Array, optional)

- Default: `null`

Explicitly define a 4x4 column-major model matrix for the mesh. If provided, will override
`getOrientation`, `getScale`, `getTranslation`. This will be composed with layer's [`modelMatrix`](https://github.com/uber/deck.gl/blob/master/docs/api-reference/layer.md#modelmatrix-number16-optional).

* If an array is provided, it is used as the transform matrix for all objects.
* If a function is provided, it is called on each object to retrieve its transform matrix.

##### `sizeMinPixels` (Number, optional)

* Default: `0`

The minimum size in pixels for one unit of the scene.

##### `sizeMaxPixels` (Number, optional)

* Default: `Number.MAX_SAFE_INTEGER`

The maximum size in pixels for one unit of the scene.

## Source

[modules/mesh-layers/src/scenegraph-layer](https://github.com/uber/deck.gl/tree/master/modules/mesh-layers/src/scenegraph-layer)

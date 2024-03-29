# SimpleMeshLayer

import {SimpleMeshLayerDemo} from '@site/src/doc-demos/mesh-layers';

<SimpleMeshLayerDemo />

The `SimpleMeshLayer` renders a number of instances of an arbitrary 3D geometry. For example, it can be used to visualize a fleet of 3d cars each with a position and an orientation over the map.

```js
import DeckGL from '@deck.gl/react';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {CubeGeometry} from '@luma.gl/core'

function App({data, viewState}) {
  /**
   * Data format:
   * [
   *   {
   *     position: [-122.45, 37.7],
   *     angle: 0,
   *     color: [255, 0, 0]
   *   },
   *   {
   *     position: [-122.46, 37.73],
   *     angle: 90,
   *     color: [0, 255, 0]
   *   },
   *   ...
   * ]
   */
  const layer = new SimpleMeshLayer({
    id: 'mesh-layer',
    data,
    texture: 'texture.png',
    mesh: new CubeGeometry(),
    getPosition: d => d.position,
    getColor: d => d.color,
    getOrientation: d => [0, d.angle, 0]
  });

  return <DeckGL viewState={viewState} layers={[layer]} />;
}
```

`loaders.gl` offers a [category](https://loaders.gl/docs/specifications/category-mesh) of loaders for loading meshes from standard formats. For example, the following code adds support for OBJ files:

```js
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {OBJLoader} from '@loaders.gl/obj';

new SimpleMeshLayer({
  ...
  mesh: 'path/to/model.obj',
  loaders: [OBJLoader]
});
```

## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/mesh-layers
```

```js
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
new SimpleMeshLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/mesh-layers@^9.0.0/dist.min.js"></script>
```

```js
new deck.SimpleMeshLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md) properties.

### Mesh

##### `mesh` (String|Geometry|Object) {#mesh}

The geometry to render for each data object. One of:

- An URL to a mesh description file in a format supported by [loaders.gl](https://loaders.gl/docs/specifications/category-mesh). The appropriate loader will have to be registered via the loaders.gl `registerLoaders` function for this usage.
- A luma.gl [Geometry](https://github.com/visgl/luma.gl/blob/8.5-release/modules/engine/docs/api-reference/geometry.md) instance
- An object containing the following fields:
  + `positions` (Float32Array) - 3d vertex offset from the object center, in meters
  + `normals` (Float32Array) - 3d normals
  + `texCoords` (Float32Array) - 2d texture coordinates


##### `texture` (String|Texture|Image|ImageData|HTMLCanvasElement|HTMLVideoElement|ImageBitmap|Promise|Object, optional) {#texture}

- Default `null`.

The texture of the geometries.

- If a string is supplied, it is interpreted as a URL or a [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs).
- One of the following, or a Promise that resolves to one of the following:
  + One of the valid [pixel sources for WebGL2 texture](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D)
  + A luma.gl [Texture](https://luma.gl/docs/api-reference/core/resources/texture) instance
  + A plain object that can be passed to the `Texture` constructor, e.g. `{width: <number>, height: <number>, data: <Uint8Array>}`. Note that whenever this object shallowly changes, a new texture will be created.

The image data will be converted to a [Texture](https://luma.gl/docs/api-reference/core/resources/texture) object. See `textureParameters` prop for advanced customization.

If `texture` is supplied, texture is used to render the geometries. Otherwise, object color obtained via the `getColor` accessor is used.


##### `textureParameters` (Object) {#textureparameters}

Customize the [texture parameters](https://luma.gl/docs/api-reference/core/resources/sampler#samplerprops).

If not specified, the layer uses the following defaults to create a linearly smoothed texture from `texture`:

```js
{
  minFilter: 'linear',
  magFilter: 'linear',
  mipmapFilter: 'linear',
  addressModeU: 'clamp-to-edge',
  addressModeV: 'clamp-to-edge'
}
```


### Render Options

##### `sizeScale` (Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#sizescale}

- Default `1`.

Multiplier to scale each geometry by.

##### `wireframe` (Boolean, optional) {#wireframe}

- Default: `false`

Whether to render the mesh in wireframe mode.

##### `material` (Object, optional) {#material}

* Default: `true`

This is an object that contains material props for [lighting effect](../core/lighting-effect.md) applied on extruded polygons.
Check [the lighting guide](../../developer-guide/using-effects.md#material-settings) for configurable settings.


### Data Accessors


##### `getPosition` ([Function](../../developer-guide/using-layers.md#accessors), optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getposition}

- Default: `object => object.position`

Method called to retrieve the center position for each object in the `data` stream.


##### `getColor` ([Function](../../developer-guide/using-layers.md#accessors)|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square") {#getcolor}

- Default: `[0, 0, 0, 255]`

If `mesh` does not contain vertex colors, use this color to render each object. If `mesh` contains vertex colors, then the two colors are mixed together. Use `[255, 255, 255]` to use the original mesh colors. If `texture` is assigned, then both colors will be ignored.

The color is in the format of `[r, g, b, [a]]`. Each channel is a number between 0-255 and `a` is 255 if not supplied.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

##### `getOrientation` ([Function](../../developer-guide/using-layers.md#accessors)|Array, optional) {#getorientation}

- Default: `[0, 0, 0]`

Object orientation defined as a vec3 of Euler angles, `[pitch, yaw, roll]` in degrees. This will be composed with layer's [modelMatrix](https://github.com/visgl/deck.gl/blob/master/docs/api-reference/core/layer.md#modelmatrix-number16-optional).

* If an array is provided, it is used as the orientation for all objects.
* If a function is provided, it is called on each object to retrieve its orientation.

##### `getScale` ([Function](../../developer-guide/using-layers.md#accessors)|Array, optional) {#getscale}

- Default: `[1, 1, 1]`

Scaling factor on the mesh along each axis.

* If an array is provided, it is used as the scale for all objects.
* If a function is provided, it is called on each object to retrieve its scale.

##### `getTranslation` ([Function](../../developer-guide/using-layers.md#accessors)|Array, optional) {#gettranslation}

- Default: `[0, 0, 0]`

Translation of the mesh along each axis. Offset from the center position given by `getPosition`. `[x, y, z]` in meters. This will be composed with layer's [modelMatrix](https://github.com/visgl/deck.gl/blob/master/docs/api-reference/core/layer.md#modelmatrix-number16-optional).

* If an array is provided, it is used as the offset for all objects.
* If a function is provided, it is called on each object to retrieve its offset.

##### `getTransformMatrix` ([Function](../../developer-guide/using-layers.md#accessors)|Array, optional) {#gettransformmatrix}

- Default: `null`

Explicitly define a 4x4 column-major model matrix for the mesh. If provided, will override
`getOrientation`, `getScale`, `getTranslation`.

* If an array is provided, it is used as the transform matrix for all objects.
* If a function is provided, it is called on each object to retrieve its transform matrix.

## Source

[modules/mesh-layers/src/simple-mesh-layer](https://github.com/visgl/deck.gl/tree/master/modules/mesh-layers/src/simple-mesh-layer)

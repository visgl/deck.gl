# MeshLayer

The Mesh Layer renders a number of arbitrary geometries. For example, a fleet of 3d cars each with a position and an orientation over the map.

```js
import DeckGL from 'deck.gl';
import {MeshLayer} from '@deck.gl/experimental-layers';
import {CubeGeometry} from 'luma.gl'

const App = ({data, viewport}) => {

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
  const layer = new MeshLayer({
    id: 'mesh-layer',
    data,
    sizeScale: 100,
    texture: 'texture.png',
    mesh: new CubeGeometry()
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Properties

##### `mesh` (Geometry|Object)

The geometry to render for each data object.
Can be a luma.gl [Geometry](http://uber.github.io/luma.gl/#/documentation/api-reference/geometry) instance, or an object of attributes.

The following attributes are expected:
- `positions` (Float32Array) - 3d vertex offset from the object center, in meters
- `normals` (Float32Array) - 3d nomals
- `texCoords` (Float32Array) - 2d texture coordinates


##### `texture` (Texture2D|Image|String, optional)

- Default `null`.

The texture of the geometries.
Can be either a luma.gl [Texture2D](http://uber.github.io/luma.gl/#/documentation/api-reference/texture-2) instance, an HTMLImageElement, or a url string to the texture image.

If `texture` is supplied, texture is used to render the geometries. Otherwise, object color obtained via the `getColor` accessor is used.


##### `sizeScale` (Number, optional)

- Default `1`.

Multiplier to scale each geometry by.


##### `getPosition` (Function, optional)

- Default: `object => object.position`

This accessor returns the center position corresponding to an object in the `data` stream.


##### `getYaw` (Function, optional)

- Default: `object => object.yaw || object.angle || 0`

The yaw (heading) in degrees of each object.


##### `getPitch` (Function, optional)

- Default: `object => object.pitch || 0`

The pitch (elevation) in degrees of each object.


##### `getRoll` (Function, optional)

- Default: `object => object.roll || 0`

The roll (bank) in degrees of each object.

See [Euler angles](https://en.wikipedia.org/wiki/Euler_angles).


##### `getColor` (Function|Array, optional)

- Default: `[0, 0, 0, 255]`

The color of each object. Only used if `texture` is empty.


##### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode

##### `lightSettings` (Object, optional)

**EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
Be aware that this prop will likely be changed in a future version of deck.gl.


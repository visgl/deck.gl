<!-- INJECT:"PointCloudLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
</p>

# PointCloudLayer

The Point Cloud Layer takes in points with 3d positions, normals and colors
and renders them as spheres with a certain radius.

```js
import DeckGL, {PointCloudLayer} from 'deck.gl';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {position: [-122.4, 37.7, 12], normal: [-1, 0, 0], color: [255, 255, 0]},
   *   ...
   * ]
   */
  const layer = new PointCloudLayer({
    id: 'point-cloud-layer',
    data,
    pickable: false,
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [-122.4, 37.74],
    radiusPixels: 4,
    getPosition: d => d.position,
    getNormal: d => d.normal,
    getColor: d => d.color,
    lightSettings: {},
    onHover: ({object}) => setTooltip(object.position.join(', '))
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

### Render Options

##### `radiusPixels` (Number, optional)

* Default: `10`

Global radius of all points.

##### `fp64` (Boolean, optional)

* Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode. Note that since deck.gl v6.1, the default 32-bit projection uses a hybrid mode that matches 64-bit precision with significantly better performance.

##### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for the point cloud.
Be aware that this prop will likely be changed in a future version of deck.gl.

### Data Accessors

##### `getPosition` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `object => object.position`

Method called to retrieve the position of each object.

##### `getNormal` (Function|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 1]`

The normal of each object, in `[nx, ny, nz]`.

* If an array is provided, it is used as the normal for all objects.
* If a function is provided, it is called on each object to retrieve its normal.


##### `getColor` (Function|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[0, 0, 0, 255]`

The rgba color of each object, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

## Source

[modules/layers/src/point-cloud-layer](https://github.com/uber/deck.gl/tree/6.2-release/modules/layers/src/point-cloud-layer)


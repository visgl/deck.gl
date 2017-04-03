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
    radiusPixels: 20
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/base-layer.md) properties.

### Render Options

##### `radiusPixels` (Number, optional)

- Default: `10`

Global radius of all points.

##### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode
##### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for the point cloud.
Be aware that this prop will likely be changed in a future version of deck.gl.

### Data Accessors

##### `getPosition` (Function, optional)

- Default: `object => object.position`

Method called to retrieve the position of each object.

##### `getNormal` (Function, optional)

- Default: `object => object.normal`

Method called to retrieve the normal of each object.

##### `getColor` (Function, optional)

- Default: `object => object.color`

Method called to retrieve the rgba color of each object.
* If the alpha parameter is not provided, it will be set to `255`.
* If the method does not return a value for the given object, fallback to
`[0, 0, 0, 255]`.

## Source
[src/layers/core/point-cloud-layer](https://github.com/uber/deck.gl/tree/4.0-release/src/layers/core/point-cloud-layer)


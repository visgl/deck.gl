<div align="center">
  <img height="300" src="/website/src/static/images/hexagon-cell-layer.png" />
</div>

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="extruded" />
</p>

# HexagonCellLayer

The Hexagon Cell Layer is a variation of the grid layer. It is intended to render
tessellated hexagons, and also enables height in 3d. The HexagonCellLayer
takes in the vertices of a primitive hexagon as `[[longitude, latitude]]`,
and an array of hexagon centroid as `[longitude, latitude]`.
It renders each hexagon based on color, opacity and elevation.

```js
import DeckGL, {HexagonCellLayer} from 'deck.gl';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {centroid: [-122.4, 37.7], color: [255, 0, 0], elevation: 100},
   *   ...
   * ]
   */
  const layer = new HexagonCellLayer({
    id: 'hexagon-cell-layer',
    data,
    radius: 500,
    angle: 0
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

### Render Options

##### `hexagonVertices` (Array[[lon, lat]], optional)

Primitive hexagon vertices as an array of six [lon, lat] pairs,
in either clockwise or counter clouckwise direction. Use radius and angle
instead of hexagonVertices if provided.

##### `radius` (Number, optional)

Primitive hexagon radius in meter. The hexagons are pointy-topped (rather than flat-topped).
If `radius` and `angle` are provided, they will be used to calculate
primitive hexagon instead of `hexagonVertices`

##### `angle` (Number, optional)

Primitive hexagon angle in radian. Angle is the rotation of one corner
counter clockwise from north. If `radius` and `angle` are provided,
they will be used to calculate primitive hexagon instead of `hexagonVertices`

##### `coverage` (Number, optional)

* Default: `1`

Hexagon radius multiplier, between 0 - 1. The radius of hexagon is calculated by
`coverage * radius`

##### `elevationScale` (Number, optional)

* Default: `1`

Hexagon elevation multiplier. The elevation of hexagon is calculated by
`elevationScale * getElevation(d)`. `elevationScale` is a handy property
to scale all hexagon elevations without updating the data.

##### `extruded` (Boolean, optional)

* Default: `true`

Whether to extrude hexagon. If se to false, all hexagons will be set to flat.

##### `fp64` (Boolean, optional)

* Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode. Note that since deck.gl v6.1, the default 32-bit projection uses a hybrid mode that matches 64-bit precision with significantly better performance.

##### `lightSettings` (Object, optional) **EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
Be aware that this prop will likely be changed in a future version of deck.gl.

### Data Accessors

##### `getCentroid` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `object => object.centroid`

Method called to retrieve the centroid of each hexagon. Centorid should be
set to [lon, lat]

##### `getColor` (Function|Array, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `[255, 0, 255, 255]`

The rgba color of each object, in `r, g, b, [a]`. Each component is in the 0-255 range.

* If an array is provided, it is used as the color for all objects.
* If a function is provided, it is called on each object to retrieve its color.

##### `getElevation` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1000`

Method called to retrieve the elevation of each object. 1 unit approximate to 100 meters.

## Source

[modules/layers/src/hexagon-cell-layer](https://github.com/uber/deck.gl/tree/6.3-release/modules/layers/src/hexagon-cell-layer)


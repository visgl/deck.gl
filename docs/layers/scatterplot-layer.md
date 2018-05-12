<!-- INJECT:"ScatterplotLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
</p>

# ScatterplotLayer

The Scatterplot Layer takes in paired latitude and longitude coordinated
points and renders them as circles with a certain radius.

```js
import DeckGL, {ScatterplotLayer} from 'deck.gl';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {name: 'Colma (COLM)', code:'CM', address: '365 D Street, Colma CA 94014', exits: 4214, coordinates: [-122.466233, 37.684638]},
   *   ...
   * ]
   */
  const layer = new ScatterplotLayer({
    id: 'scatterplot-layer',
    data,
    pickable: true,
    opacity: 0.8,
    radiusScale: 6,
    radiusMinPixels: 1,
    radiusMaxPixels: 100,
    getPosition: d => d.coordinates,
    getRadius: d => Math.sqrt(d.exits),
    getColor: d => [255, 140, 0],
    onHover: ({object}) => setTooltip(`${object.name}\n${object.address}`)
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

### Render Options

##### `radiusScale` (Number, optional)

* Default: `1`

A global radius multiplier for all points.

##### `outline` (Boolean, optional)

* Default: `false`

Only draw outline of points.

##### `strokeWidth` (Number, optional)

* Default: `1`

Width of the outline, in pixels. Requires `outline` to be `true`.

##### `radiusMinPixels` (Number, optional)

* Default: `0`

The minimum radius in pixels.

##### `radiusMaxPixels` (Number, optional)

* Default: `Number.MAX_SAFE_INTEGER`

The maximum radius in pixels.

##### `fp64` (Boolean, optional)

* Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode.

### Data Accessors

##### `getPosition` (Function, optional)

* Default: `object => object.position`

Method called to retrieve the position of each object.

##### `getRadius` (Function, optional)

* Default: `object => object.radius`

Method called to retrieve the radius of each object.

##### `getColor` (Function, optional)

* Default: `object => object.color`

Method called to retrieve the rgba color of each object.

* If the alpha parameter is not provided, it will be set to `255`.
* If the method does not return a value for the given object, fallback to `[0, 0, 0, 255]`.

## Source

[modules/core/src/core-layers/scatterplot-layer](https://github.com/uber/deck.gl/tree/5.2-release/modules/core/src/core-layers/scatterplot-layer)


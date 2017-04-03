<!-- INJECT:"LineLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
</p>

# LineLayer

The Line Layer renders flat lines joining pairs of source and target points,
specified as latitude/longitude coordinates.

```js
import DeckGL, {LineLayer} from 'deck.gl';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {sourcePosition: [-122.4, 37.7], targetPosition: [-122.5, 37.8], color: [255, 0, 0]},
   *   ...
   * ]
   */
  const layer = new LineLayer({
    id: 'line-layer',
    data,
    strokeWdith: 2
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/base-layer.md) properties.

### Render Options

##### `strokeWidth` (Number, optional)

- Default: `1`

The stroke width used to draw each line. Unit is pixels.

##### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode

### Data Accessors

##### `getSourcePosition` (Function, optional)

- Default: `object => object.sourcePosition`

Method called to retrieve the source position of each object.

##### `getTargetPosition` (Function, optional)

- Default: `object => object.targetPosition`

Method called to retrieve the target position of each object.

##### `getColor` (Function, optional)

- Default: `object => object.color`

Method called to determine the rgba color of the source.
* If the alpha parameter is not provided, it will be set to `255`.
* If the method does not return a value for the given object, fallback to
`[0, 0, 0, 255]`.

## Source

[src/layers/core/line-layer](https://github.com/uber/deck.gl/tree/4.0-release/src/layers/core/line-layer)


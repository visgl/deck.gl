<!-- INJECT:"ScreenGridLayerDemo" -->

# ScreenGridLayer

The Screen Grid Layer takes in an array of latitude and longitude
coordinated points, aggregates them into histogram bins and
renders as a grid.

```js
import DeckGL, {ScreenGridLayer} from 'deck.gl';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {position: [-122.4, 37.7]},
   *   ...
   * ]
   */
  const layer = new ScreenGridLayer({
    id: 'screen-grid-layer',
    data,
    cellSizePixels: 40
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

**Note:** The aggregation is done in screen space, so the data prop
needs to be reaggregated by the layer whenever the map is zoomed or panned.
This means that this layer is best used with small data set, however the
visuals when used with the right data set can be quite effective.

## Properties

Inherits from all [Base Layer](/docs/api-reference/base-layer.md) properties.

### Render Options

##### `cellSizePixels` (Number, optional)

- Default: `100`

Unit width/height of the bins.

##### `minColor` (Number[4], optional)

- Default: `[0, 0, 0, 255]`

Expressed as an rgba array, minimal color that could be rendered by a tile.

##### `maxColor` (Number[4], optional)

- Default: `[0, 255, 0, 255]`

Expressed as an rgba array, maximal color that could be rendered by a tile.

### Data Accessors

##### `getPosition` (Function, optional)

- Default: `object => object.position`

Method called to retrieve the position of each object.

##### `getWeight` (Function, optional)

- Default: `object => 1`

Method called to retrieve the weight of each object.

## Source

[src/layers/core/screen-grid-layer](https://github.com/uber/deck.gl/tree/4.0-release/src/layers/core/screen-grid-layer)


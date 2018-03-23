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

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

### Render Options

##### `cellSizePixels` (Number, optional)

- Default: `100`

Unit width/height of the bins.

##### `minColor` (Number[4], optional)

- Default: `[0, 0, 0, 255]`

Expressed as an rgba array, minimal color that could be rendered by a tile. This prop is deprecated in version 5.2.0, use `colorRange` and `colorDomain` instead.

##### `maxColor` (Number[4], optional)

- Default: `[0, 255, 0, 255]`

Expressed as an rgba array, maximal color that could be rendered by a tile.  This prop is deprecated in version 5.2.0, use `colorRange` and `colorDomain` instead.

##### `colorDomain` (Array, optional) **EXPERIMENTAL**

- Default: `[1, max(weight)]`

Color scale input domain. The color scale maps continues numeric domain into
discrete color range. If not provided, the layer will set `colorDomain` to [1, max-of-all-cell-weights], You can control how the color of cells mapped
to value of its weight by passing in an arbitrary color domain. This property is extremely handy when you want to render different data input with the same color mapping for comparison.

##### `colorRange` (Array, optional) **EXPERIMENTAL**

- Default: <img src="/website/src/static/images/colorbrewer_YlOrRd_6.png"/></a>

Specified as an array of colors formatted as `[[255, 255, 255, 255]]`. Default is
[colorbrewer](http://colorbrewer2.org/#type=sequential&scheme=YlOrRd&n=6) `6-class YlOrRd`.

NOTE: `minColor` and `maxColor` take precedence over `colorDomain` and `colorRange`, to use `colorDomain` and `colorRange` do not provide `minColor` and `maxColor`.


### Data Accessors

##### `getPosition` (Function, optional)

- Default: `object => object.position`

Method called to retrieve the position of each object.

##### `getWeight` (Function, optional)

- Default: `object => 1`

Method called to retrieve the weight of each object.

## Source

[src/core-layers/screen-grid-layer](https://github.com/uber/deck.gl/tree/5.1-release/src/core-layers/screen-grid-layer)

<!-- INJECT:"PolygonLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="extruded" />
</p>

# H3ClusterLayer

The `H3ClusterLayer` renders regions represented by hexagon sets from the [h3](https://uber.github.io/h3/) geospatial indexing system.

`H3ClusterLayer` is a [CompositeLayer](/docs/api-reference/composite-layer.md).

```js
import DeckGL, {H3ClusterLayer} from 'deck.gl';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {
   *     name: 'Downtown',
   *     hexagonIds: [
   *       '882830829bfffff',
   *       '8828308299fffff',
   *       '8828308291fffff',
   *       '8828308293fffff',
   *       '882830874dfffff',
   *       '88283095a7fffff',
   *       '88283095a5fffff'
         ],
   *     population: 4780
   *   },
   *   ...
   * ]
   */
  const layer = new H3ClusterLayer({
    id: 'h3-cluster-layer',
    data,
    stroked: true,
    filled: true,
    extruded: false,
    pickable: true,
    getHexagons: d => d.hexagonIds,
    getLineWidth: 30,
    getLineColor: [0, 0, 0],
    getFillColor: d => [d.population / 10000 * 255, 255, 0],
    onHover: ({object, x, y}) => {
      const tooltip = `${object.name}\nPopulation: ${object.population}`;
      /* Update tooltip
         http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
      */
    }
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md), [CompositeLayer](/docs/api-reference/composite-layer.md), and [PolygonLayer](/docs/api-reference/polygon-layer.md) properties, plus the following:

### Data Accessors

##### `getHexagons` (Function, optional)

Method called to retrieve the hexagon cluster from each object, as an array of [H3](https://uber.github.io/h3/) hexagon indices. These hexagons are joined into polygons that represent the geospatial outline of the cluster.


## Sub Layers

The `H3ClusterLayer` renders the following sublayers:

* `cluster-region` - a [PolygonLayer](/docs/layers/column-layer.md) rendering all clusters.


## Source

[modules/geo-layers/src/h3-layers/h3-cluster-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/h3-layers/h3-cluster-layer.js)


<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="extruded" />
</p>

# S2Layer (Experimental)

The S2Layer renders filled and/or stroked cells of the [S2 geospatial indexing system](http://s2geometry.io/).

The JavaScript implementation of S2 [`s2-geometry`](https://git.coolaj86.com/coolaj86/s2-geometry.js) is used for cell boundary calculations.

```js
import DeckGL from 'deck.gl';
import {S2Layer} from '@deck.gl/geo-layers';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {
   *     // S2 Cell in SF Bay Area
   *     token: "80858004",
   *     zipcode: 94107,
   *     population: 26599,
   *     area: 6.11
   *   },
   *   {
   *     token: "8085800c",
   *     zipcode: 94107,
   *     population: 26599,
   *     area: 6.11
   *   },
   *   ...
   * ]
   */
  const layer = new S2Layer({
    id: 's2-layer',
    data,
    pickable: true,
    stroked: true,
    filled: true,
    wireframe: true,
    lineWidthMinPixels: 1,
    getS2Token: d => d.token,
    getElevation: d => d.population / d.area / 10,
    getFillColor: d => [d.population / d.area / 60, 140, 0],
    getLineColor: [80, 80, 80],
    getLineWidth: 1,
    onHover: ({object, x, y}) => {
      const tooltip = `${object.zipcode}\nPopulation: ${object.population}`;
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

##### `getS2Token` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

Check [S2 Cell](http://s2geometry.io/devguide/s2cell_hierarchy) for more details.

* default: `object => object.token`


## Sub Layers

The `S2Layer` renders the following sublayers:

* `cell` - a [PolygonLayer](/docs/layers/polygon-layer.md) rendering all S2 cells.


## Source

[modules/geo-layers/src/s2-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/s2-layer)


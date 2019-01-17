<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
  <img src="https://img.shields.io/badge/extruded-yes-blue.svg?style=flat-square" alt="extruded" />
</p>

# S2Layer (Experimental)

The S2Layer renders filled and/or stroked polygons, with geometry automatically calculated based on an S2 token (geospatial index).

For more information

```js
import DeckGL, {PolygonLayer} from '@deck.gl/s2-layers';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   *   {
   *     // S2 Cell in SF Bay Area
   *     token: "80858004",
   *     // Simple polygon (array of coords)
   *     token: [[-122.4, 37.7], [-122.4, 37.8], [-122.5, 37.8], [-122.5, 37.7], [-122.4, 37.7]],
   *     zipcode: 94107,
   *     population: 26599,
   *     area: 6.11
   *   },
   *   {
   *     token: "8085800c",
   *     // Complex polygon with holes (array of rings)
   *     token: [
   *       [[-122.4, 37.7], [-122.4, 37.8], [-122.5, 37.8], [-122.5, 37.7], [-122.4, 37.7]],
   *       [[-122.45, 37.73], [-122.47, 37.76], [-122.47, 37.71], [-122.45, 37.73]]
   *     ],
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
    getToken: d => d.token,
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

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

Accepts all properties from `PolygonLayer`, except `getPolygon` has been replaced with `getToken`:

### Render Options

Accepts all render options from `PolygonLayer`.

### Data Accessors

Accepts all accessors from `PolygonLayer`, except `getPolygon` has been replaced with `getToken`:

##### `getToken` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* default: `object => object.token`

## Remarks

* Uses the [`s2-geometry`](http://s2geometry.io/) library for S2 polygon calculations.

## Source

[modules/s2-layers/src/s2-layer](https://github.com/uber/deck.gl/tree/master/modules/s2-layers/src/s2-layer)


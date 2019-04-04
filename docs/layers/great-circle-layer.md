<!-- INJECT:"GreatCircleLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/64--bit-support-blue.svg?style=flat-square" alt="64-bit" />
</p>

# GreatCircleLayer

The `GreatCircleLayer` is a variation of the [ArcLayer](/docs/layers/arc-layer.md). It renders flat arcs along the great circle joining pairs of source and target points,
specified as latitude/longitude coordinates.

```js
import DeckGL, {GreatCircleLayer} from 'deck.gl';

const App = ({data, viewport}) => {

  /**
   * Data format:
   * [
   * {
   *   "from": {
   *     "type": "major",
   *     "name": "San Francisco Int'l",
   *     "abbrev": "SFO",
   *     "coordinates": [
   *       -122.38347034444931,
   *       37.61702508680534
   *     ]
   *   },
   *   "to": {
   *     "type": "major",
   *     "name": "Liverpool John Lennon",
   *     "abbrev": "LPL",
   *     "coordinates": [
   *       -2.858620657849378,
   *       53.3363751054422
   *     ]
   *   }
   *   ...
   * ]
   */
  const layer = new GreatCircleLayer({
    id: 'great-circle-layer',
    data,
    pickable: true,
    getStrokeWidth: 12,
    getSourcePosition: d => d.from.coordinates,
    getTargetPosition: d => d.to.coordinates,
    getSourceColor: [64, 255, 0],
    getTargetColor: [0, 128, 200],
    onHover: ({object, x, y}) => {
      const tooltip = `${object.from.name} to ${object.to.name}`;
      /* Update tooltip
         http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
      */
    }
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
};
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) and [ArcLayer](/docs/layers/arc-layer.md) properties.

## Source

[great-circle-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/great-circle-layer)

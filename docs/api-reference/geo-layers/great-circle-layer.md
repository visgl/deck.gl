# GreatCircleLayer

import {GreatCircleLayerDemo} from '@site/src/doc-demos/geo-layers';

<GreatCircleLayerDemo />

The `GreatCircleLayer` is a variation of the [ArcLayer](../layers/arc-layer.md). It renders flat arcs along the great circle joining pairs of source and target points,
specified as latitude/longitude coordinates.

> Starting v8.2, using this layer is identical to using the `ArcLayer` with props `greatCircle: true` and `getHeight: 0`.


```js
import DeckGL, {GreatCircleLayer} from 'deck.gl';

function App({data, viewState}) {
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
    getTargetColor: [0, 128, 200]
  });

  return <DeckGL viewState={viewState}
    layers={[layer]}
    getTooltip={({object}) => object && `${object.from.name} to ${object.to.name}`} />;
}
```


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```js
import {GreatCircleLayer} from '@deck.gl/geo-layers';
new GreatCircleLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^8.0.0/dist.min.js"></script>
```

```js
new deck.GreatCircleLayer({});
```


## Properties

Inherits from all [Base Layer](../core/layer.md) and [ArcLayer](../layers/arc-layer.md) properties.

## Source

[great-circle-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/great-circle-layer)

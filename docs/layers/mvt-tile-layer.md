<!-- INJECT:"TileLayerDemo" -->

<p class="badges">
  <img src="https://img.shields.io/badge/@deck.gl/geo--layers-lightgrey.svg?style=flat-square" alt="@deck.gl/geo-layers" />
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# MVTTileLayer

`MVTTileLayer` is a derived TileLayer that makes it possible to visualize very large datasets through MVT tiles. Igual que la TileLayer original, it will only load, decode and render MVTs containing features that are visible within the current viewport.

MVTs are loaded from a network server, so you need to specify your own tile server URLs in `urlTemplates` property. You can provide as many URLs as you want for a unique set of tiles. All URLs will be balanced by this algorithm, ensuring that tiles will be always requested to the same server depending on their index.

This layer also handles feature clipping so that there are no features divided by tile divisions.

```js
import DeckGL from '@deck.gl/react';
import {MVTTileLayer} from '@deck.gl/geo-layers';

export const App = ({viewport}) => {
  const layer = new MVTTileLayer({
    urlTemplates: [
      `https://a.tiles.mapbox.com/v4/mapbox.boundaries-adm0-v3/{z}/{x}/{y}.vector.pbf?access_token=${MapboxAccessToken}`
    ],

    getFillColor: [140, 170, 180]
  });

  return <DeckGL {...viewport} layers={[layer]} />;
};
```


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```js
import {MVTTileLayer} from '@deck.gl/geo-layers';
new MVTTileLayer({});
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
new deck.MVTTileLayer({});
```


## Properties
Inherits all properties from [Tile Layer](/docs/api-reference/tile-layer.md) and [Base Layer](/docs/api-reference/layer.md), and adds a custom property:

##### `urlTemplates` (Array)

- Default `[]`

URL templates to load tiles from network. Templates don't require a specific format.
The layer will replace `{x}`, `{y}`, `{z}` ocurrences to the proper tile index before requesting it to the server.

### Callbacks
Inherits all callbacks from [Tile Layer](/docs/api-reference/tile-layer.md) and [Base Layer](/docs/api-reference/layer.md).

## Source

[modules/geo-layers/src/mvt-tile-layer](https://github.com/uber/deck.gl/tree/master/modules/geo-layers/src/mvt-tile-layer)

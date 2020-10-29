# BASEMAP

[CARTO basemaps](https://carto.com/basemaps/) are available and they can be used without a token.

## Usage

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/carto
```

```js
import {DeckGL} from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';
import {BASEMAP} from '@deck.gl/carto';
<DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={layers}>
  <StaticMap mapStyle={BASEMAP.POSITRON} />
</DeckGL>
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.2.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/carto@^8.2.0/dist.min.js"></script>

<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.2.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^8.2.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/carto@^8.2.0/dist.min.js"></script>
```

```js
const deckgl = new deck.DeckGL({
    container: 'map',
    mapStyle: deck.carto.BASEMAP.POSITRON,
    initialViewState: {
      latitude: 0,
      longitude: 0,
      zoom: 1
    },
    controller: true
  });
```

## Supported basemaps

| NAME | PREVIEW | STYLE URL  |
| -------- |-------------| -------- |
| Positron | <img src="https://carto.com/help/images/building-maps/basemaps/positron_labels.png"  /> | https://basemaps.cartocdn.com/gl/positron-gl-style/style.json |
| Dark Matter | <img src="https://carto.com/help/images/building-maps/basemaps/dark_labels.png"  /> | https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json |
| Voyager | <img src="https://carto.com/help/images/building-maps/basemaps/voyager_labels.png"  /> | https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json |
| Positron (no labels) | <img src="https://carto.com/help/images/building-maps/basemaps/positron_no_labels.png"  /> | https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json |
| Dark Matter (no labels) | <img src="https://carto.com/help/images/building-maps/basemaps/dark_no_labels.png"  /> | https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json |
| Voyager (no labels) | <img src="https://carto.com/help/images/building-maps/basemaps/voyager_no_labels.png"  /> | https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json |



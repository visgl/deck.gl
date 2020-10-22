# Basemap

[CARTO basemaps](https://carto.com/basemaps/) are available and they can be used without a token.

## Usage

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/carto
```

```js
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

There are three basemaps available today:

* POSITRON
* DARK_MATTER
* VOYAGER

Ensure you follow the [Terms and Conditions](https://drive.google.com/file/d/0B3OBExqwT6KJNHp3U3VUamx6U1U/view) when using them
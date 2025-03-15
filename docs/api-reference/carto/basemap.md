# BASEMAP

[CARTO basemaps](https://carto.com/basemaps/) are available and they can be used without a token.

Ensure you follow the [Terms and Conditions](https://drive.google.com/file/d/1P7bhSE-N9iegI398QYDjKeVhnbS7-Ilk/view) when using them.

## Usage

### React

**Important Note:** Mapbox-GL-JS v2.0 changed to a license that requires an API key for loading the library, which will prevent you from using `react-map-gl` ( a higher level library). They have an in-depth guide about it [here](https://github.com/visgl/react-map-gl/blob/v6.0.0/docs/get-started/mapbox-tokens.md).

In short, if you want to use the library without a Mapbox token, then you have two options: use a `react-map-gl` version less than 6.0 (`npm i react-map-gl@5`), or [substitute `mapbox-gl` with a fork](https://github.com/visgl/react-map-gl/blob/v6.0.0/docs/get-started/get-started.md#using-with-a-mapbox-gl-fork).

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/carto
```

```js
import {DeckGL} from '@deck.gl/react';
import {StaticMap} from 'react-map-gl/maplibre';
import {BASEMAP} from '@deck.gl/carto';
<DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={layers}>
  <StaticMap mapStyle={BASEMAP.POSITRON} />
</DeckGL>;
```

### Standalone

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/carto@^9.0.0/dist.min.js"></script>

<!-- or -->
<script src="https://unpkg.com/@deck.gl/core/@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/mesh-layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/extensions@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/carto@^9.0.0/dist.min.js"></script>

<!-- basemap provider -->
<script src="https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"></script>
```

```js
const map = new maplibregl.Map({
  container: 'map',
  style: deck.carto.BASEMAP.POSITRON,
  interactive: false
})
const deckgl = new deck.DeckGL({
  canvas: 'deck-canvas',
  initialViewState: {
    latitude: 0,
    longitude: 0,
    zoom: 1
  },
  onViewStateChange: ({viewState}) => {
    const {longitude, latitude, ...rest} = viewState;
    map.jumpTo({center: [longitude, latitude], ...rest});
  }
  controller: true
});
```

## Supported basemaps

There are several basemaps available today:

- POSITRON
- DARK_MATTER
- VOYAGER
- POSITRON_NOLABELS
- DARK_MATTER_NOLABELS
- VOYAGER_NOLABELS

| NAME                 | PREVIEW                                                                                    | STYLE URL                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| POSITRON             | <img src="https://carto.com/help/images/building-maps/basemaps/positron_labels.png"  />    | https://basemaps.cartocdn.com/gl/positron-gl-style/style.json             |
| DARK_MATTER          | <img src="https://carto.com/help/images/building-maps/basemaps/dark_labels.png"  />        | https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json          |
| VOYAGER              | <img src="https://carto.com/help/images/building-maps/basemaps/voyager_labels.png"  />     | https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json              |
| POSITRON_NOLABELS    | <img src="https://carto.com/help/images/building-maps/basemaps/positron_no_labels.png"  /> | https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json    |
| DARK_MATTER_NOLABELS | <img src="https://carto.com/help/images/building-maps/basemaps/dark_no_labels.png"  />     | https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json |
| VOYAGER_NOLABELS     | <img src="https://carto.com/help/images/building-maps/basemaps/voyager_no_labels.png"  />  | https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json     |

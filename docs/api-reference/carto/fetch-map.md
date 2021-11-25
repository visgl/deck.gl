# fetchMap

`fetchMap` is an API that instantiates layers configured in CARTO Builder for use with deck.gl. It is available starting with CARTO Maps API version v3.

<div align="center">
  <div>
    <img src="https://user-images.githubusercontent.com/453755/143416216-4f1f8ddb-6ba3-4ed2-a026-d89c0f3e1ec7.gif" />
    <p><i>CARTO Builder demo</i></p>
  </div>
</div>

## Usage

### Static display of a CARTO map

```js
import {Deck} from '@deck.gl/core';
import {fetchMap} from '@deck.gl/carto';

const cartoMapId = 'ff6ac53f-741a-49fb-b615-d040bc5a96b8';
fetchMap({cartoMapId}).then(map => new Deck(map));
```

### Integration with basemap

```js
import mapboxgl from 'mapbox-gl';

fetchMap({cartoMapId}).then(({initialViewState, mapStyle, layers}) => {
  const MAP_STYLE = `https://basemaps.cartocdn.com/gl/${mapStyle.styleType}-gl-style/style.json`;
  const map = new mapboxgl.Map({container: 'map', style: MAP_STYLE, interactive: false});
  deck.setProps({
    controller: true,
    initialViewState,
    layers,
    onViewStateChange: ({viewState}) => {
      const {longitude, latitude, ...rest} = viewState;
      map.jumpTo({center: [longitude, latitude], ...rest});
    }
  });
});
```

## Usage

```js
const map = await fetchMap({cartoMapId, credentials, autoRefresh, onNewData});
```

- `cartoMapId` (String) - identifier of public map created in CARTO Builder
- `credentials` (Object, Optional) - [CARTO Credentials](/docs/api-reference/carto/overview.md#carto-credentials) to use in API requests
- `autoRefresh` (Number, Optional) - Interval in seconds at which to autoRefresh the data. If provided, `onNewData` must also be provided
- `onNewData` (Function, Optional) - Callback function that will be invoked whenever data in layers is changed. If provided, `autoRefresh` must also be provided

### Return value

When invoked with a given `cartoMapId`, `fetchMap` will retrieve the information about the map from CARTO, generate appropriate layers and populate them with data. The properties of the `map` are as follows:

- `id` (String) - the `cartoMapId`
- `title` (String) - the title given to the map in CARTO Builder
- `description` (String) - the description given to the map in CARTO Builder
- `createdAt` (String) - when the map was created
- `updatedAt` (String) - when the map was last updated
- `initialViewState` (String) - the [view state](docs/developer-guide/views.md#view-state)
- `mapStyle` (String) - an identifier describing the [basemap](docs/api-reference/carto/basemap.md#supported-basemaps) configure in CARTO Builder
- `layers` (Array) - a collection of deck.gl [layers](docs/api-reference/layers.md)
- `stopAutoRefresh` (Function) - a function to invoke to stop auto-refreshing. Only present if `autoRefresh` option was provided to `fetchMap`

## Auto-refreshing

With dynamic data sources, the `autoRefresh` option to `fetchMap` makes it simple to create an live-updating map.

```js
const deck = new Deck({canvas: 'deck-canvas'});
const mapConfiguration = {
  autoRefresh: 5,
  cartoMapId,
  onNewData: ({layers}) => {
    deck.setProps({layers});
  }
};

const {initialViewState, layers, stopAutoRefresh} = await fetchMap(mapConfiguration);
deck.setProps({controller: true, initialViewState, layers});

buttonElement.addEventListener('click', () => {
  stopAutoRefresh();
});
```

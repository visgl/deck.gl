# fetchMap

CARTO [Builder](https://carto.com/builder/) is a powerful tool for designing map visualizations. With the `fetchMap` function, you can easily instantiate layers configured in Builder for use with deck.gl. It is available starting with CARTO Maps API version v3 and deck.gl 8.7.

<div align="center">
  <div>
    <img src="https://raw.githubusercontent.com/visgl/deck.gl-data/master/images/docs/fetch-map.gif" />
    <p><i>Loading a Builder map with deck.gl</i></p>
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

### Integration with CARTO basemaps

```js
import mapboxgl from 'mapbox-gl';

fetchMap({cartoMapId}).then(({initialViewState, mapStyle, layers}) => {
  // Add Mapbox GL for the basemap. It's not a requirement if you don't need a basemap.
  const MAP_STYLE = `https://basemaps.cartocdn.com/gl/${mapStyle.styleType}-gl-style/style.json`;
  const deckgl = new deck.DeckGL({
    container: 'container',
    controller: true,
    mapStyle: MAP_STYLE,
    initialViewState,
    layers
  });
});
```

## Parameters

```js
const map = await fetchMap({cartoMapId, credentials, autoRefresh, onNewData});
```

##### `cartoMapId` (String) {#cartomapid}

Required. Identifier of map created in CARTO Builder.

##### `credentials` (Object, optional) {#credentials}

[CARTO Credentials](./overview.md#carto-credentials) to use in API requests.

##### `headers` (Object, optional) {#headers}

Custom headers to include in the map instantiation requests.

##### `autoRefresh` (Number, optional) {#autorefresh}

Interval in seconds at which to autoRefresh the data. If provided, `onNewData` must also be provided.

##### `onNewData` (Function, Optional) {#onnewdata}

Callback function that will be invoked whenever data in layers is changed. If provided, `autoRefresh` must also be provided.

## Return value

When invoked with a given `cartoMapId`, `fetchMap` will retrieve the information about the map from CARTO, generate appropriate layers and populate them with data. The properties of the `map` are as follows:

##### `id` (String) {#id}

The `cartoMapId`.

##### `title` (String) {#title}

The title given to the map in CARTO Builder.

##### `description` (String) {#description}

The description given to the map in CARTO Builder.

##### `createdAt` (String) {#createdat}

When the map was created.

##### `updatedAt` (String) {#updatedat}

When the map was last updated.

##### `initialViewState` (String) {#initialviewstate}

The [view state](/docs/developer-guide/views.md#view-state).

##### `mapStyle` (String) {#mapstyle}

An identifier describing the [basemap](/docs/api-reference/carto/basemap.md#supported-basemaps) configured in CARTO Builder.

##### `layers` (Array) {#layers}

A collection of deck.gl [layers](/docs/api-reference/layers.md).

##### `stopAutoRefresh` (Function) {#stopautorefresh}

A function to invoke to stop auto-refreshing. Only present if `autoRefresh` option was provided to `fetchMap`.

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

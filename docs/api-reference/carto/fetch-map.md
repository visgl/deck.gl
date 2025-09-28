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
import { fetchMap } from '@deck.gl/carto';
import { MapboxOverlay } from '@deck.gl/mapbox';
import maplibregl from 'maplibre-gl';

fetchMap({ cartoMapId }).then(({ basemap, layers }) => {
  const map = new maplibregl.Map({
    container: '...',
    ...basemap?.props, // basemap.props contain all props required to setup basemap
    interactive: true
  })
  const overlay = new MapboxOverlay({layers: result.layers});
  map.addControl(overlay);
})
```

## Parameters

```js
const map = await fetchMap({cartoMapId, credentials, autoRefresh, onNewData});
```

#### `cartoMapId` (string) {#cartomapid}

Required. Identifier of map created in CARTO Builder.

#### `accessToken` (string, optional) {#accesstoken}

CARTO platform access token. Only required for private maps.

#### `apiBaseUrl` (string, optional) {#apibaseurl}

Base URL of the CARTO Maps API.
  
Example for account located in EU-west region: `https://gcp-eu-west1.api.carto.com`

#### `headers` (object, optional) {#headers}

Custom HTTP headers to include in the map instantiation requests.

#### `autoRefresh` (number, optional) {#autorefresh}

Interval in seconds at which to autoRefresh the data. If provided, `onNewData` must also be provided.

#### `onNewData` (Function, Optional) {#onnewdata}

Callback function that will be invoked whenever data in layers is changed. If provided, `autoRefresh` must also be provided.

## Return value

When invoked with a given `cartoMapId`, `fetchMap` will retrieve the information about the map from CARTO, generate appropriate layers and populate them with data. The properties of the `map` are as follows:

#### `id` (string) {#id}

The `cartoMapId`.

#### `title` (string) {#title}

The title given to the map in CARTO Builder.

#### `description` (string) {#description}

The description given to the map in CARTO Builder.

#### `createdAt` (string) {#createdat}

When the map was created.

#### `updatedAt` (string) {#updatedat}

When the map was last updated.

#### `initialViewState` (string) {#initialviewstate}

The [view state](../../developer-guide/views.md#view-state).

#### `layers` (Layer[]) {#layers}

A collection of deck.gl [layers](../core/layer.md).

#### `basemap` (object) {#basemap}

An object describing the [basemap](../../api-reference/carto/basemap.md#supported-basemaps) configured in CARTO Builder.

Properties:
 * `type` **(string)** - type of basemap: `'maplibre'` or `'google-maps'`
 * `props` **(string or object)** - props that should be passed to basemap implementation
    * if `type` is `'maplibre'` then it contains
      * `style` **(string or object)** - URL of basemap style or style object if custom basemap is configured
      * `center` **([number, number])** - center of map as `[latitude, longitude]`
      * `zoom` **(number)** - zoom level
      * `pitch` **(number)**
      * `bearing` **(number)**
    * if `type` is `'google-maps'`, then it contains those props
      * `mapTypeId` **(string)** - type id of map
      * `mapId` **(string, optional)** - map id
      * `center` **(object)** - center of map as `{lat: number; lng: number}`
      * `zoom`: **(number)** - zoom level (note, it has +1 offset applied versus deck.gl zoom)
      * `tilt`: **(number)** - tilt, same as `pitch` in deck.gl API
      * `heading`: **(number)** - heading, same as `bearing` in deck.gl API
 * `rawStyle` **(string or object)** - for `maplibre` basemaps, original `style` before applying layer filtering
 * `visibleLayerGroups` **(object, optional)** - layer groups to be displayed in the basemap.
 * `attribution` **(string, optional)** - custom attribution HTML for this basemap

#### `stopAutoRefresh` (Function) {#stopautorefresh}

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

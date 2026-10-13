# fetchMap

CARTO [Builder](https://carto.com/builder/) is a powerful tool for designing map visualizations. With the `fetchMap` function, you can easily instantiate layers configured in Builder for use with deck.gl. It is available starting with CARTO Maps API version v3 and deck.gl 8.7.

![](https://raw.githubusercontent.com/visgl/deck.gl-data/master/images/docs/fetch-map.gif)

*Loading a Builder map with deck.gl*

## Usage[​](#usage "Direct link to Usage")

### Static display of a CARTO map[​](#static-display-of-a-carto-map "Direct link to Static display of a CARTO map")

```
import {Deck} from '@deck.gl/core';

import {fetchMap} from '@deck.gl/carto';



const cartoMapId = 'ff6ac53f-741a-49fb-b615-d040bc5a96b8';

fetchMap({cartoMapId}).then(map => new Deck(map));
```

### Integration with CARTO basemaps[​](#integration-with-carto-basemaps "Direct link to Integration with CARTO basemaps")

```
import { fetchMap } from '@deck.gl/carto';

import { MapLibreOverlay } from '@deck.gl/maplibre';

import maplibregl from 'maplibre-gl';



fetchMap({ cartoMapId }).then(({ basemap, layers }) => {

  const map = new maplibregl.Map({

    container: '...',

    ...basemap?.props, // basemap.props contain all props required to setup basemap

    interactive: true

  })

  const overlay = new MapLibreOverlay({layers: result.layers});

  map.addControl(overlay);

})
```

## Parameters[​](#parameters "Direct link to Parameters")

```
const map = await fetchMap({cartoMapId, credentials, autoRefresh, onNewData});
```

#### `cartoMapId` (string)[​](#cartomapid "Direct link to cartomapid")

Required. Identifier of map created in CARTO Builder.

#### `accessToken` (string, optional)[​](#accesstoken "Direct link to accesstoken")

CARTO platform access token. Only required for private maps.

#### `apiBaseUrl` (string, optional)[​](#apibaseurl "Direct link to apibaseurl")

Base URL of the CARTO Maps API.

Example for account located in EU-west region: `https://gcp-eu-west1.api.carto.com`

#### `headers` (object, optional)[​](#headers "Direct link to headers")

Custom HTTP headers to include in the map instantiation requests.

#### `autoRefresh` (number, optional)[​](#autorefresh "Direct link to autorefresh")

Interval in seconds at which to autoRefresh the data. If provided, `onNewData` must also be provided.

#### `onNewData` (Function, Optional)[​](#onnewdata "Direct link to onnewdata")

Callback function that will be invoked whenever data in layers is changed. If provided, `autoRefresh` must also be provided.

## Return value[​](#return-value "Direct link to Return value")

When invoked with a given `cartoMapId`, `fetchMap` will retrieve the information about the map from CARTO, generate appropriate layers and populate them with data. The properties of the `map` are as follows:

#### `id` (string)[​](#id "Direct link to id")

The `cartoMapId`.

#### `title` (string)[​](#title "Direct link to title")

The title given to the map in CARTO Builder.

#### `description` (string)[​](#description "Direct link to description")

The description given to the map in CARTO Builder.

#### `createdAt` (string)[​](#createdat "Direct link to createdat")

When the map was created.

#### `updatedAt` (string)[​](#updatedat "Direct link to updatedat")

When the map was last updated.

#### `initialViewState` (string)[​](#initialviewstate "Direct link to initialviewstate")

The [view state](https://deck.gl/next/docs/developer-guide/views.md#view-state).

#### `layers` (Layer\[])[​](#layers "Direct link to layers")

A collection of deck.gl [layers](https://deck.gl/next/docs/api-reference/core/layer.md).

#### `basemap` (object)[​](#basemap "Direct link to basemap")

An object describing the [basemap](https://deck.gl/next/docs/api-reference/carto/basemap.md#supported-basemaps) configured in CARTO Builder.

Properties:

* `type` **(string)** - type of basemap: `'maplibre'` or `'google-maps'`

* `props` **(string or object)** - props that should be passed to basemap implementation

  <!-- -->

  * if `type` is `'maplibre'` then it contains

    <!-- -->

    * `style` **(string or object)** - URL of basemap style or style object if custom basemap is configured
    * `center` **(\[number, number])** - center of map as `[latitude, longitude]`
    * `zoom` **(number)** - zoom level
    * `pitch` **(number)**
    * `bearing` **(number)**

  * if `type` is `'google-maps'`, then it contains those props

    <!-- -->

    * `mapTypeId` **(string)** - type id of map
    * `mapId` **(string, optional)** - map id
    * `center` **(object)** - center of map as `{lat: number; lng: number}`
    * `zoom`: **(number)** - zoom level (note, it has +1 offset applied versus deck.gl zoom)
    * `tilt`: **(number)** - tilt, same as `pitch` in deck.gl API
    * `heading`: **(number)** - heading, same as `bearing` in deck.gl API

* `rawStyle` **(string or object)** - for `maplibre` basemaps, original `style` before applying layer filtering

* `visibleLayerGroups` **(object, optional)** - layer groups to be displayed in the basemap.

* `attribution` **(string, optional)** - custom attribution HTML for this basemap

#### `stopAutoRefresh` (Function)[​](#stopautorefresh "Direct link to stopautorefresh")

A function to invoke to stop auto-refreshing. Only present if `autoRefresh` option was provided to `fetchMap`.

## Auto-refreshing[​](#auto-refreshing "Direct link to Auto-refreshing")

With dynamic data sources, the `autoRefresh` option to `fetchMap` makes it simple to create an live-updating map.

```
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

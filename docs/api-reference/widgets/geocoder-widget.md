import {WidgetPreview} from '@site/src/doc-demos/widgets';
import {GeocoderWidget} from '@deck.gl/widgets';

# GeocoderWidget

<img src="https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square" alt="from v9.2" />

The GeocoderWidget helps the user find positions on the map.

This widget provides an input box for entering an address or a pair of coordinates.

The user types an address or coordinates into the text field and press **Go** to move the map.  The most recent addresses that have been successfully located are  presented in a drop-down menu. 

Addresses that return a valid location are stored in browser local storage (up to five entries). They will appear in the drop-down for quick re-use during later visits.

## Usage

<WidgetPreview cls={GeocoderWidget}/>

```ts
import {Deck} from '@deck.gl/core';
import {GeocoderWidget} from '@deck.gl/widgets';

new Deck({
  widgets: [new GeocoderWidget()]
});
```

## Types

### `GeocoderWidgetProps` {#geocoderwidgetprops}

The `GeocoderWidgetProps` accepts the generic [`WidgetProps`](../core/widget.md#widgetprops) and:

#### `label` (string, optional) {#label}

* Default: `'Geocoder'`

Tooltip message displayed while hovering a mouse over the widget.

#### `transitionDuration` (number, optional) {#transitionduration}

* Default: `200`

View state transition duration in milliseconds.

#### `geocoder` (string, optional) {#geocoder}

* Default: `'coordinates'`

Which geocoding service to use. Supported values are `'coordinates'`, `'google'`, `'mapbox'`, `'opencage'`, or `'custom'`.

#### `apiKey` (string, optional) {#apikey}

* Default: `''`

Required if `geocoder` is set to a third party provider. For quick testing, applications can use the  `coordinates` geocode does not require an api key.

#### `customGeocoder` (optional) {#customgeocoder}

Only used when `geocoder` is `'custom'`. A function that receives the entered text and an API key, and resolves to a `{longitude, latitude}` object when successful.

#### `_geolocation` (optional) {#_geolocation}

In addition to addresses / coordinates, one position of obvious interest is the user's own current position. This experimental option adds a `current` menu item that calls the browser's geolocation API and navigates to the user's current position. Note that this requires the user to enable geolocation in the browser.

If `props._geolocation` **Current position** from the drop-down uses `navigator.geolocation` to center the map. The option is hidden if the browser does not provide the Geolocation API or the user denies access.

## Source

[modules/widgets/src/geocoder-widget.tsx](https://github.com/visgl/deck.gl/tree/master/modules/widgets/src/geocoder-widget.tsx)

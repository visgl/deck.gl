# GeocoderWidget

The GeocoderWidget can be thought of as widget that helps the user find positions on the map, and in addition to addresses / coordinates, one position of obvious interest is the user's own current position.

This widget provides an input box for entering an address or a pair of coordinates. The most recent addresses that have been successfully located are stored in `localStorage` and presented in a drop-down menu. The top item in the menu is always **Current position**, which when selected invokes the browser's geolocation API to re-center the map.

```ts
import {GeocoderWidget} from '@deck.gl/widgets';
import {Deck} from '@deck.gl/core';

new Deck({
  widgets: [new GeocoderWidget()]
});
```

## Props

The `GeocoderWidget` shares the base properties listed on the [widget overview page](./overview.md). Additional options are listed below.

#### `geocoder` (string, optional) {#geocoder}

Default: `'coordinates'`

Which geocoding service to use. Supported values are `'coordinates'`, `'google'`, `'mapbox'`, `'opencage'`, or `'custom'`.

#### `apiKey` (string, optional) {#apiKey}

Required if `geocoder` is set to a supported third party provider.

#### `onGeocode` (function, optional) {#onGeocode}

Only used when `geocoder` is `'custom'`. A function that receives the entered text and an API key, and resolves to a `{longitude, latitude}` object when successful.

## Usage

Type an address or coordinates into the text field and press **Go** to move the map. Addresses that return a valid location are stored in browser local storage (up to five entries). They will appear in the drop-down for quick re-use during later visits.

Selecting **Current position** from the drop-down uses `navigator.geolocation` to center the map. The option is hidden if the browser does not provide the Geolocation API or the user denies access.


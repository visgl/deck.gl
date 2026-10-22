# GeocoderWidget (Experimental)

![from v9.2](https://img.shields.io/badge/from-v9.2-green.svg?style=flat-square)

<!-- -->

The GeocoderWidget helps the user find positions on the map.

This widget provides an input box for entering an address or a pair of coordinates.

The user types an address or coordinates into the text field and press **Go** to move the map. The most recent addresses that have been successfully located are presented in a drop-down menu.

Addresses that return a valid location are stored in browser local storage (up to five entries). They will appear in the drop-down for quick re-use during later visits.

* JavaScript
* TypeScript
* React

```
import {Deck} from '@deck.gl/core';

import {_GeocoderWidget as GeocoderWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  initialViewState: {

    longitude: 0,

    latitude: 52,

    zoom: 4

  },

  controller: true,

  widgets: [

    new GeocoderWidget({

      geocoder: 'coordinates',

      _geolocation: true

    })

  ]

});
```

```
import {Deck} from '@deck.gl/core';

import {_GeocoderWidget as GeocoderWidget} from '@deck.gl/widgets';

import '@deck.gl/widgets/stylesheet.css';



new Deck({

  initialViewState: {

    longitude: 0,

    latitude: 52,

    zoom: 4

  },

  controller: true,

  widgets: [

    new GeocoderWidget({

      geocoder: 'coordinates',

      _geolocation: true

    })

  ]

});
```

```
import React from 'react';

import DeckGL, {_GeocoderWidget as GeocoderWidget} from '@deck.gl/react';

import '@deck.gl/widgets/stylesheet.css';



function App() {

  return (

    <DeckGL

      initialViewState={{

        longitude: 0,

        latitude: 52,

        zoom: 4

      }}

      controller

    >

      <GeocoderWidget geocoder="coordinates" _geolocation />

    </DeckGL>

  );

}
```

## Constructor[​](#constructor "Direct link to Constructor")

```
import {_GeocoderWidget as GeocoderWidget, type GeocoderWidgetProps} from '@deck.gl/widgets';

new GeocoderWidget({} satisfies GeocoderWidgetProps);
```

## Types[​](#types "Direct link to Types")

### `GeocoderWidgetProps`[​](#geocoderwidgetprops "Direct link to geocoderwidgetprops")

The `GeocoderWidgetProps` accepts the generic [`WidgetProps`](https://deck.gl/docs/api-reference/core/widget.md#widgetprops) and:

#### `label` (string, optional)[​](#label "Direct link to label")

* Default: `'Geocoder'`

Tooltip message displayed while hovering a mouse over the widget.

#### `transitionDuration` (number, optional)[​](#transitionduration "Direct link to transitionduration")

* Default: `200`

View state transition duration in milliseconds.

#### `geocoder` (string, optional)[​](#geocoder "Direct link to geocoder")

* Default: `'coordinates'`

Which geocoding service to use. Supported values are `'coordinates'`, `'google'`, `'mapbox'`, `'opencage'`, or `'custom'`.

#### `apiKey` (string, optional)[​](#apikey "Direct link to apikey")

* Default: `''`

Required if `geocoder` is set to a third party provider. For quick testing, applications can use the `coordinates` geocode does not require an api key.

#### `customGeocoder` (optional)[​](#customgeocoder "Direct link to customgeocoder")

Only used when `geocoder` is `'custom'`. A function that receives the entered text and an API key, and resolves to a `{longitude, latitude}` object when successful.

#### `_geolocation` (optional)[​](#_geolocation "Direct link to _geolocation")

In addition to addresses / coordinates, one position of obvious interest is the user's own current position. This experimental option adds a `current` menu item that calls the browser's geolocation API and navigates to the user's current position. Note that this requires the user to enable geolocation in the browser.

If `props._geolocation` **Current position** from the drop-down uses `navigator.geolocation` to center the map. The option is hidden if the browser does not provide the Geolocation API or the user denies access.

#### `onGeocode` (Function, optional)[​](#ongeocode "Direct link to ongeocode")

```
(params: {viewId: string; coordinates: {longitude: number; latitude: number; zoom?: number}}) => void
```

* Default: `() => {}`

Callback when a location is geocoded and the view will navigate to it.

* `viewId`: The view being updated
* `coordinates`: The geocoded coordinates (longitude, latitude, and optionally zoom)

## Source[​](#source "Direct link to Source")

[modules/widgets/src/geocoder-widget.tsx](https://github.com/visgl/deck.gl/tree/9.4-release/modules/widgets/src/geocoder-widget.tsx)

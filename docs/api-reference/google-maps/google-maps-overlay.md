# GoogleMapsOverlay

This class implements the [OverlayView](https://developers.google.com/maps/documentation/javascript/reference/overlay-view#OverlayView)/[WebGLOverlayView](https://developers.google.com/maps/documentation/javascript/reference/webgl#WebGLOverlayView) (depending on map rendering type) interface and can be used as any other Google Maps overlay.

As detailed in the [overview](https://deck.gl/docs/api-reference/google-maps/overview.md), the overlay supports both Vector and Raster Google map rendering. Depending on the Google Map configuration, the correct deck.gl overlay rendering method will be chosen at runtime.

## Example[​](#example "Direct link to Example")

<!-- -->

* TypeScript
* React

```
import {Loader} from '@googlemaps/js-api-loader';

import {GoogleMapsOverlay} from '@deck.gl/google-maps';

import {ScatterplotLayer} from '@deck.gl/layers';



const loader = new Loader({apiKey: '<google_maps_api_key>'});

const googlemaps = await loader.importLibrary('maps');



const map = new googlemaps.Map(document.getElementById('map'), {

  center: {lat: 51.47, lng: 0.45},

  zoom: 11,

  mapId: '<google_map_id>'

});



const overlay = new GoogleMapsOverlay({

  layers: [

    new ScatterplotLayer({

      id: 'deckgl-circle',

      data: [

        {position: [0.45, 51.47]}

      ],

      getPosition: d => d.position,

      getFillColor: [255, 0, 0, 100],

      getRadius: 1000

    })

  ]

});



overlay.setMap(map);
```

```
import React, {useMemo, useEffect} from 'react';

import {APIProvider, Map, useMap} from '@vis.gl/react-google-maps';

import {DeckProps} from '@deck.gl/core';

import {ScatterplotLayer} from '@deck.gl/layers';

import {GoogleMapsOverlay} from '@deck.gl/google-maps';



function DeckGLOverlay(props: DeckProps) {

  const map = useMap();

  const overlay = useMemo(() => new GoogleMapsOverlay(props));



  useEffect(() => {

    overlay.setMap(map);

    return () => overlay.setMap(null);

  }, [map])



  overlay.setProps(props);

  return null;

}



function App() {

  const layers = [

    new ScatterplotLayer({

      id: 'deckgl-circle',

      data: [

        {position: [0.45, 51.47]}

      ],

      getPosition: d => d.position,

      getFillColor: [255, 0, 0, 100],

      getRadius: 1000

    })

  ];



  return <APIProvider apiKey="<google_maps_api_key>">

    <Map

      defaultCenter={{lat: 51.47, lng: 0.45}}

      defaultZoom={11}

      mapId="<google_maps_id>" >

      <DeckGLOverlay layers={layers} />

    </Map>

  </APIProvider>;

}
```

## Constructor[​](#constructor "Direct link to Constructor")

```
import {GoogleMapsOverlay} from '@deck.gl/google-maps';

import type {GoogleMapsOverlayProps} from '@deck.gl/google-maps';



new GoogleMapsOverlay(props: GoogleMapsOverlayProps);
```

`props` are forwarded to a `Deck` instance. The following [Deck](https://deck.gl/docs/api-reference/core/deck.md) props are supported:

* `style`
* `layers`
* `effects`
* `parameters`
* `pickingRadius`
* `useDevicePixels`
* `onWebGLInitialized`
* `onBeforeRender`
* `onAfterRender`
* `onLoad`

The constructor additionally accepts the following option:

* `interleaved` (boolean) - When set to `false`, a dedicated deck.gl canvas is layered on top of the base map. If set to `true` and the Google Map is configured for Vector rendering, deck.gl layers are inserted into the Google Maps layer stack, sharing the same WebGL2RenderingContext. Default is `true`.

## Remarks[​](#remarks "Direct link to Remarks")

### Antialiasing[​](#antialiasing "Direct link to Antialiasing")

With `interleaved: true` on a Vector map, deck.gl shares the WebGL context created by Google Maps, which does not provide multisampling and exposes no option to request it. Layers whose edges depend on it — including [PathLayer](https://deck.gl/docs/api-reference/layers/path-layer.md), [LineLayer](https://deck.gl/docs/api-reference/layers/line-layer.md), [ArcLayer](https://deck.gl/docs/api-reference/layers/arc-layer.md), and [PointCloudLayer](https://deck.gl/docs/api-reference/layers/point-cloud-layer.md) — render with hard, aliased edges. See [#7647](https://github.com/visgl/deck.gl/issues/7647).

Set `antialiasing: true` on those layers to have them compute edge coverage in the shader instead. On composite layers the prop is named `lineAntialiasing` ([GeoJsonLayer](https://deck.gl/docs/api-reference/layers/geojson-layer.md#lineantialiasing), [PolygonLayer](https://deck.gl/docs/api-reference/layers/polygon-layer.md#lineantialiasing)).

## Methods[​](#methods "Direct link to Methods")

#### `setMap`[​](#setmap "Direct link to setmap")

```
overlay.setMap(map);
```

Add/remove the overlay from a map. An overlay can be temporarily hidden from a map by calling `setMap(null)`. Removing an overlay does not destroy the WebGL2 context; use `finalize()` if the overlay should be permanently removed.

#### `setProps`[​](#setprops "Direct link to setprops")

```
overlay.setProps(props);
```

Update (partial) props.

#### `pickObject`[​](#pickobject "Direct link to pickobject")

Equivalent of [deck.pickObject](https://deck.gl/docs/api-reference/core/deck.md).

#### `pickObjects`[​](#pickobjects "Direct link to pickobjects")

Equivalent of [deck.pickObjects](https://deck.gl/docs/api-reference/core/deck.md).

#### `pickMultipleObjects`[​](#pickmultipleobjects "Direct link to pickmultipleobjects")

Equivalent of [deck.pickMultipleObjects](https://deck.gl/docs/api-reference/core/deck.md).

#### `finalize`[​](#finalize "Direct link to finalize")

Remove the overlay and release all underlying resources.

##### getCanvas[​](#getcanvas "Direct link to getCanvas")

See [Deck.getCanvas](https://deck.gl/docs/api-reference/core/deck.md#getcanvas). When using `interleaved: true`, returns the base map's `canvas`.

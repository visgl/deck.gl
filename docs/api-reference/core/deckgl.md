# DeckGL (Scripting Interface)

`DeckGL` extends the core [Deck](/docs/api-reference/core/deck.md) class with some additional features such as Mapbox integration. It offers a convenient way to use deck.gl in prototype environments such as [Codepen](https://codepen.io), [JSFiddle](https://jsfiddle.net) and [Observable](https://observablehq.com). 

Make sure to read the [Using deck.gl Scripting API](/docs/get-started/using-standalone.md) article.


## Usage

```js
new deck.DeckGL({
  mapStyle: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
  initialViewState: {
    longitude: -122.45,
    latitude: 37.8,
    zoom: 12
  },
  controller: true,
  layers: [
    new deck.ScatterplotLayer({
      data: [
        {position: [-122.45, 37.8], color: [255, 0, 0], radius: 100}
      ],
      getColor: d => d.color,
      getRadius: d => d.radius
    })
  ]
});
```

## Properties

All [Deck](/docs/api-reference/core/deck.md) class properties, with these additional props that can be passed to the constructor:

##### `container` (DOMElement | String, optional)

Default: `document.body`

The container in which deck.gl should append its canvas. Can be either a HTMLDivElement or the element id. The deck.gl canvas is resized to fill the container.

##### `map` (Object, optional)

Default: `window.mapboxgl`

The scripting API offers out-of-the-box integration with Mapbox. To add a base map to your visualization, you need to include the Mapbox library and stylesheet:

```html
<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.0/mapbox-gl.js'></script>
<link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.0/mapbox-gl.css' rel='stylesheet' />
```

The above script adds `mapboxgl` to the global scope, which will be picked up by default. 

To disable the base map, simply exclude the mapbox script or set `map` to false.

In some environments such as Observable, libraries cannot be imported into the global scope, in which case you need to manually pass the mapboxgl object to `map`:

```js
mapboxgl = require('mapbox-gl@~0.44.1/dist/mapbox-gl.js');
```

And

```js
new deck.DeckGL({
  ...
  map: mapboxgl
});
```

To use a mapbox-gl fork such as [MapLibre GL JS](https://maplibre.org), pass the corresponding library entry point to `map`:

```html
<script src="https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.js"></script>
<link href="https://unpkg.com/maplibre-gl@latest/dist/maplibre-gl.css" rel="stylesheet" />
```

And 

```js
new deck.DeckGL({
  ...
  map: maplibregl
});
```

##### `mapStyle` (Object | String)

The style JSON or URL for the Mapbox map.

##### `mapboxApiAccessToken` (String)

The API access token to use Mapbox tiles. See [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js/api) documentation for how to use Mapbox.


## Methods

All [Deck](/docs/api-reference/core/deck.md) class methods, with these additional methods:

##### `getMapboxMap`

Returns the mapbox-gl [Map](https://www.mapbox.com/mapbox-gl-js/api/#map) instance if a base map is present.


## Source

[modules/main/bundle.js](https://github.com/visgl/deck.gl/blob/master/modules/main/bundle.js)

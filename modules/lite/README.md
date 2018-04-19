# deck.gl/js
Scripting version of deck.gl

## Usage

Include the library:
```html
<script src='https://uber.github.io/deck.gl/deckgl-5.2.js'></script>
```

To use with Mapbox:
```html
<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.44.1/mapbox-gl.js'></script>
<link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.44.1/mapbox-gl.css' rel='stylesheet' />
```

```js
new deck.DeckGL({
  mapboxApiAccessToken: '<your_token_here>',
  longitude: -122.45,
  latitude: 37.8,
  zoom: 12,
  layers: [
    new deck.ScatterplotLayer({
      data: [
        {position: [-122.45, 37.8], color: [255, 0, 0], radius: 100}
      ]
    })
  ]
});
```

## Demo
[Codepen](https://codepen.io/vis-gl/)

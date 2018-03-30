# deck.gl/js
Scripting version of deck.gl

## Usage
```js
new DeckGL({
  longitude: -122.45,
  latitude: 37.8,
  zoom: 12,
  map: true,
  layers: [
    new DeckGL.ScatterplotLayer({
      data: [
        {position: [-122.45, 37.8], color: [255, 0, 0], radius: 100}
      ]
    })
  ]
});
```

## Demo
[Codepen](https://codepen.io/Pessimistress/pen/jGXVBK)

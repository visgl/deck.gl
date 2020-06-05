# RFC: Data Manager

* Authors: Xiaoji Chen
* Date: Jan, 2020
* Status: **Draft**

## Summary

This RFC proposes a generic transport format for generating/rendering data cross platforms.

## Background

In v7.3, deck.gl added the `@deck.gl/json` module. It supports generating serializable deck.gl props in non-JavaScript environments and send it to render on the client side. This format is currently used by `pydeck`, deck.gl's Python binding.

We have plans to add bindings for other languages, and potentially non-JS renderers. This calls for a more comprehensive format that can be easily generated, sent, and handled by multiple languages and platforms.

The JSON format has the following shortcomings:

- Efficiency: Serializing/deserializing large data objects with JSON is expensive in terms of both time and space. Network bandwidth, CPU time and memory are all valuable assets when it comes to web applications.
- Updates: It is not possible to update a layer without re-sending the entire snapshot. This is important for animation and/or live data visualization.

A hybrid transport format of both JSON and binary will help address these issues.

## Proposal

### Deck-level data manager

deck.gl's existing data management model is per-layer. This makes it difficult for 1) multiple layers to share the same data (URL/arraybuffer), and 2) updating data separately from the visualization.

The proposal is to add a Deck-level `DataManager` that is shared and referenced by all layers.

- A "resource" in the data manager can be any of:
  + String: representing the URL that should be loaded by a registered loader
  + JavaScript Array
  + TypedArray: converted to a luma.gl Buffer object
  + Promise
  + luma.gl Buffer/Texture2D
- Layers can reference a shared resource by its local url (see below)
- The `DataManager` handles:
  + loading async resources
  + tracking the consumer of each resource
  + updating the consumer if a resource is updated

Registering a resource:

```js
// declarative
<DeckGL
  resources={{
    'airports': 'https://raw.githubusercontent.com/../airports.geojson',
    'interleaved-pointcloud-date': float32Array
  }} />

// imperative
deck.addResources({
  'airports': 'https://raw.githubusercontent.com/../airports.geojson',
  'interleaved-pointcloud-date': float32Array
});
```

Update a resource:

```js
// declarative
<DeckGL
  resources={{
    // `airports` is removed because it is no longer referenced
    'interleaved-pointcloud-date': float32Array.slice()  // a shalow change is required to signal updates
  }} />

// imperative
deck.addResources({
  'interleaved-pointcloud-date': float32Array
}, {
  update: true // indicate that the data has been mutated
});
deck.removeResources('airports');
```

Reference a resource:

```js
const layers = [
  // Multiple layers sharing the same dataset
  new ScatterplotLayer({data: 'deck://airports', ...}),
  new ColumnLayer({data: 'deck://airports', ...}),
  
  // Interleaved binary
  new PointCloudLayer({
    data: {
      length: 1e6,
      attributes: {
        positions: {buffer: 'deck://interleaved-pointcloud-date', size: 3, stride: 24},
        colors: {buffer: 'deck://interleaved-pointcloud-date', size: 4, stride: 24, offset: 12, type: GL.UNSIGNED_BYTE},
      }
    }
  }),

  // Populate arbitrary async prop
  new SimpleMeshLayer({mesh: 'deck://car-mesh', ...})
]
```

A compound resource (i.e. an Arrow table) can be destructed like this:

```js
new ScatterplotLayer({
  data: {
    length: 1e5,
    attributes: {
      getPosition: {buffer: 'deck://scatterplot-data-arrow/coordinate', size: 2},
      getRadius: {buffer: 'deck://scatterplot-data-arrow/radius', size: 1}
    }
  }
})
```


### JSONConverter API

Expand the `JSONConverter.convert` API to accept a second argument:

```js
converter.convert(json, resources);
```

Where `resources` is a map of resources.
This allows the application to update resources incrementally, from e.g. binary payloads:

```js
let json;
let resouces = {};

function onServerMessage({type, id, payload}) {
  if (type === 'json') {
    json = payload;
  } else if (type === 'binary') {
    resources[id] = payload;
  }
  const deckProps = converter.convert(json, resources);
  // update
}
```

In the JSON payload, layers can reference binary data like this:

```json
{
  "@@type": "PointCloudLayer",
  "data": {
    "length": 1e6,
    "attributes": {
      "positions": {"buffer": "deck://interleaved-pointcloud-date", "size": 3, "stride": 24},
      "colors": {"buffer": "deck://interleaved-pointcloud-date", "size": 4, "stride": 24, "offset": 12, "type": "uint8"},
    }
  }
}
```


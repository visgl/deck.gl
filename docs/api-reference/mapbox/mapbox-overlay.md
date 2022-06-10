# MapboxOverlay

`MapboxOverlay` is an implementation of [Mapbox GL JS](https://www.npmjs.com/package/mapbox-gl)'s [IControl](https://docs.mapbox.com/mapbox-gl-js/api/markers/#icontrol) API. When adding a `MapboxOverlay` control to an mapbox map, deck.gl layers are rendered in synchronization with the base map layers. This control supports both [overlaid and interleaved](/docs/get-started/using-with-map.md) rendering modes.

## Example

### Overlaid

```js
import {MapboxOverlay} from '@deck.gl/mapbox';
import {ScatterplotLayer} from '@deck.gl/layers';

const map = new mapboxgl.Map({
  center: [-74.5, 40],
  zoom: 14,
  antialis: true // Improves the rendering quality
});

const overlay = new MapboxOverlay({
  interleaved: false,
  layers: [
    new ScatterplotLayer({
      id: 'my-scatterplot',
      data: [
        {position: [-74.5, 40], size: 100}
      ],
      getPosition: d => d.position,
      getRadius: d => d.size,
      getColor: [255, 0, 0]
    })
  ]
});

map.addControl(overlay);
```

### Interleaved

```js
import {MapboxOverlay} from '@deck.gl/mapbox';
import {ScatterplotLayer} from '@deck.gl/layers';

const map = new mapboxgl.Map({
  center: [-74.5, 40],
  zoom: 14,
  antialis: true // Improves the rendering quality
});

const overlay = new MapboxOverlay({
  interleaved: true,
  layers: [
    new ScatterplotLayer({
      id: 'my-scatterplot',
      data: [
        {position: [-74.5, 40], size: 100}
      ],
      getPosition: d => d.position,
      getRadius: d => d.size,
      getColor: [255, 0, 0],

      beforeId: 'admin_labels' // Insert before this Mapbox layer
    })
  ]
});

map.addControl(overlay);
```


## Constructor

```js
import {MapboxOverlay} from '@deck.gl/mapbox';
new MapboxOverlay(props);
```

`MapboxOverlay` accepts the same props as the [Deck](/docs/api-reference/core/deck.md) class, with the following exceptions:

- `views` - multi-view support is limited. There is only one `MapView` that can synchronize with the base map. See the [using with multi-views](#multi-view-usage) section for details.
- `parent` / `canvas` / `gl` - context creation is managed internally.
- `viewState` / `initialViewState` - camera state is managed internally.
- `controller` - always disabled (to use Mapbox's interaction handlers).

The constructor additionally accepts the following option:

- `interleaved` (Boolean) - If `false`, a dedicated deck.gl canvas is added on top of the base map. If `true`, deck.gl layers are inserted into mapbox-gl's layer stack, and share the same WebGLRenderingContext as the base map.

When using `interleaved: true`, you may optionally add a `beforeId` prop to a layer to specify its position in the Mapbox layer stack. If multiple deck.gl layers have the same `beforeId`, they are rendered in the order that is passed into the `layers` array.

## Methods

##### setProps

```js
const overlay = new MapboxOverlay({
  interleaved: true,
  layers: []
});

map.addControl(overlay);

// Update layers
overlay.setProps({
  layers: [new ScatterplotLayer({...})]
})
```

Updates (partial) props of the underlying `Deck` instance. See [Deck.setProps](/docs/api-reference/core/deck.md#setprops).

##### pickObject

See [Deck.pickObject](/docs/api-reference/core/deck.md#pickobject).

##### pickObjects

See [Deck.pickObjects](/docs/api-reference/core/deck.md#pickobjects).

##### pickMultipleObjects

See [Deck.pickMultipleObjects](/docs/api-reference/core/deck.md#pickmultipleobjects).

##### finalize

Removes the control and deletes all resources.


## Remarks

### Multi-view usage

When using `MapboxOverlay` with multiple views passed to the `views` prop, only one of the views can match the base map and receive interaction.

With that said, it is still possible to take advantage of deck's multi-view system and render a mapbox base map onto any one MapView of your choice by setting the `views` array and a `layerFilter` callback.

- To use multiple views, define a `MapView` with the id `“mapbox”`. This view will receive the state that matches the base map at each render.
- If views are provided but the array does not contain this id, then a `MapView({id: 'mapbox'})` will be inserted at the bottom of the stack.

```js
import {MapboxOverlay} from '@deck.gl/mapbox';
import {Deck, MapView, OrthographicView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

const map = new mapboxgl.Map({...});

const overlay = new MapboxOverlay({
  views: [
    // This view will be synchronized with the base map
    new MapView({id: 'mapbox'}),
    // This view will not be interactive
    new OrthographicView({id: 'widget'})
  ],
  layerFilter: ({layer, viewport}) => {
    const shouldDrawInWidget = layer.id.startsWith('widget');
    if (viewport.id === 'widget') return shouldDrawInWidget;
    return !shouldDrawInWidget;
  },
  layers: [
    new ScatterplotLayer({
      id: 'my-scatterplot',
      data: [
        {position: [-74.5, 40], size: 100}
      ],
      getPosition: d => d.position,
      getRadius: d => d.size,
      getFillColor: [255, 0, 0]
    }),
    new ScatterplotLayer({
      id: 'widget-scatterplot',
      data: [
        {position: [0, 0], size: 100}
      ],
      getPosition: d => d.position,
      getRadius: d => d.size,
      getFillColor: [255, 0, 0]
    })
  ]
});

map.addControl(overlay);
```

# MapboxOverlay

`MapboxOverlay` is an implementation of [Mapbox GL JS](https://www.npmjs.com/package/mapbox-gl)'s [IControl](https://docs.mapbox.com/mapbox-gl-js/api/markers/#icontrol) API. When adding a `MapboxOverlay` instance to an mapbox map, a deck.gl canvas overlaid on top of the base map, and synchronized with the map's camera.

## Example

```js
import {MapboxOverlay} from '@deck.gl/mapbox';
import {ScatterplotLayer} from '@deck.gl/layers';

const map = new mapboxgl.Map({...});

const overlay = new MapboxOverlay({
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

## Constructor

```js
import {MapboxOverlay} from '@deck.gl/mapbox';
new MapboxOverlay(props);
```

`MapboxOverlay` accepts the same props as the [Deck](/docs/api-reference/core/deck.md) class, with the following exceptions:

- `views` - multi-view is not supported. There is only one `MapView` that synchronizes with the base map.
- `viewState` - managed internally.
- `controller` - always disabled (to use Mapbox's interaction handlers).

## Methods

##### setProps

Updates (partial) props of the underlying `Deck` instance. See [Deck.setProps](/docs/api-reference/core/deck.md#setprops).

##### pickObject

See [Deck.pickObject](/docs/api-reference/core/deck.md#pickobject).

##### pickObjects

See [Deck.pickObjects](/docs/api-reference/core/deck.md#pickobjects).

##### pickMultipleObjects

See [Deck.pickMultipleObjects](/docs/api-reference/core/deck.md#pickmultipleobjects).

##### finalize

Removes the control and deletes all resources.

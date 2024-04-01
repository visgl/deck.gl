# MapboxLayer

`MapboxLayer` is an implementation of [Mapbox GL JS](https://www.npmjs.com/package/mapbox-gl)'s [CustomLayerInterface](https://docs.mapbox.com/mapbox-gl-js/api/properties/#customlayerinterface) API. By adding a `MapboxLayer` instance to an mapbox map, one can render any deck.gl layer inside the mapbox canvas / WebGL2 context. This is in contrast to the traditional deck.gl/mapbox integration where the deck.gl layers are rendered into a separate canvas over the base map.

See the Mapbox [`map.addLayer(layer, before?)`](https://www.mapbox.com/mapbox-gl-js/api/#map#addlayer) API for how to add a layer to an existing layer stack.

## Example

```js
import {MapboxLayer} from '@deck.gl/mapbox';
import {ScatterplotLayer} from '@deck.gl/layers';

const map = new mapboxgl.Map({...});

const myScatterplotLayer = new MapboxLayer({
  id: 'my-scatterplot',
  type: ScatterplotLayer,
  data: [
      {position: [-74.5, 40], size: 100}
  ],
  getPosition: d => d.position,
  getRadius: d => d.size,
  getColor: [255, 0, 0]
});

// wait for map to be ready
map.on('load', () => {
  // insert before the mapbox layer "waterway_label"
  map.addLayer(myScatterplotLayer, 'waterway_label');

  // update the layer
  myScatterplotLayer.setProps({
    getColor: [0, 0, 255]
  });
});
```


## Constructor

```js
import {MapboxLayer} from '@deck.gl/mapbox';
new MapboxLayer(props);
```

Parameters:

- `props` (object)
  + `props.id` (string) - an unique id is required for each layer.
  + `props.type` (`Layer`, optional) - a class that extends deck.gl's base `Layer` class. Required if `deck` is not provided.
  + `props.deck` (`Deck`, optional) - a `Deck` instance that controls the rendering of this layer. If provided, the layer will be looked up from its layer stack by `id` at render time, and all other props are ignored. It's recommended that you use the [MapboxOverlay](./mapbox-overlay.md) class where a `Deck` instance is automatically managed.
  + Optional: any other prop needed by this type of layer. See deck.gl's [layer catalog](../layers/README.md) for documentation and examples on how to create layers.


## Methods

##### setProps(props)

```js
const layer = new MapboxLayer({
    id: 'my-scatterplot',
    type: ScatterplotLayer,
    ...
});

map.addLayer(layer);

layer.setProps({
    radiusScale: 2
});
```

Update a layer after it's added. Has no effect if `props.deck` is provided.

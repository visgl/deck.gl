# MapboxLayer

`MapboxLayer` is an implementation of [mapbox](https://www.npmjs.com/package/mapbox-gl)'s custom layer API. By adding a `MapboxLayer` instance to an mapbox map, one can render any deck.gl layer inside the mapbox canvas / WebGL context. This is in contrast to the traditional deck.gl/mapbox integration where the deck.gl layers are rendered into a separate canvas over the base map.

See [mapbox documentation](https://www.mapbox.com/mapbox-gl-js/api/#map#addlayer) for how to add a layer to an existing layer stack.

## Example

There are two options to construct a `MapboxLayer`.

### Make a Layer from Scratch

This option works best for static layers that do not require advanced interaction controls, or frequent adding/removing/updating.

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
    // add to mapbox
    map.addLayer(myScatterplotLayer);

    // update the layer
    myScatterplotLayer.setProps({
      getColor: [0, 0, 255]
    });
}
```

### Use a Layer from an Existing Deck's Layer Stack

This option allows one to take full advantage of the `Deck` API, e.g. top-level props such as `pickingRadius`, `onHover`, and adding/removing/updating layers in a reactive fashion by setting the `layers` array.

```js
import {MapboxLayer} from '@deck.gl/mapbox';
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

const map = new mapboxgl.Map({...});

const deck = new Deck({
    gl: map.painter.context.gl,
    layers: [
        new ScatterplotLayer({
            id: 'my-scatterplot',
            data: [
                {position: [-74.5, 40], size: 100}
            ],
            getPosition: d => d.position,
            getRadius: d => d.size,
            getFillColor: [255, 0, 0]
        })
    ]
});

// wait for map to be ready
map.on('load', () => {
    // add to mapbox
    map.addLayer(new MapboxLayer({id: 'my-scatterplot', deck}));

    // update the layer
    deck.setProps({
        layers: [
            new ScatterplotLayer({
                id: 'my-scatterplot',
                data: [
                    {position: [-74.5, 40], size: 100}
                ],
                getPosition: d => d.position,
                getRadius: d => d.size,
                getFillColor: [0, 0, 255]
            })
        ]
    });
}
```


## Constructor

```js
import {MapboxLayer} from '@deck.gl/mapbox';
new MapboxLayer(props);
```

Parameters:

- `props` (Object)
  + `props.id` (String) - an unique id is required for each layer.
  + `props.deck` (`Deck`, optional) - a `Deck` instance that controls the rendering of this layer. If provided, the layer will be looked up from its layer stack by `id` at render time, and all other props are ignored.
  + `props.type` (`Layer`, optional) - a class that extends deck.gl's base `Layer` class. Required if `deck` is not provided.
  + Optional: any other prop needed by this type of layer. See deck.gl's [layer catalog](http://deck.gl/#/documentation/deckgl-api-reference/layers/layer) for documentations and examples on how to create layers.


## Methods

##### setProps(props)

```js
const layer = new MapboxLayer({
    id: 'my-scatterplot',
    type: ScatterplotLayer,
    ...
});

layer.setProps({
    radiusScale: 2
});
```

Update a layer after it's added. Has no effect if `props.deck` is provided.

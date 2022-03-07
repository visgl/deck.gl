# MapboxLayer

`MapboxLayer` is an implementation of [Mapbox GL JS](https://www.npmjs.com/package/mapbox-gl)'s [CustomLayerInterface](https://docs.mapbox.com/mapbox-gl-js/api/properties/#customlayerinterface) API. By adding a `MapboxLayer` instance to an mapbox map, one can render any deck.gl layer inside the mapbox canvas / WebGL context. This is in contrast to the traditional deck.gl/mapbox integration where the deck.gl layers are rendered into a separate canvas over the base map.

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

### Using Multiple Views from an Existing Deck Instance

This option allows one to take advantage of deck's multi-view system and render a mapbox base map onto any one MapView of your choice by setting the `views` array and a `layerFilter` callback.

- To use multiple views, define a `MapView` with the id `“mapbox”`. This view will receive the state that matches the base map at each render.
- If views are provided but the array does not contain this id, then a `MapView({id: 'mapbox'})` will be inserted at the bottom of the stack.
- If the views prop is not provided, then the default is a single `MapView({id: 'mapbox'})`.

```js
import {MapboxLayer} from '@deck.gl/mapbox';
import {Deck, MapView, OrthographicView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

const map = new mapboxgl.Map({...});

const deck = new Deck({
    gl: map.painter.context.gl,
    views: [new MapView({id: 'mapbox'}), new OrthographicView({id: 'widget'})],
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

// wait for map to be ready
map.on('load', () => {
    // add to mapbox
    map.addLayer(new MapboxLayer({id: 'my-scatterplot', deck}));
});
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
  + Optional: any other prop needed by this type of layer. See deck.gl's [layer catalog](/docs/api-reference/layers/README.md) for documentation and examples on how to create layers.


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

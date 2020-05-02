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

#### Pure JS

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

#### React

```js
import React from "react";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { MapboxLayer } from "@deck.gl/mapbox";
import { StaticMap } from "react-map-gl";

const initialViewState = {
  longitude: -112.1861,
  latitude: 36.1284,
  zoom: 12.1,
  pitch: 0,
  bearing: 0,
};

export default class Map extends React.Component {
  state = {};

  // DeckGL and mapbox will both draw into this WebGL context
  _onWebGLInitialized = (gl) => {
    this.setState({ gl });
  };

  _onMapLoad = () => {
    const map = this._map;
    const deck = this._deck;

    // You must initialize an empty deck.gl layer to prevent flashing
    map.addLayer(
      // This id has to match the id of the deck.gl layer
      new MapboxLayer({ id: "my-scatterplot", deck }),
      // Optionally define id from Mapbox layer stack under which to add deck layer
      'beforeId'
    );
  };

  render() {
    const { gl } = this.state;
    const layers = [
      new ScatterplotLayer({
        id: "my-scatterplot",
        data: [{ position: [-112.152317, 36.0723292], size: 100 }],
        getPosition: (d) => d.position,
        getRadius: (d) => d.size,
        getFillColor: [0, 0, 255],
      }),
    ];

    return (
      <DeckGL
        ref={(ref) => {
          // save a reference to the Deck instance
          this._deck = ref && ref.deck;
        }}
        layers={layers}
        initialViewState={initialViewState}
        controller
        // To render vector tile polygons correctly
        glOptions={{stencil: true}}
        onWebGLInitialized={this._onWebGLInitialized}
      >
        {gl && (
          <StaticMap
            ref={(ref) => {
              // save a reference to the mapboxgl.Map instance
              this._map = ref && ref.getMap();
            }}
            gl={gl}
            onLoad={this._onMapLoad}
            mapOptions={{ hash: true }}
          />
        )}
      </DeckGL>
    );
  }
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

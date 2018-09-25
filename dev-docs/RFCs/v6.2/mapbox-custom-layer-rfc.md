# RFC: Mapbox Custom Layer Integration

* Authors: Xiaoji Chen, Ib Green
* Date: Sep 25, 2018
* Status: **Draft**

References:

* [Layer Group Operations RFC](v6.x/layer-and-group-operation-rfc.md)


## Abstract

This RFC proposes changes to the deck.gl API to allow deck.gl to use mapbox context and to trigger rendering of certain deck.gl layer renders in between mapbox style layers.


## Problems

* Initializing the DeckGL instance with an external gl context. (Work towards making this as declarative as possible).
* Render deck.gl "layer-by-layer" - Work towards an official "static" rendering API for deck.gl


## Proposed MapboxGL API Integration

This case is fairly simple: a `MapboxLayer` class that can be used as a custom mapbox layer provides the plumbing and enables mapbox users to use deck.gl "layer packs".

The adapter class transparently creates and manages as `Deck` instance under the hood.

```js
import Deck, {ScatterplotLayer} from '@deck.gl/core';
import {MapboxLayer} from '@deck.gl/mapbox';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v9',
  center: [-74.012, 40.705],
  zoom: 15.5,
  bearing: -20,
  pitch: 45
});

map.on('load', () => {
  map.addLayer(mapboxBuildingLayer);
  map.addLayer(deckPoiLayer, getFirstTextLayerId(map.getStyle()));
  map.addLayer(deckRouteLayer);
});
```


## Proposed DeckGL API Integration

This case is a bit harder since it both requires postponing deck.gl initialization.

### Proposal 1: Callbacks

```js
import Deck, {ScatterplotLayer} from '@deck.gl/core';
import {MapboxLayer} from '@deck.gl/mapbox';

const map = new mapboxgl.Map({...});

const deck = new Deck({
  width: '100%',
  height: '100%',
  longitude: -122.4,
  latitude: 37.8,
  layers: [
    new MapboxLayer({
      id: 'my-scatterplot',
      insertBefore: 'admin-1-labels',
      type: ScatterplotLayer,
      ...
    })
  ],
  onAddLayer: (layer) => {
    if (layer instanceof MapboxLayer) {
      map.addLayer(layer, layer.props.insertBefore)
    }
  },
  onRemoveLayer: (layer) => {
    if (layer instanceof MapboxLayer) {
      map.removeLayer(layer.id);
    }
  }
});
```

Advantages:

* Allows deck.gl and mapbox layers to be ordered (to some degree) within the deck.gl layer list
* Callbacks are generic and could possibly be useful in other contexts

Downsides:

* Uses `MapboxLayer` inside deck.gl API, ideally that module should be reserved for mapbox API.
* Relies on callbacks which is not "declarative"
* Makes it harder to change/control mapbox layer structure, as injection of custom layers is based on deck.gl lifecycle and not directly under application control.



### Proposal 2: LayerGroups

Ideas:

* "Reuse" the `LayerGroup` concept from the "Layer Group and Operations RFC" to enable the specification of groups of layers that can be rendered "separately".
* Move towards an official static deck.gl rendering API where the app can add a list of groups and then control how they are rendered.


```js
import Deck, {LayerGroup, ScatterplotLayer} from '@deck.gl/core';
import {MapboxLayer} from '@deck.gl/mapbox';

class App extends React.Component {
  render() {
    return (
      <Deck
        width='100%'
        height='100%'
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
        }}

        // A simple, callbackless way to make deck initialize with the gl context from a sub-component is envisioned...
        gl='map'

        layers={[
          // Layer groups create named groups of layers that don't render automatically
          // In this case we rely on MapboxLayers to render them.
          new LayerGroup({
            id: 'below-labels',
            layers: [
              new ScatterplotLayer({
                id: 'my-scatterplot',
                insertBefore: 'admin-1-labels',
                type: ScatterplotLayer,
                ...
              })
            ]
          }),

          // Any layers not in group render automatically as before.
          new ArcLayer({...});
        ]}
        >

        <StaticMap
          id='map'
          style="mapbox://styles/mapbox/light-v9"
          onLoad={this._onLoad.bind(this)/>

      </DeckGL>
    );
  }

  _onLoad(map) {
    const insertBefore = getFirstTextLayerId(map.getStyle());
    map.addLayer(new MapboxLayer({groupId: })', insertBefore);
    map.addLayer({id: '3d-buildings', source: 'composite', ...});
  }
}
```

Advantages:

* Leverages `LayerGroups` which if introduced as part of layer operations reuses and builds on a "declarative" concept.
* Keeps `MapboxLayer` as part of a Mapbox Style focused API.

Disadvantages

* The `LayerGroup` concept is not yet developed. How should these be implemented, short and long term?
* More work to create apps that provide a UI for mixing of deck and mapbox layers (e.g. kepler.gl)?


## Official Static Rendering API

The various internal methods that are being exposed to support the mapbox integration might as well be cleaned up and formalized into a proper supported "static" rendering API.

```js
const deck = new Deck(gl: null);
deck.setWebGLContext(map.gl);
deck.setProps(layers: [new LayerGroup({id: 'group1'}), new LayerGroup({id: 'group2'})])
deck.clear();
deck.renderLayerGroup('group1');
deck.renderLayerGroup('group2');
```


## WebGL Context Initialization Mechanisms

TBA

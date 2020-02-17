# RFC: Mapbox Custom Layer Integration

* Authors: Xiaoji Chen, Ib Green
* Date: Sep 25, 2018
* Status: **Draft**

References:

* [Layer Group Operations RFC](/dev-docs/RFCs/proposals/layer-and-group-operation-rfc.md)


## Abstract

This RFC proposes changes to the deck.gl API to allow deck.gl to use mapbox context and to trigger rendering of certain deck.gl layer renders in between mapbox style layers.


## Proposals


### Official Static Rendering API

Currently deck.gl rendering happens automatically, in bulk, in the deck.gl animation loop. But to be able to interleave with an external rendering system (in this case mapbox), we need to have to be able to render layer by layer.

The methods that are being exposed to support the mapbox integration might as well be cleaned up and formalized into a proper supported "static" rendering API.

```js
const deck = new Deck(gl: null);
deck.setWebGLContext(map.getContext());
deck.setProps(layers: [new ScatterplotLayer({id: 'layer1'}), new ArcLayer({id: 'layer2'})])
deck.clear();
deck.renderLayer('layer1');
deck.renderLayer('layer2');
```

Note: We are still assuming that layers need to be "added" to deck.gl (and thus go through "layer matching"), i.e. we will NOT support direct rendering of layers:

```js
deck.clear();
deck.renderLayer(new ScatterplotLayer({id: 'layer1'}));
```

To be able to render all layers it might be helpful to get an array of layer ids:

```js
const layerIds = deck.getLayerIds();
```


## Proposed: WebGL Context Initialization Mechanisms

deck.gl can already accept an external context, and will postpone necessary activities until needed.

```
deck.setWebGLContext(gl : WebGLRenderingContext);
```

This can also be done with a prop, but maybe an explicit method is clearer in this case.

```
deck.setProps({gl});
```

Initializing a react component with the context in a child map is more tricky.

react-map-gl can provide a callback (maybe faster than `onLoad`) and the context can be updated at this time. This will however involve the application.

Maybe setting the `<DeckGL>` context to a string or function could allow this to be done more declaratively.

The `<DeckGL>` render loop can look for a function or `gl` attribute on its children.



* Initializing the DeckGL instance with an external gl context. (Work towards making this as declarative as possible).


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


### Proposal 1: Manage mapbox layer order with deck.gl API props and callbacks

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
* Reuses Mapbox API layers (good for testing/maintenance)

Downsides:

* Uses `MapboxLayer` inside deck.gl API, fairly intrusive change to how deck.gl layers are specified.
* Relies on callbacks which is not "declarative"
* Makes it harder to change/control mapbox layer structure, as injection of custom layers is based on deck.gl lifecycle and not directly under application control. E.g. if application loads new mapbox style, this doesn't retrigger `onAddLayer` callbacks.



### Proposal 2: mapbox layer order is specified separately using mapbox API.

Ideas:

* Enable app to use mapbox context for deck.gl. Render everything in that single WebGL context.
* Keep all layers in deck layers props
* By default render all layers after mapbox layers (common z buffer etc advantages).
* Allow some layers to be taken out of normal render list and provide a Mapbox Custom Layer to allow deck layers to be rendered by id.
* Leverage an official static deck.gl rendering API where the app can control how and when each layer is rendered




```js
import Deck, {ScatterplotLayer} from '@deck.gl/core';
import {MapboxLayer} from '@deck.gl/mapbox';

class App extends React.Component {
  render() {
    return (
      <Deck
        // A simple, callbackless way to init with the gl context from a sub-component is envisioned...
        // May require some private "protocol" between `<StaticMap>` and `<DeckGL>`.
        // May also stash away a _deck reference on the mapbox component.

        gl='base-map'

        width='100%'
        height='100%'

        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
        }}

        layers={[

          // Layer groups create named groups of layers that don't render automatically
          // In this case we rely on MapboxLayers to render them.

          new ScatterplotLayer({
            id: 'below-labels',
            autoRender: false // Don't render automatically with the rest of layers
            // only when explictly called out - in this case when a mapbox layer calls it out
            // An alternative to this prop is deck tracks which layers have been rendered each cycle.
            ...
          }),

          // Any layers not in group render automatically (after all mapbox layers) as before.
          new ArcLayer({...});

        ]}
        >

        <StaticMap
          id='base-map'
          style="mapbox://styles/mapbox/light-v9"
          onLoad={this._onLoad.bind(this)/>

      </DeckGL>
    );
  }

  _onLoad(map) {
    const insertBefore = getFirstTextLayerId(map.getStyle());
    map.addLayer(new RenderDeckLayerById({id: 'below-labels'}), insertBefore);

    map.addLayer({id: '3d-buildings', source: 'composite', ...});

    // Ideally this would be auto injected, but OK to have to add it.
    // Main motivation is that app should not need to start creating styles for every single layer
    // just because it is sharing a gl context with mapbox

    // Typically goes last
    map.addLayer(new RenderRemainingDeckLayers());
  }
}
```

Advantages:

* Keeps `MapboxLayer` as part of a Mapbox Style focused API.

Disadvantages

* More work to create apps that provide a UI for mixing of deck and mapbox layers (e.g. kepler.gl)?



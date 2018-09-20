# @deck.gl/mapbox-layers

Enables the use deck.gl layers as custom mapbox layers, enabling seamless interleaving of mapbox and deck.gl layers.

To create a mapbox-compatible deck.gl layer:

```js
import DeckLayer from '@deck.gl/mapbox-layers';
import {ScatterplotLayer} from '@deck.gl/core-layers';

const myDeckLayer = new DeckLayer({
    id: 'my-scatterplot',
    type: ScatterplotLayer,
    data: [
        {position: [-74.5, 40], size: 100}
    ],
    getPosition: d => d.position,
    getRadius: d => d.size,
    getColor: [255, 0, 0]
});
```

To add the layer to mapbox:

```js
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = '<your access token here>';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [-74.50, 40],
    zoom: 9
});

map.addLayer(myDeckLayer);
```

See [deck.gl](http://deck.gl) for documentations and examples on how to create layers.


## DeckLayer

The `DeckLayer` is a custom mapbox layer class that renders a deck.gl layer inside the mapbox canvas / WebGL context. This is in contrast to the typical deck.gl/mapbox integration where the deck.gl layers are rendered into a separate canvas.

##### constructor

```
import DeckLayer from '@deck.gl/mapbox-layers';

new DeckLayer(props);
```

Parameters:

- `props` (Object)
    + `props.id` (String) - an unique id is required for each layer.
    + `props.type` (`Layer`) - a class that extends deck.gl's base `Layer` class.
    + Any other prop needed by this layer, specified by `type`. See deck.gl's [layer catalog](http://deck.gl/#/documentation/deckgl-api-reference/layers/layer) for each layer's props.

##### setProps(props)

```js
const layer = new DeckLayer({
    id: 'my-scatterplot',
    type: ScatterplotLayer,
    ...
});

layer.setProps({
    radiusScale: 2
});
```

Update a layer after it's added.


## Advantages and Limitations

### Advantages

* mapbox and deck.gl layers can be freely "interleaved", enabling a number of layer mixing effects, such as drawing behind map labels; z-occlusion between deck.gl 3D objects and Mapbox buildings; etc.
* mapbox and deck.gl will share a single canvas and WebGL context, saving system resources.

### Limitations

* deck.gl's multi-view system, including controllers and viewport transitions cannot be used.
* WebGL2 based deck.gl features, such as attribute transitions and GPU accelerated aggregation layers cannot be used.



## Mixing deck and mapbox layers

There is a range of use cases for mixing layers, with increasing complexity.


### Injecting a 3D layer into an existing mapbox layer stack

In this cases, the application wants to add a deck.gl 3D layer (e.g. ArcLayer, HexagonLayer, GeoJsonLayer) on top of a mapbox basemap, while seemlessly blend into the z-buffer. This will interleave the useful visualization layers from both the deck.gl and mapbox layer catalogs. In this case, the mapbox [`map.addLayer(layer)`](https://www.mapbox.com/mapbox-gl-js/api/#map#addlayer) API method can be used to add a mix of deck.gl and mapbox layers to the top of the layer stack from the currently loaded mapbox style.


### Injecting deck layers into an existing mapbox layer stack

A bit more control is provided by the optional `before` parameter of the mapbox [`map.addLayer(layer, before?)`](https://www.mapbox.com/mapbox-gl-js/api/#map#addlayer) API. Using this parameter, it is possible to inject a `DeckLayer` instance just before any existing mapbox layer in the layer stack of the currently loaded style.

That sounds good, but which mapbox layer should the application pick as its "injection point", and how does the application get a reference to it?

One major use case for mixing deck.gl and mapbox layers is that some important information in the mapbox map is hidden by a deck.gl visualization layer, and controlling opacity is not enough. A typical example of this is labels and roads, where it is desirable to have a deck.gl visualization layer render on top of the mapbox geography, but where one might still want to see e.g. labels and/or roads. Alternatively, the deck.gl visualization should cover the ground, but not the roads and labels.

Mapbox provides an example of [finding the first label layer](https://www.mapbox.com/mapbox-gl-js/example/geojson-layer-in-stack/). For more sophisticated injection point lookups, refer to Mapbox' documentation on the format of mapbox style layers, see [Mapbox Style Spec](https://www.mapbox.com/mapbox-gl-js/style-spec/#layers).


### Building a mixed mapbox and deck layer stack from scratch

mapbox allows for complete control of the stack of layers, see e.g. [Mapbox GL JS labels on top of radar raster](https://bl.ocks.org/danswick/c19fec2e92e00967458d). In such scenario it is of course easy to control where any `DeckLayer` instances should be added. However, "hand coding" a complete layer stack can require a lot of work and can result in reduced flexibility as it doesn't let the application take advantage of predefined styles.

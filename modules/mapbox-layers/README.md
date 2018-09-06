# @deck.gl/mapbox-layers

Enables the use deck.gl layers as custom mapbox layers, enabling seamless interleaving of mapbox and deck.gl layers.

See [deck.gl](http://deck.gl) for documentation.


## DeckLayer

The `DeckLayer` is a custom mapbox layer class that renders a list of deck.gl layers inside the mapbox canvas / WebGL context. This is in contrast to the typical deck.gl/mapbox integration where the deck.gl layers are rendered separately


## Advantages and Limitations

Advantages:

* mapbox and deck.gl layers can be freely "interleaved", enabling a number of important uses cases as described below.
* mapbox and deck.gl will share a single canvas and WebGL context, saving system resources.

Disadvantages:

* deck.gl's multi view system, including controllers and viewport transitions cannot be used
* WebGL2 based deck.gl features, such as attribute transitions and GPU accelerated aggregation layers cannot be used.
* At the moment, 3D layer integration is not yet complete, meaning that using 3D layers from both mapbox and deck.gl typically will not work.



## Mixing deck and mapbox layers

There is a range of use cases for mixing layers, with increasing complexity.


### Adding deck layers to the top of the mapbox layer stack

In simple cases, the application just wants a mapbox basemap, combined with the ability to interleave useful visualization layers from both the deck.gl and mapbox layer catalogs. In this case, the mapbox [`map.addLayer(layer)`](https://www.mapbox.com/mapbox-gl-js/api/#map#addlayer) API method can be used to add a mix of deck.gl and mapbox layers to the top of the layer stack from the currently loaded mapbox style.


### Injecting deck layers into an existing mapbox layer stack

A bit more control is provided by the optional `before` parameter of the mapbox [`map.addLayer(layer, before?)`](https://www.mapbox.com/mapbox-gl-js/api/#map#addlayer) API. Using this parameter, it is possible to inject a `DeckLayers` instance just before any existing mapbox layer in the layer stack of the currently loaded style.

That sounds good, but which mapbox layer should the application pick as its "injection point", and how does the application get a reference to it?

One major use case for mixing deck.gl and mapbox layers is that some important information in the mapbox map is hidden by a deck.gl visualization layer, and controlling opacity is not enough. A typical example of this is labels and roads, where it is desirable to have a deck.gl visualization layer render on top of the mapbox geography, but where one might still want to see e.g. labels and/or roads. Alternatively, the deck.gl visualization should cover the ground, but not the roads and labels.

Mapbox provides an example of [finding the first label layer](https://www.mapbox.com/mapbox-gl-js/example/geojson-layer-in-stack/). For more sophisticated injection point lookups, refer to Mapbox' documentation on the format of mapbox style layers, see [Mapbox Style Spec](https://www.mapbox.com/mapbox-gl-js/style-spec/#layers).


### Building a mixed mapbox and deck layer stack from scratch

mapbox allows for complete control of the stack of layers, see e.g. [Mapbox GL JS labels on top of radar raster](https://bl.ocks.org/danswick/c19fec2e92e00967458d). In such scenario it is of course easy to control where any `DeckLayer` instances should be added. However, "hand coding" a complete layer stack can require a lot of work and can result in reduced flexibility as it doesn't let the application take advantage of predefined styles.


### 3D Layer / Depth Buffer Integration

> 3D (i.e. depth buffer) synchronization between Mapbox and deck.gl is still under development. The current "deep" layer integration between deck.gl and mapbox-gl is focused on 2D layers, as described above.


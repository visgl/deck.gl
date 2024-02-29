# Base Maps

While deck.gl works independently without any map component, when visualizing geospatial datasets, a base map can offer invaluable context for understanding the overlay layers.

## Base Maps Renderers

deck.gl has been designed to work in tandem with popular JavaScript base map providers. Depending on your tech stack, deck.gl's support for a particular base map solution may come with different level of compatibility and limitations.

There are two types of integration between deck.gl and a base map renderer:

- **Overlaid**: the Deck canvas is rendered over the base map as a separate DOM element. Deck's camera and the camera of the base map are synchronized so they pan/zoom together. This is the more robust option since the two libraries manage their renderings independently from each other. It is usually sufficient if the base map is 2D.

![Deck as overlay on top of the base map](https://miro.medium.com/max/1600/0*K3DVssEhnv5VaDCp)

- **Interleaved**: Deck renders into the WebGL2 context of the base map. This allows for occlusion between deck.gl layers and the base map's labels and/or 3D features. The availability of this option depends on whether the base map solution exposes certain developer APIs, and may subject the user to bugs/limitations associated with such APIs.

![Deck interleaved with base map layers](https://miro.medium.com/max/1600/0*faYL1UbVD4af5qzy)


| Library | Pure JS | React | Overlaid | Interleaved | Docs |
| ----- | ----- | ----- | ----- | ----- | ----- |
| [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/latest/) | ✓ | ✓ | | [example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/arcgis) | [link](../developer-guide/base-maps/using-with-arcgis.md) |
| [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/deckgl-overlay-view) | ✓ | ✓ | [example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/google-maps) | [example](https://developers.google.com/maps/documentation/javascript/examples/deckgl-tripslayer) | [link](../developer-guide/base-maps/using-with-google-maps.md) |
| [harp.gl](https://www.harp.gl/) | ✓ | | [example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/harp.gl) |  | |
| [Leaflet](https://leafletjs.com/) | ✓ | | [example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/leaflet) |  | |
| [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/) | ✓ | ✓ | [example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/maplibre) | [example](https://deck.gl/gallery/mapbox-layer) | [link](../developer-guide/base-maps/using-with-mapbox.md) |
| [MapLibre GL JS](https://maplibre.org/maplibre-gl-js-docs/api/) | ✓ | ✓ | [example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/maplibre) | [example](https://deck.gl/gallery/mapbox-layer) | [link](../developer-guide/base-maps/using-with-mapbox.md#compatibility-with-mapbox-gl-js-forks) |
| [OpenLayers](https://openlayers.org/) | ✓ | | [example](https://github.com/visgl/deck.gl/tree/master/examples/get-started/pure-js/openlayers) |  | |

It is also important to understand the difference between the JS library that renders the map and the map data provider. For example, you can use Mapbox GL JS with the Mapbox service, but also with any other service that hosts Mapbox Vector Tiles. When using a base map, be sure to follow the terms and conditions, as well as the attribution requirements of both the JS library and the data provider.

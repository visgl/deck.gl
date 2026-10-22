# Layer Catalog Overview

For first-time deck.gl developers, it is helpful to read the following pages before jumping into the layer catalog:

* [Guide to using deck.gl layers](https://deck.gl/docs/developer-guide/using-layers.md): general concepts and frequently asked questions
* All deck.gl layers inherit from either the [`Layer`](https://deck.gl/docs/api-reference/core/layer.md) or the [`CompositeLayer`](https://deck.gl/docs/api-reference/core/composite-layer.md) base classes, and the props of those layers are available to all layers unless otherwise documented. The base class props are not repeated in individual layer documentation.

## Core Layers[​](#core-layers "Direct link to Core Layers")

The [Core Layers](https://www.npmjs.com/package/@deck.gl/layers) are a group of generic-purpose layers, intended to represent the building blocks for all data visualizations.

The core layers are the most stable and supported deck.gl layers.

* [ArcLayer](https://deck.gl/docs/api-reference/layers/arc-layer.md)
* [BitmapLayer](https://deck.gl/docs/api-reference/layers/bitmap-layer.md)
* [ColumnLayer](https://deck.gl/docs/api-reference/layers/column-layer.md)
* [GeoJsonLayer](https://deck.gl/docs/api-reference/layers/geojson-layer.md)
* [GridCellLayer](https://deck.gl/docs/api-reference/layers/grid-cell-layer.md)
* [IconLayer](https://deck.gl/docs/api-reference/layers/icon-layer.md)
* [LineLayer](https://deck.gl/docs/api-reference/layers/line-layer.md)
* [PathLayer](https://deck.gl/docs/api-reference/layers/path-layer.md)
* [PointCloudLayer](https://deck.gl/docs/api-reference/layers/point-cloud-layer.md)
* [PolygonLayer](https://deck.gl/docs/api-reference/layers/polygon-layer.md)
* [ScatterplotLayer](https://deck.gl/docs/api-reference/layers/scatterplot-layer.md)
* [SolidPolygonLayer](https://deck.gl/docs/api-reference/layers/solid-polygon-layer.md)
* [TextLayer](https://deck.gl/docs/api-reference/layers/text-layer.md)

## Aggregation Layers[​](#aggregation-layers "Direct link to Aggregation Layers")

The [Aggregation Layers](https://www.npmjs.com/package/@deck.gl/aggregation-layers) are layers that aggregate the input data and visualize them in alternative representations, such as grid and hexagon binning, contour, and heatmap.

* [ContourLayer](https://deck.gl/docs/api-reference/aggregation-layers/contour-layer.md)
* [GridLayer](https://deck.gl/docs/api-reference/aggregation-layers/grid-layer.md)
* [HeatmapLayer](https://deck.gl/docs/api-reference/aggregation-layers/heatmap-layer.md)
* [HexagonLayer](https://deck.gl/docs/api-reference/aggregation-layers/hexagon-layer.md)
* [ScreenGridLayer](https://deck.gl/docs/api-reference/aggregation-layers/screen-grid-layer.md)

## Geo Layers[​](#geo-layers "Direct link to Geo Layers")

The [Geo Layers](https://www.npmjs.com/package/@deck.gl/geo-layers) collects layers that specifically target geospatial visualization use cases, including support for map tiles, popular geospatial indexing systems, GIS formats, etc.

* [A5Layer](https://deck.gl/docs/api-reference/geo-layers/a5-layer.md)
* [GeohashLayer](https://deck.gl/docs/api-reference/geo-layers/geohash-layer.md)
* [GreatCircleLayer](https://deck.gl/docs/api-reference/geo-layers/great-circle-layer.md)
* [H3ClusterLayer](https://deck.gl/docs/api-reference/geo-layers/h3-cluster-layer.md)
* [H3HexagonLayer](https://deck.gl/docs/api-reference/geo-layers/h3-hexagon-layer.md)
* [MVTLayer](https://deck.gl/docs/api-reference/geo-layers/mvt-layer.md)
* [QuadkeyLayer](https://deck.gl/docs/api-reference/geo-layers/quadkey-layer.md)
* [S2Layer](https://deck.gl/docs/api-reference/geo-layers/s2-layer.md)
* [TerrainLayer](https://deck.gl/docs/api-reference/geo-layers/terrain-layer.md)
* [TileLayer](https://deck.gl/docs/api-reference/geo-layers/tile-layer.md)
* [Tile3DLayer](https://deck.gl/docs/api-reference/geo-layers/tile-3d-layer.md)
* [TripsLayer](https://deck.gl/docs/api-reference/geo-layers/trips-layer.md)
* [WMSLayer](https://deck.gl/docs/api-reference/geo-layers/wms-layer.md)

## Mesh Layers[​](#mesh-layers "Direct link to Mesh Layers")

The [Mesh Layers](https://www.npmjs.com/package/@deck.gl/mesh-layers) visualize 3D models, with experimental support for scenegraph in the glTF format.

* [SimpleMeshLayer](https://deck.gl/docs/api-reference/mesh-layers/simple-mesh-layer.md)
* [ScenegraphLayer](https://deck.gl/docs/api-reference/mesh-layers/scenegraph-layer.md)

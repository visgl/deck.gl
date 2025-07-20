# Layer Catalog Overview

For first-time deck.gl developers, it is helpful to read the following pages before jumping into the layer catalog:

* [Guide to using deck.gl layers](../../developer-guide/using-layers.md): general concepts and frequently asked questions
* All deck.gl layers inherit from either the [`Layer`](../core/layer.md) or the [`CompositeLayer`](../core/composite-layer.md) base classes, and the props of those layers are available to all layers unless otherwise documented. The base class props are not repeated in individual layer documentation.


## Core Layers

The [Core Layers](https://www.npmjs.com/package/@deck.gl/layers) are a group of generic-purpose layers, intended to represent the building blocks for all data visualizations.

The core layers are the most stable and supported deck.gl layers.

  - [ArcLayer](./arc-layer.md)
  - [BitmapLayer](./bitmap-layer.md)
  - [ColumnLayer](./column-layer.md)
  - [GeoJsonLayer](./geojson-layer.md)
  - [GridCellLayer](./grid-cell-layer.md)
  - [IconLayer](./icon-layer.md)
  - [LineLayer](./line-layer.md)
  - [PathLayer](./path-layer.md)
  - [PointCloudLayer](./point-cloud-layer.md)
  - [PolygonLayer](./polygon-layer.md)
  - [ScatterplotLayer](./scatterplot-layer.md)
  - [SolidPolygonLayer](./solid-polygon-layer.md)
  - [TextLayer](./text-layer.md)

## Aggregation Layers

The [Aggregation Layers](https://www.npmjs.com/package/@deck.gl/aggregation-layers) are layers that aggregate the input data and visualize them in alternative representations, such as grid and hexagon binning, contour, and heatmap.

  - [ContourLayer](../aggregation-layers/contour-layer.md)
  - [GridLayer](../aggregation-layers/grid-layer.md)
  - [HeatmapLayer](../aggregation-layers/heatmap-layer.md)
  - [HexagonLayer](../aggregation-layers/hexagon-layer.md)
  - [ScreenGridLayer](../aggregation-layers/screen-grid-layer.md)

## Geo Layers

The [Geo Layers](https://www.npmjs.com/package/@deck.gl/geo-layers) collects layers that specifically target geospatial visualization use cases, including support for map tiles, popular geospatial indexing systems, GIS formats, etc.

  - [A5Layer](../geo-layers/a5-layer.md)
  - [GeohashLayer](../geo-layers/geohash-layer.md)
  - [GreatCircleLayer](../geo-layers/great-circle-layer.md)
  - [H3ClusterLayer](../geo-layers/h3-cluster-layer.md)
  - [H3HexagonLayer](../geo-layers/h3-hexagon-layer.md)
  - [MVTLayer](../geo-layers/mvt-layer.md)
  - [QuadkeyLayer](../geo-layers/quadkey-layer.md)
  - [S2Layer](../geo-layers/s2-layer.md)
  - [TerrainLayer](../geo-layers/terrain-layer.md)
  - [TileLayer](../geo-layers/tile-layer.md)
  - [Tile3DLayer](../geo-layers/tile-3d-layer.md)
  - [TripsLayer](../geo-layers/trips-layer.md)
  - [WMSLayer](../geo-layers/wms-layer.md)

## Mesh Layers

The [Mesh Layers](https://www.npmjs.com/package/@deck.gl/mesh-layers) visualize 3D models, with experimental support for scenegraph in the glTF format.

  - [SimpleMeshLayer](../mesh-layers/simple-mesh-layer.md)
  - [ScenegraphLayer](../mesh-layers/scenegraph-layer.md)

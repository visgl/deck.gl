# Layer Catalog Overview

For first-time deck.gl developers, it is helpful to read the following pages before jumping into the layer catalog:

* [Guide to using deck.gl layers](/docs/developer-guide/using-layers.md): general concepts and frequently asked questions
* All deck.gl layers inherit from either the [`Layer`](/docs/api-reference/core/layer.md) or the [`CompositeLayer`](/docs/api-reference/core/composite-layer.md) base classes, and the props of those layers are available to all layers unless otherwise documented. The base class props are not repeated in individual layer documentation.


## Core Layers

The [Core Layers](https://www.npmjs.com/package/@deck.gl/layers) are a group of generic-purpose layers, intended to represent the building blocks for all data visualizations.

The core layers are the most stable and supported deck.gl layers.

  - [ArcLayer](/docs/api-reference/layers/arc-layer.md)
  - [BitmapLayer](/docs/api-reference/layers/bitmap-layer.md)
  - [ColumnLayer](/docs/api-reference/layers/column-layer.md)
  - [GeoJsonLayer](/docs/api-reference/layers/geojson-layer.md)
  - [GridCellLayer](/docs/api-reference/layers/grid-cell-layer.md)
  - [IconLayer](/docs/api-reference/layers/icon-layer.md)
  - [LineLayer](/docs/api-reference/layers/line-layer.md)
  - [PathLayer](/docs/api-reference/layers/path-layer.md)
  - [PointCloudLayer](/docs/api-reference/layers/point-cloud-layer.md)
  - [PolygonLayer](/docs/api-reference/layers/polygon-layer.md)
  - [ScatterplotLayer](/docs/api-reference/layers/scatterplot-layer.md)
  - [SolidPolygonLayer](/docs/api-reference/layers/solid-polygon-layer.md)
  - [TextLayer](/docs/api-reference/layers/text-layer.md)

## Aggregation Layers

The [Aggregation Layers](https://www.npmjs.com/package/@deck.gl/aggregation-layers) are layers that aggregate the input data and visualize them in alternative representations, such as grid and hexagon binning, contour, and heatmap.

  - [ContourLayer](/docs/api-reference/aggregation-layers/contour-layer.md)
  - [GridLayer](/docs/api-reference/aggregation-layers/grid-layer.md)
  - [GPUGridLayer](/docs/api-reference/aggregation-layers/gpu-grid-layer.md)
  - [CPUGridLayer](/docs/api-reference/aggregation-layers/cpu-grid-layer.md)
  - [HexagonLayer](/docs/api-reference/aggregation-layers/hexagon-layer.md)
  - [ScreenGridLayer](/docs/api-reference/aggregation-layers/screen-grid-layer.md)
  - [HeatmapLayer](/docs/api-reference/aggregation-layers/heatmap-layer.md) *Experimental*

## Geo Layers

The [Geo Layers](https://www.npmjs.com/package/@deck.gl/geo-layers) collects layers that specifically target geospatial visualization use cases, including support for map tiles, popular geospatial indexing systems, GIS formats, etc.

  - [GreatCircleLayer](/docs/api-reference/geo-layers/great-circle-layer.md)
  - [H3ClusterLayer](/docs/api-reference/geo-layers/h3-cluster-layer.md)
  - [H3HexagonLayer](/docs/api-reference/geo-layers/h3-hexagon-layer.md)
  - [QuadkeyLayer](/docs/api-reference/geo-layers/quadkey-layer.md)
  - [S2Layer](/docs/api-reference/geo-layers/s2-layer.md)
  - [TileLayer](/docs/api-reference/geo-layers/tile-layer.md)
  - [TripsLayer](/docs/api-reference/geo-layers/trips-layer.md)
  - [TerrainLayer](/docs/api-reference/geo-layers/terrain-layer.md)
  - [MVTLayer](/docs/api-reference/geo-layers/mvt-layer.md)

## Mesh Layers

The [Mesh Layers](https://www.npmjs.com/package/@deck.gl/mesh-layers) visualize 3D models, with experimental support for scenegraph in the glTF format.

  - [SimpleMeshLayer](/docs/api-reference/mesh-layers/simple-mesh-layer.md)
  - [ScenegraphLayer](/docs/api-reference/mesh-layers/scenegraph-layer.md)

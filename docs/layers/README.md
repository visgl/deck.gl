# deck.gl Layer Catalog Overview

For first-time deck.gl developers, it is helpful to read the following pages before jumping into the layer catalog:

* [Guide to using deck.gl layers](/docs/developer-guide/using-layers.md): general concepts and frequently asked questions
* All deck.gl layers inherit from either the [`Layer`](/docs/api-reference/layer.md) or the [`CompositeLayer`](/docs/api-reference/composite-layer.md) base classes, and the props of those layers are available to all layers unless otherwise documented. The base class props are not repeated in individual layer documentation.


## Core Layers

The [Core Layers](https://www.npmjs.com/package/@deck.gl/layers) are a group of generic-purpose layers, intended to represent the building blocks for all data visualizations.

The core layers are the most stable and supported deck.gl layers.

  - [ArcLayer](/docs/layers/arc-layer.md)
  - [BitmapLayer](/docs/layers/bitmap-layer.md)
  - [ColumnLayer](/docs/layers/column-layer.md)
  - [GeoJsonLayer](/docs/layers/geojson-layer.md)
  - [GridCellLayer](/docs/layers/grid-cell-layer.md)
  - [IconLayer](/docs/layers/icon-layer.md)
  - [LineLayer](/docs/layers/line-layer.md)
  - [PathLayer](/docs/layers/path-layer.md)
  - [PointCloudLayer](/docs/layers/point-cloud-layer.md)
  - [PolygonLayer](/docs/layers/polygon-layer.md)
  - [ScatterplotLayer](/docs/layers/scatterplot-layer.md)
  - [SolidPolygonLayer](/docs/layers/solid-polygon-layer.md)
  - [TextLayer](/docs/layers/text-layer.md)

## Aggregation Layers

The [Aggregation Layers](https://www.npmjs.com/package/@deck.gl/aggregation-layers) are layers that aggregate the input data and visualize them in alternative representations, such as grid and hexagon binning, contour, and heatmap.

  - [ContourLayer](/docs/layers/contour-layer.md)
  - [GridLayer](/docs/layers/grid-layer.md)
  - [GPUGridLayer](/docs/layers/gpu-grid-layer.md)
  - [CPUGridLayer](/docs/layers/cpu-grid-layer.md)
  - [HexagonLayer](/docs/layers/hexagon-layer.md)
  - [ScreenGridLayer](/docs/layers/screen-grid-layer.md)
  - [HeatmapLayer](/docs/layers/heatmap-layer.md) *Experimental*

## Geo Layers

The [Geo Layers](https://www.npmjs.com/package/@deck.gl/geo-layers) collects layers that specifically target geospatial visualization use cases, including support for map tiles, popular geospatial indexing systems, GIS formats, etc.

  - [GreatCircleLayer](/docs/layers/great-circle-layer.md)
  - [H3ClusterLayer](/docs/layers/h3-cluster-layer.md)
  - [H3HexagonLayer](/docs/layers/h3-hexagon-layer.md)
  - [S2Layer](/docs/layers/s2-layer.md)
  - [TileLayer](/docs/layers/tile-layer.md)
  - [TripsLayer](/docs/layers/trips-layer.md)
  - [TerrainLayer](/docs/layers/terrain-layer.md)
  - [MVTLayer](/docs/layers/mvt-layer.md)

## Mesh Layers

The [Mesh Layers](https://www.npmjs.com/package/@deck.gl/mesh-layers) visualize 3D models, with experimental support for scenegraph in the glTF format.

  - [SimpleMeshLayer](/docs/layers/simple-mesh-layer.md)
  - [ScenegraphLayer](/docs/layers/scenegraph-layer.md)

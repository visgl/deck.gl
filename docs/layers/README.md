# Layer Catalog Overview

The deck.gl layer catalog is organized into a couple of sections.

## Base Layer

All deck.gl layers inherit from the [`Layer`](/docs/api-reference/layer.md) base class and its props are available to all layers unless otherwise documented.

## Core Layers

The [Core Layers](https://www.npmjs.com/package/@deck.gl/layers) are a group of generic-purpose layers, intended to represent the building blocks for all data visualizations.

The core layers are the most stable and supported deck.gl layers.

Some notable features of the core deck.gl layers

* **64-bit Mode** Most core Layers support a 64 bit mode that can be used to achieve higher precision, particularly under high zoom levels (> 1.000.000x) at the cost of sacrificing some performance and memory. Layers that have a 64 bit counterpart are marked with a "64-bit" tag.
* **Extrusions** Some of the Core layers support extrusions and heights (aka "elevations") enabling applications to show a "2.5D" view of their data when using the map in perspective mode. The layers that support extrusions are marked with an "Extrusion" tag.

## Aggregation Layers

The [Aggregation Layers](https://www.npmjs.com/package/@deck.gl/aggregation-layers) are layers that aggregate the input data and visualize them in alternative representations, such as grid and hexagon binning, contour, and heatmap.

## Geo Layers

The [Geo Layers](https://www.npmjs.com/package/@deck.gl/geo-layers) collects layers that specifically target geospatial visualization use cases, including support for map tiles, popular geospatial indexing systems, GIS formats, etc.

## Mesh Layers

The [Mesh Layers](https://www.npmjs.com/package/@deck.gl/mesh-layers) visualize 3D models, with experimental support for scenegraph in the glTF format.

# Roadmap: New layers in deck.gl

* **Authors**: Ib Green, Shaojing Li...

## Motivation

Most people use deck.gl through the layers that we provide with it and additions to the layer catalog are a good way to increase the use cases supported by deck.gl. We gradually want to add more layers to the layer catalog.

## Generalized Aggregation Layers

We have an increasing number of "aggregating" layers. Can the aggregator code be generalized into a reusable "AggregationManager" that can be attached to existing layers without subclassing or with minimal subclassing.

### Vector Field Layer

### Particle Layer

### ArcLayer

* Height of the arcs
* Style of the lines

### IconLayer

* Rotation angles
* World oriented labels

### PathLayer

* Different widths at the beginning and end of path segment
* Offset lines (e.g. left right lanes)
* Dashed lines - IMPLEMENTED

### GridLayer
* Add coverage, lowerPercentile, upperPercentile, getColorValue to GridLayer to make it aligned with HexagonLayer

## 3D Layer Catalog

## NEW 3D Polygon Layer

Polygon layer where baselines can also be adjusted.

### NEW - ThreeJSScene layer

A layer that takes a THREE.js scene and renderers it.

We will need to see how we bridge the react world with the THREE.js world so that the THREE.js scene is properly driven by the apps. We could support rendering static image first and have THREE.js scene node diff-ing implemented later.
3DSceneLayer
A layer that also renders a 3D scene with our custom scene graph solutions. Comparing the the ThreeJSSceneLayer, this will feature our custom scene graph algorithms.

### S2OutlineLayer

### TopoJSONLayer

People would like us to support more standard data format so they could simply plug their data in and expect to have something rendered on their screen. TopoJSON has been requested by our users (https://github.com/uber/deck.gl/issues/591)

## Trips Layer Catalog

One of our most important data items are trips, we could collect the various layers we have built and customized for trips into a separate layer catalog.

## Implemented

### Multiple Layer Catalogs

With more layers in our layer catalog, we should consider reorganizing the layers for easier navigation. We could put our core layers into different folders, such as non-geo and geo. We can also consider moving the entire layer catalog out of core deck.gl repo and ask our users to import new packages.

* Core Catalog - `@deck.gl/layers`
* 3D Layers - `@deck.gl/3d-layers`
* Advanced Geospatial Layer Catalog - `@deck.gl/geospatial-layers`
* Trips Layer Catalog - `@deck.gl/trip-layers`
* Infovis Layer Catalog - `@deck.gl/infovis-layers`

### ScenegraphLayer

A general layer that takes a set of luma.gl scenegraphs and renders them as instances

### H3Layer

### H3OutlineLayer

### S2Layer

### ScatterplotLayer

* Outlines...

### BitmapLayer

### MeshLayer

A general instanced layer that takes whatever geometry that the app provides to the deck.gl. We should support full 3D transformation.

### HeatmapLayer

Similar to our Hexagon layer but instead of rendering hexagon or square bars, it does the aggregation and renders some interpolated

### TextLayer

Renders text labels in screen space. There are multiple solutions to text rendering. TextLayer can be implemented as a composite layer containing an IconLayer with pre-rasterized textures, or as a dynamically composed set of labels.

# RFC: New layers in deck.gl v.Next

* **Author**: Shaojing Li
* **Date**: May 10, 2017
* **Status**: WIP


# Overview

Most people use deck.gl through the layers that we provide with it and beefing up the layer catalog is always the best way to increase the customer base of deck.gl.

In the next version of deck.gl, we will add more layers to the layer catalog.


## Candidate layers

### A general instanced layer

A general instanced layer that takes whatever geometry that the app provides to the deck.gl. We should support full 3D transformation.

### A general non-instanced layer

A general layer that takes a set of luma.gl geometries and renders


### ThreeJSScene layer

A layer that takes a THREE.js scene and renderers it.

We will need to see how we bridge the react world with the THREE.js world so that the THREE.js scene is properly driven by the apps. We could support rendering static image first and have THREE.js scene node diff-ing implemented later.
3DSceneLayer
A layer that also renders a 3D scene with our custom scene graph solutions. Comparing the the ThreeJSSceneLayer, this will feature our custom scene graph algorithms.


### BitmapLayer
Renders a set of bitmaps on a certain altitude.


### HeatmapLayer

Similar to our Hexagon layer but instead of rendering hexagon or square bars, it does the aggregation and renders some interpolated

### 2D color heatmap

### TextLayer

Renders text labels in screen space. There are multiple solutions to text rendering. TextLayer can be implemented as a composite layer containing an IconLayer with pre-rasterized textures, or as a dynamically composed set of labels.

### TopoJSONLayer

People would like us to support more standard data format so they could simply plug their data in and expect to have something rendered on their screen. TopoJSON has been requested by our users (https://github.com/uber/deck.gl/issues/591)

### Node-link layer

like geojson-layer, a composition of node (scatterplot, icon) and link (line, path, curve) layers

### Matrix layer
basically a variation of the screen grid layer - geoEncode


## Layer improvements

We could extends the functionality of our existing layers by adding more props and controls to it without breaking the backward-compatibility.

### ArcLayer

* Height of the arcs
* Style of the lines

### IconLayer

* Rotation angles

### PathLayer

* Different widths at the beginning and end of path segment
* Dashed lines (port from OCS-Lite) 398

### GridLayer
* Add coverage, lowerPercentile, upperPercentile, getColorValue to GridLayer to make it aligned with HexagonLayer

### All Layers

* Default selected highlight color support

## Layer organization

With more layers in our layer catalog, we should consider reorganizing the layers for easier navigation. We could put our core layers into different folders, such as non-geo and geo. We can also consider moving the entire layer catalog out of core deck.gl repo and ask our users to import new packages, such as ‘deckgl-geo-layers’ and ‘deckgl-nongeo-layer’...etc.

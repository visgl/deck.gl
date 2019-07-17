# RFC: Contour Layer

* **Authors**: Ravi Akkenapally
* **Date**: June 2018
* **Status**: **Implemented**

## Overview

This RFC proposes a new layer for rendering contours lines.


## Use Cases

Rendering boundaries between areas with different characteristics.


## Proposed

A new layer with following key props.

* contours (Array): An array with each element containing a threshold and color values. Each element results in at most one contour with specified color.

* cellSize (Number): Cell size in meters, used for aggregating data.

* getStrokeWidth (Number) : Size of the contour line in pixels. All contours are rendered with same width, but can have different colors using `contours` prop.


## Implementation

Internally layer uses `GPUGridAggregator` and `LineLayer` to render contours. First input data is aggregated using specified cellSize. Once aggregated data is available new utility methods are implemented to generate contour segments (each segment with a start and end points) using [Marching Squares](https://en.wikipedia.org/wiki/Marching_squares) algorithm.

### Generating contours

The main idea here is, `GPUGridAggregator` returns a texture (can be converted into array of weights) and some metadata about the texture like, `gridOrigin`, `gridSize` and `cellSize`. [Marching Squares](https://en.wikipedia.org/wiki/Marching_squares) algorithm can be used to parse this texture once for each threshold and generate vertex data (X and Y positions) of contour intersection with cell boundaries. This vertex data is relative to the aggregated texture, i.e X is in [0, gridSize.x] and Y is in [0, gridSize.y] range. Now based on `cellSize` and `gridOrigin` these vertices can be transformed into original world space (lng/lat) and can be fed into `LineLayer`, which renders each contour intersection segment resulting contours.

## Sample code

Contour layer with 3 sets of contours.

```
props: {
  id: 'contourLayer',
  contours: [
    {threshold: 1, color: [255, 0, 0]},
    {threshold: 5, color: [0, 255, 0]},
    {threshold: 10, color: [0, 0, 255]},
  ],
  cellSize: 200,
  getStrokeWidth: 3
  getPosition: d => d.COORDINATES,
}
```

Contour layer with one contour

```
props: {
  id: 'contourLayer',
  contours: [
    {threshold: 1, color: [255, 0, 0]}],
  cellSize: 200,
  getStrokeWidth: 1
  getPosition: d => d.COORDINATES,
}
```

## Next Steps

### GPU Acceleration

Contour vertex data generation can be optimized by performing it on GPU, this is currently being explored.

### Screen space contours

This RFC propose world space (lng/lat) layer, but can easily be extended into screen space. `GPUAggregator` already supports screen space aggregation, whats needed is screen space `LineLayer`.

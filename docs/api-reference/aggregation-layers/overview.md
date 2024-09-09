# @deck.gl/aggregation-layers

Layers that aggregate the input data and visualize them in alternative representations, such as grid and hexagon binning, contour, and heatmap.

  - [ContourLayer](./contour-layer.md)
  - [GridLayer](./grid-layer.md)
  - [HeatmapLayer](./heatmap-layer.md)
  - [HexagonLayer](./hexagon-layer.md)
  - [ScreenGridLayer](./screen-grid-layer.md)

## CPU vs GPU Aggregation

In the right context, enabling GPU aggregation can significantly speed up your application. This section offers in-depth insights into the performance and limitations that should be factored into leveraging this functionality.

### Considerations

- **Compaibility**: The client-side features required by GPU aggregation has been universally supported by evergreen browsers for a while and represent 95%+ of the global market. However, users have reported that driver discrepancies in certain devices/chips can affect the outcome.
- **Data size**: The time it takes for CPU to perform aggregation is generally linear to the size of the input data. GPU aggegation requires some up-front overhead in setting up shaders and uploading buffers, but the margin to process more data is very small. When working with large datasets (>100K) GPU is much faster than CPU. With small datasets, GPU could be slower than CPU.
- **Data distribution**: The memory needed by CPU aggregation is proportional to the number of cells that contain at least one data point. The memory needed by GPU aggregation is proportional to all possible cells, including the empty ones in between. GPU performs better with densely concentrated data points than sparse and sprawling data points.
- **Filtering**: GPU-based extentions such as [DataFilterExtension](../extensions/data-filter-extension.md), [MaskExtension](../extensions/mask-extension.md) only work with GPU aggregation.
- **Precision**: GPU shaders only support 32-bit floating numbers. While this layer implement mitigations to compensate for precision loss, it is expected if GPU aggregation does not produce identical results as the CPU. There are tests in place to ensure acceptable consistency between CPU and GPU aggregation.
- **Access to binned points**: GPU aggregation does not expose which data points are contained in a specific cell. If this is a requirement, for example, displaying a list of locations upon selecting a cell, then you need to either use CPU aggregation, or manually filter data on the fly.

### Performance Metrics

The following table compares the performance between CPU and GPU aggregations using random data:

| #objects | CPU #iterations/sec | GPU #iterations/sec | Notes |
| ---- | --- | --- | --- |
| 25K | 535 | 359 | GPU is <b style={{color:'red'}}>33%</b> slower |
| 100K | 119 | 437 | GPU is <b style={{color:'green'}}>267%</b> faster |
| 1M | 12.7 | 158 | GPU is <b style={{color:'green'}}>1144%</b> faster |

*Numbers are collected on a 2016 15-inch Macbook Pro (CPU: 2.8 GHz Intel Core i7 and GPU: AMD Radeon R9 M370X 2 GB)*

## Advanced usage

It is possible to implement a custom aggregation layer, or even perform aggregation without layers, using the utilities from this module.

- [AggregationLayer](./aggregation-layer.md) class
- [Aggregator](./aggregator.md) interface, implemented by
  + [CPUAggregator](./cpu-aggregator.md)
  + [WebGLAggregator](./webgl-aggregator.md)

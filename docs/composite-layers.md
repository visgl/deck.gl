# Customizing Existing Layers

It is often possible to modify the behavior of an existing layer using
either using an composite (or "adaptor") layer, or through subclassing.

## Composing Layers

### Adaptor Layers

Sometimes an existing layer renders the right thing, but it would be desirable
that it had another interface (different accessors), or performed aggregation on
its data.

Examples could be:
* Creating an `S2Layer` with an accessor that takes
  [S2](https://code.google.com/archive/p/s2-geometry-library/)
  tokens, uses the S2 library to calculates the polygons corresponding
  to that cell, and renders it using e.g. the PolygonLayer.
* Adding aggregation to an existing layer.
  By default, deck.gl layers render one graphical element for each element in
  the `data` prop. But in some cases, e.g. heatmaps, the data needs to be
  aggregated (or "binned") into cells before rendering. An adaptor in
  the form of a composite layer is a great way of organizing this.

In fact several core deck.gl layers, like the GeoJsonLayer and the GridLayer
are written as composite "adapter" layers.


##$ Collection Layers

Often a more complex visualization consists of a number of layers that are
rendered after breaking down a common set of props. It can be helpful
to collect the code that does this breakdown into a single composite layer.


### Considerations when using Composite Layers

* Forwarding properties
* Map `updateTriggers`
* Picking index handling.

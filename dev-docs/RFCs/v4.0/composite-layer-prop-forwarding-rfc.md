# RFC: Composite Layer Interface Convention

* **Author**: Shaojing Li
* **Date**: April 4, 2017
* **Status**: **Approved and Implemented**


## Summary

Composite layers are for constructing, processing and rendering complex visualizations through compositing multiple “related” underlying layers.

In deck.gl, there are two types of composite layers,
1. The “real” or “**complex**” composite layer that draws multiple different types of primitive layers, such as the GeoJson layer that draws PolygonLayer, PathLayer and ScatterPlotLayer.
* The “**Adaptor**” layer that provides a slight specialization / enhancement of an existing layer but otherwise very similar functionality to the underlying layer, such as the S2Layer.

In this document, we are aiming at establishing a convention that guides the API design principles for the first type of composite layers.

In general, we would like the interfaces of the composite layer, including the props and accessors, to be explicitly declared in the `defaultProps` object. The composite layer, when creating its underlying layers, will NOT automatically forward props it receives to them. The author of the composite layer needs to manually select appropriate props from its prop list (all should be defined in the defaultProps object) and pass them as the specific props of the underlying layers, usually in renderLayers() method.

Remark: This deviates from the general pattern that React components pass their props.


## Rationale

The rationale behind this convention is “separation of the interface from the implementation”:
* Manual prop forwarding hides the underlying implementation of a composite layer completely from its user.
* All info surfaced through the interface of a composite layer is totally controlled and can be examined 100% by looking at the defaultProps object.
* The layer developers of composite layers will then have the liberty to change the implementation at will in the future, as long as the layer fulfills its interface contract documented in docs.

In addition, changes of the underlying layer will NOT automatically bubble up to the composite layer. Since the developers of the underlying layer has no way of knowing who is using his/her layer, at the time of creating and modifying it, automatic prop forwarding often leads to unexpected rendering effect on the composite layer that uses it, which diminishes the advantages brought by true “composition” of layers.

As an example, here are the 2 composite layers we would like to change to have them conformant to this convention


### GeoJsonLayer

| GeoJsonLayer props / accessors | Mapped underlying layer props |
| --- | --- |
| fp64 | polygonFillLayer.props.fp64 polygonWireframeLayer.props.fp64 polygonLineLayer.props.fp64 pathLayer.props.fp64 pointLayer.props.fp64 |
| stroked | Not forwarded but to switch on/off polygonOutlineLayer |
| filled | Not forwarded but to switch on/off polygonFillLayer |
| extruded | polygonFillLayer.extruded |
| wireframe | Not forwarded but to switch on/off  polygonWireframeLayer |
| lineWidthScale | pathLayer.props.widthScale polygonLineLayer.props.widthScale |
| lineWidthMinPixels | pathLayer.props.widthMinPixels polygonLineLayer.props.widthScale |
| lineWidthMaxPixels | pathLayer.props.widthMaxPixels polygonLineLayer.props.widthScale |
| lineJointRounded | pathLayer.props.rounded polygonLineLayer.props.widthScale |
| lineMiterLimit | pathLayer.props.miterLimit polygonLineLayer.props.widthScale |
| getLineWidth | polygonLineLayer.props.getWidth pathLayer.props.getWidth |
| getLineColor | polygonWireframeLayer.props.getColor polygonLineLayer.props.getColor pathLayer.props.getColor |
| getFillColor | pointLayer.props.getFillColor polygonFillLayer.props.getFillColor |
| getRadius | pointLayer.props.getRadius |
| getElevation | polygonFillLayer.props.getElevation polygonWireframeLayer.props.getElevation |
| onHover | polygonFillLayer.props.onHover polygonWireframeLayer.props.onHover polygonLineLayer.props.onHover pathLayer.props.onHover pointLayer.props.onHover |
| onClick | polygonFillLayer.props.onClick polygonWireframeLayer.props.onClick polygonLineLayer.props.onClick pathLayer.props.onClick pointLayer.props.onClick |


### PolygonLayer

Instead of using “lineWidthScale” as in the GeoJsonLayer, I feel that the outline prefix is more intuitive as there are no lines in the “Polygon” layer. The lines we draw are logically part of the polygons, so the “outline” sound better to me.

| PolygonLayer props / accessors | Mapped underlying layer props |
| --- | --- |
| fp64 | polygonLayer.props.fp64 polygonWireframeLayer.props.fp64 polygonLineLayer.props.fp64 |
| lineWidthScale | polygonLineLayer.props.widthScale |
| lineWidthMinPixels | polygonLineLayer.props.widthMinPixels |
| lineWidthMaxPixels | polygonLineLayer.props.widthMaxPixels |
| lineJointRounded | polygonLineLayer.props.rounded |
| lineMiterLimit | polygonLineLayer.props.miterLimit |
| getLineColor | polygonLineLayer.props.getColor polygonWireframeLayer.props.getColor |
| getFillColor | polygonLayer.props.getColor |
| getLineWidth | polygonLineLayer.props.getWidth pathLayer.props.getWidth |
| getElevation | polygonLayer.props.getElevation polygonWireframeLayer.props.getElevation |
| onHover | polygonLayer.props.onHover polygonWireframeLayer.props.onHover polygonLineLayer.props.onHover |
| onClick | polygonLayer.props.onClick polygonWireframeLayer.props.onClick polygonLineLayer.props.onClick |

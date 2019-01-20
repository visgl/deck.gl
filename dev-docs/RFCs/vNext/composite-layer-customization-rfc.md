# RFC: Improved Customization of Composite Layers

* **Authors**: Ib Green, Xiaoji Chen
* **Date**: Jan 2019
* **Status**: Draft

## Motivation

deck.gl has strong support for customizing primitive layers, for instance through subclassing and modifying shaders. But things get harder when those shaders are access through a composite layer.


### Proposal: CompositeLayers document which sub layers they render

Each composite layer will be expected to document names for its sublayers. This makes it possible for applications to specify overrides for particular layers.

There are two types of naming possible
- name the actual layer types being rendered: Scatterplot, Path, Polygon in the case of GeoJSON
- name the actual layer instances being rendered (Points, Lines, PolygonOutlines, ExtrudedPolygons, ...) 

**QUESTION** - Pick one of these schemes, or support both?


### Proposal: CompositeLayers take a new prop `transferAllProps`

* Currently composite layers carefully pick what props to forward.
* This was done deliberately to ensure a more rigid interface specification for layers.
* When replacing sublayers with custom layers, it can be critical to be able to supply a new prop.

The `forwardBaseLayerProps()` method could check for `transferAllProps`


### Proposal: CompositeLayers take a new `subLayerProps` prop

The `subLayerProps` prop would be a recursive object. The keys are sublayer ids and the values are object of props to override. A special prop `layer` can be used to override layer type.


In application:
```js
const customizedGeoJsonLayer = new GeoJsonLayer({
  ...,
  transferAllProps: true,
  subLayerProps: {
    points: {
      layer: ExtendedScatterplotLayer,
      extendedProp: 100
    },
    'polygons-fill': {
      subLayerProps: {  // Recursive application of sublayerProps!
        SolidPolygonLayer: {
          layer: HollowPolygonLayer
        }
      }
    }
  }
})
```

#### Changes to the CompositeLayer API

**getSubLayerProps**

The overriding props supplied by the user can be merged inside `compositeLayer.getSubLayerProps` so that each layer does not have to implement their own handling of `subLayerProps`.

**getSubLayerClass**

A new CompositeLayer class method that extracts the `layer` field from `subLayerProps`, if any. This will replace the ad-hoc implementations in e.g. [HexagonLayer](https://github.com/uber/deck.gl/blob/6.3-release/modules/layers/src/hexagon-layer/hexagon-layer.js#L396) and [GeoJsonLayer](https://github.com/uber/deck.gl/blob/6.3-release/modules/layers/src/geojson-layer/geojson-layer.js#L71).


#### Open Questions

**Should keys be layer class name or sublayer id?**

Composite layers may render multiple sublayers of the same type. For example, the GeoJsonLayer renders two `PathLayer` instances, one for polygon outlines and one for line strings. Differentiating them with unique ids would give the user finer grain control.

**How do user props merge with props created by the parent layer?**

The composite layer themselves should decide which props are "overridable" by the user. This can be done via supplying multiple arguments to the sublayer constructor:

```js
renderLayers() {
  const SubLayer = new this.getSubLayerClass('child-layer') || ScatterplotLayer;
  return new SubLayer(
    {
      // "overridable" props
      stroked: this.props.stroked,
      filled: this.props.filled
    },
    // where subLayerProps are merged in
    this.getSubLayerProps({id: 'child-layer'}),
    {
      // "non-overridable" props
      data
    }
  );
}
```

**The coupling of sub layers is pretty tight, it becomes part of the interface.**

The sublayer ids will need to be documented as each composite layer's public API.

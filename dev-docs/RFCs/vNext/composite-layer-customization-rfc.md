# RFC: Improved Customization of Composite Layers

* **Authors**: Ib Green
* **Date**: Sep 2017
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


### Proposal: CompositeLayers take new a `subLayerProps` prop

The sublayerProps would be a recursive object. A special prop `layer` can be used to override layer type.


In application:
```js
const customizedGeoJsonLayer = new GeoJsonLayer({
  ...,
  transferAllProps: true,
  subLayerProps: {
    ScatterplotLayer: {
      layer: ExtendedScatterplotLayer,
      extendedProp: 100
    },
    PolygonLayer: {
      subLayerProps: {  // Recursive application of sublayerProps!
        SolidPolygonLayer: {
          layer: HollowPolygonLayer
        }
      }
    }
  }
})
```

In geojson:
```js
const defaultProps = {
  ...,
  subLayers: {
    PointLayer: ScatterplotLayer,
    LineLayer: PathLayer,
    PolygonLayer: SolidPolygonLayer
  }
};

const GeoJsonLayer extends CompositeLayer {
  ...
  renderLayers() {
  	return [
  	  new this.props.subLayerProps.PointLayer({
  	  }),
  	];
  }
}
```


### Proposal: CompositeLayers take a `subLayerProps` prop


In application:
```js
  const customizedGeoJsonLayer = new GeoJsonLayer({
  	...,
  	subLayerProps: {
  	  PointLayer: ...
  	}
  })
```



## Open Questions

* Key by sub id or by layer type?
* Merging props
* Overriding props for sub layers recursively
* The coupling of sub layers is pretty tight, it becomes part of the interface.

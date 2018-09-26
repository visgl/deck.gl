# RFC: Improved Customization of Composite Layers

* **Authors**: Matthew Rice (@matthrice), Clay Anderson (@supersonicclay), Ib Green (@ibgreen)
* **Date**: Sep 2018 (Updated from original Sep 2017 proposal).
* **Status**: Draft

References:

* [nebula.gl PR #46](https://github.com/uber/nebula.gl/pull/46) - Configure sublayers and their props


## Summary

This RFC proposes a mechanism for overriding individual sublayers and sublayer properties in `CompositeLayers`, enabling applications to reuse complex composite layers while changing some configuration or behavior in one of the generated or "rendered" sub layers.


## Motivation

deck.gl has strong support for customizing primitive layers, for instance through subclassing and modifying shaders. But things get harder when those shaders are access through a composite layer.


## Proposal

See the linked [nebula.gl PR #46](https://github.com/uber/nebula.gl/pull/46). It contains an override system based on sublayer ids and sub layer cloning.

The huge advantage with cloning is that it does not depend on intrusive changes in existing composite layers, at the cost of some performance (required to clone certain sublayers).

```js
render() {
  const layer = new EditableGeoJsonLayer({
    id: 'editable-geojson',
    data: this.state.data,
    mode: this.state.mode,
    selectedFeatureIndexes: this.state.selectedFeatureIndexes,
    // getEditHandlePointColor: [0, 0, 255], // instead of this
    layerOverrides: {
      editHandles: {
        props: {
          getColor:[0, 0, 255], // do this
        }
      }
    }
  }
}
```


## Alternative Solutions / Older Proposals

### Proposal: CompositeLayers document which sub layers they render

Each composite layer could document names for its sublayers. This makes it possible for applications to specify overrides for particular layers.



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


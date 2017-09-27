# RFC: Improved Customization of Composite Layers

* **Authors**: Ib Green
* **Date**: Sep 2017
* **Status**: Draft

## Motivation

deck.gl has strong support for customizing primitive layers, for instance through subclassing and modifying shaders. But things get harder when those shaders are access through a composite layer.


### Proposal: CompositeLayers take a `subLayers` prop

Each composite layer will be expected to document names for its sublayers.

In application:
```js
  const customizedGeoJsonLayer = new GeoJsonLayer({
  	...,
  	subLayers: {
  	  PointLayer: ExtendedScatterplotLayer
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
  	  new this.props.subLayers.PointLayer({
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

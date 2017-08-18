# RFC - Viewport Support for Infovis

* **Author**: Ib Green
* **Date**: Dec 7, 2016
* **Status**: **Approved and Implemented**

Notes:
* Implemented (with a different class hierarchy) as part of deck.gl v4.
* This was the first deck.gl RFC.


## Background

Problems with Current Viewport
* The current Viewport class used in deck.gl v3 is mapping/geospatial focused and not directly suitable for generic infovis.
* Current Viewport always expects longitude and latitude arguments, which make no sense for non-map related visualizations
* Current Viewport view must be created with lng,lat,zoom,pitch,bearing,altitude parameters, which are natural when a “ground” plane is clearly defined by a map, but may be restrictive for general 3D visualizations (e.g. embeddings as 3D point clouds). Makes it harder to write interfaces (event handling).
* Current Viewport assumes that positions (i.e x,y,z coordinates in deck.gl layers) are in mercator coordinates or meter offsets. Disregarding complications of the initial non-linear part of the mercator transformation, this currently builds in assumptions about “world size” (512 * zoom ^ 2) that just doesn’t fit a generic data set.

Other Design Considerations
* When designing the viewport, it is tempting to just pick a coordinate system that is most elegant or natural (e.g. 0-1). But we should at least sanity check floating point precision implications of such a choice in the shaders.

## Proposal: Create a Viewports class Hierarchy

A possibility is to split current viewport class into 3 classes. The idea is that any of these viewports can be used with deck.gl (and they will share some code), but they provide different interfaces to the application:

* `BaseViewport` - completely generic and linear, works with matrices
* `ScaledViewport` - generic and linear, but calculates view and projection matrices for center/zoom/...
* `MercatorViewport` - understands lng/lat/zoom/pitch/bearing


### BaseViewport

```js
// BaseViewport works in a [0,1] world system. Any standard matrices can be used.

new BaseViewport({
    // Window width/height in pixels (for pixel projection)
    width,
    height,

    // Defines the coordinate system
    worldMatrix,

    projectionMatrix,
    viewMatrix,

})
```

### ScaledViewport

```js
// ScaledViewport takes center, zoom, pitch, bearing etc parameters
// Calculates ViewMatrix and ProjectionMatrix from these
// Still allows app to set worldMatrix and modelMatrix

new ScaledViewport({
    // Window width/height in pixels (for pixel projection)
    width,
    height,

    worldMatrix,

    // Current center (in 0-1 coordinates? Or worldMatrix coordinates)
    centerX,
    centerY,
    zoom,
    altitude,
    pitch,
    bearing,
})
```

### MercatorViewport

MercatorViewport adds non-linear WebMercator project/unproject.

```js
new MercatorViewport({
  lng, lat, zoom // converted to centerX, centerY, scale
})
```

## Other considerations

### Model Matrix support

Proposal : Add modelMatrix parameter to the BaseViewport.getMatrices call. The viewport will right multiply in the modelMatrix into the combined matrices. This would work for all Viewport classes.


### Implications on Shaders

The viewport interacts with the deck.gl shaders mainly through uniforms.



## References

viewport-mercator-project


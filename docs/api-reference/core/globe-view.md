# GlobeView (Experimental)

> This class is experimental, which means it does not provide the compatibility and stability that one would typically expect from other `View` classes. Use with caution and report any issues that you find on GitHub.

The `GlobeView` class is a subclass of [View](./view.md). This view projects the earth into a 3D globe.

It's recommended that you read the [Views and Projections guide](../../developer-guide/views.md) before using this class.

<div style={{position:'relative',height:450}}></div>
<div style={{position:'absolute',transform:'translateY(-450px)',paddingLeft:'inherit',paddingRight:'inherit',left:0,right:0}}>
  <iframe height="450" style={{width:'100%'}} scrolling="no" title="deck.gl GlobeView" src="https://codepen.io/vis-gl/embed/JjbdXjr?height=450&theme-id=light&default-tab=result" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
    See the Pen <a href='https://codepen.io/vis-gl/pen/JjbdXjr'>deck.gl GlobeView</a> by vis.gl
    (<a href='https://codepen.io/vis-gl'>@vis-gl</a>) on <a href='https://codepen.io'>CodePen</a>.
  </iframe>
</div>


## Limitations

The goal of `GlobeView` is to provide a generic solution to rendering and navigating data in the 3D space.
In the initial release, this class mainly addresses the need to render an overview of the entire globe. The following limitations apply, as features are still under development: 

- No support for rotation (`pitch` or `bearing`). The camera always points towards the center of the earth, with north up.
- No high-precision rendering at high zoom levels (> 12). Features at the city-block scale may not be rendered accurately.
- Only supports `COORDINATE_SYSTEM.LNGLAT` (default of the `coordinateSystem` prop).
- Known rendering issues when using multiple views mixing `GlobeView` and `MapView`, or switching between the two.
- Support for `TileLayer` and `MVTLayer` is experimental.
- These layers currently do not work in this view:
  + Aggregation layers: `HeatmapLayer`, `ContourLayer`
  + `TerrainLayer`
- [MaskExtension](../extensions/mask-extension.md) is not supported in this view.

When GeoJson paths and polygons are rendered with this view, the straight lines and flat surfaces are warped to the surface of the globe. Note that the warped edges still correspond to straight lines in the Mercator projection. To draw lines along the shortest distance on the globe, use the [GreatCircleLayer](../geo-layers/great-circle-layer.md).


## Constructor

```js
import {_GlobeView as GlobeView} from '@deck.gl/core';
const view = new GlobeView({id, ...});
```

`GlobeView` takes the same parameters as the [View](./view.md) superclass constructor, plus the following:

#### `resolution` (number, optional) {#resolution}

The resolution at which to turn flat features into 3D meshes, in degrees. Smaller numbers will generate more detailed mesh. Default `10`.

#### `nearZMultiplier` (number, optional) {#nearzmultiplier}

Scaler for the near plane, 1 unit equals to the height of the viewport. Default to `0.1`. Overwrites the `near` parameter.

#### `farZMultiplier` (number, optional) {#farzmultiplier}

Scaler for the far plane, 1 unit equals to the distance from the camera to the edge of the screen. Default to `2`. Overwrites the `far` parameter.


## View State

To render, `GlobeView` needs to be used together with a `viewState` with the following parameters:

- `longitude` (number) - longitude at the viewport center
- `latitude` (number) - latitude at the viewport center
- `zoom` (number) - zoom level
- `maxZoom` (number, optional) - max zoom level. Default `20`.
- `minZoom` (number, optional) - min zoom level. Default `0`.


## Controller

By default, `GlobeView` uses the `GlobeController` to handle interactivity. To enable the controller, use:

```js
const view = new GlobeView({id: 'globe', controller: true});
```

Visit the [GlobeController](./globe-controller.md) documentation for a full list of supported options.


# Remarks

## Occlusion

In the MapView, it is often sufficient to provide a solid background color where there is no geometry. In the GlobeView, the user can "see through" to the other side of the earth. There are two ways to fix this:

- Render a polygon that represents the surface of the earth:

```js
new SolidPolygonLayer({
  id: 'background',
  data: [
    [[-180, 90], [0, 90], [180, 90], [180, -90], [0, -90], [-180, -90]]
  ],
  getPolygon: d => d,
  stroked: false,
  filled: true,
  getFillColor: [40, 40, 40]
})
```

- Discard all surfaces that face away from the camera by passing the following prop to `Deck`:

```js
parameters: {
  cull: true
}
```



## Source

[modules/core/src/views/globe-view.ts](https://github.com/visgl/deck.gl/blob/master/modules/core/src/views/globe-view.ts)

# Upgrade Guide

## Upgrading from deck.gl v3 to v4

### Importing deck.gl React component

A small but breaking change is that the 'deck.gl/react' import is no
longer available, since the relative file caused complications with
the new support for support "tree shaking" (multiple transpiled distributions). This means you will need to revert to the pre-3.0 way of importing the react
component:

```
// V3
import DeckGL from 'deck.gl/react';
// V4
import DeckGL from 'deck.gl';
```

### Deprecated and Removed Layers

#### ChoroplethLayer, ChoroplethLayer64, ExtrudedChoroplethLayer (Deprecated)

The functionality of these is now covered in a more unified, flexible and
performant way by the following new layers: `GeoJsonLayer`, `PolygonLayer` and
`PathLayer`.

You should be able to just supply the same geojson data you are already using
with your `ChoroplethLayer`s to the new `GeoJsonLayer`, although you will want
to review the props of the new layer to make sure you get the desired results.

The Choropleth layers are still around for now so there is no urgency to upgrade,
but they will likely be removed in the next major version of deck.gl.

### EnhancedChoroplethLayer (Removed)

This was a a sample layer in deck.gl v3 and has now been moved to a
stand-alone example and is no longer exported from the deck.gl npm module.

Applications can either copy this layer from deck.gl v3 or the example,
or consider using the new `PathLayer` which also handles wide lines albeit in a
slightly different way. It may fit the same use cases.


### Upgrading Layer Accessors and Properties

As the result of an API cleanup, there are some deprecated layers and some
deprecated properties on existing layers. This continue to work in v4 but will
most likely be removed in the next major release.

#### updateTriggers

Update triggers can now be specified by referring to the name of the accessor,
instead of the name of the actual WebGL attribute.

Note that this is supported on all layers supplied by deck.gl, but if you
are using older layers, they need a small addition to their attribute
definitions, see below.

#### `strokeWidth` props

One of the most noticeable changes in v4 could be that all line based layers
(i.e. layers that render using the `GL.LINE` drawing mode, namely
`LineLayer and `ArcLayer` and the `ScatterplotLayer` in outline mode)
have dropped support for the `strokeWidth` prop.

This particular change was caused by browsers dropping support for this feature.
Note that this is not a completely surprising changes since `GL.LINE` mode
rendering always had signficant limitations in terms of lack of support for
mitering, unreliable support for anti-aliasing and platform dependent line width limits.

The practical outcome of this is that these layers should now only be
considered for outline/wireframe type rendering, and the resulting lines may be
very thin on modern Retina/4K+ displays.

deck.gl will gradually provide alternate layers that use non-`GL.LINE` based
techniques that provide better line rendering for various use cases.
In 4.0 the `PathLayer` is the first example of this, and `PathLayer` is also used
by the new `GeoJsonLayer` to render lines and outlines.

Remarks:
* Some background: WebGL lineWidth no longer has any effect in
  [Chrome](https://bugs.chromium.org/p/chromium/issues/detail?id=60124)
  and [Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=634506).

#### `Scale` props

Scale props (or "multiplicative uniform" props) is a set of props that
multiply some existing value for all objects in the layers.

This makes it easy to make a slider that instantly modifies e.g. radius of
every point in a scatterplot without rebuilding the geometry.

For API consistency reasons these have all been renamed with the suffix `..Scale`

| scatterplotLayer | radius | radiusScale |

## Modified Layers

* `ScatterplotLayer`


### Upgrading Layers from deck.gl v3 to v4

While v3 layers should work without changes in v4, there are some improvements
you may want to take advantage of.

## updateTriggers

To enable applications 

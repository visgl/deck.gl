# Upgrade Guide

## v3 to v4

#### Importing deck.gl React component

A small but breaking change is that the 'deck.gl/react' import is no
longer available, since the relative file caused complications with
the new support for support "tree shaking" (multiple transpiled distributions). This means you will need to revert to the pre-3.0 way of importing the react component:

```js
// V3
import DeckGL from 'deck.gl/react';
// V4
import DeckGL from 'deck.gl';
```

#### Layer Properties

```diff
- BaseLayer.dataIterator
```

This prop was not correctly implemented in deck.gl v3 so its removal is unlikely to
break any existing code.

#### Layers

Have been deprecated:

- ChoroplethLayer
- ChoroplethLayer64
- ExtrudedChoroplethLayer

The functionality of these is now covered in a more unified, flexible and
performant way by the following new layers: [GeoJsonLayer](/docs/geojson-layer.md),
[PolygonLayer](/docs/layers/polygon-layer.md) and
[PathLayer](/docs/layers/path-layer.md).

You should be able to just supply the same geojson data you are already using
with your `ChoroplethLayer`s to the new [GeoJsonLayer](/docs/geojson-layer.md), although
you will want to review the props of the new layer to make sure you get the desired results.

The Choropleth layers are still around for now so there is no urgency to upgrade,
but they will likely be removed in the next major version of deck.gl.

```diff
- EnhancedChoroplethLayer
```

This sample layer has now been moved to a standalone example and is no longer exported.

Applications can either copy this layer from deck.gl v3 or the example,
or consider using the new [PathLayer](/docs/layers/path-layer.md) which also handles
wide lines albeit in a slightly different way. It may fit the same use cases.

#### Upgrading Layer Accessors and Properties

As the result of an API cleanup, there are some deprecated layers and some
deprecated properties on existing layers. This continue to work in v4 but will
most likely be removed in the next major release.

##### updateTriggers

Update triggers can now be specified by referring to the name of the accessor,
instead of the name of the actual WebGL attribute.

Note that this is supported on all layers supplied by deck.gl, but if you
are using older layers, they need a small addition to their attribute
definitions, see below.

##### strokeWidth

One of the most noticeable changes in v4 could be that all line based layers
(i.e. layers that render using the `GL.LINE` drawing mode, namely
[LineLayer](/docs/layers/line-layer.md) and [ArcLayer](/docs/layers/arc-layer.md)
and the [ScatterplotLayer](/docs/layers/scatterplot-layer.md) in outline mode)
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
In 4.0 the [PathLayer](/docs/layers/path-layer.md) is the first example of this, and is also used
by the new [GeoJsonLayer](/docs/geojson-layer.md) to render lines and outlines.

Some background: WebGL `lineWidth` no longer has any effect in
[Chrome](https://bugs.chromium.org/p/chromium/issues/detail?id=60124) and
[Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=634506).

##### Scale props

Scale props (or "multiplicative uniform" props) is a set of props that
multiply some existing value for all objects in the layers.

This makes it easy to make a slider that instantly modifies e.g. radius of
every point in a scatterplot without rebuilding the geometry.

For API consistency reasons these have all been renamed with the suffix `..Scale`

`scatterplotLayer`, `radius`, `radiusScale`.

##### getPickingInfo

To override the default picking behavior, implement the `getPickingInfo()` method
that returns an info object to be passed to `onHover` and `onClick` handlers. If
this methods returns `null`, no event will be fired.

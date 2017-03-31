# Upgrade Guide

## Upgrading from deck.gl v3 to v4

### Changed Import: The `DeckGL` React component

A small but breaking change that will affect all applications is that the
'deck.gl/react' import is no longer available. As of v4.0, the app is required
to import deck.gl as follows:
```
// V4
import DeckGL from 'deck.gl';
// V3
import DeckGL from 'deck.gl/react';
```
While it would have been preferable to avoid this change, a significant
modernization of the deck.gl build process and preparations for "tree-shaking"
support combined to make it impractical to keep supporting the old import style.


### Deprecated/Removed Layers

| Layer              | Status       | Replacement         |
| ---                | ---          | ---                 |
| `ChoroplethLayer`  | Deprecated | `GeoJsonLayer`, `PolygonLayer` and `PathLayer`    |
| `ChoroplethLayer64` | Deprecated | `GeoJsonLayer`, `PolygonLayer` and `PathLayer`    |
| `ExtrudedChoroplethLayer` | Deprecated | `GeoJsonLayer`, `PolygonLayer` and `PathLayer`    |
| `EnhancedChoroplethLayer`  | Moved to examples  | `PathLayer`    |

* ChoroplethLayer, ChoroplethLayer64, ExtrudedChoroplethLayer

These set of layers are deprecated in deck.gl v4, with their functionality
completely substituted by more unified, flexible and performant new layers:
 `GeoJsonLayer`, `PolygonLayer` and `PathLayer`.

Developers should be able to just supply the same geojson data that are used with
`ChoroplethLayer`s to the new `GeoJsonLayer`. The props of the `GeoJsonLayer` are
a bit different from the old `ChoroplethLayer`, so proper testing is recommended
to achieve satisfactory result.

* EnhancedChoroplethLayer

This was a a sample layer in deck.gl v3 and has now been moved to a
stand-alone example and is no longer exported from the deck.gl npm module.

Developers can either copy this layer from the example folder into their
application's source tree, or consider using the new `PathLayer` which also
handles wide lines albeit in a slightly different way.


### Removed, Changed and Deprecated Layer Properties

| Layer            | Old Prop       | New Prop         | Comment |
| ---              | ---            | ---              | ---     |
| Layer            | `dataIterator` | N/A              | Prop was not functional in v3    |
| ScatterplotLayer | `radius`       | `radiusScale`    | Default has changed from 30 to 1 |
| ScatterplotLayer | `drawOutline`  | `outline`        | |
| ScreenGridLayer  | `unitWidth`    | `cellSizePixels` | |
| ScreenGridLayer  | `unitHeight`   | `cellSizePixels` | | |


#### Note about `strokeWidth` props

All line based layers (`LineLayer and `ArcLayer` and the `ScatterplotLayer`
in outline mode) now use use shaders to render an exact pixel thickness
on lines, instead of using the `GL.LINE` drawing mode.

This particular change was caused by browsers dropping support for this feature
([Chrome](https://bugs.chromium.org/p/chromium/issues/detail?id=60124)
and [Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=634506)).

Also `GL.LINE` mode rendering always had signficant limitations in terms of
lack of support for mitering, unreliable support for anti-aliasing and
platform dependent line width limits so this should represent an improvement
in visual quality and consistency for these layers.

#### Removed prop: `Layer.dataIterator`

This prop has been removed in deck.gl v4. Note that it was not functioning
as documented in deck.gl v3.

#### Renamed Props: The `...Scale` suffix

Props that have their name end of `Scale` is a set of props that
multiply some existing value for all objects in the layers.
These props usually correspond to WebGL shader uniforms that "scaling" all
values of specific attributes simultaneously.

For API consistency reasons these have all been renamed with the suffix `..Scale`.
See the property table above.

#### Removed lifecycle method: `Layer.willReceiveProps`

This lifecycle was deprecated in v3 and is now removed in v4.
Use `Layer.updateState` instead.

#### Changes to `updateTriggers`

Update triggers can now be specified by referring to the name of the accessor,
instead of the name of the actual WebGL attribute.

Note that this is supported on all layers supplied by deck.gl v4, but if you
are using older layers, they need a small addition to their attribute
definitions to specify the name of the accessor.

### AttributeManager changes

#### Removed method: `AttributeManager.setLogFunctions`

Use the new static function `AttributeManager.setDefaultLogFunctions` to set
loggers for all AttributeManagers (i.e. for all layers).

#### Removed method: `AttributeManager.addDynamic`

This method has been deprecated since version 2.5 and is now removed in v4.
Use `AttributeManager.add()` instead.

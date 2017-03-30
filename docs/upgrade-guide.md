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

### Removed, Changed and Deprecated Layer Properties

| Layer            | Old Prop       | New Prop         | Comment |
| ---              | ---            | ---              | ---     |
| Layer            | `dataIterator` | N/A              | Prop was not functional in v3    |
| ScatterplotLayer | `radius`       | `radiusScale`    | Default has changed from 30 to 1 |
| ScatterplotLayer | `drawOutline`  | `outline`        | |
| ScreenGridLayer  | `unitWidth`    | `cellSizePixels` | |
| ScreenGridLayer  | `unitHeight`   | `cellSizePixels` | | |

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

#### updateTriggers

Update triggers can now be specified by referring to the name of the accessor,
instead of the name of the actual WebGL attribute.

Note that this is supported on all layers supplied by deck.gl, but if you
are using older layers, they need a small addition to their attribute
definitions, see below.


### AttributeManager changes

#### Removed method: `AttributeManager.setLogFunctions`

Use the new static function `AttributeManager.setDefaultLogFunctions` to set
loggers for all AttributeManagers (i.e. for all layers).

#### Removed method: `AttributeManager.addDynamic`

This method has been deprecated since version 2.5 and is now removed in v4.
Use `AttributeManager.add()` instead.


### Deprecated/Removed Layers

| Layer            | Status       | Replacement         |
| ---              | ---            | ---              | ---     |
| `ChoroplethLayer`  | Deprecated | `GeoJsonLayer`, `PolygonLayer` and `PathLayer`    |
| `ChoroplethLayer64` | Deprecated | `GeoJsonLayer`, `PolygonLayer` and `PathLayer`    |
| `ExtrudedChoroplethLayer` | Deprecated | `GeoJsonLayer`, `PolygonLayer` and `PathLayer`    |
| `EnhancedChoroplethLayer`  | Moved to samples  | `PathLayer`    |

#### ChoroplethLayer, ChoroplethLayer64, ExtrudedChoroplethLayer

These set of layers are deprecated in deck.gl v4, with their functionality
completely substituted by more unified, flexible and performant new layers:
 `GeoJsonLayer`, `PolygonLayer` and `PathLayer`.

Developers should be able to just supply the same geojson data that are used with
`ChoroplethLayer`s to the new `GeoJsonLayer`. The props of the `GeoJsonLayer` are
a bit different from the old `ChoroplethLayer`, so proper testing is recommended
to achieve satisfactory result.

As a deprecated layer, the Choropleth-family layers will stick around for
at least another major revision, but please take some time to upgrade to the new
GeoJsonLayer.

#### EnhancedChoroplethLayer

This was a a sample layer in deck.gl v3 and has now been moved to a
stand-alone example and is no longer exported from the deck.gl npm module.

Developers can either copy this layer from deck.gl v3 or the example,
or consider using the new `PathLayer` which also handles wide lines albeit in a
slightly different way.

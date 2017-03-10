# Upgrade Guide

## Upgrading from deck.gl v3 to v4

### Importing deck.gl React component

A small but breaking change is that the 'deck.gl/react' import is no
longer available, since the relative file caused complications with
the new support for support "tree shaking" (multiple transpiled distributions).
As of v4.0, the user is expected to import deck.gl using "pre-v3.0" way as
follows:

```
// V3
import DeckGL from 'deck.gl/react';
// V4
import DeckGL from 'deck.gl';
```

### Removed, Changed and Deprecated Layer Properties

#### `BaseLayer.dataIterator` prop (Removed)

This prop has been removed in deck.gl v4 as it was not correctly functioning
as intended in deck.gl v3.

### Deprecated and Removed Layers

#### ChoroplethLayer, ChoroplethLayer64, ExtrudedChoroplethLayer (Deprecated)

These set of layers are deprecated in deck.gl v4, with their functionality
completely substituted by more unified, flexible and performant new layers:
 `GeoJsonLayer`, `PolygonLayer` and `PathLayer`.

Developers should be able to just supply the same geojson data that are used with
 `ChoroplethLayer`s to the new `GeoJsonLayer`. The props of the `GeoJsonLayer` is
 also a bit different from the old `ChoroplethLayer`, so proper testing is recommended
 to achieve satisfactory result.

As a deprecated layer, the Choropleth-family layers will stick around for
at least another major revision, but please take some time to upgrade to the new
GeoJsonLayer.

### EnhancedChoroplethLayer (Removed)

This was a a sample layer in deck.gl v3 and has now been moved to a
stand-alone example and is no longer exported from the deck.gl npm module.

Developers can either copy this layer from deck.gl v3 or the example,
or consider using the new `PathLayer` which also handles wide lines albeit in a
slightly different way.


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

#### Props with `Scale` suffix

Props that have their name end of `Scale` is a set of props that
multiply some existing value for all objects in the layers. These props usually correspond
to WebGL shader uniforms that "scaling" all values of specific attributes simultaneously.

For API consistency reasons these have all been renamed with the suffix `..Scale`

| ScatterplotLayer | radius | radiusScale |

| GridLayer | elevation | elevationScale |

| HexagonLayer | elevation | elevationScale |

| IconLayer | size | sizeScale |

| PathLayer | strokeWidth | strokeWidthScale |

# Upgrade Guide

## v3 to v4

### React

A small but breaking change that will affect all applications is that the
'deck.gl/react' import is no longer available. As of v4.0, the app is required
to import deck.gl as follows:

```js
// V4
import DeckGL from 'deck.gl';
// V3
import DeckGL from 'deck.gl/react';

```
While it would have been preferable to avoid this change, a significant
modernization of the deck.gl build process and preparations for "tree-shaking"
support combined to make it impractical to keep supporting the old import style.

### Layer Properties & Accessors

| Layer            | Old Prop       | New Prop         | Comment                          |
| ---------------- | -------------- | ---------------- | -------------------------------- |
| Layer            | `dataIterator` | N/A              | Prop was not functional in v3    |
| ScatterplotLayer | `radius`       | `radiusScale`    | Default has changed from 30 to 1 |
| ScatterplotLayer | `drawOutline`  | `outline`        |                                  |
| ScreenGridLayer  | `unitWidth`    | `cellSizePixels` |                                  |
| ScreenGridLayer  | `unitHeight`   | `cellSizePixels` |                                  |

```diff
- Layer.dataIterator
```

This prop was not correctly implemented in deck.gl v3 so its removal is unlikely to
break any existing code.

##### Scale props

Props that have their name end of `Scale` is a set of props that
multiply some existing value for all objects in the layers.
These props usually correspond to WebGL shader uniforms that "scaling" all
values of specific attributes simultaneously.

For API consistency reasons these have all been renamed with the suffix `..Scale`.
See the property table above.

##### Layer.willReceiveProps lifecycle

This lifecycle was deprecated in v3 and is now removed in v4. Use `Layer.updateState` instead.

##### updateTriggers

Update triggers can now be specified by referring to the name of the accessor,
instead of the name of the actual WebGL attribute.

Note that this is supported on all layers supplied by deck.gl, but if you
are using older layers, they need a small addition to their attribute
definitions, see below.

### Layers

Have been deprecated:

- ChoroplethLayer
- ChoroplethLayer64
- ExtrudedChoroplethLayer

The functionality of these is now covered in a more unified, flexible and
performant way by the following new layers: [GeoJsonLayer](/docs/geojson-layer.md),
[PolygonLayer](/docs/layers/polygon-layer.md) and
[PathLayer](/docs/layers/path-layer.md).

Developers should be able to just supply the same geojson data that are used
with the `ChoroplethLayer` to the new [GeoJsonLayer](/docs/geojson-layer.md),
there's minor differences in terms of props so proper testing is recommended to
achieve satisfactory results.

As a deprecated layer, the Choropleth-family layers will stick around for
at least another major revision.

```diff
- EnhancedChoroplethLayer
```

This sample layer has now been moved to a standalone example and is no longer exported.

Applications can either copy this layer from deck.gl v3 or the example,
or consider using the new [PathLayer](/docs/layers/path-layer.md) which also handles
wide lines albeit in a slightly different way.

### AttributeManager

```diff
- AttributeManager.setLogFunctions
```

Use the new static function `AttributeManager.setDefaultLogFunctions` to set
loggers for all AttributeManagers (i.e. for all layers).

```diff
- AttributeManager.addDynamic
```

This method has been deprecated since version 2.5 and is now removed in v4.
Use `AttributeManager.add()` instead.

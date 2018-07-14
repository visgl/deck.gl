# Upgrade Guide

## Upgrading from deck.gl v5.3 to v6.0

#### Pixel sizes

Pixel sizes in line, icon and text layers now match their HTML/SVG counterparts. To achieve the same rendering output as v5, you should halve the following props:

* `ArcLayer.getStrokeWidth`
* `LineLayer.getStrokeWidth`
* `IconLayer.getSize` or `IconLayer.sizeScale`
* `TextLayer.getSize` or `TextLayer.sizeScale`
* `PointCloudLayer.radiusPixels`


#### Views and Controllers

* `ViewportController` React component has been removed. The functionality is now built in to the `Deck` and `DeckGL` classes.
* `Deck.onViewportChange(viewport)` etc callbacks are no longer supported. Use `Deck.onViewStateChange({viewState})`
* `DeckGL.viewport` and `DeckGL.viewports` props are no longer supported. Use `DeckGL.views`.


#### Shader Modules

Some previously deprecated `project` module functions have now been removed.


#### `Layer.is64bitEnabled()` deprecated

Instead use `use64bitProjection` and `use64bitPositions`.


#### ScreenGridLayer

`minColor` and `maxColor` props are deprecated. Use `colorRange` and `colorDomain` props.



## Upgrading from deck.gl v5.2 to v5.3

### Viewport classes

Continuing the changes that started in 5.2: while the base `Viewport` class will remain supported, the various `Viewport` subclasses are now deprecated. For now, if for projection purposes you need to create a `Viewport` instance matching one of your `View` instances you can use `View.makeViewport`:

```js
new MapView().makeViewport({width, height, viewState: {longitude, latitude, zoom}});
```


### Layer properties

| Layer            | Removed Prop       | New Prop             | Comment |
| ---              | --- | --- | --- |
| `ArcLayer`       | `strokeWidth`       | `getStrokeWidth` | Can be set to constant value |
| `LineLayer`      | `strokeWidth`       | `getStrokeWidth` | Can be set to constant value |


### Pure JS applications

Core layers are broken out from ` @deck.gl/core` to a new submodule ` @deck.gl/layers`. Non-React users of deck.gl should now install both submodules:

```bash
npm install @deck.gl/core @deck.gl/layers
```

And import layers from the new submodule instead of core:

```js
import {ScatterplotLayer} from '@deck.gl/layers';
```

Users of `deck.gl` are not affected by this change.


## Upgrading from deck.gl v5.1 to v5.2

### DeckGL component

* `DeckGL.viewports` and `DeckGL.viewport` are deprecated and should be replaced with `DeckGL.views`.

### Viewport classes

* A number of `Viewport` subclasses have been deprecated. They should be replaced with their `View` counterparts.

### Experimental Features

Some experimental exports have been removed:

* The experimental React controller components (`MapController` and `OrbitController`) have been removed. These are now replaced with JavaScript classes that can be used with the `Deck.controller` / `DeckGL.controller` property.


## Upgrading from deck.gl v5 to v5.1

N/A


## Upgrading from deck.gl v4.1 to v5

### Dependencies

deck.gl 4.1 requires luma.gl as peer dependency, but 5.0 specifies it as a normal "dependency". This means that many applications no longer need to list luma.gl in their package.json. Applications that do might get multiple copies of luma.gl installed, which will not work. **luma.gl will detect this situation during run-time throwing an exception**, but **npm and yarn will not detect it during install time**. Thus your build can look successful during upgrade but fail during runtime.

### Layer Props

Coordinate system related props have been renamed for clarity. The old props are no longer supported and will generate errors when used.

| Layer            | Removed Prop       | New Prop             | Comment |
| ---              | ---                | ---                  | ---     |
| Layer            | `projectionMode`   | `coordinateSystem`   | Any constant from `COORDINATE_SYSTEM`  |
| Layer            | `projectionOrigin` | `coordinateOrigin`   | [lng, lat] |

Note; There is also an important semantical change in that using `coordinateSystem` instead of `projectionMode` causes the superimposed `METER_OFFSET` system's y-axis to point north instead of south. This was always the intention so in some sense this was regarded as a bug fix.

### DeckGL component

Following methods and props have been renamed for clarity. The semantics are unchanged. The old props are still available but will generate a deprecation warning.

| Old Method            | New Method        | Comment |
| ---                   | ---               | ---     |
| `queryObject`         | `pickObject`      | These names were previously aligned with react-map-gl, but ended up confusing users. Since rest of the deck.gl documentation talks extensively about "picking" it made sense to stay with that terminology. |
| `queryVisibleObjects` | `pickObjects`     | The word "visible" was intended to remind the user that this function only selects the objects that are actually visible in at least one pixel, but again it confused more than it helped. |

### Removed picking Uniforms

| Removed uniform       | Comment |
| ---                   | ---     |
| renderPickingBuffer   |[picking shader module](https://github.com/uber/luma.gl/tree/5.0-release/src/shadertools/modules/picking)|
| pickingEnabled        |[picking shader module](https://github.com/uber/luma.gl/tree/5.0-release/src/shadertools/modules/picking)|
| selectedPickingColor  |[picking shader module](https://github.com/uber/luma.gl/tree/5.0-release/src/shadertools/modules/picking)|


The shader uniforms are used for implementing picking in custom shaders, these uniforms are no longer set by the deck.gl. Custom shaders can now use luma.gl [picking shader module](https://github.com/uber/luma.gl/tree/5.0-release/src/shadertools/modules/picking).


### Initial WebGL State

Following WebGL parameters are set during DeckGL component initialization.

| WebGL State   |  Value |
|----           |----    |
| depthTest     | true         |
| depthFunc     | gl.LEQUAL |
| blendFuncSeparate | [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA] |

All our layers enable depth test so we are going set this state during initialization. We are also changing blend function for more appropriate rendering when multiple elements are blended.

For any custom needs, these parameters can be overwritten by updating them in [`onWebGLInitialized`](/docs/api-reference/react/deckgl.md#onWebGLInitialized) callback or by passing them in `parameters` object to `drawLayer` method of `Layer` class.


### assembleShaders

The `assembleShaders` function was moved to luma.gl in v4.1 and is no longer re-exported from deck.gl. As described in v4.1 upgrade guide please use `Model` class instead or import it from luma.gl.


### Removed Immutable support

`ScatterplotLayer` and `PolygonLayer` supported immutable/ES6 containers using [`get`](https://github.com/uber/deck.gl/blob/master/src/core/utils/get.js) method, due to performance reasons this support has been dropped.


## Upgrading from deck.gl v4 to v4.1

deck.gl v4.1 is a backward-compatible release. Most of the functionality and APIs remain unchanged but there are smaller changes that might requires developers' attention if they **develop custom layers**. Note that applications that are only using the provided layers should not need to make any changes issues.


### Dependencies

Be aware that deck.gl 4.1 bumps the luma.gl peer dependency from 3.0 to 4.0. There have been instances where this was not detected by the installer during update.


### Layer Life Cycle Optimization

* **shouldUpdateState** - deck.gl v4.1 contains additional optimizations of the layer lifecycle and layer diffing algorithms. Most of these changes are completely under the hood but one  visible change is that the default implementation of `Layer.shouldUpdate` no longer returns true if only the viewport has changed. This means that layers that need to update state in response to changes in screen space (viewport) will need to redefine `shouldUpdate`:

```js
  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged; // default is now changeFlags.propsOrDataChanged;
  }
```

Note that this change has already been done in all the provided deck.gl layers that are screen space based, including the `ScreenGridLayer` and the `HexagonLayer`.

### luma.gl `Model` class API change

* deck.gl v4.1 bumps luma.gl to from v3 to v4. This is major release that brings full WebGL2 enablement to deck.gl. This should not affect you if you are mainly using the provided deck.gl layers but if you are writing your own layers using luma.gl classes you may want to look at the upgrade guide of luma.gl.

The `gl` parameter is provided as a separate argument in luma.gl v4, instead of part of the options object.

```js
// luma.gl v4
new Model(gl, {opts});
// luma.gl v3
new Model({gl, ...opts});
```


### Shader Assembly

Custom layers are **no longer expected** to call `assembleShaders` directly. Instead, the new `Model` class from luma.gl v4 will take shaders and the modules they are using as parameters and assemble shaders automatically.

```js
// luma.gl v4
const model = new Model(gl, {
  vs: VERTEX_SHADER,
  fs: FRAGMENT_SHADER,
  modules: ['fp64', ...],
  shaderCache: this.context.shaderCache
  ...
}));

// luma.gl v3
const shaders = assembleShaders(gl, {
  vs: VERTEX_SHADER,
  fs: FRAGMENT_SHADER,
  modules: ['fp64', 'project64'],
  shaderCache: this.context.shaderCache
});
const model = new Model({
  gl,
  vs: shaders.vs,
  fs: shaders.fs,
  ...
});
```

### Removed Layers

| Layer              | Status       | Replacement         |
| ---                | ---          | ---                 |
| `ChoroplethLayer`  | Removed | `GeoJsonLayer`, `PolygonLayer` and `PathLayer`    |
| `ChoroplethLayer64` | Removed | `GeoJsonLayer`, `PolygonLayer` and `PathLayer`    |
| `ExtrudedChoroplethLayer` | Removed | `GeoJsonLayer`, `PolygonLayer` and `PathLayer`    |

* ChoroplethLayer, ChoroplethLayer64, ExtrudedChoroplethLayer

These set of layers were deprecated in deck.gl v4, and are now removed in v5. You can still get same functionality using more unified, flexible and performant layers:
 `GeoJsonLayer`, `PolygonLayer` and `PathLayer`.

## Upgrading from deck.gl v3 to v4

### Changed Import: The `DeckGL` React component

A small but breaking change that will affect all applications is that the 'deck.gl/react' import is no longer available. As of v4.0, the app is required to import deck.gl as follows:

```js
// V4
import DeckGL from 'deck.gl';
// V3
import DeckGL from 'deck.gl/react';
```

While it would have been preferable to avoid this change, a significant modernization of the deck.gl build process and preparations for "tree-shaking" support combined to make it impractical to keep supporting the old import style.


### Deprecated/Removed Layers

| Layer              | Status       | Replacement         |
| ---                | ---          | ---                 |
| `ChoroplethLayer`  | Deprecated | `GeoJsonLayer`, `PolygonLayer` and `PathLayer`    |
| `ChoroplethLayer64` | Deprecated | `GeoJsonLayer`, `PolygonLayer` and `PathLayer`    |
| `ExtrudedChoroplethLayer` | Deprecated | `GeoJsonLayer`, `PolygonLayer` and `PathLayer`    |
| `EnhancedChoroplethLayer`  | Moved to examples  | `PathLayer`    |

* ChoroplethLayer, ChoroplethLayer64, ExtrudedChoroplethLayer

These set of layers are deprecated in deck.gl v4, with their functionality completely substituted by more unified, flexible and performant new layers:
 `GeoJsonLayer`, `PolygonLayer` and `PathLayer`.

Developers should be able to just supply the same geojson data that are used with `ChoroplethLayer`s to the new `GeoJsonLayer`. The props of the `GeoJsonLayer` are a bit different from the old `ChoroplethLayer`, so proper testing is recommended to achieve satisfactory result.

* EnhancedChoroplethLayer

This was a a sample layer in deck.gl v3 and has now been moved to a stand-alone example and is no longer exported from the deck.gl npm module.

Developers can either copy this layer from the example folder into their application's source tree, or consider using the new `PathLayer` which also handles wide lines albeit in a slightly different way.


### Removed, Changed and Deprecated Layer Properties

| Layer            | Old Prop       | New Prop         | Comment |
| ---              | ---            | ---              | ---     |
| Layer            | `dataIterator` | N/A              | Prop was not functional in v3    |
| ScatterplotLayer | `radius`       | `radiusScale`    | Default has changed from 30 to 1 |
| ScatterplotLayer | `drawOutline`  | `outline`        | |
| ScreenGridLayer  | `unitWidth`    | `cellSizePixels` | |
| ScreenGridLayer  | `unitHeight`   | `cellSizePixels` | | |


#### Note about `strokeWidth` props

All line based layers (`LineLayer and `ArcLayer` and the `ScatterplotLayer` in outline mode) now use use shaders to render an exact pixel thickness on lines, instead of using the `GL.LINE` drawing mode.

This particular change was caused by browsers dropping support for this feature ([Chrome](https://bugs.chromium.org/p/chromium/issues/detail?id=60124) and [Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=634506)).

Also `GL.LINE` mode rendering always had signficant limitations in terms of lack of support for mitering, unreliable support for anti-aliasing and platform dependent line width limits so this should represent an improvement in visual quality and consistency for these layers.

#### Removed prop: `Layer.dataIterator`

This prop has been removed in deck.gl v4. Note that it was not functioning as documented in deck.gl v3.

#### Renamed Props: The `...Scale` suffix

Props that have their name end of `Scale` is a set of props that multiply some existing value for all objects in the layers. These props usually correspond to WebGL shader uniforms that "scaling" all values of specific attributes simultaneously.

For API consistency reasons these have all been renamed with the suffix `..Scale`. See the property table above.

#### Removed lifecycle method: `Layer.willReceiveProps`

This lifecycle was deprecated in v3 and is now removed in v4. Use `Layer.updateState` instead.

#### Changes to `updateTriggers`

Update triggers can now be specified by referring to the name of the accessor, instead of the name of the actual WebGL attribute.

Note that this is supported on all layers supplied by deck.gl v4, but if you are using older layers, they need a small addition to their attribute definitions to specify the name of the accessor.

### AttributeManager changes

#### Removed method: `AttributeManager.setLogFunctions`

Use the new static function `AttributeManager.setDefaultLogFunctions` to set loggers for all AttributeManagers (i.e. for all layers).

#### Removed method: `AttributeManager.addDynamic`

This method has been deprecated since version 2.5 and is now removed in v4. Use `AttributeManager.add()` instead.

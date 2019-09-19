# Upgrade Guide

## Upgrading from deck.gl v7.2 to v7.3

#### Core

- `layer.setLayerNeedsUpdate` is renamed to `layer.setNeedsUpdate()` and the old name will be removed in the next major release.
- Previously deprecated `Layer` class method, `screenToDevicePixels`, is removed. Use luma.gl [utility methods](https://luma.gl/#/documentation/api-reference/webgl-2-classes/device-pixels) instead.

#### Layers

- `ScreenGridLayer`: support is now limited to browsers that implement either WebGL2 or the `OES_texture_float` extension. [coverage stats](https://webglstats.com/webgl/extension/OES_texture_float)
- Some shader attributes are renamed for consistency:

| Layer | Old | New |
| ----- | --- | --- |
| `LineLayer` | `instanceSourceTargetPositions64xyLow.xy` | `instanceSourcePositions64xyLow` |
| | `instanceSourceTargetPositions64xyLow.zw` | `instanceTargetPositions64xyLow` |
| `PathLayer` | `instanceLeftStartPositions64xyLow.xy` | `instanceLeftPositions64xyLow`  |
| | `instanceLeftStartPositions64xyLow.zw` | `instanceStartPositions64xyLow` |
| | `instanceEndRightPositions64xyLow.xy`  | `instanceEndPositions64xyLow`   |
| | `instanceEndRightPositions64xyLow.zw`  | `instanceRightPositions64xyLow` |
| `ArcLayer` | `instancePositions64Low` | `instancePositions64xyLow`  |
| `ScenegraphLayer` | `instancePositions64xy` | `instancePositions64xyLow`  |
| `SimpleMeshLayer` | `instancePositions64xy` | `instancePositions64xyLow`  |


#### @deck.gl/json

- Non-breaking Change: The `_JSONConverter` class has been renamed to `JSONConverter` (deprecated alias still available).
- Non-breaking Change: The `_JSONConverter.convertJson()` method has been renamed to `JSONConverter.convert()`  (deprecated stub still available).
- Breaking Change: The `_JSONConverter` no longer automatically injects deck.gl `View` classes and enumerations. If reqiured need to import and add these to your `JSONConfiguration`.
- Removed: The `JSONLayer` is no longer included in this module. The code for this layer has been moved to an example in `/test/apps/json-layer`, and would need to be copied into applications to be used.


## Upgrading from deck.gl v7.1 to v7.2

#### Breaking Changes

##### Layer methods

Following `Layer` class methods have been removed :

| Removed            | Alternate       | Comment |
| ---              | --- | --- |
| `use64bitProjection`  | use `Fp64Extension` | details in `fp64 prop` section below  |
| `is64bitEnabled`      | use `Fp64Extension` | details in `fp64 prop` section below  |
| `updateAttributes` | `_updateAttributes` | method is renamed |


##### fp64 prop

The deprecated `fp64` prop is removed. The current 32-bit projection is generally precise enough for almost all use cases. If you previously use this feature:

  ```js
  /// old
  import {COORDINATE_SYSTEM} from '@deck.gl/core';

  new ScatterplotLayer({
    coordinateSystem: COORDINATE_SYSTEM.LNGLAT_DEPRECATED,
    fp64: true,
    ...
  })
  ```

  It can be changed to:

  ```js
  /// new
  import {COORDINATE_SYSTEM} from '@deck.gl/core';
  import {Fp64Extension} from '@deck.gl/extensions';

  new ScatterplotLayer({
    coordinateSystem: COORDINATE_SYSTEM.LNGLAT_DEPRECATED,
    extensions: [new Fp64Extension()],
    ...
  })
  ```

##### Color Attributes and Uniforms

All core layer shaders now receive **normalized** color attributes and uniforms. If you were previously subclassing a core layer with custom vertex shaders, you should expect the color attributes to be in `[0, 1]` range instead of `[0, 255]`.

##### project64 Shader Module

The `project64` shader module is no longer registered by default. If you were previously using a custom layer that depends on this module:

  ```js
  getShaders() {
    return {vs, fs, modules: ['project64']};
  }
  ```

  It can be changed to:

  ```js
  import {project64} from '@deck.gl/core';

  getShaders() {
    return {vs, fs, modules: [project64]};
  }
  ```
#### CPU Grid layer and Hexagon layer updateTriggers

`getElevationValue`, `getElevationWeight` and `getColorValue`, `getColorWeight` are now compared using `updateTriggers` like other layer [accessors](https://github.com/uber/deck.gl/blob/master/docs/developer-guide/using-layers.md#accessors). Update them without passing updateTriggers will no longer trigger layer update.

#### Deprecations

IE support is deprecated and will be removed in the next major release.


## Upgrading from deck.gl v7.0 to v7.1

#### Breaking Changes

- Fixed a bug where `coordinateOrigin`'s `z` is not applied in `METER_OFFSETS` and `LNGLAT_OFFSETS` coordinate systems.
- If your application was subclassing `GridLayer`, you should now subclass `CPUGridLayer` instead, and either use it directly, or provide it as the sublayer class for `GridLayer` using `_subLayerProps`:

  ```js
  class EnhancedCPUGridLayer extends CPUGridLayer {
  // enhancments
  }

  // Code initilizing GridLayer
  const myGridLayer = new GridLayer({
    // props
    ...
    // Override sublayer type for 'CPU'
    _subLayerProps: {
      CPU: {
        type: EnhancedCPUGridLayer
      }
    }
  });
  ```

#### Deprecations

- `getColor` props in `ColumnLayer` and `H3HexagonLayer` are deprecated. Use `getLineColor` and `getFillColor` instead.

## Upgrading from deck.gl v6.4 to v7.0

#### Submodule Structure and Dependency Changes

- ` @deck.gl/core` is moved from `dependencies` to `devDependencies` for all submodules. This will reduce the runtime error caused by installing multiple copies of the core.
- The master module `deck.gl` now include all submodules except ` @deck.gl/test-utils`. See [list of submodules](/docs/get-started/getting-started.md#selectively-install-dependencies) for details.
- `ContourLayer`, `GridLayer`, `HexagonLayer` and `ScreenGridLayer` are moved from ` @deck.gl/layers` to ` @deck.gl/aggregation-layers`. No action is required if you are importing them from `deck.gl`.
- ` @deck.gl/experimental-layers` is deprecated. Experimental layers will be exported from their respective modules with a `_` prefix.
  + `BitmapLayer` is moved to ` @deck.gl/layers`.
  + `MeshLayer` is renamed to `SimpleMeshLayer` and moved to ` @deck.gl/mesh-layers`.
  + `TileLayer` and `TripsLayer` are moved to ` @deck.gl/geo-layers`.

#### Deck Class

Breaking Changes:

- `onLayerHover` and `onLayerClick` props are replaced with `onHover` and `onClick`. The first argument passed to the callback will always be a valid [picking info](/docs/developer-guide/interactivity.md#the-picking-info-object) object, and the second argument is the pointer event. This change makes these two events behave consistently with other event callbacks.

#### Layers

Deprecations:

- `ArcLayer` and `LineLayer`'s `getStrokeWidth` props are deprecated. Use `getWidth` instead.

Breaking Changes:

- `HexagonCellLayer` is removed. Use [ColumnLayer](/docs/layers/column-layer.md) with `diskResolution: 6` instead.
- A bug in projecting elevation was fixed in `HexagonLayer`, `GridLayer` and `GridCellLayer`. The resulting heights of extruded grids/hexagons have changed. You may adjust them to match previous behavior by tweaking `elevationScale`.
- The following former experimental layers' APIs are redesigned as they graduate to official layers. Refer to their documentations for details:
  - [BitmapLayer](/docs/layers/column-layer.md)
  - [SimpleMeshLayer](/docs/layers/simple-mesh-layer.md)
  - [TileLayer](/docs/layers/tile-layer.md)
  - [TripsLayer](/docs/layers/trips-layer.md)

#### Lighting

The old experimental prop `lightSettings` in many 3D layers is no longer supported. The new and improved settings are split into two places: a [material](https://github.com/uber/luma.gl/tree/master/docs/api-reference/core/materials) prop for each 3D layer and a shared set of lights specified by [LightingEffect](/docs/effects/lighting-effect.md) with the [effects prop of Deck](/docs/api-reference/deck.md#effects).
Check [Using Lighting](/docs/developer-guide/using-lighting.md) in developer guide for more details.

#### Views

v7.0 includes major bug fixes for [OrbitView](/docs/api-reference/orbit-view.md) and [OrthographicView](/docs/api-reference/orthographic-view.md). Their APIs are also changed for better clarity and consistency.

Breaking Changes:

* View state: `zoom` is now logarithmic in all `View` classes. `zoom: 0` maps one unit in world space to one pixel in screen space.
* View state: `minZoom` and `maxZoom` now default to no limit.
* View state: `offset` (pixel-shift of the viewport center) is removed, use `target` (world position `[x, y, z]` of the viewport center) instead.
* Constructor prop: added `target` to specify the viewport center in world position.
* `OrthographicView`'s constructor props `left`, `right`, `top` and `bottom` are removed. Use `target` to specify viewport center.
* `OrbitView`'s constructor prop `distance` and static method `getDistance` are removed. Use `fovy` and `zoom` instead.

#### project Shader Module

Deprecations:

- `project_scale` -> `project_size`
- `project_to_clipspace` -> `project_common_position_to_clipspace`
- `project_to_clipspace_fp64` -> `project_common_position_to_clipspace_fp64`
- `project_pixel_to_clipspace` -> `project_pixel_size_to_clipspace`

#### React

If you are using DeckGL with react-map-gl, ` @deck.gl/react@^7.0.0` no longer works with react-map-gl v3.x.


## Upgrading from deck.gl v6.3 to v6.4

#### OrthographicView

The experimental `OrthographicView` class has the following breaking changes:

- `zoom` is reversed (larger value means zooming in) and switched to logarithmic scale.
- Changed view state defaults:
  + `zoom` - `1` -> `0`
  + `offset` - `[0, 1]` -> `[0, 0]`
  + `minZoom` - `0.1` -> `-10`
- `eye`, `lookAt` and `up` are now set in the  `OrthographicView` constructor instead of `viewState`.

#### ScatterplotLayer

Deprecations:

- `outline` is deprecated: use `stroked` instead.
- `strokeWidth` is deprecated: use `getLineWidth` instead. Note that while `strokeWidth` is in pixels, line width is now pecified in meters. The old appearance can be achieved by using `lineWidthMinPixels` and/or `lineWidthMaxPixels`.
- `getColor` is deprecated: use `getFillColor` and `getLineColor` instead.

Breaking changes:

- `outline` / `stroked` no longer turns off fill. Use `filled: false` instead.

#### GeoJsonLayer

Breaking changes:

- `stroked`, `getLineWidth` and `getLineColor` props now apply to point features (rendered with a ScatterplotLayer) in addition to polygon features. To revert to the old appearance, supply a `_subLayerProps` override:

```js
new GeoJsonLayer({
  // ...other props
  stroked: true,
  _subLayerProps: {
    points: {stroked: false}
  }
});
```


## Upgrading from deck.gl v6.2 to v6.3

#### GridLayer and HexagonLayer

Shallow changes in `getColorValue` and `getElevationValue` props are now ignored by default. To trigger an update, use the `updateTriggers` prop. This new behavior is aligned with other core layers and improves runtime performance.

#### Prop Types in Custom Layers

Although the [prop types system](/docs/developer-guide/custom-layers/prop-types.md) is largely backward-compatible, it is possible that some custom layers may stop updating when a certain prop changes. This is because the automatically deduced prop type from `defaultProps` does not match its desired usage. Switch to explicit descriptors will fix the issue, e.g. from:

```js
MyLayer.defaultProps = {
  prop: 0
};
```

To:

```js
MyLayer.defaultProps = {
  prop: {type: 'number', value: 0, min: 0}
};
```


## Upgrading from deck.gl v6.1 to v6.2

#### fp64

The default coordinate system `COORDINATE_SYSTEM.LNGLAT` is upgraded to offer high-precision results in a way that is much faster and more cross-platform compatible. The `fp64` layer prop is ignored when using this new coordinate system. You can get the old fp64 mode back by using `coordinateSystem: COORDINATE_SYSTEM.LNGLAT_DEPRECATED` with `fp64: true`.


## Upgrading from deck.gl v5.3 to v6.0


#### luma.gl v6.0

deck.gl v6.0 brings in luma.gl v6.0 which is a major release with a few breaking changes. The change that is most likely to affect deck.gl applications is probably that the way the `GL` constant is imported has changed. For details, see to the luma.gl [Upgrade Guide](https://luma.gl/#/documentation/overview/upgrade-guide).


#### Pixel sizes

Pixel sizes in line, icon and text layers now match their HTML/SVG counterparts. To achieve the same rendering output as v5, you should use half the previous value in the following props:

* `ArcLayer.getStrokeWidth`
* `LineLayer.getStrokeWidth`
* `IconLayer.getSize` or `IconLayer.sizeScale`
* `TextLayer.getSize` or `TextLayer.sizeScale`
* `PointCloudLayer.radiusPixels`


#### Accessors

All layer accessors that support constant values have had their default values changed to constants. For example, `ScatterplotLayer`'s default `getRadius` prop is changed from `d => d.radius || 1` to `1`. All dynamic attributes now must be explicitly specified. This change makes sure that using default values results in best performance.


#### Views and Controllers

* (React only) Viewport constraint props: `maxZoom`, `minZoom`, `maxPitch`, `minPitch` are no longer supported by the `DeckGL` component. They must be specified as part of the `viewState` object.
* (React only) `ViewportController` React component has been removed. The functionality is now built in to the `Deck` and `DeckGL` classes.
* `Deck.onViewportChange(viewport)` etc callbacks are no longer supported. Use `Deck.onViewStateChange({viewState})`
* `DeckGL.viewport` and `DeckGL.viewports` props are no longer supported. Use `DeckGL.views`.


#### ScreenGridLayer

`minColor` and `maxColor` props are deprecated. Use `colorRange` and `colorDomain` props.


#### Shader Modules

Some previously deprecated `project_` module GLSL functions have now been removed.

#### Attribute

`isGeneric` field of attribute object returned by `AttributeManager`'s update callbacks is replaced by `constant`. For more details check [`attribute manager`](/docs/api-reference/attribute-manager.md).

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

`ScatterplotLayer` and `PolygonLayer` supported immutable/ES6 containers using [`get`](https://github.com/uber/deck.gl/blob/5.0-release/src/core/utils/get.js) method, due to performance reasons this support has been dropped.


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

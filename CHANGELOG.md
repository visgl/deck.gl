# Change Log

All notable changes to deck.gl will be documented in this file.

Official releases are documented first. Beta releases are listed
towards the end of this document.

<!--
Each version should:
  List its release date in the above format.
  Group changes to describe their impact on the project, as follows:
  Added for new features.
  Changed for changes in existing functionality.
  Deprecated for once-stable features removed in upcoming releases.
  Removed for deprecated features removed in this release.
  Fixed for any bug fixes.
  Security to invite users to upgrade in case of vulnerabilities.
Ref: http://keepachangelog.com/en/0.3.0/
-->

## Recent Dev Releases

#### [v4.0.0-beta.3]
- Add PointCloudLayer
- FIX: `onHover` and `onClick` are no longer called on layers that are not affected
- BREAKING: `layer.pick()` is renamed to `layer.getPickingInfo()`, must return info object

#### [v4.0.0-beta.2]
- Bumps luma.gl with some hotfixes
- Remove unfinished example
- Doc improvements (upgrade guide)
- NEW: PointDensityGridLayer

#### [v4.0.0-beta.1]

API AUDIT CHANGES:
- `GeoJsonLayer` `getHeight` => `getElevation`
- `GeoJsonLayer` Docs: Clarified that elevation is always in `meters` for cartographic projection modes

- `PolygonLayer` `getHeight` => `getElevation`
- `PolygonLayer` Docs: Clarified that elevation is always in `meters` for cartographic projection modes
- `PolygonLayer` Docs: documented missing props
- `PolygonLayer` Docs: Marked `lightSettings` as experimental

- `PathLayer` `getWidth` => `getStrokeWidth`
- `PathLayer` `strokeWidth` => `strokeWidthScale`
- `PathLayer` `strokeMinPixels` => `strokeWidthMinPixels`
- `PathLayer` `strokeMaxPixels` => `strokeWidthMaxPixels`

- `HexagonLayer` Docs: Marked `lightSettings` as experimental
- `HexagonLayer` Docs: Marked `selectedPickingColor` as experimental
- `GridLayer` Docs: Marked `lightSettings` as experimental

- Cleanup: More layers now only imports the `get` utility function instead
  of the full `Container` object from utils - this provides most of the
  benefits with smaller impact on the code.

DOCS
  - Moved docs into 4.0 subfolder to support publishing multiple doc versions
    from a single tree.



#### [v3.1.0-beta.16] -
- NEW: Main example now provides UI to modify layer props
- NEW: Main example now has GeoJson test file with all GeoJson geometry types.
- NEW: GridLayer
- FIX: GeoJson points now render correctly
- FIX: Mutation issue in defaultProps
- Demo now installs and builds stand-alone
- Picking improvements - order of function calls changed to enable layer overrides
- PathLayer: new props
- PathLayer: geometry generation performance.
- Webpack config improvements to enable tree-shaking

#### [v3.1.0-beta.15] -
CHANGE: Revert to babel compilation to expose the dist file tree rather than a bundle

#### [v3.1.0-beta.14] -
FIX: GeoJson path layer
FIX: defaultProps handling

#### [v3.1.0-beta.13] -
NEW: GeoJsonLayer cleanup
NEW: HexagonLayer

#### [v3.1.0-beta.12] -
FIX: Broken dist export

#### [v3.1.0-beta.11] -

NEW: GeoJsonLayer, PathLayer
NEW: PolygonLayer with flat, extrusion and wireframe (5x faster than Choropleth)
NEW: Support immutable geojson data in choropleth layers
NEW: Add benchmarks for node and browser.js (#299)
NEW: Lighting supported on polygon layer. New lighting shader module.
FIX: FP64 math function improvement, bug fixes and speed
FIX: Set Viewport project/unproject default to screen coordinates
- Main example refactored
- Shader tests as webpack
- 64bit layers as subclasses of 32 bit layers
- Choropleth Layers now in deprecated folder
- Remove lodash.flattendeep and geojson-normalize module dependencies



#### [v3.1.0-beta.10] -
FIX: Loosen luma.gl peer dependency

#### [v3.1.0-beta.9] -
FIX: Additional model matrix cleanup and streamlining

#### [v3.1.0-beta.8] -
FIX: Model matrix cleanup

#### [v3.1.0-beta.7] -
- FIX: Re-export of beta6 with fixed config.

#### [v3.1.0-beta6] -
- FIX: Fix to model matrix in meter offsets mode (now handles rotations in addition to translations)
- BREAKING: `react` and `experimental` entry points no longer supported (after webpack transition).
- CHANGE: Now packaged using Webpack 2 - exposed as a single bundle rather than a directory of files.
- UPDATE: Simplification and cleanup of main example.

#### [v3.1.0-beta5] -
- FIX: Disable viewport comparison (temporarily) as it broke `METERS` mode.
- CHANGE: Remove react-autobind dependency (deck.gl/react now includes a minimal
  `autobind` implementation).
- NEW: Additional examples included, including (WIP) google maps.

#### [v3.1.0-beta4] -
- FIX: Restore `COORDINATE_SYSTEM` export

#### [v3.1.0-beta3] -
- CHANGE: Move shaderlib into src, remove unneeded scripts

#### [v3.1.0-beta2] - Working modelMatrix
- FIX: modelMatrix now applied correctly in both drawing and picking
- NEW: Main example now has slider to separate layers

#### [v3.1.0-beta1] - Use new `Viewport` from `viewport-mercator-project`

- NEW: Support for per-layer model matrices (layer.modelMatrix props)
- NEW: Support for non-mercator Viewports
  The `DeckGL` React component now takes a generic `Viewport` prop that can be
  created with arbitrary `view` and `projection` matrices.
  If not supplied, it attempts to create a viewport from supplied mercator
  parameters, which corresponds to behavior before the change.
- NEW: `LayerManager.setViewport` replaces `LayerManager.setContext`
Internal changes:
- `WebGLViewport` now a wrapper around a supplied `Viewport` rather than a subclass.


## Official Releases

### deck.gl v3

#### [3.1.1] - 2016-12-1

- FIX: ExtrudedChoroplethLayer64 - Now updates uniforms when props change
- HOTFIX ScatterplotLayer: Fix instancePositions regression in 3.1.0
- HOTFIX DeckGL: Fix PropType warning regression in 3.1.0 (layers/effects props)

#### [3.1.0] - 2016-11-30

- LineLayer: Support elevations (z coords on positions)
- LineLayer64: Support elevations (z coords on positions)
- Scatterplot: Enable updateTriggers on instanceRadius, separate from positions.
- EXPERIMENTAL FEATURE: ReflectionEffect
- INTERNAL: Target build env moved to Node 6. Travis tests now run on 6 & 7.

#### [3.0.9, 3.0.10] - 2016-11-18

- Bumped viewport-mercator-project version for the unproject fix.
- Updated dependency versions (#229)
- Added test code for attribute-manager (#213)
- Added minMax radius for the scatterplot-layer (#230)

#### [3.0.8] - 2016-11-18

- Performance optimization: remove unnecessary gl.getParameter() calls (#227)

#### [3.0.7] - 2016-11-16

- Fixed precision issue for vec2_mix_fp64 function (#223)
- Added mouse event object to hover and click event parameter (#255)

#### [3.0.6] - 2016-11-14

- Bug fix for picking not returning x, y coordinates (#220)

#### [3.0.5] - 2016-11-14

- Performance optimization: prevent redundant data calculation (#222)

#### [3.0.3] - 2016-11-14

- Bug fixes for ScatterplotLayer not being updated with new data prop (#215)
- Performance optimization: prevent fbo from reallocating every time (#217)

#### [3.0.2] - 2016-11-12

- Performance optimization for examples in gh-pages

#### [3.0.1] - 2016-11-11

- Enable blending by default
- Fix syntax highlighting in gh-pages

#### [3.0.0] - Major deck.gl Release

For details see [What's New](docs/whats-new.md)

### deck.gl v2

#### [2.4.10] - 2016-09-20
- Added line width support to the choropleth layer.

#### [2.4.9] - FIX: Picking of instanced layers restored
- Layer.calculateInstancePickingColors now gets correct numInstances argument.
- Bumps luma.gl to include Linux fix.

#### [2.4.8] - TBD
- Move glslify to "dependencies" in package.json
- Fix bool uniform that webgl in certain environment handles it differently

#### [2.4.7] - 2016-09-06
- Fix issue of mercatorEnabled not working on Linux

#### [2.4.6] - 2016-09-06
- Fix issue where 0 opacity is interpreted as default opacity
- Fix issue with printing of layerName in debug messages crashes

#### [2.4.5] - 2016-08-31
- Fixed picking for the choropleth layer

#### [2.4.4] - 2016-08-17
- Added deckgl-overlay canvas ID and customize style support

#### [2.4.3] - 2016-08-16
- Fix document / add customize style support to the canvas (@contra)

#### [2.4.2] - 2016-08-16
- Added per point radius support for the scatterplot-layer

#### [2.4.1] - 2016-08-15
- Fixed primitive distortion bug for the scatterplot and hexagon-layer

#### [2.4.0] - 2016-08-12
- Added non-LatLng coordinate support for
  - arc-layer
  - choropleth-layer
  - line-layer
  - scatterplot-layer

#### [2.3.0] - 2016-08-06
- Added line-layer support

#### [2.2.5] - 2016-08-02
- Added per point color support for the scatterplot-layer

#### [2.2.4] - 2016-07-13
- Performance improvement

#### [2.2.0] - 2016-07-05
- Added perspective mode, 3D camera support
- Added unit tests
- Tons of refactoring and performance improvement

#### [2.1.0] - 2016-03-30
- Added precompile support
- Added data deep comparison support
- Added better uniform error message support
- Changed to use the new Luma.gl API
- Moved babel-related libraries from devDependence to dependency
- Changed default blending function (ZERO -> ONE_MINUS_SRC_ALPHA)
- Bug in getNumberInstances

#### [2.0.0] - 2016-02-29
- Retina display support
- Performance refactoring
- Switched the underlying rendering framework to
  [luma.gl](https://github.com/uber/luma.gl)
- Fixed picking on retina/regular display

## deck.gl v1

#### [1.0.0] - 2016-01-06
- Initial commit of the open-source version of deck.gl

# Beta Releases

### Beta-3.0.0 Releases

#### [v3.0.0-rc6] -
- Support layerIndex uniform to solve z-fighting
- gl_FragDepth extension to fix Voronoi Layer (#186)
- Remove Scatterplot64(Meters) Layer for now (#188)
- FIX: Made Viewport.getUniforms() overridable and more debuggable

#### [v3.0.0-rc5] -
- FIX: METERS mode high precision z coordinate restored

#### [v3.0.0-rc4] -
- FIX: METERS mode high precision restored
- REMOVED unfinished GeoJson layer
- FIX: gl.viewport only called when view size changes

#### [v3.0.0-rc3] -
- FIX: Uniforms arg on Layer.draw()

#### [v3.0.0-rc2] -
- FIX to ChoroplethLayer64 colors
- FIX: METERS MODE
- Viewport now imported from viewport-mercator-project
- Dependency cleanup - several no longer needed dependencies removed
- Doc now serves locally from relative directories


#### [v3.0.0-rc1] - First Release Candidate, Final API changes
- BREAKING: Removed pickInfo life cycle method - can be handled by pick
- FEATURE: Add `onLayerClick` and `onLayerHover` methods to deck.gl wrapper.
- FIX: Restore multilayer picking. Fixes #136.
- PERF: Enable Uint8Array color attributes
  - Layer.instancePickingColors and Scatterplot.instanceColors now Uint8Arrays

#### [v3.0.0-beta31] - Stabilization/Performance round
- FIX: Scatterplot lineWidth warning
- FIX: context.viewport = null in draw
- FIX: opacity prop.
- FEATURE: Enables prop diff tracing (deck.log.priority = 1)
- PERF: Defeat spurious redraws

#### [v3.0.0-beta30] - Perf fixes - significantly reduce GPU load.
- FIX: compareProps and updateTriggers fixes
- PERF: reduce unnecessary updates
- Doc updates

#### [v3.0.0-beta29] -
- FIX: ArcLayer flickering last segments
- FIX: Scatterplot Layer exception
- FIX: Layer lifecycle - initialization/update of sublayers
- Doc update of Layers


#### [v3.0.0-beta28] -
- BREAKING CHANGE: Picking API final version. Fixes #115. Fixes #116.
- FIX: Ignore null layers
- FIX: Warns once instead of throws on deprecated props.
- FIX: Pinned babel-plugin-glslify version to avoid broken release
- Remove broken layers (HexagonLayer and PointCloudLayer).

#### [v3.0.0-beta27] - Broken
- npm publish failed, no dist

#### [v3.0.0-beta26] -
- FEATURE: line width now takes device pixel ratio into account
- FEATURE: New life cycle methods, old methods deprecated
- FIX: Fix for context.viewport initialization order
- FIX: `DeckGL` component now cancels animation loop on unmount.
- BREAKING: Removed `blending` prop from react components
- FIX: ScreenGridLayer
- FEATURE: ScreenGridLayer now have accessors (getPosition, getWeight) and custom
    color ramps (minColor, maxColor)

#### [v3.0.0-beta25] -
- FEATURE: Adds drawOutline option to ScatterplotLayer.
- FIX: update context.viewport issue #128
- BREAKING: deepCompare prop changed to dataComparator. lodash.isequal dependency removed.

#### [3.0.0-beta24] -
- FIX: Picking in most layers
- FIX: Initialization of sublayers
- Exports more symbols from lib
- 64 bit ExtrudedChoroplethLayer
- 64 bit layers in place
- GLSL library alignement 64 bit projections

#### [3.0.0-beta23] -
 - FEATURE: `Layer.pick` lifecycle method - Let's layers take control of picking
 - FEATURE: Support for Composite Layers
 - FEATURE: new GeoJsonLayer - Initial composite layer, only Polygons for now.
 - BREAKING: Introducing `context` that is shared between layers.
    gl and viewport moved from state to context. This implies that apps
    no longer need to pass {lng,lat,zoom,pitch,bearing} to each layer, only
    to the `DeckGL` react component.
 - BREAKING: GridLayer renamed to ScreenGridLayer
 - BREAKING: All layers now use `assembleShaders`
 - BREAKING: GLSL `project` package - shader functions renamed to have
   `project` prefix, in line with conventions for new shader package system.
 - MISC: Documentation updates.
 - MISC: WebGLRenderer/DeckGl react component cleanup, removed unusued methods.

#### [3.0.0-beta22] -
 - FIX: Perspective projection matrix "far plane" now covers negative Z coords
 - FEATURE: Improved precision trigonometry library for Intel GPUs
 - FEATURE: ChoroplethLayer64
 - FEATURE: Experimental "Cone Based" VoronoiLayer
 - CHANGE: shaderAssembler system reorganization

#### [3.0.0-beta21] -
 - FIX: Now takes layer props into account when generating projection uniforms

#### [3.0.0-beta20] -
 - DOCUMENTATION: Article updates
 - FIX: Fix broken shader export in beta19

#### [3.0.0-beta19] -
 - BREAKING - New GLSL projection methods and assembleShader function.
   All layers updated.
 - FIX - ArcLayer64 flickering fixed by high precision workaround.

#### [3.0.0-beta18] -
 - BREAKING: No longer use Camera/Scene to render. Enabler for issue #5.
 - BREAKING: Sample layers now available through `import 'deck.gl/samples';
 - FEATURE: FP64 layers now exported by default import 'deck.gl'
 - BREAKING: DeckGLOverlay renamed to DeckGL: `import DeckGL from 'deck.gl/react';`
 - FIX: GridLayer
 - FEATURE: ChoroplethLayer now renders MultiPolygons and Polygons with holes

#### [3.0.0-beta17] - 64bit layers and more.
 - FEATURE: New GLSL library: 64bit emulated floating point
 - FEATURE: New layer: ScatterplotLayer64: Sample 64-bit, high precision layer
 - FEATUREY: ArcLayer can now specify separate start end end color for each arc.
 - FIX: Add high precision version of `tan` as Intel GPU workaround.
 - INTERNAL: eslint now uses stronger rules. Fix new eslint warnings.

#### [3.0.0-beta16] -
 - Breaking change - rename `disableMercatorProject` prop to `mercatorEnabled`
 - Add experimental layers folder
 - Add separate import files for experimental layers and viewport
   import {PointCloudLayer, ...} from 'deck.gl/experimental'
   import Viewport from 'deck.gl/viewport'
- Add test cases for top-level exports
- Code reorganization

#### [3.0.0-beta15] - Merge 2.4.9 fixes

#### [3.0.0-beta14] - Viewport improvements
- Revert to 2-series luma.gl (no longer need beta release)
- Viewport improvements

#### [3.0.0-beta13] -
- Breaking Change: Standardize parameters in layers to always expect arrays.
- Remove separate attribute updater definitions to simplify layer subclass
  creation

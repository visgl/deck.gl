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

### Change Log
All notable changes to deck.gl will be documented in this file.

#### [Ongoing]
- Tutorials of using deck.gl


### Beta-3.0.0 Releases

#### [v3.0.0-beta25] -
- FEATURE: Adds drawOutline option to ScatterplotLayer.
- FIX: update context.viewport issue #128

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

### Official Releases

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

#### [1.0.0] - 2016-01-06
- Initial commit of the open-source version of deck.gl

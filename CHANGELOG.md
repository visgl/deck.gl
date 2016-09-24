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

### Beta-3.0.0 CHECKLIST
deck.gl
- [ ] New documentation on gh-pages to replace the current API docs in README.MD
- [ ] High-precision (64-bit) versions of core layers
- [ ] Add performance test layers
- [ ] Fix broken HexagonLayer angle
- [ ] Grid layer, fix or remove
- [ ] Point Cloud layer example
- [ ] Viewport class - fitbounds replacement
- [ ] Viewport class supported as input parameter to all layers (possibly
      through react context)
luma.gl
- [ ] High-precision (64-bit) floating point calculation support
- [ ] New logging library with performance instrumentation
react-map-gl
- [ ] Viewport class exported from deck.gl and react-map-gl layers able to use it.
- [ ] Map layers use new projects
- [ ] All dependencies on mapbox transform removed
- [ ] map-interactions independent of react-map-gl, used to control deck.gl
      visualizations without maps?

### Beta-3.0.0 Releases

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

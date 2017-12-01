# Change Log

All notable changes to deck.gl will be documented in this file.

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

## Official Releases

#### [4.1.6] - 2017-12-01
- PolygonLayer- add elevationScale, fix updateTriggers.getElevation doesn't trigger updateGeometry (#1046)
- Fix spike issue in path layer (#1200)
- update sharp end fix for 64bits pathlayer shader (#1202)

#### [4.1.5] - 2017-10-13
- Specify meter unit for getLineWidth in geojson layer (#1029)
- Fix point missing issue for 64 bits point cloud layer vertex shader(#1028)
- fix point cloud data paths (#1013)

#### [4.1.4] - 2017-10-06
- fix bug where layer does not update on updateTriggers change (#971)

#### [4.1.3] - 2017-9-29

- Fix picking buffer clear color. (#931)
- Handle recursive layer ids, update LayerManager docs and tests. (#933)
- Hexagon Layer: Add getElevationValue to calculate hexagon elevation by aggregation (#938)
- Update docs with missing layer props. (#959)
- Grid Layer: Add getElevationValue to enable grid elevation by aggregation (#954)
- Hexagon/Grid Layer: Fix FP64 mode rendering when elevation < 0.0 (#968)
- DeckGL: Add initWebGLParameters prop to ensure examples on master work (#969)

#### [4.1.2] - 2017-9-1

- Bump luma.gl dependency from 4.0.1 to 4.0.2.
- Fix the icon rotation issue (#900)
- Fix sin calculation using sin() (#885)

#### [4.1.1] - 2017-8-25

- Example fixes. (#884)
- getShaders() : update docs and examples. (#876)
- Make sure blend modes override layer parameters during picking (#879)
- Add depthTest:false to ScreenGridLayer (#875)
- Layer.parameters: Update docs and forward in GeojsonLayer (#874)
- Fix S2Layer fill color (#870)
- Fix Maximum call stack size exceeded error in grid aggregator (#868)
- Fix S2Layer base class and props. (#869)
- Doc paragraph reformatting. Bump code links to 4.1-release (#854)
- A pass on refreshing picking and event handling docs (#850)
- Update dependencies to use luma 4.0.1 version (#849)
- interaction bug fixes (#817)

### deck.gl v4.1

### deck.gl v4.0

#### [4.0.0] - 2017-4-6 Major deck.gl Release

For details see What's New
### deck.gl v3.0

#### [3.1.3] - 2017-1-25

- HOTFIX: Fixed project_fp64 issue under linux + nvidia (#315)

#### [3.1.2] - 2017-1-19

- HOTFIX: Fixed some 64-bit math issue on some Nvidia GPUs (#286)
- HOTFIX: Fixed an issue in scatterplot64 that NaN got passed to GPU (#287)
- Disable blending when rendering to picking framebuffer (#288)

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

### deck.gl v1

#### [1.0.0] - 2016-01-06
- Initial commit of the open-source version of deck.gl

## Beta Releases

### v4.1 Beta Releases

#### deck.gl v4.1.0-beta.6
- Remove 'project' module in layer model creation as it's provided by default (#787)
- Fix `HexagonCellLayer` cell size changes while zomming (#785)
- Fix point projection in `GridCellLayer` (#784)

#### deck.gl v4.1.0-beta.5

- Fix `GridCellLayer` cellSize changing on zooming (#782)
- Add `getSubLayerClass`, `getSubLayerProps` methods to `GridLayer` and `HexagonLayer` for easy subclassing (#783)
- Add `pointRadiusScale`, `pointRadiusMinPixels` and `pointRadiusMaxPixels` props to GeoJsonLayer (#781)
- FIX: Fix the bug in shaders of LabelLayer that rotation angle is clamped to 0 - 180 degree (#780)
- Add the project module to the default module for our new shader system (#779)

#### deck.gl v4.1.0-beta.4
- Picking clean up (#774)
- Prevent picking when dragging (#775)
- Controllers bug fix (#777)
- Rename `settings` prop to `parameters`

#### deck.gl v4.1.0-beta.3
- WEBSITE update (#768)
- FIX: polygonOffset (#770)
- Use luma.gl shader modules (#772)
- DOC: Vis suite blog posts (#773)

#### deck.gl v4.1.0-beta.2
- NEW: `getUniformsFromViewport` refactored into `project` shader module's `getUniforms`.
- FIX: Update canvas size to match with device framebuffer size.
- WEBSITE: Links to other frameworks (#753)
- FIX: Avoid deep comparison error in compareProps when oldProp is empty (#754)
- FIX: Fix the fluctuation of the end cap for path layer 64bit (#755)
- MapController clean up (#757)
- SIZE: Remove gl-matrix (#759
- OrbitController clean up (#761)
- EXAMPLE: Fix updateState issue in TagMap: add shouldUpdateState function (#762)
- NEW: Replaced explicit calls to `assembleShaders` with `Model` parameters. (#764, #765, #767)

#### deck.gl v4.1.0-beta.1
- webpack configuration cleanup
- EXAMPLES: Experimental TagMap Layer (#735, @zhan1486)
- FIX: Use external buffers for layer attributes
- SEER integration upgrades (#744)
- Import luma.gl v4.0.0-beta.1 (#752)

#### deck.gl v4.1.0-alpha.15

- FIX: Tween.js import (#730, #734)
- Example config files cleaned up (#731, #732)
- queryVisibleObjects (renamed from queryObject) (#736)
- Event Management Refactor (#738)
- SEER integration upgrades (#740)
- Graph Layer example refactor (#742)
- New luma state management API
- WEBSITE: demo renamed to website

#### deck.gl v4.1.0-alpha.14

- "Stateless" picking (#717)
- Lifecycle performance tuning (#721)
- SEER performance badges (#720, #722)
- Custom "spy" class to fix test-browser
- FIX: Using external buffers for layer attributes
- FIX: Shadercache import (#727)

#### deck.gl v4.1.0-alpha.13
- Lifecycle tuning (#708)
- Seer performance badges (#709)
- Event Manager API Audit fixes (#710)
- FIX external buffers for layer attributes (#711)
- Travis CI fixes (#713)
- Examples now on react-map-gl v3 (#714)
- Stateless picking (uses new luma.gl features) (#715)
- Custom spy for tests (#716)

#### deck.gl v4.1.0-alpha.12
- Seer fix (#706)

#### deck.gl v4.1.0-alpha.11
- EXAMPLE: PlotLayer example improvement (#689)
- FIX: Fix 64-bit PathLayer (#704)
- TEST: EventManager tests (#705)

#### deck.gl v4.1.0-alpha.10
- FIX: fix point cloud examples bug (#680)
- FIX: fix modelMatrix in meter offset mode (#678)
- NEW: Add queryObjects api to DeckGL component (#673)
- Flatten CompositeLayer.renderLayer() output (#676)

#### deck.gl v4.1.0-alpha.9
- EXAMPLES: update the PlotLayer example with axis labels (#671)
- FIX: Fix radiusMinPixels and radiusMaxPixels for METER_OFFSETS in scatterplot (#607)
- TEST: Fix the rendering test (#672)
- FIX: Use luma.gl v4.0.0-alpha.7 to resolve the texture loading issue (#665)

#### deck.gl v4.1.0-alpha.8

- FIX: EventManager error in trackpad scroll
- FIX: `mousemove` is fired twice during drag
- FIX: drag events
- FIX: error when dragging outside of the canvas
- FIX: IconLayer does not rerender after texture is loaded

#### deck.gl v4.1.0-alpha.7

- FIX: Import in node

#### deck.gl v4.1.0-alpha.6

- FIX: Composite layers now pass `getPolygonOffset` prop to children
- FIX: `PolygonLayer` and `GeoJsonLayer` order sublayers dynamically for better blending behavior

#### deck.gl v4.1.0-alpha.5

- NEW: `getPolygonOffset` prop of the base Layer class (#649)
- NEW: Modularize support for raw and gestural input events (#636)

#### deck.gl v4.1.0-alpha.4
Versions 4.1.0 alpha 1, 2 and 3 have been unpublished due to a wrong tagging.

- PERFORMANCE: Optimize encodePickingColor by replacing the naive math with bit-wise operations (#631)
- FEAT: Add `pickingRadius` prop (#641)
- FEAT: Seer integration and performace improvements
- PERFORMANCE: Compiled are now cached for reuse so that same shaders are not recompiled for the same type of layers (#613)
- PERFORMANCE: getViewportUniforms optimization (#586)
- BREAKING: Only composite layers have `renderLayers` methods (#585)
- BREAKING: Only primitive layers' `draw` methods are called during render (#585)
- `GridLayer` add `coverage`, `lowerPercentile`, `upperPercentile` and `getColorValue` to layer prop (#614)
- `IconLayer` add `getAngle` for rotating each icon with a specific angles (in degrees) (#625)
- `HexagonLayer` add interval `getHexagons`, `getSortedCounts` `getUpdateTriggers` methods, make it easier to create layer subclass
- `HexagonLayer` add `getColorValue` (optional) prop, returns a value to base bin color on.
- `HexagonLayer` change default `hexagonAggregator` output to `{hexagons: [], hexagonVertices: []}`
- `HexagonLayer` add `getValue` to `BinSorter` to support color / elevation by value
- TEST: Implement code coverage with nyc and coverall report (#596)
- HOTFIX: fix `HexagonLayer` hex color calculation, use `bin.value` instead of `bin.points.count` to calculate color
- HOTFIX: Fix the bug that layer is finalized at every cycle due to an incorrect if check(#552)
- HOTFIX: Fix the bug that Model got regenerated every time data is changed for SolidPolygonLayer (#554)
- HOTFIX: Fix the bug that lighting is not working properly for 64-bit PolygonLayer on Intel Iris Pro GPU (#563)
- DEMO: Fix brushing layer demo (#603)
- DEMO: Fix the scrolling on iPhone (#546)
- DEMO: Reorganized the examples (#547)
- DEMO: Misc fixed form demo site (#548, #549)
- KNOWN ISSUES: the IconLayer example doesn't work if use with luma.gl v4.0.0-alpha.1

### v4.0 Beta Releases

#### [v4.0.0-rc.6]
- Fix: remove postinstall script

#### [v4.0.0-rc.5]
- `getPickingInfo()` methods receive an additional argument `sourceLayer` (#468)
- `HexagonLayer` add `lowerPercentile` and `higherPercentile` (#470)
- FIX: Fix the async loading issue #347 by not setting state of stale layers to null (#483)
- FIX: Fix the lightSettings prop transfer issue in composite layers (#484)
- FIX: Fix the attribute logger (#499)
- Demo site: Add IconLayer demo (#467, #487)
- Demo site: Refactor to make all demos available as standalone examples (#471, 477)
- Demo site: Add Hexagon layer demo (3d heatmap) (#478)
- Demo site: New data set for the GeoJsonLayer demo (#492)
- Demo site: Link directly to source code from examples (#497)
- Examples: Remove layers that are not in v4 release plan from LayerBrowser example (#475, #490)
- Examples: Add JSX wrapper example (#482)

#### [v4.0.0-rc.4]
- `GridCellLayer` `latOffset` and `lonOffset` => `cellSize`
- Picking improvement: consistently handle picking in composite layers and also simplied picking (#448, #450)
- FIX: Fix the projectionMode checks for point cloud layer (#454)
- FIX: Make extruded and non-extruded polygon layers using the same Uint8ClampedArray to process colors
- FIX: Make radiusPixels works for PointCloudLayer (#450)
- FIX: Fix the bug that several composite layer not transferring proper props to their underlying layers (#455, #464)
- FIX: Fix a bug causes active layers got invalidated in the middle of the picking info processing (#458)
- FIX: Fix the vertice generation for extruded polygons with holes (#447)
- FIX: Now deck.gl picking works properly for non-fullscreen apps (#455)
- FIX: `onHover` and `onClick` props now work on `GridLayer` and `HexagonLayer`
- Picking info from `GeoJsonLayer` and `PolygonLayer` now have `layer` property point to the
  composite layer instead of a sublayer
- FIX: `PointCloudLayer` use `radiusPixels` instead of `radius`
- Examples: Fix the hello-world examples (#461)
- Demo site: Add interactive demo for each core layers (#452)
- Demo site: Upgrade old demos to v4 (#453)
- Demo site: Various other bug fixes (#463)

#### [v4.0.0-rc.3]

- Disable implicit props forwarding between the composite layer and its underlying layers.
- `GeoJsonLayer` `getColor` => `getLineColor`
- `GeoJsonLayer` `getWidth` => `getLineWidth`
- `GeoJsonLayer` add `lineWidthScale`
- `GeoJsonLayer` add `lineWidthMinPixels`
- `GeoJsonLayer` add `lineWidthMaxPixels`
- `GeoJsonLayer` add `lineJointRounded`
- `GeoJsonLayer` add `lineMiterLimit`
- `PolygonLayer` `getColor` => `getLineColor`
- `PolygonLayer` `getWidth` => `getLineWidth`
- `PolygonLayer` add `lineWidthScale`
- `PolygonLayer` add `lineWidthMinPixels`
- `PolygonLayer` add `lineWidthMaxPixels`
- `PolygonLayer` add `lineJointRounded`
- `PolygonLayer` add `lineMiterLimit`
- FIX: `ScatterplotLayer` calls Layer.updateState() to invalidate all attributes when data changed
- FIX: Fix the `ExtrudedChoroplethLayer64` in deprecated layer examples
- Replace all readFileSync() calls with Javascript imports for all GLSL shaders

#### [v4.0.0-rc1]

- FIX: Composite layers now have a stub invalidateAttribute()
- FIX: GeoJsonLayer and PolygonLayer now transfer correct updateTriggers to its sublayers
- FIX: Fix the picking for PolygonLayer with and without extrusions
- FIX: update the data file and default values for GeoJsonLayer example so that it correctly shows all geometry features
- FIX: `GeoJsonLayer` now wireframe prop only affects extruded layer and stroked only affects non-extruded layer
- FIX: super.updateState() now get called appropriately so that data change can correctly popylate to GPUs
- Re-factored GeoJsonLayer and PolygonLayer to separate polygon wireframe and polygon outline
- Removed loader for glsl and use exported Javascript string to store all GLSL shaders

- `PointDensityGridLayer` => `GridLayer`
- `PointDensityHexagonLayer` => `HexagonLayer`
- `GridLayer` => `GridCellLayer`
- `HexagonLayer` => `HexagonCellLayer`
- `PolygonLayer` => `SolidPolygonLayer`
- `PolygonLayer` is now a new composite layer that could render solid polygons as well as polygon outlines
- `GridLayer` and `HexagonLayer` to use new quantizedScale utility function
- `GeoJsonLayer` remove `drawPoints`, `drawLines`, `drawPolygon`, `fillPolygon`
- `GeoJsonLayer` add `stroked`, `filled`, `extruded`, `wireframe`
- `GeoJsonLayer` `getPointSize` => `getRadius`
- `GeoJsonLayer` `getStrokeWidth` => `getWidth`
- `GeoJsonLayer` `getStrokerColor` => `getColor`
- `GeoJsonLayer` remove `getPointColor`, use `getFillColor` instead
- `PathLayer` `strokeWidthScale` => `widthScale`
- `PathLayer` `strokeWidthMinPixels` => `widthMinPixels`
- `PathLayer` `strokeWidthMaxPixels` => `widthMaxPixels`
- `PathLayer` `getStrokeWidth` => `getWidth`
- `ScatterplotLayer` change the default `radiusScale` to 1
- `ScreenGridLayer` change `unitWidth` and `unitHeight` to `cellSizePixels`

- Update tests to reflect the new layer names and props

#### [v4.0.0-beta.5]
- NEW: add `viewportSize`, `devicePixelRatio` and `modelViewMatrix` to default uniforms

#### [v4.0.0-beta.4]
- FIX: Make luma.gl peer dependency more flexible
- Dependencies: Bump to react-map-gl@2, remove viewport-mercator-project & lodash.flatten
- 64 bit layers additions and fixes
- IconLayer aspect ratio
- New sample layers

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

### v3.1 Beta Releases

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


### v3.0 Beta Releases

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
 - BREAKING: DeckGLOverlay renamed to DeckGL: `import DeckGL from 'deck.gl';`
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

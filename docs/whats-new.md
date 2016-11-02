# deck.gl v3 - November 8, 2016

## Highlights
  - New demo website!
  - Comprehensive documentation!
  -
  - Support for Multi-Primitive Layers
  - Support for Composite Layers (Somewhat Experimental)

- Streamlined life cycle methods. The life cycle methods are now
  optimized for deck.gl's needs and no longer try to mimic React.
  Limited compatibility is provided but it is strongly recommended
  to update layers to the new methods


## React integration improvements
  - DeckGL (was DeckGLOverlay) component now a separate import, to
    allow deck.gl to be used by non-React applications.
  - Adds `onLayerClick` and `onLayerHover` methods to deck.gl wrapper.
  - DeckGL component no longer manages blending, as this is better done
    directly in layers.
  - FIX: `DeckGL` component now cancels animation loop on unmount,
    important when creating/destroying deck.gl components.

  Context
- FIX: update context.viewport


- Misc
  - Property diff tracing (deck.log.priority = 1), makes it easy
    to see what is causing your layers to rerender.

 - FIX: Perspective projection matrix "far plane" now covers negative Z coords


- Layer fixes
- Breaking Change: Standardize parameters in layers to always expect arrays.
- Remove separate attribute updater definitions to simplify layer subclass
  creation
  General:
  - line width now takes device pixel ratio into account for more consistent look between displays
  - Color attributes are now Uint8 encoded for significant GPU memory savings.
 - BREAKING: Introducing `context` that is shared between layers.
    gl and viewport moved from state to context. This implies that apps
    no longer need to pass {lng,lat,zoom,pitch,bearing} to each layer, only
    to the `DeckGL` react component.

  - Base Layer
    - `deepCompare` prop replaced with more flexible `dataComparator`

  - ArcLayer
    - Fix to flickering last segments
    - Renders smoother arcs, especially close to map

  - ScatterplotLayer.
    - Adds drawOutline option.

  - ScreenGridLayer (renamed GridLayer)
    - Now have accessors (getPosition, getWeight) and custom
      color ramps (minColor, maxColor)

 - ChoroplethLayer
   - now renders MultiPolygons and Polygons with holes

- 64bit layers

 - FIX - ArcLayer64 flickering fixed by high precision workaround.

 - FEATURE: ChoroplethLayer64

- 64 bit ExtrudedChoroplethLayer
  - Great for rendering 3D buildings on top of maps
  - Includes a basic shading model

 - new GeoJsonLayer - Initial composite layer, only Polygons for now.


#### [3.0.0-beta23] -
 - BREAKING: All layers now use `assembleShaders`
 - BREAKING: GLSL `project` package - shader functions renamed to have
   `project` prefix, in line with conventions for new shader package system.
 - FEATURE: Improved precision trigonometry library for Intel GPUs

 - BREAKING: No longer use Camera/Scene to render.
 - BREAKING: Sample layers now available through `import 'deck.gl/samples';

 - FEATURE: New GLSL library: 64bit emulated floating point
 - FEATURE: New layer: ScatterplotLayer64: Sample 64-bit, high precision layer
 - FEATURE: ArcLayer can now specify separate start end end color for each arc.
 - FIX: Add high precision version of `tan` as Intel GPU workaround.

 - Add separate import files for experimental layers and viewport
   import {PointCloudLayer, ...} from 'deck.gl/experimental'
   import Viewport from 'deck.gl/viewport'


# deck.gl v2 - May 2016

## Highlights
- 3D Perspective Mode, 3D camera support
- Performance Improvements
- Automatic attribute management
- Linux fixes - deck.gl and luma.gl now work on Linux.
- Adopts [luma.gl](https://github.com/uber/luma.gl) as default WebGL framework.
- Retina display support (picking on retina/regular display)

## React Integration
- Added deckgl-overlay canvas ID and customize style support
- Fix document / add customize style support to the canvas (@contra)

## Layers
- ScatterplotLayer
  - Per point radius support for the scatterplot-layer
  - Added per point color support for the scatterplot-layer
  - Fixed primitive distortion bug
- HexagonLayer
  - Fixed primitive distortion bug for hexagon-layer
- LineLayer (NEW)

## General
- Added data deep comparison support
- Added better uniform error message support
- Changed default blending function (ZERO -> ONE_MINUS_SRC_ALPHA)

## Misc
- Experimental support for disabling mercator project.


# deck.gl v1 - Dec 17, 2015

Initial open-source version of deck.gl, with 5 sample layers.

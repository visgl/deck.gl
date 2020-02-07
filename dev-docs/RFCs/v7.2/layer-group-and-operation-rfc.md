# RFC: Layer Group and Operations RFC

* **Authors**: Ib Green
* **Date**: July 2018
* **Status**: Early draft, For Discussion.

References:

* Several PRs implement large parts of functionality in this RFC.


## Overview

This RFC proposes a number of ideas around a new system for defining groups of layers, and letting those groups of layers render into masks. After discussion expect this to split into two or more RFCs.



## Layer Masks

Idea: Use new luma.gl support for stencil buffers to implement GPU clipping of layers against each other layers. Up to 8 independent masks (one for each "bit plane" in stencil buffer). Enable clipping of layers rendered "later" in stack, by union or intersection of a subset of masks (note limitations).

<DeckGL>
  <PolygonLayer id='mask-1' mask visible={false} .../>
  <PolygonLayer  id='mask-2' invertMask .../>
  <ScatterplotLayer clipByUnion=['mask-1', 'mask-2']>
  <PathOutlineLayer clipByIntersection=['mask-1', 'mask-2'>
</DeckGL>

Notes:

* Picking can most likely no longer render layers in reverse order...
* Support creating masks from layers with `visible=false`? Render clipping mask into stencil buffer, but not render visually? (colorMask, depthMask?). Update layers even when `visible=false`?
* Support `invertMask` when creating masks.
* Give full control of stencil bitmask to apps? It is a rather "nasty" API, but apps may want the power...


## External Masks

Allow loading of external masks?
  * E.g. let app create a mask from vector tile data? Or just ask app to render the external data to layers?

// External mask example. Maybe could be handled by a really strong `BitmapLayer`?

<DeckGL>
  <BitmapMask id='bitmap-mask' bitmapUrl=.../>
  <Layer clipBy=['bitmap-mask']>
</DeckGL>



## Double Buffering Implications

If double buffering active, masks must be rendered into both buffers due to technical complications with stencil buffers. Supporting masks makes it harder to support double buffering. Double buffering use cases unclear (except for post-processing, which are separate, so no issue).


## Layer Groups

Many potential implications, need to be thought through...

One potential use case, clip against stack of layers

<DeckGL>
  <LayerGroup id='group-1' mask>
    <PolygonLayer .../>
    <PolygonLayer .../>
  </LayerGroup>
  <LayerGroup id='group-2' mask>
    <PolygonLayer .../>
  </LayerGroup>
  <ScatterplotLayer clipByUnion=['group-1', 'group-2']>
  <ScatterplotLayer clipByIntersection=['group-1', 'group-2'>
</DeckGL>



## PostProcessing Effects

Support full range of new luma.gl postprocessing effects in deck.gl

<View postprocessing=[new FilmPass(), new OutlinePass(), new DotScreenPass(), ...]/>

* How to mix classes with constructors and JSX/React.
* Would like minimal wrappers, if any.
* Possibly per view, could also be global, or inject after layers? Might be reasonable to limit, need to be careful with perf hit.


## LayerRenderingPass class

Idea: Expose Layer Rendering as a "luma.gl" `LayerRenderingPass` so that deck.gl layers can be used in luma.gl `MultiPassRenderer` pipelines?

Requires making sure that deck.gl can be called in "componentized fashion".

Required effort and implications unclear.

May be a good fit for changes required for mapbox integration.

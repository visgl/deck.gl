# RFC Directory (deck.gl)


## Guidelines

The core developers will review RFCs (and of course, comments from the community are always welcome). Recommended review criteria are being documented in [RFC Review Guidelines](../rfc-guidelines.md).


## Roadmaps

Documents indicating intent and direction for bigger areas of functionality. Roadmap documents are intended to provide higher level descriptions than the more detailed, topic-focused RFCs.

Also see luma.gl roadmaps, such as the GPGPU roadmap

| Roadmap                                                            | Status       | Description |
| ---                                                                | ---          | ---         |
| [**API Evolution Roadmap**](../roadmaps/api-evolution-roadmap.md)  | Draft        | Ideas for changes/extensions to the core deck.gl API |
| [**New Layers Roadmap**](../roadmaps/layers-roadmap.md)            | Draft        | Ideas for new layers |
| [**Animation Roadmap**](../roadmaps/animation-roadmap.md)          | Draft        | Animation API roadmap |
| [**Performance Roadmap**](../roadmaps/performance-roadmap.md)      | Draft        | Performance Improvements |
| [**Infovis Roadmap**](../roadmaps/infovis-roadmap.md)              | Draft        | Infovis (non-geospatial) features roadmap |
| [**Reduce Distribution Size**](../roadmaps/dist-size-roadmap.md)   | Ongoing      | Reduce size of distribution and the bundle size of applications using deck.gl |
| [**Pure JS and Scripting Roadmap**](../roadmaps/purejs-roadmap.md) | Implemented  | Support for Scripting and Pure-JS APIs |


## Longer-Terms RFCs

These RFCs are not yet associated with any specific release.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**Reduce Repository Size**](vNext/reduce-repo-size-rfc.md) | @ibgreen | **Draft** | Reduce size of deck.gl github repository |
| [**Projection Mode Improvements**](vNext/projection-mode-improvements-rfc.md) | @ibgreen @pessimistress | **Draft** | Improvements to projection system |
| [**Composite Layer Customization**](vNext/composite-layer-customization-rfc.md) | @ibgreen | **Draft** | Improvements to customizing composite layers |
| **[Render Layer to Texture](vNext/render-layer-to-texture-rfc.md)** | TBD | Proposed | Allow layers to render to texture and then use texture in subsequent layers.  |
| [**Layer Extension**](vNext/layer-extension-rfc.md) | @pessimistress | **Draft** | Adding optional functionalities to layers on-demand |
| [**Component Wrapping System**](vNext/component-wrapping-rfc.md) | @ibgreen | **Draft** | A unified system for exposing JS components to Python/Jupyter Notebook/JSON etc. |

Possible other animation related RFCs:
- integration with event handling (enter leave triggers for animations)


## Deferred RFCs

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**Off-thread attribute generation**](vNext/off-thread-attribute-generation.md) | @pessimistress | **Deferred** | Generate attributes off-thread (to avoid locking the main thread). Deferred due to issues with supporting the more general use cases. **dataUrl RFC** has been broken out. |
| [**Expose Layer AttributeManager**](vNext/expose-attribute-manager.md) | @ibgreen | **Deferred** | simplifies pregenerating attributes in apps for fast animation. |
| [**Unified ViewState**](vNext/view-state-rfc.md) | @ibgreen | **Deferred** | Controversial proposal for an even more Unified View/Controller Architecture. Review again after all Controller/Multiview RFCs have been approved/implemented |


## v7.x Binary Data RFCs

Group of related RFCs loosely targeted for 7.x releases.

| RFC | Author | Status | Description |
| --- | ---    | ---    | ---         |
| [**Binary Data RFC**](v7.x-binary/binary-data-rfc.md) | @ibgreen @pessimistress | **Draft** | Support binary data as input to deck.gl layers. |
| [**GLSL Accessor RFC**](/dev-docs/v7.x-binary/glsl-accessor-rfc.md) | @ibgreen | **Draft** | Allow apps to define GLSL accessors to directly access injected columnar data or implement advanved effects |
| [**Texture Attribute RFC**](/dev-docs/v7.x-binary/texture-attribute-rfc.md) | @ibgreen | **Draft** | Enable variable-primitive layers_ to read _descriptive attributes_ from a binary column. |
| [**GPU Data Frame Support**](/dev-docs/v7.x-binary/gpu-data-frame-rfc.md) | @ibgreen | **Draft** | Proposal for enabling deck.gl to apply data frame filters on GPU. |
| [**Chunked Data Support**](/dev-docs/v7.x-binary/chunked-data-rfc.md) | @ibgreen | **Draft** | Support Chunked Columnar data on the GPU. |


## v7.x RFCs

RFCs loosely targeted for 7.x releases. Also see [luma.gl RFCs](https://github.com/uber/luma.gl/tree/master/dev-docs/RFCs#v7x-rfcs)

| RFC | Author | Status | Description |
| --- | ---    | ---    | ---         |
| [**Imperative API Improvements**](v7.x/imperative-api-rfc.md) | @ibgreen | **draft** | Potential API improvements for imperative programming. |
| [**Partial Updates**](vNext/partial-updates-rfc.md) | @ibgreen @georgios-uber | **draft** | Allow partial updates of vertex attributes to support high-performance editing. |
| [**Project / Unproject Improvements**](v7.x/project-unproject-rfc.md) | @ibgreen | **Draft** | Consolidating, generalizing and simplifying JS `project`/`unproject` API, covering uses from new features such as MultiView. |
| [**Layer Operations**](v7.x/layer-and-group-operation-rfc.md) | @ibgreen| **Preliminary Approval** | Allow partial updates of vertex attributes to support high-performance editing. |
| [**Property Animation**](v7.x/property-animation-rfc.md) | @ibgreen | Draft | Allow Layer props and GL parameters to accept functions in addition to values and call these on every render to update values |
| [**Heatmap Layer**](v7.x/heatmap-layer-rfc.md) | @1chandu | Draft | A new layer to render heat maps with GPU Acceleration |

## V7.1 RFCs

These RFCS were implemented in v7.1.

| RFC | Author | Status | Description |
| --- | ---    | ---    | ---         |
| [**GPU Acceleration in GridLayer**](v7.1/gpu-grid-layer.md) | @1chandu | **Implemented** | GPU Accelerated aggregation support in GridLayer. |


## v7.0 RFCs

These RFCS were implemented in v7.0. Also see [luma.gl RFCs](https://github.com/uber/luma.gl/tree/master/dev-docs/RFCs#v70-rfcs).

| RFC | Author | Status | Description |
| --- | ---    | ---    | ---         |
| [**Phong Lighting**](v7.0/phong-lighting-rfc.md) | @jianhuang01 | **Implemented** | Add phong lighting module to luma and deck |
| **[Effects Manager](v7.x/effects-manager-rfc.md)** | @jianhuang01 | Draft | Official support for effects (shadows, reflections, better lighting, postprocessing, framebuffer composition etc).  |
| [**Composite Layer Prop Forwarding**](v7.0/composite-layer-prop-forwarding-rfc.md) | @ibgreen @pessimistress | **Implemented** | Conventions for overriding sublayer props |


## v6.3 RFCs

These RFCS were implemented in v6.3. Also see [luma.gl RFCs](https://github.com/uber/luma.gl/tree/master/dev-docs/RFCs#v63-rfcs).

| RFC | Author | Status | Description |
| --- | ---    | ---    | ---         |
| [**Prop Types**](v6.3/prop-types-rfc.md) | @ibgreen | **Implemented** | Validate e.g ranges for numeric attributes, support animation/auto-interpolation. |
| [**Advanced Event Handling**](v6.3/event-handling.md) | @pessimistress | Draft | Allow Layer props to accept *on<Event>* style callbacks for events other than hover and click |
| [**GPU Aggregation enhancements**](v6.3/gpu-aggregator-enhancements.md) | @1chandu | **Implemented** | Enhance GPUGridAggregator to support multiple aggregation operations and aggregation of up to 3 weights  |


## v6.2 RFCs

These RFCS were implemented in v6.2. Also see [luma.gl RFCs](https://github.com/uber/luma.gl/tree/master/dev-docs/RFCs#v62-rfcs).

| RFC | Author | Status | Description |
| --- | ---    | ---    | ---         |
| [**Mapbox Custom Layer**](v6.2/mapbox-custom-layer-rfc.md) | @pessimistress @ibgreen | **Draft** | Integration of deck.gl API with new mapbox custom layers. |


## v6.1 RFCs

These RFCS were implmented in v6.1. Also see [luma.gl RFCs](https://github.com/uber/luma.gl/tree/master/dev-docs/RFCs#v61-rfcs)

| RFC | Author | Status | Description |
| --- | ---    | ---    | ---         |
| [**JSON Layers**](v6.1/json-layers-rfc.md) | @ibgreen| **Preliminary Approval** | Enable deck.gl layers to be specified as JSON payloads. |
| [**View Class Extensions**](v6.1/view-class-extension-rfc.md) | @ibgreen| **Review** | Additional View Class properties that enable e.g. "nested" maps (minimap on top of main map). |
| [**Property Animation (Phase 1)**](v6.x/property-animation-rfc.md) | @ibgreen | Draft | Allow Layer props and GL parameters to accept functions in addition to values and call these on every render to update values |
| [**Contour Layer**](v6.1/contour-layer-rfc.md) | @1chandu | **Preliminary Approval** | Contour detecting aggregating layer. |
| [**Improved 32 bit Projection Mode**](v6.1/improved-lnglat-projection-rfc.md.md) | @ibgreen @georgios-uber | **Implemented** | New projection mode for mixed 32/64 bit precision. |


## v6.0 RFCs

These RFCS were implemented in v6.0. Also see [luma.gl RFCs](https://github.com/uber/luma.gl/tree/master/dev-docs/RFCs#v60-rfcs)

| RFC | Author | Status | Description |
| --- | ---    | ---    | ---         |
| [**Per-View Controllers**](v6.0/per-view-controllers-rfc.md) | @ibgreen | **Draft** | Support one controller per view in multi-view apps |
| **[GPU Aggregations](v6.0/gpu-screengrid-aggregation-rfc.md)** | @1chandu | Draft | Official support for effects (shadows, reflections, better lighting, postprocessing, framebuffer composition etc).  |
| **[Data Filter](v6.0/data-filter-rfc.md)** | @pessimistress | Draft | Add generic support to filter data objects on the GPU.  |
| **[React API](v6.0/react-api-rfc.md)** | @pessimistress | Draft | React API refresh.  |


## v5.3 RFCs

These RFCs were implemented in v5.3.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**Auto Controls**](v5.3/auto-controls-rfc.md) | @ibgreen | **Review** | Allow deck.gl to be used without an `onViewStateChange` callback. |
| [**Async Layer Props**](v5.3/async-props-rfc.md) | @pessimistress & @ibgreen | **Review** | `Layer.data` can be a URL string, and layer asynchronously downloads and displays the data. |
| [**Picking Occluded Ojects**](v5.3/picking-overlapping-objects-rfc.md) | @ibgreen @georgios-uber | **draft** | Allow partial updates of vertex attributes to support high-performance editing. |
| [**Constant Accessor**](v5.3/constant-accessor-rfc.md) | @pessimistress | **draft** | Allow users to supply constant attributes directly instead of using an accessor. |
| [**Attribute Buffer**](v5.3/attribute-buffer-rfc.md) | @pessimistress | **draft** | Move buffer management from Model class to AttributeManager. |



## v5.2 RFCs

These RFCs were implemented in v5.2.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**New View Classes**](v5.2/view-class-rfc.md) | @ibgreen @pessimistress | **Implemented** | Official API for multi-view support, replacing the v5.0 experimental API |
| [**Unified 32/64-bit Projection**](v5.2/unified-32-and-64-bit-project-api-rfc.md) | @ibgreen | **Implemented** | |


## v5.1 RFCs

These RFCs were implemented in v5.1.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| **Animation** | | | |
| [**Attribute Transitions**](v5.1/attribute-transition-rfc.md) | @pessimistress | **Implemented** | Automatically interpolate between two copies of a vertex attributes |
| **[TransitionInterpolator](v5.1/transition-interpolator-class-rfc.md)** | @pessimistress | **Implemented** | New class to make it easier to customize interpolation |


## v5.0 RFCs

These RFCs were implemented in v5.0. Also see luma.gl RFCs.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| **Animation** | | | |
| [**Auto Highlighting**](v5.0/auto-highlighting-rfc.md) | @ibgreen @1chandu | **Implemented** | Auto highlight hovered object via `picking` module |
| | | | |
| **Viewports and Controllers** | | | |
| [**First Person Geospatial Viewport**](v5.0/first-person-geospatial-viewport-rfc.md) | @ibgreen | **Experimental** | Geospatially enable all viewports, add FirstPersonViewport for hybrid apps. |
| [**Multiple Viewports**](v5.0/multi-viewport-rfc.md) | @ibgreen | **Experimental** | Support for multiple viewports |
| [**Viewport Transitions**](v5.0/viewport-transitions-rfc.md) | @1chandu | **Experimental** | Animate Viewport changes ("fly to" effect) through interpolation of Viewport props. (Also used in react-map-gl v3.2). |
| [**Break out EventManager**](v5.0/break-out-event-manager-rfc.md) | @ibgreen | **Implemented** | Break out event manager module (mjolnir.js) |
| | | | |
| **[luma.gl RFCs](https://github.com/uber/luma.gl/tree/master/dev-docs/RFCs)** | | | |
| **Break out Math Module** | @ibgreen | **Implemented** | Break out luma.gl math module (math.gl) |


## v4.1 RFCs

These RFCs were implemented in v4.1.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**Picking Improvements**](v4.1/picking-improvements-rfc.md) | @shaojingli | "Direction" RFC | Outlines a number of improvements to picking |
| [**Event Handling**](v4.1/event-handling-rfc.md) | Many authors | **Implemented** | Attempt to define enduring event handling architecture |


## v4.0 RFCs

These RFCs were implemented in v4.0.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**Non-Geospatial Viewports**](v4.0/non-geospatial-viewports-rfc.md) | @ibgreen @gnavvy | **Implemented** | Support for non-geospatial viewports |
| [**Composite Layer Prop Forwarding**](v4.0/composite-layer-prop-forwarding-rfc.md) | @shaojingli | **Implemented** | Conventions for prop forwarding |

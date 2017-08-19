# RFC Directory (deck.gl)

Implementation of non-trivial new deck.gl features should typically be started off with the creation of an RFC (Request for Comments) to make sure we have a complete story. It also allow the bigger team (as well as the community) to comment and contribute insights.

| RFC Status   | Description |
| ---          | --- |
| Proposed     | Call for an RFC to be written |
| Draft        | WIP version available, not ready for formal review |
| **Review**   | In formal review |
| **Approved** | Approved, ready for implementation |
| **Deferred** | Review uncovered reasons not to proceed at this time |
| **Rejected** | Review uncovered reasons not to proceed at this time |


## v5.0 RFCs

Current direction for deck.gl v5 (v.Next) is to focus on effects and animation, so we want to prioritize related RFCs. In particular, the topic of animation is big, below are some potential RFCs that could move us in the right direction.



| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| **Effect Management** | | | |
| **[EffectsManager](v5.0/effects-manager-rfc.md)** | @1chandu @ibgreen | Draft | Official support for effects (shadows, reflections, better lighting, postprocessing, framebuffer composition etc).  |
| | | | |
| **Animation** | | | |
| [**Auto Highlighting**](v5.0/auto-highlighting-rfc.md) | @ibgreen @1chandu | **Approved** | Auto highlight hovered object via `picking` module |
| [**Viewport interpolation**](v5.0/viewport-animation-rfc.md) | @1chandu | Proposed | This should build on the new Viewport system in the First Person RFC. Also needs to consider react-map-gl. |
| [**Uniform and Parameter Animation**](v5.0/property-animation-rfc.md) | @ibgreen | Draft | Allow Layer props and GL parameters to accept functions in addition to values and call these on every render to update values |
| [**Attribute Animation**](v5.0/attribute-animation-rfc.md) | @pessimistress | Proposed | Automatically interpolate between two copies of a vertex attributes |
| [**Expose Layer AttributeManager**](v5.0/expose-attribute-manager.md) | @ibgreen | Draft | simplifies pregenerating attributes in apps for fast animation. |
| [**First Person Viewport**](v5.0/first-person-mercator-viewport-rfc.md) | @ibgreen | **Approved** | Geospatially enable all viewports |
| [**PropTypes**](v5.0/prop-types-rfc.md) | ? | Draft | Validate e.g ranges for numeric attributes, support animation/auto-interpolation. |
| | | | |
| **General** | | | |
| [**dataUrl**](v5.0/data-url-rfc.md) | @pessimistress & @ibgreen | Draft | **Ease-of-Use** Allow deck.gl layers to specify a URL and asynchronously download the resulting data |
| [**Reduce Distribution Size**](v5.0/reduce-distribution-size-rfc.md) | @ibgreen | **Review** | **Hygiene** Reduce size of distribution and the bundle size of apps consuming deck.gl |
| [**Reduce Repository Size**](v5.0/reduce-repo-size-rfc.md) | @ibgreen | **Draft** | **Hygiene** Reduce size of deck.gl github repository |
| [**Break out Math Module**](v5.0/break-out-math-module-rfc.md) | @ibgreen | **Draft** | **Hygiene** Break out luma.gl math module |
| [**Break out EventManager**](v5.0/break-out-event-manager.md) | @ibgreen | **Draft** | **Hygiene** Break out shared event manager code |
| [**Partial Updates**](deferred/partial-updates-rfc.md) | @ibgreen | **Deferred** | Allow partial updates of vertex attributes to support high-performance editing. Deferred due to performance of complete updates being so good this was not needed. |
| [**Off-thread attribute generation**](deferred/off-thread-attribute-generation.md) | @pessimistress | **Deferred** | Generate attributes off-thread (to avoid locking the main thread). Deferred due to issues with supporting the more general use cases. **dataUrl RFC** could be broken out. |

Possible other animation related RFCs:
- integration with event handling (enter leave triggers for animations)


## v4.1 RFCs

These RFCs that have been implemented (fully or partially) in v4.1.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**Picking Improvements**](v4.1/picking-improvements-rfc.md) | @shaojingli | "Direction" RFC | Outlines a number of improvements to picking |
| [**Event Handling**](v4.1/event-handling-rfc.md) | Many authors | **Approved** & Implemented | Attempt to define enduring event handling architecture |


## v4.0 RFCs

These RFCs that have been implemented (fully or partially) in v4.0.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**Non-Geospatial Viewports**](v4.0/non-geospatial-viewports-rfc.md) | @ibgreen @gnavvy | **Approved** & Implemented | Support for non-geospatial viewports |
| [**Composite Layer Prop Forwarding**](v4.0/composite-layer-prop-forwarding-rfc.md) | @shaojingli | **Approved** & Implemented | Conventions for prop forwarding |

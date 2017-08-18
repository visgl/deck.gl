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


## RFCs for Next Release

Current direction for deck.gl v5 (v.Next) is to focus on effects and animation, so we want to prioritize related RFCs. In particular, the topic of animation is big, below are some potential RFCs that could move us in the right direction.


### Effects RFCs

Next generation of deck.gl should have official support for effects (shadows, reflections, better lighting, postprocessing, framebuffer composition etc).

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| **[EffectsManager RFC](drafts/effects-manager-rfc.md)** | @1chandu & @ibgreen | Draft | Complete and officially release experimental `EffectsManager` |


### Core Animation RFCs

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**Auto Highlighting RFC**](approved/auto-highlighting-rfc.md) | @ibgreen + @1chandu | **Approved** | Auto highlight hovered object via `picking` module |
| [**Viewport interpolation RFC**](drafts/viewport-animation-rfc.md) | @1chandu? | Proposed | This should build on the new Viewport system in the First Person RFC. Also needs to consider react-map-gl. |
| [**Uniform and Parameter Animation RFC**](drafts/property-animation-rfc.md) | @ibgreen | Draft | Allow Layer props and GL parameters to accept functions in addition to values and call these on every render to update values |
| [**Attribute Animation RFC**](drafts/attribute-animation-rfc.md) | @Pessimistress? | Proposed | Automatically interpolate between two copies of a vertex attributes |
| [**Expose Layer AttributeManager RFC**](drafts/expose-attribute-manager.md) | @ibgreen | Draft | simplifies pregenerating attributes in apps for fast animation. |

Possible other animation related RFCs:
- integration with event handling (enter leave triggers for animations)


### Supporting RFCs

These RFCs implement features that are considered to be supporting or complemeting the upcoming release.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**First Person Viewport RFC**](approved/first-person-mercator-viewport-rfc.md) | @ibgreen | **Approved** | Geospatially enable all viewports |
| [**PropTypes RFC**](drafts/prop-types-rfc.md) | ? | Draft | Validate e.g ranges for numeric attributes, support animation/auto-interpolation. |


### General RFCs

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**dataUrl RFC**](drafts/data-url-rfc.md) | @pessimistress & @ibgreen | Draft | **Ease-of-Use** Allow deck.gl layers to specify a URL and asynchronously download the resulting data |
| [**Reduce Distribution Size RFC**](drafts/reduce-distribution-size-rfc.md) | @ibgreen | **Review** | **Hygiene** Reduce size of distribution and the bundle size of apps consuming deck.gl |


## Deferred RFCs

These are RFCs that were deferred in the initial review (usually due to more limited applicability or higher implementation cost than initially hoped). They are still valuable as references, and may yet be implemented in future releases

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**Partial Updates RFC**](deferred/partial-updates-rfc.md) | @ibgreen | **Deferred** | Allow partial updates of vertex attributes to support high-performance editing. Deferred due to performance of complete updates being so good this was not needed. |
| [**Off-thread attribute generation RFC**](deferred/off-thread-attribute-generation.md) | @pessimistress | **Deferred** | Generate attributes off-thread (to avoid locking the main thread). Deferred due to issues with supporting the more general use cases. **dataUrl RFC** could be broken out. |



## Implemented RFCs

These are RFCs that have been implemented (fully or partially) in past releases.

### deck.gl v4.1

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**Event Handling RFC**](v4.1/event-handling-rfc.md) | Many authors | **Approved** & Implemented | Attempt to define enduring event handling architecture |


### deck.gl v4.0

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**Non-Geospatial Viewports RFC**](v4.0/non-geospatial-viewports-rfc.md) | @ibgreen & @gnavvy | **Approved** & Implemented | Support for non-geospatial viewports |
| [**Composite Layer Prop Forwarding RFC**](v4.0/composite-layer-prop-forwarding-rfc.md) | @shaojingli | **Approved** & Implemented | Conventions for prop forwarding |

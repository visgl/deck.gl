# RFC Directory (deck.gl)

- Implementation of non-trivial new deck.gl features should typically be started off with the creation of an RFC (Request for Comments) to make sure we have a complete story and allow the bigger team (as well as the community) comment and contribute.

| RFC Status  | Description |
| ---         | --- |
| Proposed    | Call for an RFC to be written |
| Draft       | WIP version available, not ready for formal review |
| In Review   | In formal review |
| Approved    | Approved, pending implementation |
| Implemented | Done |
| Deferred    | Review uncovered reasons not to proceed at this time |
| Rejected    | Review uncovered reasons not to proceed at this time |


## RFCs for Next Release

Current direction for deck.gl v5 (v.Next) is to focus on effects and animation, so we want to prioritize related RFCs. In particular, the topic of animation is big, below are some potential RFCs that could move us in the right direction.


### Effects RFCs

Next generation of deck.gl should have official support for effects (shadows, reflections, better lighting, postprocessing, framebuffer composition etc).

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| **Shadowmap RFC** | @1chandu? | Proposed |  |


### Core Animation RFCs

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**Auto Highlighting RFC**](./auto-highlighting-rfc.md) | @ibgreen + @1chandu | Approved | Auto highlight hovered object via `picking` module |
| **Viewport interpolation RFC** | @1chandu? | Proposed | This should build on the new Viewport system in the First Person RFC. Also needs to consider react-map-gl. |
| **Attribute interpolation RFC** | @Pessimistress? | Proposed | Automatically interpolate between two copies of a vertex attributes (Could build on a GeometryBuilder RFC, @ibgreen has been doing some work in this area). Probably interesting updateTrigger implications... |
| [**Uniform and Parameter Animation RFC**](wip/property-animation-rfc.md) | @ibgreen | Proposed | Allow Layer props and GL parameters to accept functions in addition to values and call these on every render to update values |
| **Layer-Independent `AttributeManager`s RFC** | @ibgreen | Proposed | simplifies pregenerating attributes in apps for fast animation.

Possible other animation related RFCs:
- integration with event handling (enter leave triggers for animations)


### Supporting RFCs

These RFCs implement features that are considered to be supporting or complemeting the upcoming release.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**First Person Viewport RFC**](first-person-mercator-viewport-rfc.md) | @ibgreen | Approved | Geospatially enable all viewports |
| [**PropTypes RFC**](wip/property-types-rfc.md) | ? | Proposed | We've wanted this for a long time, Ideally we'd be able to specify valid ranges for numeric attributes, this could be useful in animation scenarios, especially for auto-interpolation. |


### Ease-of-Use RFCs

These RFCs represent features that are not listed as part of focus areas for next generation but can help the ease-of-use of deck.gl which is a constant background priority for all deck.gl releases.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| **dataUrl RFC** | @pessimistress? | Proposed | Allow deck.gl layers to specify a URL and asynchronously download the resulting data |


## Deferred RFCs

These are RFCs that were deferred in the initial review (usually due to more limited applicability or higher implementation cost than initially hoped). They are still valuable as references, and may yet be implemented in future releases

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**Partial Updates RFC**](deferred/partial-updates-rfc.md) | @ibgreen | Deferred | Allow partial updates of vertex attributes to support high-performance editing. Deferred due to performance of complete updates being so good this was not needed. |
| [**Off-thread attribute generation RFC**]() | @pessimistress | Deferred | Generate attributes off-thread (to avoid locking the main thread). Deferred due to issues with supporting the more general use cases. **dataUrl RFC** could be broken out. |



## Implemented RFCs

These are RFCs that have been implemented (fully or partially) in past releases.

### deck.gl v4.1

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**Event Handling RFC**]() | Many authors | Approved & Implemented | Attempt to define enduring event handling architecture |


### deck.gl v4.0

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| [**Non-Geospatial Viewports RFC**]() | @ibgreen & @gnavvy | Approved & Implemented | Support for non-geospatial viewports |
| [**Composite Layer Prop Forwarding RFC**]() | @shaojingli | Approved & Implemented | Conventions for prop forwarding |

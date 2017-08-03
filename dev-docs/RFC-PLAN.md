# RFC Plan (deck.gl)

- Implementation of new deck.gl features is increasingly being started off with the creation of an RFC (Request for Comments) to make sure we have a complete story and let the bigger team comment and contribute.


## RFCs for Next Release

Current direction for deck.gl v5 (v.Next) is to focus on effects and animation, so we want to prioritize related RFCs. In particular, the topic of animation is big, below are some potential RFCs that could move us in the right direction.


### Effects RFCs

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| **Shadowmap RFC** | Ravi? | Proposed... |  |
| **Auto Highlighting RFC** | Ib + Ravi | Approved. Implementing... | Use picking module to auto highlight hovered object |


### Core Animation RFCs

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| **Viewport interpolation RFC** | Ravi? | Proposed | This should build on the new Viewport system in the First Person RFC. Also needs to consider react-map-gl. |
| **Attribute interpolation RFC** | Xiaoji? | Proposed | Automatically interpolate between two copies of a vertex attributes (Could build on a GeometryBuilder RFC, Ib has been doing some work in this area). Probably interesting updateTrigger implications... |
| **Uniform and Parameter Animation RFC** | Ib | Proposed | Allow Layer props and GL parameters to accept functions in addition to values and call these on every render to update values |
| **Layer-Independent `AttributeManager`s RFC** | Ib | Proposed simplifies pregenerating attributes in apps for fast animation.

Possible other animation related RFCs:
- integration with event handling (enter leave triggers for animations)


### Supporting RFCs

These RFCs implement features that are considered to be supporting or complemeting the upcoming release.

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| **First Person Viewport RFC** | Ib | Approved. Implementing... | Geospatially enable all viewports |
| **PropTypes RFC** | ? | We've wanted this for a long time, Ideally we'd be able to specify valid ranges for numeric attributes, this could be useful in animation scenarios, especially for auto-interpolation. |


### Ease-of-Use RFCs

These RFCs represent features that are not listed as part of focus areas for next generation but can help the ease-of-use of deck.gl

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| **dataUrl RFC** | Xiaoji? | Proposed | Allow deck.gl layers to specify a URL and asynchronously download the resulting data |


## Long-Term RFCs

These are RFCs that may be implemented in future releases

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| **Off-thread attribute generation RFC** | Xiaoji | "Frozen" | Generate attributes off-thread (to avoid locking the main thread). Frozen due to issues with supporting the more general use cases. **dataUrl RFC** could be broken out. |



## Historic RFCs

These are RFCs that have been implemented (fully or partially) in past releases.

### deck.gl v4.1

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| TBA | - | - | - |


### deck.gl v4.0

| RFC | Author | Status | Description |
| --- | --- | --- | --- |
| **Infovis Viewports RFC** | Ib & Yang | Approved & Implemented | Support for non-geospatial viewports |

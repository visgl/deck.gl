## DeckGL

## Properties

### viewports

* A singe viewport, or an array of `Viewports` or "Viewport Descriptors".

deck.gl will render all the viewports in order.

Default: If not supplied, deck.gl will try to create a `WebMercatorViewport` from other props (longitude, latitude, ...).


### viewport

* Deprecated

use `viewports` property instead, it can accept a single `Viewport`.
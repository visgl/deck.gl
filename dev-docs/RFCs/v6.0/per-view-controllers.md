# RFC - Per-View Controllers for Multiple Views

* **Author**: Ib Green
* **Date**: January 5, 2018
* **Status**: **Placeholder**


## Problem Overview

* **Using Multiple Controllers** - An application having multiple viewports might want to use different interaction in each viewport - this has multiple complications...
* **Switching Controllers** - An application that wants to switch between Viewports might want to switch between controllers, ideally this should not require too much coding effort.


## Propsed Features

**Restrict Event Handling to match Viewport Size** - Controllers need to be able to be restricted to a certain area (in terms of event handling). Some controllers are completely general (just general drag up/down):
* When working with a map controller, especially panning and zooming, the point under the mouse represents a grab point or a reference for the operation and mapping event coordinates correctly is imporant for the experience.
* Controllers might not be designed to receive coordinates from outside their viewports.
* Basically, if the map backing one WebMercator viewport doesn't fill the entire canvas, and the application wants to use a MapController

Controllers will also benefit from be able to feed multiple viewports of different types. There are limits to this of course, in particular it would be nice if for instance a geospatially neabled FirstPerson controller can feed both a `FirstPersonViewport` and a `WebMercatorViewport`. Various different viewports must be created from one set of parameters.

Contrast this to deck.gl v4.1, where the idea was that each the of Viewport was associated with a specific controller (WebMercatorViewport has a MapController, etc).


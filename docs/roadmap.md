# Roadmap

Interested in what is coming down the road? We are trying to make the deck.gl roadmap as public as possible.

We are currently using the following ways to share information about the direction of deck.gl.

* **Roadmap Document** - (this document) A high-level summary of our current direction for future releases.
* **Blog** - We use the [vis.gl blog](https://medium.com/vis-gl) blog to share information about what we are doing.
* **RFCs** - A wealth of technical detail around planned features is available in our RFCs (Requests For Comments). RFCs are technical writeups that describe a proposed feature. RFCs are available [here](https://github.com/visgl/deck.gl/tree/master/dev-docs/RFCs).
* **Experimental exports** - We are making unfinished features available as experimental exports. This gives users a clear indication about what is coming and even allow early adopters a chance to play with and provide comments on these features.
* **Experimental Layers** - We are publishing a number of work-in-progress layers to make it easy to experiment with them in applications, see below.
* **Github issues** - As always, github issues are a good way to see what is being discussed and join the discussions.


## Experimental Layers

The [@deck.gl/experimental-layers](https://www.npmjs.com/package/@deck.gl/experimental-layers) is available as of deck.gl v5.2 and contains early versions of future layers.

There are a number of interesting layers in this module, however there are caveats:

* We do not provide website documentation for these layers, so if you want to use these layers you may need to refer directly to the deck.gl source code.
* While we make reasonable attempts to not break things, we do not guarantee that they will be stable between releases.
* To prevent surprises, you may want to pin the version of the ` @deck.gl/experimental-layers` module in your `package.json`.
* Worst case, if you have to upgrade and some unexpected change happens, you can copy the source code of the affected layer(s) to your app.


## deck.gl v6.0

These are some of the big priorities for our next release:

* **Aggregation** - Improve and generalize automatic data aggregation (the current HexagonLayer and GridLayer are examples of what to expect).
* **Better Infovis Support** - Better support for non-geospatial visualizations. (Don't worry if you are a geospatial user, deck.gl will remain a "geospatial-first" library since that is the more difficult use case.)
* **Better GPGPU/WebGL2 Support** - Many stones are still left unturned here. Expect better performance, and new features for WebGL2 capable browsers (such as animations of entire attributes).
* **Visual Effects** - Shadows, blur, postprocessing etc. This continues to be strong goal that we intend to make progress on.
* **Transitions and Animations** - 5.0 introduces viewport transitions. Expect to see similar support for layer properties and attributes. Viewport transitions feature is available in the `experimental` namespace, and for additional details check the [RFC](https://github.com/visgl/deck.gl/blob/master/dev-docs/RFCs/v5.0/viewport-transition-rfc.md).


## deck.gl v5.2

These are some of things we tackled in our most recent release

* **Pure JavaScript Support** - the deck.gl npm module currently has a hard dependency on React, however in v5.0 the internal code is effectively 100% independent of React. We intend to split the library into a core module exposing a "pure" JavaScript API and an (optional) module containing the React integration. (Don't worry if you are a React user, deck.gl will continue to be "React-first", designed from the ground up with the "reactive programming paradigm" in mind. We just want non-React users to also be able use deck.gl).
* **Multi-viewport Support** - Extensive work has been done in v5.0, and we expect to finalize and make much of this functionality official in next release. For now, multiviewport features are available in the `experimental` namespace. For additional details check the [RFCs](https://github.com/visgl/deck.gl/blob/master/dev-docs/RFCs/v5.0/multi-viewport-rfc.md).
* **Multiple Modules** - In addition, in the future we plan to publish separate modules with deck.gl layers.
* **Code Size** - deck.gl has gone through rapid development and we need to overhaul the code and build processes to reduce the size.


## Details on Planned Features

### Controller Support for Multiple Viewports

TBA - This is a planned feature for a future release

**Restrict Event Handling to match Viewport Size** - Controllers need to be able to be restricted to a certain area (in terms of event handling). Some controllers are completely general (just general drag up/down):

* When working with a map controller, especially panning and zooming, the point under the mouse represents a grab point or a reference for the operation and mapping event coordinates correctly is imporant for the experience.
* Controllers might not be designed to receive coordinates from outside their viewports.
* Basically, if the map backing one WebMercator viewport doesn't fill the entire canvas, and the application wants to use a MapControls

Controllers will also benefit from be able to feed multiple viewports of different types. There are limits to this of course, in particular it would be nice if for instance a geospatially neabled FirstPerson controller can feed both a `FirstPersonViewport` and a `WebMercatorViewport`. Various different viewports must be created from one set of parameters.

Contrast this to deck.gl v4.1, where the idea was that each the of Viewport was associated with a specific controller (WebMercatorViewport has a MapController, etc).

* **Using Multiple Controllers** An application having multiple viewports might want to use different interaction in each viewport - this has multiple complications...
* **Switching Controllers** - An application that wants to switch between Viewports might want to switch between controllers, ideally this should not require too much coding effort.



## Experimental Features in Current Release

### Multi-Viewport Support

Multi-viewport support was added during deck.gl 5.0 development. The APIs are still not considered stable so the related classes are exported as part of the "experimental" namespace, and in most cases.

deck.gl now allows you to divide your screen into multiple viewports and render your layers from different perspectives, using the experimental `_viewports` property. It is e.g. possible to render a top-down map view next to a first person view for dramatic new perspectives on your data. E.g. an app can allow your users to "walk around" in the city onto which its data is overlaid.

### WebVR Support and Example

Multi viewport support can be used to integrate with the WebVR API and create dual WebVR compatible viewports that render a first person view of your data for left and right eye respectively which will display as stereoscopic 3D in supporting hardware.

### Automatic Positioning of React Children under Viewports

In addition, a new `viewId` React property can be added to `DeckGL`'s children. This will synchronize the position of the react component with the corresponding deck.gl viewport, which makes it trivial to precisely position e.g. multiple "base maps" and other background or foreground HTML components in multi-viewport layouts. The `viewportId` prop also automatically hides the react children when a viewport with the corresponding id is not present or when viewport parameters can not be supported by the underlying map component.

### Orbit Controller and Orbit Viewport Support

TBA

### All Viewports Now Geospatially Enabled

All `Viewport` classes are now geospatially enabled: they now take an optional `longitude`/`latitude` reference point. In this mode, `position`s will be treated as meter offsets from that reference point per `COORDINATE_SYSTEM.METER_OFFSET` conventions.

This means that you can now use a FirstPersonViewport (the successor to the `PerspectiveViewport` with layers encoded in `COORDINATE_SYSTEM.LNG_LAT` and `COORDINATE_SYSTEM.METER_OFFSETS`) and place a camera anywhere in the scene (in contrast to the `WebMercatorViewport` which only allows you to look "down" on a position on the map).

Viewports even accept a `modelMatrix` to allow viewport/camera positions to be specified in exactly the same coordinates as `METER_OFFSET` layers, making it possible to place a camera at the exact location any of your existing data points without having to think or do any math.

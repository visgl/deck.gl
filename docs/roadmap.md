# Roadmap

Interested in what is coming down the road? We are trying to make the deck.gl roadmap as public as possible.

We currently are using four ways to share information about the direction of deck.gl.
* **Roadmap Document** - (this document) A high-level summary of our current direction for future releases.
* **RFCs** - We are now publishing our RFCs (Requests For Comments) for features in upcoming releases. RFCs are technical writeups that describe a proposed feature. RFCs are available [here](https://github.com/uber/deck.gl/tree/master/dev-docs/RFCs).
* **Experimental exports** - We are making unfinished features available as experimental exports. This gives users a clear indication about what is coming and even allow early adopters a chance to play with and provide comments on these features.
* **Blog** - We will of course continue to use the [vis.gl](vis.gl) blog to share information about what we are doing.

As before, github issues are a good way to join the discussions.


## deck.gl v.Next

These are some of the big priorities for our next release:

* **Pure JavaScript Support** - the deck.gl npm module currently has a hard dependency on React, however in v5.0 the internal code is effectively 100% independent of React. We intend to split the library into a core module exposing a "pure" JavaScript API and an (optional) module containing the React integration. (Don't worry if you are a React user, deck.gl will continue to be "React-first", designed from the ground up with the "reactive programming paradigm" in mind. We just want non-React users to also be able use deck.gl).
* **Multi-viewport Support** - Extensive work has been done in v5.0, and we expect to finalize and make much of this functionality official in next release. For now, multiviewport features are available in the `experimental` namespace. For additional details check the [RFCs](https://github.com/uber/deck.gl/blob/master/dev-docs/RFCs/v5.0/multi-viewport-rfc.md).
* **Visual Effects** - Shadows, blur, postprocessing etc. This continues to be strong goal that we intend to make progress on.
* **Transitions and Animations** - 5.0 introduces viewport transitions. Expect to see similar support for layer properties and attributes. Viewport transitions feature is available in the `experimental` namespace, and for additional details check the [RFC](https://github.com/uber/deck.gl/blob/master/dev-docs/RFCs/v5.0/viewport-transition-rfc.md).
* **Code Size** - deck.gl has gone through rapid development and we need to overhaul the code and build processes to reduce the size.
* **Multiple Modules** - In addition, in the future we plan to publish separate modules with deck.gl layers.

## Beyond the Next Major Release

Other themes we want to develop are:
* **Aggregation** - Improve and generalize automatic data aggregation (the current HexagonLayer and GridLayer are examples of what to expect).
* **Better Infovis Support** - Better support for non-geospatial visualizations. (Don't worry if you are a geospatial user, deck.gl will remain a "geospatial-first" library since that is the more difficult use case.)
* **Better GPGPU/WebGL2 Support** - Many stones are still left unturned here. Expect better performance, and new features for WebGL2 capable browsers (such as animations of entire attributes).


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

### Controller Hierarchy

TBA

### All Viewports Now Geospatially Enabled

All `Viewport` classes are now geospatially enabled: they now take an optional `longitude`/`latitude` reference point. In this mode, `position`s will be treated as meter offsets from that reference point per `COORDINATE_SYSTEM.METER_OFFSET` conventions.

This means that you can now use a FirstPersonViewport (the successor to the `PerspectiveViewport` with layers encoded in `COORDINATE_SYSTEM.LNG_LAT` and `COORDINATE_SYSTEM.METER_OFFSETS`) and place a camera anywhere in the scene (in contrast to the `WebMercatorViewport` which only allows you to look "down" on a position on the map).

Viewports even accept a `modelMatrix` to allow viewport/camera positions to be specified in exactly the same coordinates as `METER_OFFSET` layers, making it possible to place a camera at the exact location any of your existing data points without having to think or do any math.

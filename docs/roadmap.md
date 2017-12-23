# Roadmap

Interested in what is coming down the road? We are trying to make the deck.gl roadmap as public as possible.

We currently are using four ways to share information about the direction of deck.gl.
* **Roadmap Document** - (this document) Contains a high-level summary of our current thoughts and ambitions.
* **RFCs** - We are now publishing our RFCs (Requests For Comments) for features in upcoming releases. These are available in the [developer documents](https://github.com/uber/deck.gl/tree/master/dev-docs/RFCs) section of the github repo.
* **Experimental exports** - We are making unfinished features available as experimental exports. This gives users a clear indication about what is coming and even allow early adopters a chance to play with and provide comments on these features.
* **Blog** - We will of course continue to use the vis.gl blog to share information about what we are doing.

Naturally, the github issues also contains relevant information, but in a less structured form.


## deck.gl v.Next

* **Pure JavaScript support** - deck.gl is today a React library, but in 5.0 the internal code is essentially 100% independent of React. We want to define an official JavaScript API and publish the React "wrappers" as an optional add-on module. (Please don't worry if you are a React user, deck.gl will continue to be "React-first", designed from the ground up with the "reactive programming paradigm" in mind).
* **Multi-viewport support** - Extensive work has been done in 5.0, we expect to finalize and make much of this functionality official in next release. This feature is available in the `experimental` namespace, and for additional details check the [RFC](https://github.com/uber/deck.gl/blob/master/dev-docs/RFCs/v5.0/multi-viewport-rfc.md).
* **Visual Effects** - Shadows, blur, postprocessing etc. This continues to be strong goal that unfortunately has been pushed forward.
* **Transitions and Animations** - 5.0 introduces viewport transitions. Expect to see similar support for layer properties and attributes. Viewport transitions feature is available in the `experimental` namespace, and for additional details check the [RFC](https://github.com/uber/deck.gl/blob/master/dev-docs/RFCs/v5.0/viewport-transition-rfc.md).
* **Code Size** - deck.gl has gone through rapid development and we need to overhaul the code and build processes to reduce the size.

In addition, in the future we plan to publish separate modules with deck.gl layers and core functionality.

## Longer Term

Other themes we want to develop are:
* **Aggregation** - Improve and generalize automatic data aggregation (the current HexagonLayer and GridLayer are examples of what to expect).
* **Better Infovis Support** - Better support for non-geospatial visualizations. (Don't worry if you are a geospatial user, deck.gl will remain a "geospatial-first" library since that is the more difficult use case.)
* **Better GPGPU/WebGL2 Support** - Many stones are still left unturned here. Expect better performance, and new features (such as animations of entire attributes), especially in WebGL2 capable browsers.


## Short Term: Experimental Features in 5.0

A lot of multi-viewport support was added during deck.gl 5.0 development. The APIs are still not considered stable so the related classes are exported as part of the "experimental" namespace, and in most cases.

### Multi-Viewport Support

deck.gl now allows you to divide your screen into multiple viewports and render your layers from different perspectives, using the experimental `_viewports` property. It is e.g. possible to render a top-down map view next to a first person view for dramatic new perspectives on your data. E.g. an app can allow your users to "walk around" in the city onto which its data is overlaid.

### WebVR Support and Example

Multi viewport support can be used to integrate with the WebVR API and create dual WebVR compatible viewports that render a first person view of your data for left and right eye respectively which will display as stereoscopic 3D in supporting hardware.

### Automatic Positioning of React Children under Viewports

In addition, a new `viewportId` React property can be added to `DeckGL`'s children. This will synchronize the position of the react component with the corresponding deck.gl viewport, which makes it trivial to precisely position e.g. multiple "base maps" and other background or foreground HTML components in multi-viewport layouts. The `viewportId` prop also automatically hides the react children when a viewport with the corresponding id is not present or when viewport parameters can not be supported by the underlying map component.

### Orbit Controller and Orbit Viewport Support

TBA

### Controller Hierarchy

TBA

### All Viewports Now Geospatially Enabled

All `Viewport` classes are now geospatially enabled: they now take an optional `longitude`/`latitude` reference point. In this mode, `position`s will be treated as meter offsets from that reference point per `COORDINATE_SYSTEM.METER_OFFSET` conventions.

This means that you can now use a FirstPersonViewport (the successor to the `PerspectiveViewport` with layers encoded in `COORDINATE_SYSTEM.LNG_LAT` and `COORDINATE_SYSTEM.METER_OFFSETS`) and place a camera anywhere in the scene (in contrast to the `WebMercatorViewport` which only allows you to look "down" on a position on the map).

Viewports even accept a `modelMatrix` to allow viewport/camera positions to be specified in exactly the same coordinates as `METER_OFFSET` layers, making it possible to place a camera at the exact location any of your existing data points without having to think or do any math.

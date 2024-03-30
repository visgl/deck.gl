# ZoomWidget

This widget controls the zoom level of a deck.gl view. Click '+' to zoom in by 1, click '-' to zoom out by 1. Supports controlling Map and Globe views.

## Props

##### `id` (string) {#id}

Default: `'zoom'`

Unique identifier of the widget.

##### `viewId` (string, optional) {#viewid}

Default: `null`

The widget is attached to the view identified by this `viewId`. When assigned, the widget is placed within the specified view, and  exclusively interacts with it. Required when using [multiple views](../../developer-guide/views.md#using-multiple-views).

##### `placement` (string, optional) {#placement}

Default: `'top-left'`

Widget position within the view relative to the map container. Valid options are `top-left`, `top-right`, `bottom-left`, `bottom-right`, or `fill`.

##### `orientation` (string, optional) {#orientation}

Default: `'vertical'`

Widget button orientation. Valid options are `vertical` or `horizontal`.

##### `container` (HTMLElement, optional) {#container}

Default: `undefined`

A [compatible DOM element](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen#Compatible_elements) which should be made full screen. By default, the map container element will be made full screen.

##### `zoomInLabel` (string, optional) {#zoominlabel}

Tooltip message displayed while hovering a mouse over the zoom in button.

Default: `'Zoom In'`

##### `zoomOutLabel` (string, optional) {#zoomoutlabel}

Tooltip message displayed while hovering a mouse over the zoom out button.

Default: `'Zoom Out'`

##### `transitionDuration` (number, optional) {#transitionduration}

Default: `200`

Zoom transition duration in milliseconds.

##### `style` (object, optional) {#style}

Default: `{}`

Additional CSS styles for the canvas.

##### `className` (string, optional) {#classname}

Default: `undefined`

Class name to attach to the widget element. The element has the default class name of `deck-widget deck-zoom-widget`.
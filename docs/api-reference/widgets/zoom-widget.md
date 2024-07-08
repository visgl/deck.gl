# ZoomWidget

This widget controls the zoom level of a deck.gl view. Click '+' to zoom in by 1, click '-' to zoom out by 1. Supports controlling Map and Globe views.

## Props

#### `id` (string) {#id}

Default: `'zoom'`

Unique identifier of the widget.

#### `viewId` (string, optional) {#viewid}

Default: `null`

The `viewId` prop controls how a widget interacts with views. If `viewId` is defined, the widget is placed in that view and interacts exclusively with it; otherwise, it is placed in the root widget container and affects all views.

#### `placement` (string, optional) {#placement}

Default: `'top-left'`

Widget position within the view relative to the map container. Valid options are `top-left`, `top-right`, `bottom-left`, `bottom-right`, or `fill`.

#### `orientation` (string, optional) {#orientation}

Default: `'vertical'`

Widget button orientation. Valid options are `vertical` or `horizontal`.

#### `zoomInLabel` (string, optional) {#zoominlabel}

Tooltip message displayed while hovering a mouse over the zoom in button.

Default: `'Zoom In'`

#### `zoomOutLabel` (string, optional) {#zoomoutlabel}

Tooltip message displayed while hovering a mouse over the zoom out button.

Default: `'Zoom Out'`

#### `transitionDuration` (number, optional) {#transitionduration}

Default: `200`

Zoom transition duration in milliseconds.

#### `style` (object, optional) {#style}

Default: `{}`

Additional CSS styles for the canvas.

#### `className` (string, optional) {#classname}

Default: `undefined`

Class name to attach to the widget element. The element has the default class name of `deck-widget deck-zoom-widget`.
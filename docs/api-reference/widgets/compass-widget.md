# CompassWidget

This widget visualizes bearing and pitch. Click it once to reset bearing to 0, click it a second time to reset pitch to 0. Supports Map and Globe view.

## Props

### `id` (String) {#id}

Default: `'fullscreen'`

Unique identifier of the widget.

### `viewId` (String, optional) {#viewid}

Default: `null`

The widget is attached to the view identified by this `viewId`. When assigned, the widget is placed within the specified view, and  exclusively interacts with it. Required when using [multiple views](../../developer-guide/views.md#using-multiple-views).

### `placement` (String, optional) {#placement}

Default: `'top-left'`

Widget position within the view relative to the map container. Valid options are `top-left`, `top-right`, `bottom-left`, `bottom-right`, or `fill`.

### `label` (String, optional) {#label}

Tooltip message displayed while hovering a mouse over the widget.

Default: `'Compass'`

### `transitionDuration` (Number, optional) {#transitionduration}

Default: `200`

Bearing and pitch reset transition duration in milliseconds.

### `style` (Object, optional) {#style}

Default: `{}`

Additional CSS styles for the canvas.

### `className` (String, optional) {#classname}

Default: `undefined`

Class name to attach to the widget element. The element has the default class name of `deck-widget deck-fullscreen-widget`.
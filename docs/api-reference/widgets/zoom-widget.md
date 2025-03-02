# ZoomWidget

This widget controls the zoom level of a deck.gl view. Click '+' to zoom in by 1, click '-' to zoom out by 1. Supports controlling Map and Globe views.

## Props

#### `id` (string, optional) {#id}

Default: `'zoom'`

The `id` must be unique among all your widgets at a given time. It's recommended to set `id` explicitly. The `id` is used to match widgets between updates, ensuring deck.gl can distinguish between them. A default `id` is assigned based on widget type, so if you have multiple widgets of the same type (e.g., two `compass` widgets), you need to provide a custom `id` for at least one.

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

Additional CSS styles for the widget. camelCase CSS properties (e.g. `backgroundColor`) and kabab-case CSS variables are accepted (e.g. `--button-size`).

#### `className` (string, optional) {#classname}

Default: `undefined`

Class name to attach to the widget element. The element has the default class name of `deck-widget deck-zoom-widget`.
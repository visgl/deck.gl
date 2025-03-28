# InfoWidget

The InfoWidget shows a popup when an item in a layer has been clicked.

## Props

#### `id` (string, optional) {#id}

Default: `'popup'`

The `id` must be unique among all your widgets at a given time. 

Note: It is necessary to set `id` explicitly if you have more than once instance of the same widget.

#### `placement` (string, optional) {#placement}

Default: `'top-left'`

Widget position within the view relative to the map container. Valid options are `top-left`, `top-right`, `bottom-left`, `bottom-right`, or `fill`.

#### `label` (string, optional) {#label}

Tooltip message displayed while hovering a mouse over the widget.

Default: `'Popup'`

#### `style` (object, optional) {#style}

Default: `{}`

Additional CSS styles for the widget. camelCase CSS properties (e.g. `backgroundColor`) and kabab-case CSS variables are accepted (e.g. `--button-size`).

#### `className` (string, optional) {#classname}

Default: `undefined`

Class name to attach to the widget element. The element has the default class name of `deck-widget deck-popup-widget`.

# ResetViewWidget

This widget resets the view state of a deck.gl viewport to its initial state. The user clicks the widget to return to the initial view.

## Props

#### `id` (string, optional) {#id}

Default: `'reset-view'`

The `id` must be unique among all your widgets at a given time. It's recommended to set `id` explicitly if you have multiple widgets of the same type.

#### `placement` (string, optional) {#placement}

Default: `'top-left'`

Widget position within the view relative to the map container. Valid options are `top-left`, `top-right`, `bottom-left`, `bottom-right`, or `fill`.

#### `label` (string, optional) {#label}

Tooltip message displayed while hovering a mouse over the widget.

Default: `'Reset View'`

#### `style` (object, optional) {#style}

Default: `{}`

Additional CSS styles for the widget. camelCase CSS properties (e.g. `backgroundColor`) and kabab-case CSS variables are accepted (e.g. `--button-size`).

#### `className` (string, optional) {#classname}

Default: `undefined`

Class name to attach to the widget element. The element has the default class name of `deck-widget deck-reset-view-widget`.

## Styles

| Name                | Type                     | Default                                       |
| ------------------- | ------------------------ | --------------------------------------------- |
| `--icon-reset-view` | [SVG Data Url][data_url] | [Material Symbol Fullscreen][icon_reset_view] |

[data_url]: https://developer.mozilla.org/en-US/docs/Web/CSS/url#using_a_data_url
[icon_reset_view_url]: https://fonts.google.com/icons

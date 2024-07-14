# FullscreenWidget

This widget enlarges deck.gl to fill the full screen. Click the widget to enter or exit full screen.

## Props

#### `id` (string, optional) {#id}

Default: `'fullscreen'`

The `id` must be unique among all your widgets at a given time. It's recommended to set `id` explicitly. The `id` is used to match widgets between updates, ensuring deck.gl can distinguish between them. A default `id` is assigned based on widget type, so if you have multiple widgets of the same type (e.g., two `compass` widgets), you need to provide a custom `id` for at least one.

#### `placement` (string, optional) {#placement}

Default: `'top-left'`

Widget position within the view relative to the map container. Valid options are `top-left`, `top-right`, `bottom-left`, `bottom-right`, or `fill`.

#### `container` (HTMLElement, optional) {#container}

Default: `undefined`

A [compatible DOM element](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen#Compatible_elements) which should be made full screen. By default, the map container element will be made full screen.

#### `enterLabel` (string, optional) {#enterlabel}

Tooltip message displayed while hovering a mouse over the widget when out of fullscreen.

Default: `'Enter Fullscreen'`

#### `exitLabel` (string, optional) {#exitlabel}

Tooltip message displayed while hovering a mouse over the widget when fullscreen.

Default: `'Exit Fullscreen'`

#### `style` (object, optional) {#style}

Default: `{}`

Additional CSS styles for the canvas.

#### `className` (string, optional) {#classname}

Default: `undefined`

Class name to attach to the widget element. The element has the default class name of `deck-widget deck-fullscreen-widget`.